import axios from './root.service.js';

/**
 * Obtiene el ranking de asistencia de voluntarios (incidentes APROBADOS + eventos)
 * @param {number} fechaInicio - Timestamp de inicio
 * @param {number} fechaFin - Timestamp de fin
 * @param {number} idcompania - ID de la compañía
 */
export async function getRankingAsistencia(fechaInicio, fechaFin, idcompania) {
  try {
    const response = await axios.post('/dashboard/compania/asistencia/ranking', {
      fechaInicio,
      fechaFin,
      idcompania
    });
    console.log("Ranking Asistencia Response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching ranking asistencia:', error);
    throw error;
  }
}
