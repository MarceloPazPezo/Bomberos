import axios from './root.service.js';

const API_URL = '/tipoSangre';

export const tipoSangreService = {
  /**
   * Obtiene todos los tipos de sangre disponibles
   */
  async getTiposSangre() {
    try {
      const response = await axios.get(`${API_URL}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipos de sangre:', error);
      throw error;
    }
  },

  /**
   * Obtiene un tipo de sangre por ID
   */
  async getTipoSangreById(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipo de sangre:', error);
      throw error;
    }
  }
};
