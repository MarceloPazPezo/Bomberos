import API from './root.service';

/**
 * Servicio para gestión de Claves Radiales
 */
export async function fetchClavesRadiales({ search = '', page = 1, limit = 200 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  console.debug('[API] GET /clave-radial', { params });
  const { data } = await API.get('/clave-radial', { params });
  console.debug('[API] /clave-radial response', data);
  return data.data || data; // Compatible con diferentes formatos de respuesta
}

export async function createClaveRadial(payload) {
  const { data } = await API.post('/clave-radial', payload);
  return data.data;
}

export async function updateClaveRadial(id, payload) {
  const { data } = await API.patch(`/clave-radial/detalle/${id}`, payload);
  return data.data;
}

export async function deleteClaveRadial(id) {
  try {
    const { data } = await API.delete(`/clave-radial/detalle/${id}`);
    return data.data;
  } catch (error) {
    console.error('[CLAVE_RADIAL_SERVICE] Error al eliminar clave radial:', error);
    throw error; // Lanzar el error para que el componente lo maneje
  }
}

export async function getClaveRadialById(id) {
  const { data } = await API.get(`/clave-radial/detalle/${id}`);
  return data.data;
}

