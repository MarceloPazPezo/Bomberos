import axios from './root.service.js';

const API_URL = '/compania';

/**
 * Servicio para manejar imágenes de compañías con URLs firmadas
 */
class CompaniaImageService {
  
  /**
   * Obtiene una URL firmada para el logo de una compañía específica
   * @param {number} companiaId - ID de la compañía
   * @returns {Promise<string|null>} URL firmada o null
   */
  async getCompaniaLogoURL(companiaId) {
    try {
      const response = await axios.get(`${API_URL}/${companiaId}/logo-url`);
      
      if (response.data?.status === 'Success' && response.data?.data?.url) {
        return response.data.data.url;
      } else {
        return null;
      }
    } catch (error) {
      // Solo mostrar error si no es un 404 (compañía sin logo)
      if (error.response?.status !== 404) {
        console.error('Error al obtener URL de logo de la compañía:', error);
      }
      return null;
    }
  }

  /**
   * Obtiene URLs firmadas para múltiples compañías
   * @param {Array<number>} companiasIds - Array de IDs de compañías
   * @returns {Promise<Map<number, string>>} Mapa de ID -> URL firmada
   */
  async getCompaniasLogosURLs(companiasIds) {
    const imageMap = new Map();
    
    if (!companiasIds || companiasIds.length === 0) {
      return imageMap;
    }

    try {
      // Procesar en lotes para evitar sobrecargar el servidor
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < companiasIds.length; i += batchSize) {
        batches.push(companiasIds.slice(i, i + batchSize));
      }

      // Procesar cada lote
      for (const batch of batches) {
        const promises = batch.map(async (companiaId) => {
          try {
            const url = await this.getCompaniaLogoURL(companiaId);
            if (url) {
              imageMap.set(companiaId, url);
            }
          } catch (error) {
            // Solo mostrar warning si no es un 404 esperado
            if (error.response?.status !== 404) {
              console.warn(`Error obteniendo logo para compañía ${companiaId}:`, error);
            }
          }
        });

        await Promise.all(promises);
      }
    } catch (error) {
      console.error('Error obteniendo URLs de logos de compañías:', error);
    }

    return imageMap;
  }

  /**
   * Obtiene la URL de la imagen por defecto para compañías
   * @returns {string|null} URL de la imagen por defecto o null para usar componente DefaultLogo
   */
  getDefaultLogoURL() {
    return null; // Usar componente DefaultLogo en lugar de imagen estática
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

export default new CompaniaImageService();
