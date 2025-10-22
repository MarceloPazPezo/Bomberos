"use strict";
import {
  obtenerEstadosReporteService,
} from "../services/estadoReporte.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function listarEstadosReporte(req, res) {
  try {

    const resultado = await obtenerEstadosReporteService();
    if (resultado.total === 0) {
      return handleSuccess(res, 204);
    }
    return handleSuccess(res, 200, "Estados de reporte encontrados", resultado);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }

}