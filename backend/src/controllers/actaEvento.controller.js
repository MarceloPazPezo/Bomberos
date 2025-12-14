"use strict";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { obtenerEventoPorIdService } from "../services/evento.service.js";
import { obtenerActaEventoService, upsertActaEventoService, obtenerListaAsistenciaDetalladaService } from "../services/actaEvento.service.js";
import { generarActaReunionPdfService } from "../services/reportes/actaReunionPdf.service.js";

export async function getActaEvento(req, res) {
    try {
        const { id } = req.params;
        if (!id) return handleErrorClient(res, 400, "ID del evento es requerido");
        const evento = await obtenerEventoPorIdService(id);
        if (!evento) return handleErrorClient(res, 404, "Evento no encontrado");
        const acta = await obtenerActaEventoService(id);
        const asistencia = await obtenerListaAsistenciaDetalladaService(id);
        return handleSuccess(res, 200, "Acta del evento", { acta, asistencia });
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function upsertActaEvento(req, res) {
    try {
        console.log('[upsertActaEvento] Iniciando - ID:', req.params.id);
        console.log('[upsertActaEvento] Body:', req.body);
        console.log('[upsertActaEvento] Usuario:', req.user?.email);

        const { id } = req.params;
        if (!id) return handleErrorClient(res, 400, "ID del evento es requerido");

        const evento = await obtenerEventoPorIdService(id);
        if (!evento) return handleErrorClient(res, 404, "Evento no encontrado");

        console.log('[upsertActaEvento] Evento encontrado:', { id: evento.id, nombre: evento.nombre });

        const data = req.body || {};
        console.log('[upsertActaEvento] Datos a guardar:', data);

        const acta = await upsertActaEventoService(id, data);
        console.log('[upsertActaEvento] Acta guardada exitosamente');

        return handleSuccess(res, 200, "Acta guardada", acta);
    } catch (error) {
        console.error('[upsertActaEvento] ERROR:', error);
        console.error('[upsertActaEvento] Stack:', error.stack);
        return handleErrorServer(res, 500, error.message);
    }
}

export async function generarActaReunionPdf(req, res) {
    try {
        const { id } = req.params;
        console.log('[generarActaReunionPdf] ID del evento:', id);
        console.log('[generarActaReunionPdf] Body recibido:', req.body);

        if (!id) return handleErrorClient(res, 400, "ID del evento es requerido");
        const evento = await obtenerEventoPorIdService(id);
        if (!evento) return handleErrorClient(res, 404, "Evento no encontrado");

        console.log('[generarActaReunionPdf] Evento encontrado:', { id: evento.id, nombre: evento.nombre });

        const { descripcionActa, temas, expiresIn } = req.body || {};
        console.log('[generarActaReunionPdf] Parámetros para generar PDF:', { descripcionActa, temas, expiresIn });

        const result = await generarActaReunionPdfService(id, { descripcionActa, temas, expiresIn });
        console.log('[generarActaReunionPdf] PDF generado exitosamente:', result);

        return handleSuccess(res, 200, "Acta PDF generada", result);
    } catch (error) {
        console.error('[generarActaReunionPdf] ERROR:', error);
        console.error('[generarActaReunionPdf] Stack trace:', error.stack);
        return handleErrorServer(res, 500, error.message);
    }
}
