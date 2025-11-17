import API from './root.service';

/**
 * Servicio para gestión de Vínculos
 */
export async function fetchVinculos({ search = '', page = 1, limit = 200 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  const { data } = await API.get('/vinculo', { params });
  return data.data || data; // Compatible con diferentes formatos de respuesta
}

export async function createVinculo(payload) {
  const { data } = await API.post('/vinculo', payload);
  return data.data;
}

export async function updateVinculo(id, payload) {
  const { data } = await API.patch(`/vinculo/detalle/${id}`, payload);
  return data.data;
}

export async function deleteVinculo(id) {
  try {
    const { data } = await API.delete(`/vinculo/detalle/${id}`);
    return data.data;
  } catch (error) {
    console.error('[VINCULO_SERVICE] Error al eliminar vínculo:', error);
    throw error; // Lanzar el error para que el componente lo maneje
  }
}

export async function getVinculoById(id) {
  const { data } = await API.get(`/vinculo/detalle/${id}`);
  return data.data;
}

