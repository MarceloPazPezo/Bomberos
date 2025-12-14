"use strict";
import { AppDataSource } from "../config/configDb.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { crearEstadoEstablecidoService, obtenerUltimoEstadoPorIncidenteService, obtenerHistorialEstadosPorIncidenteService } from "../services/estadoEstablecido.service.js";
import { sendIndividualNotification } from "../services/notification.service.js";
import { NOTIFICATION_TYPES } from "../helpers/notification.helper.js";
import logger from "../config/configLogger.js";

export async function cambiarEstadoIncidente(req, res) {
  const idIncidente = Number(req.params?.id);
  if (!Number.isInteger(idIncidente) || idIncidente <= 0) {
    return handleErrorClient(res, 400, "Id inválido");
  }
  const estadoRaw = (req.body?.estado || "").toString().trim();
  const idBombero = Number(req.body?.idBombero);
  const comentario = req.body?.comentario || null;
  const estado = estadoRaw.toUpperCase();
  const ALLOWED_DEST = new Set(["APROBADO", "CORREGIR", "ENVIADO"]);
  if (!ALLOWED_DEST.has(estado)) {
    return handleErrorClient(res, 400, "Estado destino no permitido");
  }
  if (!Number.isInteger(idBombero) || idBombero <= 0) {
    return handleErrorClient(res, 400, "idBombero requerido");
  }
  try {
    const last = await obtenerUltimoEstadoPorIncidenteService(idIncidente);
    const lastEstado = (last?.estado || "").toUpperCase();
    if (!lastEstado) {
      return handleErrorClient(res, 409, "Incidente sin estado actual");
    }
    // Reglas de transición:
    // - Si actual = ENVIADO => destino en {APROBADO, CORREGIR}
    // - Si actual = BORRADOR o CORREGIR => destino solamente ENVIADO
    let permitido = false;
    if (lastEstado === "ENVIADO" && (estado === "APROBADO" || estado === "CORREGIR")) {
      permitido = true;
    }
    if ((lastEstado === "BORRADOR" || lastEstado === "CORREGIR") && estado === "ENVIADO") {
      permitido = true;
    }
    if (!permitido) {
      return handleErrorClient(res, 409, `Transición no permitida desde ${lastEstado} a ${estado}`);
    }
    // Buscar id del estado destino en EstadoReporte por nombre
    const repoEstado = AppDataSource.getRepository("EstadoReporte");
    const estadoEntidad = await repoEstado.createQueryBuilder("e")
      .where("UPPER(e.nombre) = :n", { n: estado })
      .getOne();
    if (!estadoEntidad) {
      return handleErrorClient(res, 400, "Estado destino no existe");
    }
    await crearEstadoEstablecidoService({
      idBombero,
      idEstado: Number(estadoEntidad.id),
      idIncidente,
      fechaHora: new Date(),
      comentario,
    });

    // Manejar notificaciones según el tipo de cambio de estado
    try {
      const repoIncidente = AppDataSource.getRepository("Incidente");
      const incidente = await repoIncidente.createQueryBuilder("i")
        .select(["i.id", "i.idRedactor", "i.descripcionPreliminar"])
        .where("i.id = :id", { id: idIncidente })
        .getOne();

      if (!incidente) {
        logger.warn(`[INCIDENTE_ESTADO] Incidente ${idIncidente} no encontrado para notificaciones`);
      } else {
        // Caso 1: Parte enviado a revisión -> Notificar a revisores
        if (estado === "ENVIADO") {
          const { getBomberosByPermisoService } = await import("../services/bombero.service.js");
          const revisoresIds = await getBomberosByPermisoService("revisar_partes");

          if (revisoresIds && revisoresIds.length > 0) {
            const descripcion = incidente.descripcionPreliminar || `Parte #${idIncidente}`;
            await Promise.all(
              revisoresIds.map(revisorId =>
                sendIndividualNotification(
                  {
                    type: NOTIFICATION_TYPES.INCIDENTE,
                    title: "Nuevo Parte para Revisión",
                    message: `Hay un nuevo parte de emergencia "${descripcion}" esperando tu revisión.`,
                    data: {
                      incidenteId: idIncidente,
                      estado: estado,
                      accion: 'nuevo_parte_revision'
                    }
                  },
                  revisorId
                ).catch(err => logger.error(`[INCIDENTE_ESTADO] Error notificando a revisor ${revisorId}:`, err))
              )
            );
            logger.info(`[INCIDENTE_ESTADO] Notificaciones enviadas a ${revisoresIds.length} revisores`);
          }
        }

        // Caso 2: Parte aprobado o requiere corrección -> Notificar al redactor
        if ((estado === "APROBADO" || estado === "CORREGIR") && incidente.idRedactor) {
          const notificationTitle = estado === "APROBADO"
            ? "Parte de Emergencia Aprobado"
            : "Parte de Emergencia Requiere Corrección";

          const notificationMessage = estado === "APROBADO"
            ? `Tu parte de emergencia "${incidente.descripcionPreliminar || 'N/A'}" ha sido aprobado.`
            : `Tu parte de emergencia "${incidente.descripcionPreliminar || 'N/A'}" requiere correcciones.${comentario ? ` Comentario: ${comentario}` : ''}`;

          await sendIndividualNotification(
            {
              type: NOTIFICATION_TYPES.INCIDENTE,
              title: notificationTitle,
              message: notificationMessage,
              data: {
                incidenteId: idIncidente,
                estado: estado,
                comentario: comentario,
                accion: 'revision_parte'
              }
            },
            incidente.idRedactor
          );
          logger.info(`[INCIDENTE_ESTADO] Notificación enviada al redactor ${incidente.idRedactor} por cambio de estado a ${estado}`);
        }
      }
    } catch (notificationError) {
      // No fallar el cambio de estado si falla la notificación
      logger.error(`[INCIDENTE_ESTADO] Error enviando notificación:`, notificationError);
    }

    return handleSuccess(res, 201, "Estado cambiado", { idIncidente, nuevoEstado: estado });
  } catch (err) {
    return handleErrorServer(res, 500, err.message || "Error interno");
  }
}

export async function obtenerHistorialEstados(req, res) {
  const idIncidente = Number(req.params?.id);
  if (!Number.isInteger(idIncidente) || idIncidente <= 0) {
    return handleErrorClient(res, 400, "Id inválido");
  }
  try {
    const historial = await obtenerHistorialEstadosPorIncidenteService(idIncidente);
    return handleSuccess(res, 200, "Historial de estados", historial);
  } catch (err) {
    return handleErrorServer(res, 500, err.message || "Error interno");
  }
}

export default { cambiarEstadoIncidente, obtenerHistorialEstados };
