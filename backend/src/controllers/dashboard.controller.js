"use strict";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

import { 
  getcantidadDeIncidentesDiasdelaSemana, 
  getcantidadDeIncidentesMeses,
  getClavesRadialesMasRepetidas,
  getIncidentesPorFranjaHoraria,
  getHeatmapDiaHora,
  getAsistenciaPromedio,
  getHeatmapDisponibilidad,
  getcantidadDeEventosDiasdelaSemana,
  getcantidadDeEventosMeses,
  getcantidadDeEventosPorGranularidad,
  getcantidadDeEventosPorTipo,
  getPromedioAsistenciaPorTipoEvento,
  getTendenciaMensualAsistencia,
  getEvolucionEventosYAsistentes,
  getPorcentajeParticipacion
} from "../services/dasboard.service.js";


export async function cantidadDeIncidentesDiasdelaSemana(req, res) {
  try {
    const { fechaInicio, fechaFin, idcompania } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }
    
    const data = await getcantidadDeIncidentesDiasdelaSemana(fechaInicio, fechaFin, idcompania);
    handleSuccess(res, 200, "Cantidad de incidentes por días de la semana", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function cantidadDeIncidentesMeses(req, res) {
  try {
    const { añoDesde, añoHasta, idcompania } = req.body;
    if (!añoDesde || !añoHasta) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: añoDesde y añoHasta", 400);
    }

    const data = await getcantidadDeIncidentesMeses(añoDesde, añoHasta, idcompania);
    handleSuccess(res, 200, "Cantidad de incidentes por meses", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function clavesRadialesMasRepetidas(req, res) {
  try {
    const { fechaInicio, fechaFin, idcompania } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }
    
    const data = await getClavesRadialesMasRepetidas(fechaInicio, fechaFin, idcompania);
    handleSuccess(res, 200, "Claves radiales más repetidas", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function incidentesPorFranjaHoraria(req, res) {
  try {
    const { fechaInicio, fechaFin, idcompania } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }
    
    const data = await getIncidentesPorFranjaHoraria(fechaInicio, fechaFin, idcompania);
    handleSuccess(res, 200, "Incidentes por franja horaria", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function heatmapDiaHora(req, res) {
  try {
    const { fechaInicio, fechaFin, idcompania } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }
    
    const data = await getHeatmapDiaHora(fechaInicio, fechaFin, idcompania);
    handleSuccess(res, 200, "Mapa de calor día-hora de incidentes", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function asistenciaPromedio(req, res) {
  try {
    const { fechaInicio, fechaFin, idcompania } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }
    
    const data = await getAsistenciaPromedio(fechaInicio, fechaFin, idcompania);
    handleSuccess(res, 200, "Asistencia promedio de voluntarios por incidente", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function heatmapDisponibilidad(req, res) {
  try {
    const { fechaInicio, fechaFin, idcompania } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }
    
    const data = await getHeatmapDisponibilidad(fechaInicio, fechaFin, idcompania);
    handleSuccess(res, 200, "Mapa de calor día-hora de disponibilidad", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

// ============================================
// Controladores para Dashboard de Eventos
// ============================================

export async function cantidadDeEventosDiasdelaSemana(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }
    
    const data = await getcantidadDeEventosDiasdelaSemana(fechaInicio, fechaFin);
    handleSuccess(res, 200, "Cantidad de eventos por días de la semana", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function cantidadDeEventosMeses(req, res) {
  try {
    const { añoDesde, añoHasta } = req.body;
    if (!añoDesde || !añoHasta) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: añoDesde y añoHasta", 400);
    }

    const data = await getcantidadDeEventosMeses(añoDesde, añoHasta);
    handleSuccess(res, 200, "Cantidad de eventos por meses", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function cantidadDeEventosPorGranularidad(req, res) {
  try {
    const { fechaInicio, fechaFin, granularidad } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }

    const granularidadValida = granularidad || 'mes';
    if (!['semana', 'mes', 'año'].includes(granularidadValida)) {
      return handleErrorClient(res, "Granularidad debe ser 'semana', 'mes' o 'año'", 400);
    }
    
    const data = await getcantidadDeEventosPorGranularidad(fechaInicio, fechaFin, granularidadValida);
    handleSuccess(res, 200, `Cantidad de eventos por ${granularidadValida}`, data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function cantidadDeEventosPorTipo(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }

    const data = await getcantidadDeEventosPorTipo(fechaInicio, fechaFin);
    handleSuccess(res, 200, "Cantidad de eventos por tipo", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function promedioAsistenciaPorTipoEvento(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }

    const data = await getPromedioAsistenciaPorTipoEvento(fechaInicio, fechaFin);
    handleSuccess(res, 200, "Promedio de asistencia por tipo de evento", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function tendenciaMensualAsistencia(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }

    const data = await getTendenciaMensualAsistencia(fechaInicio, fechaFin);
    handleSuccess(res, 200, "Tendencia mensual de asistencia a eventos", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function evolucionEventosYAsistentes(req, res) {
  try {
    const { fechaInicio, fechaFin, idTipoEvento } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }

    const data = await getEvolucionEventosYAsistentes(fechaInicio, fechaFin, idTipoEvento || null);
    handleSuccess(res, 200, "Evolución diaria de eventos y asistentes", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}

export async function porcentajeParticipacion(req, res) {
  try {
    const { fechaInicio, fechaFin, idsEventos } = req.body;
    if (!fechaInicio || !fechaFin) {
      return handleErrorClient(res, "Faltan parámetros obligatorios: fechaInicio y fechaFin", 400);
    }

    const data = await getPorcentajeParticipacion(fechaInicio, fechaFin, idsEventos || null);
    handleSuccess(res, 200, "Porcentaje de participación de voluntarios en eventos", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message || "Error interno del servidor");
  }
}
