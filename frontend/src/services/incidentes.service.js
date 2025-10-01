import axios from './root.service.js';

// Devuelve lista de incidentes con su último estado y detalles mínimos para el kanban/drawer
export const getIncidentesResumen = async () => {
  try {
    const resp = await axios.get('/incidentes/resumen');
    // backend devuelve { status, message, data }
    console.log("Datos recibidos del backend22:", resp);
    return resp.data?.data ?? resp.data;
  } catch (error) {
    console.error('Error al obtener incidentes resumen:', error);
    throw error.response?.data || error;
  }
};
