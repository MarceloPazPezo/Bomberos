"use strict";
import { obtenerIncidentesResumenService } from "../services/incidenteResumen.service.js";
import { handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function listarIncidentesResumen(req, res) {
  try {
    const data = await obtenerIncidentesResumenService();
    return handleSuccess(res, 200, "Incidentes con último estado", data);
  } catch (error) {
    return handleErrorServer(res, 500, error.message || "Error interno");
  }
}

export default { listarIncidentesResumen };
