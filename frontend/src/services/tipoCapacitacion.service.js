import API from './root.service';

/**
 * Servicio para gestión de Tipos de Capacitación
 */
export async function fetchTiposCapacitacion({ search = '', page = 1, limit = 200 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  const { data } = await API.get('/tipo-capacitacion', { params });
  return data.data || data; // Compatible con diferentes formatos de respuesta
}

export async function createTipoCapacitacion(payload) {
  const { data } = await API.post('/tipo-capacitacion', payload);
  return data.data;
}

export async function updateTipoCapacitacion(id, payload) {
  const { data } = await API.patch(`/tipo-capacitacion/detalle/${id}`, payload);
  return data.data;
}

export async function deleteTipoCapacitacion(id) {
  try {
    const { data } = await API.delete(`/tipo-capacitacion/detalle/${id}`);
    return data.data;
  } catch (error) {
    console.error('[TIPO_CAPACITACION_SERVICE] Error al eliminar tipo de capacitación:', error);
    throw error;
  }
}

export async function getTipoCapacitacionById(id) {
  const { data } = await API.get(`/tipo-capacitacion/detalle/${id}`);
  return data.data;
}

