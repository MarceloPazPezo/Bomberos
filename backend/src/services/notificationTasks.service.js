"use strict";

import { AppDataSource } from "../config/configDb.js";
import { sendIndividualNotification } from "./notification.service.js";
import { NOTIFICATION_TYPES } from "../helpers/notification.helper.js";
import logger from "../config/configLogger.js";
import redisClient from "../config/configRedis.js";

/**
 * Verifica si ya se envió una notificación usando Redis como cache
 * @param {string} key - Clave única para la notificación
 * @returns {Promise<boolean>} - true si ya fue enviada, false si no
 */
async function wasNotificationSent(key) {
    try {
        const exists = await redisClient.exists(key);
        return exists === 1;
    } catch (error) {
        logger.error("[NOTIFICATION_TASKS] Error verificando notificación en Redis:", error);
        return false; // En caso de error, permitir enviar (fail-safe)
    }
}

/**
 * Marca una notificación como enviada en Redis
 * @param {string} key - Clave única para la notificación
 * @param {number} ttl - Tiempo de vida en segundos (por defecto 48 horas)
 */
async function markNotificationAsSent(key, ttl = 48 * 60 * 60) {
    try {
        await redisClient.setex(key, ttl, "sent");
    } catch (error) {
        logger.error("[NOTIFICATION_TASKS] Error marcando notificación en Redis:", error);
    }
}

/**
 * Notifica a bomberos cuya disponibilidad está próxima a vencer
 * Se notifica SOLO UNA VEZ cuando falta entre 1-2 horas para vencer
 */
export async function notifyExpiringDisponibilidades() {
    try {
        const disponibilidadRepository = AppDataSource.getRepository("Disponibilidad");

        const now = new Date();
        const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
        const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        // Buscar disponibilidades que vencen en las próximas 1-2 horas
        const expiringDisponibilidades = await disponibilidadRepository
            .createQueryBuilder("d")
            .leftJoinAndSelect("d.bombero", "bombero")
            .where("d.fechaTermino IS NOT NULL")
            .andWhere("d.fechaTermino > :in1Hour", { in1Hour })
            .andWhere("d.fechaTermino <= :in2Hours", { in2Hours })
            .getMany();

        if (expiringDisponibilidades.length === 0) {
            logger.info("[NOTIFICATION_TASKS] No hay disponibilidades próximas a vencer");
            return { sent: 0, errors: 0 };
        }

        let sent = 0;
        let errors = 0;

        for (const disponibilidad of expiringDisponibilidades) {
            try {
                // Crear clave única para esta notificación
                const notificationKey = `notification:disponibilidad:expiring:${disponibilidad.id}`;

                // Verificar si ya se envió esta notificación
                if (await wasNotificationSent(notificationKey)) {
                    logger.debug(`[NOTIFICATION_TASKS] Notificación de disponibilidad ${disponibilidad.id} ya fue enviada`);
                    continue;
                }

                const horasRestantes = Math.round(
                    (disponibilidad.fechaTermino.getTime() - now.getTime()) / (1000 * 60 * 60)
                );

                await sendIndividualNotification(
                    {
                        type: NOTIFICATION_TYPES.RECORDATORIO,
                        title: "Tu disponibilidad está por vencer",
                        message: `Tu disponibilidad vencerá en aproximadamente ${horasRestantes} hora(s). Recuerda actualizar tu estado si es necesario.`,
                        data: {
                            disponibilidadId: disponibilidad.id,
                            fechaTermino: disponibilidad.fechaTermino,
                            accion: 'disponibilidad_expirando'
                        }
                    },
                    disponibilidad.idBombero
                );

                // Marcar como enviada por 48 horas (para evitar re-envíos)
                await markNotificationAsSent(notificationKey, 48 * 60 * 60);

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
 * Se notifica SOLO UNA VEZ exactamente 24 horas antes del evento (±10 minutos de tolerancia)
 * Los eventos se notifican a todos los bomberos activos (eventos son globales)
 */
export async function notifyUpcomingCalendarEvents() {
    try {
        const eventoRepository = AppDataSource.getRepository("Evento");
        const bomberoRepository = AppDataSource.getRepository("Bombero");

        const now = new Date();
        // Buscar eventos que están entre 23h 50m y 24h 10m en el futuro
        const in23h50m = new Date(now.getTime() + 23 * 60 * 60 * 1000 + 50 * 60 * 1000);
        const in24h10m = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 1000);

        // Buscar eventos en la ventana de 24 horas (±10 minutos)
        const upcomingEvents = await eventoRepository
            .createQueryBuilder("e")
            .leftJoinAndSelect("e.tipoEvento", "tipoEvento")
            .where("e.fechaHoraInicio >= :in23h50m", { in23h50m })
            .andWhere("e.fechaHoraInicio <= :in24h10m", { in24h10m })
            .getMany();

        if (upcomingEvents.length === 0) {
            logger.info("[NOTIFICATION_TASKS] No hay eventos a 24 horas");
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
                // Crear clave única para este evento
                const notificationKey = `notification:evento:24h:${evento.id}`;

                // Verificar si ya se envió esta notificación
                if (await wasNotificationSent(notificationKey)) {
                    logger.debug(`[NOTIFICATION_TASKS] Notificación de evento ${evento.id} ya fue enviada`);
                    continue;
                }

                const tipoEventoNombre = evento.tipoEvento?.nombre || "Evento";
                const eventoNombre = evento.nombre || tipoEventoNombre;
                const mensaje = `Recordatorio: El evento "${eventoNombre}" (${tipoEventoNombre}) será mañana a esta hora.`;

                // Notificar a todos los bomberos activos
                let notifiedCount = 0;
                await Promise.all(
                    bomberosActivos.map(async (bombero) => {
                        try {
                            await sendIndividualNotification(
                                {
                                    type: NOTIFICATION_TYPES.RECORDATORIO,
                                    title: "Recordatorio de Evento (24 horas)",
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
                            notifiedCount++;
                        } catch (err) {
                            errors++;
                            logger.error(`[NOTIFICATION_TASKS] Error notificando a bombero ${bombero.id}:`, err);
                        }
                    })
                );

                // Marcar como enviada por 48 horas (para evitar re-envíos)
                await markNotificationAsSent(notificationKey, 48 * 60 * 60);

                sent += notifiedCount;
                logger.info(`[NOTIFICATION_TASKS] Notificaciones de evento "${eventoNombre}" enviadas a ${notifiedCount} bomberos`);
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
