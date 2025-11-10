import axios from './root.service.js';


export async function getCantidadDeIncidentesDiasdelaSemana(fechaInicio, fechaFin, idcompania) {
  try {
    const response = await axios.post('/dashboard/compania/incidente/diasdelaSemana', {
      fechaInicio,
      fechaFin,
      idcompania
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching incident data:", error);
    throw error;
  }
}


export async function getCantidadDeIncidentesMeses(añoDesde, añoHasta, idcompania) {
  try {
    const response = await axios.post('/dashboard/compania/incidente/meses', {
      añoDesde,
      añoHasta,
      idcompania
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching incident data:", error);
    throw error;
  }
}

export async function getClavesRadialesMasRepetidas(fechaInicio, fechaFin, idcompania) {
  try {
    const response = await axios.post('/dashboard/compania/incidente/clavesRadiales', {
      fechaInicio,
      fechaFin,
      idcompania
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching claves radiales:", error);
    throw error;
  }
}

export async function getIncidentesPorFranjaHoraria(fechaInicio, fechaFin, idcompania) {
  try {
    const response = await axios.post('/dashboard/compania/incidente/franjaHoraria', {
      fechaInicio,
      fechaFin,
      idcompania
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching incidentes por franja horaria:", error);
    throw error;
  }
}

export async function getHeatmapDiaHora(fechaInicio, fechaFin, idcompania) {
  try {
    const response = await axios.post('/dashboard/compania/incidente/heatmapDiaHora', {
      fechaInicio,
      fechaFin,
      idcompania
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching heatmap día-hora:", error);
    throw error;
  }
}

export async function getAsistenciaPromedio(fechaInicio, fechaFin, idcompania) {
  try {
    const response = await axios.post('/dashboard/compania/kpi/asistenciaPromedio', {
      fechaInicio,
      fechaFin,
      idcompania
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching asistencia promedio:", error);
    throw error;
  }
}

export async function getHeatmapDisponibilidad(fechaInicio, fechaFin, idcompania) {
  try {
    const response = await axios.post('/dashboard/compania/incidente/heatmapDisponibilidad', {
      fechaInicio,
      fechaFin,
      idcompania
    });
    console.log("Heatmap Disponibilidad Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching heatmap disponibilidad:", error);
    throw error;
  }
}

// ============================================
// Servicios para Dashboard de Eventos
// ============================================

/**
 * Obtiene la cantidad de eventos por día de la semana
 */
export async function getCantidadDeEventosDiasdelaSemana(fechaInicio, fechaFin) {
  try {
    const response = await axios.post('/dashboard/compania/evento/diasdelaSemana', {
      fechaInicio,
      fechaFin
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching eventos por día:", error);
    throw error;
  }
}

/**
 * Obtiene la cantidad de eventos por mes
 */
export async function getCantidadDeEventosMeses(añoDesde, añoHasta) {
  try {
    const response = await axios.post('/dashboard/compania/evento/meses', {
      añoDesde,
      añoHasta
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching eventos por mes:", error);
    throw error;
  }
}

/**
 * Obtiene la cantidad de eventos según la granularidad seleccionada
 * @param {string} granularidad - 'semana' | 'mes' | 'año'
 */
export async function getCantidadDeEventosPorGranularidad(fechaInicio, fechaFin, granularidad = 'mes') {
  try {
    const response = await axios.post('/dashboard/compania/evento/granularidad', {
      fechaInicio,
      fechaFin,
      granularidad
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching eventos por granularidad:", error);
    throw error;
  }
}

/**
 * Obtiene la cantidad de eventos por tipo dentro del rango de fechas
 */
export async function getCantidadDeEventosPorTipo(fechaInicio, fechaFin) {
  try {
    const response = await axios.post('/dashboard/compania/evento/tipo', {
      fechaInicio,
      fechaFin
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching eventos por tipo:', error);
    throw error;
  }
}

/**
 * Obtiene el promedio de asistencia de bomberos por tipo de evento
 */
export async function getPromedioAsistenciaPorTipoEvento(fechaInicio, fechaFin) {
  try {
    const response = await axios.post('/dashboard/compania/evento/asistencia/promedio', {
      fechaInicio,
      fechaFin
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching promedio asistencia por tipo evento:', error);
    throw error;
  }
}

/**
 * Obtiene la tendencia mensual de asistencia a eventos (suma de asistentes por mes)
 */
export async function getTendenciaMensualAsistencia(fechaInicio, fechaFin) {
  try {
    const response = await axios.post('/dashboard/compania/evento/asistencia/tendencia', {
      fechaInicio,
      fechaFin
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tendencia mensual asistencia:', error);
    throw error;
  }
}

/**
 * Obtiene la evolución diaria de eventos y asistentes
 * Permite filtrar opcionalmente por tipo de evento
 */
export async function getEvolucionEventosYAsistentes(fechaInicio, fechaFin, idTipoEvento = null) {
  try {
    const response = await axios.post('/dashboard/compania/evento/evolucion', {
      fechaInicio,
      fechaFin,
      idTipoEvento
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching evolución eventos y asistentes:', error);
    throw error;
  }
}

/**
 * Obtiene la lista de todos los tipos de evento disponibles
 * Usada para los filtros del dashboard de eventos
 */
export async function getTiposEvento() {
  try {
    const response = await axios.get('/dashboard/tipos-evento');
    return response.data;
  } catch (error) {
    console.error('Error fetching tipos de evento:', error);
    throw error;
  }
}

/**
 * Obtiene el porcentaje de participación de voluntarios en eventos
 * @param {number} fechaInicio - Timestamp de inicio
 * @param {number} fechaFin - Timestamp de fin
 * @param {Array<number>|null} idsEventos - Array de IDs de tipos de evento, o null para todos
 */
export async function getPorcentajeParticipacion(fechaInicio, fechaFin, idsEventos = null) {
  try {
    const response = await axios.post('/dashboard/compania/evento/participacion', {
      fechaInicio,
      fechaFin,
      idsEventos
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching porcentaje participación:', error);
    throw error;
  }
}
