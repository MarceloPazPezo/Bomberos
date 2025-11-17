import API from './root.service';

/**
 * Servicio para gestión de Tipos de EPP
 */
export async function fetchTiposEpp({ search = '', page = 1, limit = 200 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  console.debug('[API] GET /tipo-epp', { params });
  const { data } = await API.get('/tipo-epp', { params });
  console.debug('[API] /tipo-epp response', data);
  return data.data || data; // Compatible con diferentes formatos de respuesta
}

export async function createTipoEpp(payload) {
  const { data } = await API.post('/tipo-epp', payload);
  return data.data;
}

export async function updateTipoEpp(id, payload) {
  const { data } = await API.patch(`/tipo-epp/detalle/${id}`, payload);
  return data.data;
}

export async function deleteTipoEpp(id) {
  try {
    const { data } = await API.delete(`/tipo-epp/detalle/${id}`);
    return data.data;
  } catch (error) {
    console.error('[TIPO_EPP_SERVICE] Error al eliminar tipo EPP:', error);
    throw error; // Lanzar el error para que el componente lo maneje
  }
}

export async function getTipoEppById(id) {
  const { data } = await API.get(`/tipo-epp/detalle/${id}`);
  return data.data;
}

