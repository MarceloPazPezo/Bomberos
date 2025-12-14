"use strict";

import { AppDataSource } from "../config/configDb.js";
import { sendIndividualNotification } from "./notification.service.js";
import { NOTIFICATION_TYPES } from "../helpers/notification.helper.js";
import logger from "../config/configLogger.js";

/**
 * Notifica a bomberos cuya disponibilidad está próxima a vencer
 * Se considera "próxima a vencer" si termina en los próximos 15 minutos
 */
export async function notifyExpiringDisponibilidades() {
    try {
        const disponibilidadRepository = AppDataSource.getRepository("Disponibilidad");

        const now = new Date();
        const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);

        // Buscar disponibilidades que vencen en los próximos 15 minutos
        const expiringDisponibilidades = await disponibilidadRepository
            .createQueryBuilder("d")
            .leftJoinAndSelect("d.bombero", "bombero")
            .where("d.fechaTermino IS NOT NULL")
            .andWhere("d.fechaTermino > :now", { now })
            .andWhere("d.fechaTermino <= :in15Minutes", { in15Minutes })
            .getMany();

        if (expiringDisponibilidades.length === 0) {
            logger.info("[NOTIFICATION_TASKS] No hay disponibilidades próximas a vencer");
            return { sent: 0, errors: 0 };
        }

        let sent = 0;
        let errors = 0;

        for (const disponibilidad of expiringDisponibilidades) {
            try {
                const minutosRestantes = Math.round(
                    (disponibilidad.fechaTermino.getTime() - now.getTime()) / (1000 * 60)
                );

                await sendIndividualNotification(
                    {
                        type: NOTIFICATION_TYPES.RECORDATORIO,
                        title: "Tu disponibilidad está por vencer",
                        message: `Tu disponibilidad vencerá en aproximadamente ${minutosRestantes} minuto(s). Recuerda actualizar tu estado si es necesario.`,
                        data: {
                            disponibilidadId: disponibilidad.id,
                            fechaTermino: disponibilidad.fechaTermino,
                            accion: 'disponibilidad_expirando'
                        }
                    },
                    disponibilidad.idBombero
                );
                sent++;
                logger.info(`[NOTIFICATION_TASKS] Notificación de disponibilidad enviada a bombero ${disponibilidad.idBombero}`);
            } catch (error) {
                errors++;
                logger.error(`[NOTIFICATION_TASKS] Error notificando a bombero ${disponibilidad.idBombero}:`, error);
            }
        }

        logger.info(`[NOTIFICATION_TASKS] Disponibilidades: ${sent} notificaciones enviadas, ${errors} errores`);
        return { sent, errors };
    } catch (error) {
        logger.error("[NOTIFICATION_TASKS] Error en notifyExpiringDisponibilidades:", error);
        throw error;
    }
}

/**
 * Notifica a todos los bomberos activos sobre eventos próximos
 * Se considera "próximo" si el evento es en las próximas 24 horas
 * Los eventos se notifican a todos los bomberos activos (eventos son globales)
 */
export async function notifyUpcomingCalendarEvents() {
    try {
        const eventoRepository = AppDataSource.getRepository("Evento");
        const bomberoRepository = AppDataSource.getRepository("Bombero");

        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Buscar eventos que ocurren en las próximas 24 horas
        const upcomingEvents = await eventoRepository
            .createQueryBuilder("e")
            .leftJoinAndSelect("e.tipoEvento", "tipoEvento")
            .where("e.fechaHoraInicio > :now", { now })
            .andWhere("e.fechaHoraInicio <= :in24Hours", { in24Hours })
            .getMany();

        if (upcomingEvents.length === 0) {
            logger.info("[NOTIFICATION_TASKS] No hay eventos próximos en el calendario");
            return { sent: 0, errors: 0 };
        }

        let sent = 0;
        let errors = 0;

        // Obtener todos los bomberos activos una sola vez (eventos son globales)
        const bomberosActivos = await bomberoRepository
            .createQueryBuilder("b")
            .where("b.activo = :activo", { activo: true })
            .select(["b.id"])
            .getMany();

        if (bomberosActivos.length === 0) {
            logger.info("[NOTIFICATION_TASKS] No hay bomberos activos para notificar");
            return { sent: 0, errors: 0 };
        }

        for (const evento of upcomingEvents) {
            try {
                const horasRestantes = Math.round(
                    (evento.fechaHoraInicio.getTime() - now.getTime()) / (1000 * 60 * 60)
                );

                const tipoEventoNombre = evento.tipoEvento?.nombre || "Evento";
                const eventoNombre = evento.nombre || tipoEventoNombre;
                const mensaje = `Recordatorio: El evento "${eventoNombre}" (${tipoEventoNombre}) comenzará en aproximadamente ${horasRestantes} hora(s).`;

                // Notificar a todos los bomberos activos
                await Promise.all(
                    bomberosActivos.map(async (bombero) => {
                        try {
                            await sendIndividualNotification(
                                {
                                    type: NOTIFICATION_TYPES.RECORDATORIO,
                                    title: "Recordatorio de Evento",
                                    message: mensaje,
                                    data: {
                                        eventoId: evento.id,
                                        eventoNombre: evento.nombre,
                                        tipoEvento: tipoEventoNombre,
                                        fechaHoraInicio: evento.fechaHoraInicio,
                                        descripcion: evento.descripcion,
                                        accion: 'evento_proximo'
                                    }
                                },
                                bombero.id
                            );
                        } catch (err) {
                            errors++;
                            logger.error(`[NOTIFICATION_TASKS] Error notificando a bombero ${bombero.id}:`, err);
                        }
                    })
                );
                sent += bomberosActivos.length;
                logger.info(`[NOTIFICATION_TASKS] Notificaciones de evento "${eventoNombre}" enviadas a ${bomberosActivos.length} bomberos`);
            } catch (error) {
                errors++;
                logger.error(`[NOTIFICATION_TASKS] Error procesando evento ${evento.id}:`, error);
            }
        }

        logger.info(`[NOTIFICATION_TASKS] Calendario: ${sent} notificaciones enviadas, ${errors} errores`);
        return { sent, errors };
    } catch (error) {
        logger.error("[NOTIFICATION_TASKS] Error en notifyUpcomingCalendarEvents:", error);
        throw error;
    }
}

/**
 * Ejecuta todas las tareas de notificaciones programadas
 */
export async function runScheduledNotifications() {
    logger.info("[NOTIFICATION_TASKS] Iniciando ejecución de notificaciones programadas");

    const results = {
        disponibilidades: { sent: 0, errors: 0 },
        calendario: { sent: 0, errors: 0 }
    };

    try {
        results.disponibilidades = await notifyExpiringDisponibilidades();
    } catch (error) {
        logger.error("[NOTIFICATION_TASKS] Error en disponibilidades:", error);
    }

    try {
        results.calendario = await notifyUpcomingCalendarEvents();
    } catch (error) {
        logger.error("[NOTIFICATION_TASKS] Error en calendario:", error);
    }

    logger.info("[NOTIFICATION_TASKS] Ejecución completada:", results);
    return results;
}
