import API from './root.service';

/**
 * Servicio para gestión de Estados de EPP
 */
export async function fetchEstadosEpp({ search = '', page = 1, limit = 200 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  console.debug('[API] GET /estado-epp', { params });
  const { data } = await API.get('/estado-epp', { params });
  console.debug('[API] /estado-epp response', data);
  return data.data || data; // Compatible con diferentes formatos de respuesta
}

export async function createEstadoEpp(payload) {
  const { data } = await API.post('/estado-epp', payload);
  return data.data;
}

export async function updateEstadoEpp(id, payload) {
  const { data } = await API.patch(`/estado-epp/detalle/${id}`, payload);
  return data.data;
}

export async function deleteEstadoEpp(id) {
  try {
    const { data } = await API.delete(`/estado-epp/detalle/${id}`);
    return data.data;
  } catch (error) {
    console.error('[ESTADO_EPP_SERVICE] Error al eliminar estado EPP:', error);
    throw error; // Lanzar el error para que el componente lo maneje
  }
}

export async function getEstadoEppById(id) {
  const { data } = await API.get(`/estado-epp/detalle/${id}`);
  return data.data;
}

