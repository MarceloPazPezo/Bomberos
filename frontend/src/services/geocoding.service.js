import API from '@services/root.service';

const API_URL = '/geocoding';

/**
 * Servicio de geocodificación en el frontend
 * Obtiene coordenadas de ubicaciones usando el backend
 */
export const geocodingService = {
  /**
   * Geocodifica una ubicación genérica
   * @param {string} query - Nombre de la ubicación
   * @param {string} country - País (default: "Chile")
   * @returns {Promise<Object>} { lat, lng }
   */
  async geocode(query, country = 'Chile') {
    try {
      const response = await API.get(API_URL, {
        params: { query, country }
      });
      return response.data.data; // { lat, lng }
    } catch (error) {
      console.error('Error al geocodificar:', error);
      throw error;
    }
  },

  /**
   * Geocodifica una comuna específica
   * @param {string} comuna - Nombre de la comuna
   * @param {string} region - Nombre de la región (opcional)
   * @returns {Promise<Object>} { lat, lng }
   */
  async geocodeComuna(comuna, region = null) {
    try {
      const params = { comuna };
      if (region) params.region = region;
      
      console.log('[GeocodingService] Llamando a geocodificación API:', `${API_URL}/comuna`, params);
      const response = await API.get(`${API_URL}/comuna`, { params });
      console.log('[GeocodingService] Respuesta de geocodificación:', response.data);
      
      // Verificar que la respuesta tenga el formato esperado
      if (response.data && response.data.status === 'Success' && response.data.data) {
        return response.data.data; // { lat, lng }
      } else {
        console.warn('[GeocodingService] Respuesta de geocodificación con formato inesperado:', response.data);
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (error) {
      console.error('[GeocodingService] Error al geocodificar comuna:', error);
      // Si es un error 404, retornar null en lugar de lanzar error
      if (error.response && error.response.status === 404) {
        console.warn('[GeocodingService] Comuna no encontrada en servicio de geocodificación');
        return null;
      }
      throw error;
    }
  }
};

export default geocodingService;

