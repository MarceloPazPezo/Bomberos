import API from '@services/root.service';

export async function fetchRegiones({ search = '', page = 1, limit = 50 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  console.debug('[API] GET /regiones', { params });
  const { data } = await API.get('/region/regiones', { params });
  console.debug('[API] /regiones response', data);
  return data.data; // { regiones, pagination }
}

export async function createRegion(payload) {
  const { data } = await API.post('/region/regiones', payload);
  return data.data;
}

export async function updateRegion(id, payload) {
  const { data } = await API.put(`/region/regiones/${id}`, payload);
  return data.data;
}

export async function deleteRegion(id) {
  const { data } = await API.delete(`/region/regiones/${id}`);
  return data.data;
}

export async function createComuna(payload) {
  const { data } = await API.post('/comuna/', payload);
  return data.data;
}

export async function updateComuna(id, payload) {
  const { data } = await API.patch(`/comuna/detalle/${id}`, payload);
  return data.data;
}

export async function deleteComuna(id) {
  const { data } = await API.delete(`/comuna/detalle/${id}`);
  return data.data;
}

export async function fetchComunas({ search = '', idRegion, page = 1, limit = 50 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (idRegion) params.idRegion = idRegion;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  console.debug('[API] GET /comunas', { params });
  const { data } = await API.get('/region/comunas', { params });
  console.debug('[API] /comunas response', data);
  return data.data; // puede ser { comunas, pagination } del backend de comunas
}

import axios from './root.service.js';

const API_URL = '/region';

export const regionService = {
  /**
   * Obtiene todas las regiones
   * @returns {Promise<Object>} Respuesta con las regiones
   */
  async getAllRegiones() {
    try {
      const response = await axios.get(`${API_URL}/regiones`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener regiones:', error);
      throw error;
    }
  },

  /**
   * Obtiene una región por ID
   * @param {number} id - ID de la región
   * @returns {Promise<Object>} Respuesta con la región
   */
  async getRegionById(id) {
    try {
      const response = await axios.get(`${API_URL}/regiones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener región:', error);
      throw error;
    }
  },

  /**
   * Obtiene todas las comunas
   * @returns {Promise<Object>} Respuesta con las comunas
   */
  async getAllComunas() {
    try {
      const response = await axios.get(`${API_URL}/comunas`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener comunas:', error);
      throw error;
    }
  },

  /**
   * Obtiene comunas por región
   * @param {number} idRegion - ID de la región
   * @returns {Promise<Object>} Respuesta con las comunas de la región
   */
  async getComunasByRegion(idRegion) {
    try {
      const response = await axios.get(`${API_URL}/comunas/region/${idRegion}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener comunas por región:', error);
      throw error;
    }
  },

  /**
   * Obtiene una comuna por ID
   * @param {number} id - ID de la comuna
   * @returns {Promise<Object>} Respuesta con la comuna
   */
  async getComunaById(id) {
    try {
      const response = await axios.get(`${API_URL}/comunas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener comuna:', error);
      throw error;
    }
  }
};

// Exportar funciones individuales para compatibilidad
export const getRegiones = async () => {
  try {
    const response = await axios.get(`${API_URL}/regiones`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener regiones:', error);
    throw error;
  }
};

export const getComunas = async () => {
  try {
    const response = await axios.get(`${API_URL}/comunas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener comunas:', error);
    throw error;
  }
};
