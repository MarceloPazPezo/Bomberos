"use strict";
import { obtenerIncidentesResumenService } from "../services/incidenteResumen.service.js";
import { handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

// Endpoint para usuarios de nivel alto: lista todos los incidentes
// con su último estado, filtrando opcionalmente por estados permitidos
// Query params:
//   estados: coma separada, e.g. "ENVIADO,APROBADO,RECHAZADO"
export async function listarParaRevision(req, res) {
  try {
    const estadosParam = (req.query?.estados || "").toString();
    const estados = estadosParam
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const data = await obtenerIncidentesResumenService({
      // no enviar redactorId -> ver todos
      allowedEstados: estados.length > 0 ? estados : undefined,
    });

    return handleSuccess(res, 200, "Incidentes para revisión", data);
  } catch (error) {
    return handleErrorServer(res, 500, error.message || "Error interno");
  }
}

export default { listarParaRevision };
