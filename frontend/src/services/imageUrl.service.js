import axios from './root.service.js';

const API_URL = '/perfil-completo';

export const imageUrlService = {
  /**
   * Obtiene una URL firmada para una imagen de perfil
   * @param {string} imageKey - KEY de la imagen en MinIO (no se usa, el backend lo obtiene del usuario autenticado)
   * @returns {Promise<string|null>} URL firmada o null
   */
  async getProfileImageURL(imageKey) {
    try {
      const response = await axios.get(`${API_URL}/imagen-perfil-url`);
      
      if (response.data?.status === 'Success' && response.data?.data?.url) {
        return response.data.data.url;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener URL de imagen de perfil:', error);
      return null;
    }
  }
};
