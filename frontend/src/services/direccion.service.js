import axios from './root.service.js';

const API_URL = '/direccion';

export const direccionService = {
  /**
   * Crea una nueva dirección
   * @param {Object} direccionData - Datos de la dirección
   * @returns {Promise<Object>} Respuesta con la dirección creada
   */
  async createDireccion(direccionData) {
    try {
      const response = await axios.post(`${API_URL}/`, direccionData);
      return response.data;
    } catch (error) {
      console.error('Error al crear dirección:', error);
      throw error;
    }
  },

  /**
   * Obtiene una dirección por ID
   * @param {number} id - ID de la dirección
   * @returns {Promise<Object>} Respuesta con la dirección
   */
  async getDireccionById(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      throw error;
    }
  },

  /**
   * Actualiza una dirección
   * @param {number} id - ID de la dirección
   * @param {Object} direccionData - Datos actualizados
   * @returns {Promise<Object>} Respuesta con la dirección actualizada
   */
  async updateDireccion(id, direccionData) {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, direccionData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar dirección:', error);
      throw error;
    }
  },

  /**
   * Elimina una dirección
   * @param {number} id - ID de la dirección
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  async deleteDireccion(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      throw error;
    }
  },

  /**
   * Busca direcciones por criterios
   * @param {Object} criterios - Criterios de búsqueda
   * @returns {Promise<Object>} Respuesta con las direcciones encontradas
   */
  async searchDirecciones(criterios) {
    try {
      const response = await axios.get(`${API_URL}/search/criterios`, {
        params: criterios
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar direcciones:', error);
      throw error;
    }
  }
};