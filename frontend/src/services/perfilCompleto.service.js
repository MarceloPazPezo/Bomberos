import axios from './root.service.js';

const API_URL = '/perfil-completo';

/**
 * Servicio para gestionar el perfil completo del bombero
 */
export const perfilCompletoService = {
  
  /**
   * Actualiza la información personal del bombero
   * @param {Object} data - Datos de información personal
   * @returns {Promise<Object>} Respuesta de la API
   */
  async updateInformacionPersonal(data) {
    try {
      // Verificar si hay archivos para enviar
      const hasFiles = data.profileImage || (data.licenseDocuments && data.licenseDocuments.length > 0);
      
      let requestData;
      let headers = {};
      
      if (hasFiles) {
        // Usar FormData para archivos
        requestData = new FormData();
        
        // Agregar campos de texto
        Object.keys(data).forEach(key => {
          if (key === 'profileImage' && data[key]) {
            // Agregar archivo de imagen de perfil
            requestData.append('profileImage', data[key]);
          } else if (key === 'licenseDocuments' && data[key] && data[key].length > 0) {
            // Agregar documentos de licencia
            data[key].forEach((file, index) => {
              requestData.append(`licenseDocuments`, file);
            });
          } else if (key !== 'profileImage' && key !== 'licenseDocuments') {
            // Agregar otros campos como texto
            if (data[key] !== null && data[key] !== undefined) {
              requestData.append(key, data[key]);
            }
          }
        });
        
        // Configurar headers para FormData
        headers = {
          'Content-Type': 'multipart/form-data'
        };
      } else {
        // Usar JSON normal para datos sin archivos
        requestData = data;
      }
      
      console.log('Enviando datos al backend:', {
        hasFiles,
        data: hasFiles ? 'FormData' : requestData,
        headers,
        profileImage: data.profileImage ? `${data.profileImage.name} (${data.profileImage.size} bytes)` : 'No hay imagen',
        licenseDocuments: data.licenseDocuments ? `${data.licenseDocuments.length} documentos` : 'No hay documentos'
      });
      
      const response = await axios.patch(`${API_URL}/informacion-personal`, requestData, { headers });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar información personal:', error);
      throw error;
    }
  },

  /**
   * Agrega un contacto de emergencia
   * @param {Object} contactoData - Datos del contacto
   * @returns {Promise<Object>} Respuesta de la API
   */
  async addContactoEmergencia(contactoData) {
    try {
      const response = await axios.post(`${API_URL}/contactos-emergencia`, contactoData);
      return response.data;
    } catch (error) {
      console.error('Error al agregar contacto de emergencia:', error);
      throw error;
    }
  },

  /**
   * Actualiza un contacto de emergencia
   * @param {number} id - ID del contacto
   * @param {Object} contactoData - Datos actualizados del contacto
   * @returns {Promise<Object>} Respuesta de la API
   */
  async updateContactoEmergencia(id, contactoData) {
    try {
      const response = await axios.put(`${API_URL}/contactos-emergencia/${id}`, contactoData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar contacto de emergencia:', error);
      throw error;
    }
  },

  /**
   * Elimina un contacto de emergencia
   * @param {number} id - ID del contacto
   * @returns {Promise<Object>} Respuesta de la API
   */
  async deleteContactoEmergencia(id) {
    try {
      const response = await axios.delete(`${API_URL}/contactos-emergencia/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar contacto de emergencia:', error);
      throw error;
    }
  },

  /**
   * Agrega una capacitación
   * @param {Object} capacitacionData - Datos de la capacitación
   * @returns {Promise<Object>} Respuesta de la API
   */
  async addCapacitacion(capacitacionData) {
    try {
      const response = await axios.post(`${API_URL}/capacitaciones`, capacitacionData);
      return response.data;
    } catch (error) {
      console.error('Error al agregar capacitación:', error);
      throw error;
    }
  },

  /**
   * Actualiza una capacitación
   * @param {number} id - ID de la capacitación
   * @param {Object} capacitacionData - Datos actualizados de la capacitación
   * @returns {Promise<Object>} Respuesta de la API
   */
  async updateCapacitacion(id, capacitacionData) {
    try {
      const response = await axios.put(`${API_URL}/capacitaciones/${id}`, capacitacionData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar capacitación:', error);
      throw error;
    }
  },

  /**
   * Elimina una capacitación
   * @param {number} id - ID de la capacitación
   * @returns {Promise<Object>} Respuesta de la API
   */
  async deleteCapacitacion(id) {
    try {
      const response = await axios.delete(`${API_URL}/capacitaciones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar capacitación:', error);
      throw error;
    }
  },

  /**
   * Cambia la contraseña del bombero
   * @param {Object} passwordData - Datos de cambio de contraseña
   * @returns {Promise<Object>} Respuesta de la API
   */
  async changePassword(passwordData) {
    try {
      const response = await axios.patch(`${API_URL}/cambiar-contraseña`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  },

  /**
   * Actualiza un EPP asignado al bombero
   * @param {number} idEpp - ID del EPP
   * @param {Object} eppData - Datos actualizados del EPP
   * @returns {Promise<Object>} Respuesta de la API
   */
  async updateEppAsignado(idEpp, eppData) {
    try {
      const response = await axios.patch(`${API_URL}/epp/${idEpp}`, eppData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar EPP ${idEpp}:`, error);
      throw error;
    }
  }
};

export default perfilCompletoService;
