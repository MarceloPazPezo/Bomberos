import API from './root.service.js';

// Funciones existentes (sin autenticación) - para uso en formularios
export const getClasificacionesEmergencia = async () => {
  try {
    const response = await API.get('/subtipoIncidente/clasificaciones'); 
    return response.data.data;
    } catch (error) { 
        console.error('Error al obtener clasificaciones de emergencia:', error);
        throw error.response?.data || error;
    }
}

export const getSubtiposIncidente = async (idClasificacion) => {
    try {
      const response = await API.get('/subtipoIncidente/subtipos/' + idClasificacion);
      console.log(response.data.data);
        return response.data.data;
    } catch (error) {
        console.error('Error al obtener subtipos de incidente:', error);
        throw error.response?.data || error;
    }
};

export const getTiposDano = async () => {
    try {
      const response = await API.get('/subtipoIncidente/tiposDano');
        return response.data.data;
    } catch (error) {
        console.error('Error al obtener tipos de daño:', error);
        throw error.response?.data || error;
    }
};

export const getFasesIncidente = async () => {
    try {
      const response = await API.get('/subtipoIncidente/fasesIncidente');
        return response.data.data;
    } catch (error) {
        console.error('Error al obtener fases de incidente:', error);
        throw error.response?.data || error;
    }
};

// ===== CRUD COMPLETO PARA SUBTIPO INCIDENTE =====

/**
 * Servicio para gestión de Subtipos de Incidente
 */
export async function fetchSubtiposIncidentes({ search = '', page = 1, limit = 200, clasificacion = null } = {}) {
  const params = {};
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (clasificacion) params.clasificacion = clasificacion;
  console.debug('[API] GET /subtipoIncidente', { params });
  const { data } = await API.get('/subtipoIncidente', { params });
  console.debug('[API] /subtipoIncidente response', data);
  return data.data || data;
}

export async function createSubtipoIncidente(payload) {
  const { data } = await API.post('/subtipoIncidente', payload);
  return data.data;
}

export async function updateSubtipoIncidente(id, payload) {
  const { data } = await API.patch(`/subtipoIncidente/detalle/${id}`, payload);
  return data.data;
}

export async function deleteSubtipoIncidente(id) {
  try {
    const { data } = await API.delete(`/subtipoIncidente/detalle/${id}`);
    return data.data;
  } catch (error) {
    console.error('[SUBTIPO_INCIDENTE_SERVICE] Error al eliminar subtipo de incidente:', error);
    throw error;
  }
}

export async function getSubtipoIncidenteById(id) {
  const { data } = await API.get(`/subtipoIncidente/detalle/${id}`);
  return data.data;
}

