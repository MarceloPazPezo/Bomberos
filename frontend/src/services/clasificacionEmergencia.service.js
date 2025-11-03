import API from './root.service.js';

/**
 * Servicio para gestión de Clasificaciones de Emergencia
 */
export async function fetchClasificacionesEmergencia({ search = '', page = 1, limit = 200 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  console.debug('[API] GET /clasificacion-emergencia', { params });
  const { data } = await API.get('/clasificacion-emergencia', { params });
  console.debug('[API] /clasificacion-emergencia response', data);
  return data.data || data;
}

export async function createClasificacionEmergencia(payload) {
  const { data } = await API.post('/clasificacion-emergencia', payload);
  return data.data;
}

export async function updateClasificacionEmergencia(id, payload) {
  const { data } = await API.patch(`/clasificacion-emergencia/detalle/${id}`, payload);
  return data.data;
}

export async function deleteClasificacionEmergencia(id) {
  try {
    const { data } = await API.delete(`/clasificacion-emergencia/detalle/${id}`);
    return data.data;
  } catch (error) {
    console.error('[CLASIFICACION_EMERGENCIA_SERVICE] Error al eliminar clasificación de emergencia:', error);
    throw error;
  }
}

export async function getClasificacionEmergenciaById(id) {
  const { data } = await API.get(`/clasificacion-emergencia/detalle/${id}`);
  return data.data;
}

