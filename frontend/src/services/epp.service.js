import axios from './root.service.js';

/**
 * Servicio para gestión de EPP (Equipos de Protección Personal)
 */
class EppService {
  /**
   * Obtiene todos los EPP con filtros y paginación
   */
  async getEpp(params = {}) {
    try {
      const response = await axios.get('/epp', { params });
      return response.data;
    } catch (error) {
      console.error('[EPP_SERVICE] Error obteniendo EPP:', error);
      throw error;
    }
  }

  /**
   * Obtiene un EPP por ID
   */
  async getEppById(id) {
    try {
      const response = await axios.get(`/epp/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[EPP_SERVICE] Error obteniendo EPP ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo EPP
   */
  async createEpp(eppData) {
    try {
      console.log('[EPP_SERVICE] Creando EPP:', eppData);
      const response = await axios.post('/epp', eppData);
      return response.data;
    } catch (error) {
      console.error('[EPP_SERVICE] Error creando EPP:', error);
      throw error;
    }
  }

  /**
   * Actualiza un EPP existente
   */
  async updateEpp(id, eppData) {
    try {
      console.log(`[EPP_SERVICE] Actualizando EPP ${id}:`, eppData);
      const response = await axios.put(`/epp/${id}`, eppData);
      return response.data;
    } catch (error) {
      console.error(`[EPP_SERVICE] Error actualizando EPP ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un EPP
   */
  async deleteEpp(id) {
    try {
      console.log(`[EPP_SERVICE] Eliminando EPP ${id}`);
      const response = await axios.delete(`/epp/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[EPP_SERVICE] Error eliminando EPP ${id}:`, error);
      throw error;
    }
  }

  /**
   * Asigna un EPP a un bombero
   */
  async assignEppToBombero(eppId, fichaBomberoId) {
    try {
      console.log(`[EPP_SERVICE] Asignando EPP ${eppId} a ficha ${fichaBomberoId}`);
      const response = await axios.post(`/epp/${eppId}/asignar`, {
        fichaBomberoId
      });
      return response.data;
    } catch (error) {
      console.error(`[EPP_SERVICE] Error asignando EPP:`, error);
      throw error;
    }
  }

  /**
   * Desasigna un EPP de un bombero
   */
  async unassignEppFromBombero(eppId) {
    try {
      console.log(`[EPP_SERVICE] Desasignando EPP ${eppId}`);
      const response = await axios.delete(`/epp/${eppId}/asignar`);
      return response.data;
    } catch (error) {
      console.error(`[EPP_SERVICE] Error desasignando EPP:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todos los tipos de EPP
   */
  async getTiposEpp() {
    try {
      const response = await axios.get('/epp/tipos');
      return response.data;
    } catch (error) {
      console.error('[EPP_SERVICE] Error obteniendo tipos de EPP:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los estados de EPP
   */
  async getEstadosEpp() {
    try {
      const response = await axios.get('/epp/estados');
      return response.data;
    } catch (error) {
      console.error('[EPP_SERVICE] Error obteniendo estados de EPP:', error);
      throw error;
    }
  }

  /**
   * Obtiene EPP disponibles (no asignados)
   */
  async getEppDisponibles() {
    try {
      const response = await axios.get('/epp/disponibles');
      return response.data;
    } catch (error) {
      console.error('[EPP_SERVICE] Error obteniendo EPP disponibles:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas del inventario
   */
  async getInventarioStats() {
    try {
      const response = await axios.get('/epp/stats');
      return response.data;
    } catch (error) {
      console.error('[EPP_SERVICE] Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Busca EPP con filtros avanzados
   */
  async searchEpp(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.idTipoEpp) params.append('idTipoEpp', filters.idTipoEpp);
      if (filters.idEstadoEpp) params.append('idEstadoEpp', filters.idEstadoEpp);
      if (filters.idBombero) params.append('idBombero', filters.idBombero);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axios.get(`/epp?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('[EPP_SERVICE] Error buscando EPP:', error);
      throw error;
    }
  }

  /**
   * Obtiene EPP asignados a un bombero específico
   */
  async getEppByBombero(bomberoId) {
    try {
      const response = await axios.get(`/epp?idBombero=${bomberoId}`);
      return response.data;
    } catch (error) {
      console.error(`[EPP_SERVICE] Error obteniendo EPP del bombero ${bomberoId}:`, error);
      throw error;
    }
  }
}

export default new EppService();













