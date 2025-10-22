import axios from './root.service.js';

const API_URL = '/bombero';

/**
 * Servicio para manejar imágenes de bomberos con URLs firmadas
 */
class BomberoImageService {
  
  /**
   * Obtiene una URL firmada para la imagen de perfil de un bombero específico
   * @param {number} bomberoId - ID del bombero
   * @returns {Promise<string|null>} URL firmada o null
   */
  async getBomberoProfileImageURL(bomberoId) {
    try {
      const response = await axios.get(`${API_URL}/${bomberoId}/imagen-perfil-url`);
      
      if (response.data?.status === 'Success' && response.data?.data?.url) {
        return response.data.data.url;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener URL de imagen de perfil del bombero:', error);
      return null;
    }
  }

  /**
   * Obtiene URLs firmadas para múltiples bomberos
   * @param {Array<number>} bomberosIds - Array de IDs de bomberos
   * @returns {Promise<Map<number, string>>} Mapa de ID -> URL firmada
   */
  async getBomberosProfileImagesURLs(bomberosIds) {
    const imageMap = new Map();
    
    if (!bomberosIds || bomberosIds.length === 0) {
      return imageMap;
    }

    try {
      // Procesar en lotes para evitar sobrecargar el servidor
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < bomberosIds.length; i += batchSize) {
        batches.push(bomberosIds.slice(i, i + batchSize));
      }

      // Procesar cada lote
      for (const batch of batches) {
        const promises = batch.map(async (bomberoId) => {
          try {
            const url = await this.getBomberoProfileImageURL(bomberoId);
            if (url) {
              imageMap.set(bomberoId, url);
            }
          } catch (error) {
            console.warn(`Error obteniendo imagen para bombero ${bomberoId}:`, error);
          }
        });

        await Promise.all(promises);
      }
    } catch (error) {
      console.error('Error obteniendo URLs de imágenes de bomberos:', error);
    }

    return imageMap;
  }

  /**
   * Obtiene la URL de la imagen por defecto
   * @returns {string|null} URL de la imagen por defecto o null para usar componente DefaultAvatar
   */
  getDefaultAvatarURL() {
    return null; // Usar componente DefaultAvatar en lugar de imagen estática
  }

  /**
   * Verifica si una URL es válida
   * @param {string} url - URL a verificar
   * @returns {boolean} True si la URL es válida
   */
  isValidImageURL(url) {
    return url && url.trim() !== '' && url !== 'null' && url !== 'undefined';
  }
}

export default new BomberoImageService();
