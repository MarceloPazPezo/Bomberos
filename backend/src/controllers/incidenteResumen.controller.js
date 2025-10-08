"use strict";
import { obtenerIncidentesResumenService } from "../services/incidenteResumen.service.js";
import { handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function listarIncidentesResumen(req, res) {
  try {
    const redactorIdRaw = req.query?.redactorId;
    
    const redactorId = Number.parseInt(redactorIdRaw, 10);
    if (!Number.isInteger(redactorId)) {
      return handleErrorServer(res, 400, "Parámetro 'redactorId' es requerido y debe ser numérico");
    }
    const data = await obtenerIncidentesResumenService({ redactorId });
    return handleSuccess(res, 200, "Incidentes con último estado", data);
  } catch (error) {
    return handleErrorServer(res, 500, error.message || "Error interno");
  }
}

export default { listarIncidentesResumen };
