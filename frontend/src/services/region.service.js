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
