import axios from './root.service.js';

/**
 * Servicio para manejar fichas de bomberos
 */
class FichaBomberoService {
  
  /**
   * Crear nueva ficha de bombero
   * @param {Object} fichaData - Datos de la ficha
   * @returns {Promise<Object>} - Respuesta de la creación
   */
  async createFichaBombero(fichaData) {
    try {
      const response = await axios.post('/fichaBombero/', fichaData);
      return response.data;
    } catch (error) {
      console.error('Error creating ficha bombero:', error);
      return error.response?.data || { 
        status: 'Error', 
        message: 'Error al crear la ficha del bombero' 
      };
    }
  }

  /**
   * Obtener ficha de bombero por ID
   * @param {number} id - ID de la ficha
   * @returns {Promise<Object>} - Datos de la ficha
   */
  async getFichaBombero(id) {
    try {
      const response = await axios.get(`/fichaBombero/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting ficha bombero:', error);
      return error.response?.data || { 
        status: 'Error', 
        message: 'Error al obtener la ficha del bombero' 
      };
    }
  }

  /**
   * Obtener ficha de bombero por ID del bombero
   * @param {number} idBombero - ID del bombero
   * @returns {Promise<Object>} - Datos de la ficha
   */
  async getFichaBomberoByBomberoId(idBombero) {
    try {
      const response = await axios.get(`/fichaBombero/bombero/${idBombero}`);
      return response.data;
    } catch (error) {
      console.error('Error getting ficha bombero by bombero ID:', error);
      return error.response?.data || { 
        status: 'Error', 
        message: 'Error al obtener la ficha del bombero' 
      };
    }
  }

  /**
   * Actualizar ficha de bombero
   * @param {number} id - ID de la ficha
   * @param {Object} fichaData - Datos a actualizar
   * @returns {Promise<Object>} - Respuesta de la actualización
   */
  async updateFichaBombero(id, fichaData) {
    try {
      const response = await axios.patch(`/fichaBombero/${id}`, fichaData);
      return response.data;
    } catch (error) {
      console.error('Error updating ficha bombero:', error);
      return error.response?.data || { 
        status: 'Error', 
        message: 'Error al actualizar la ficha del bombero' 
      };
    }
  }

  /**
   * Eliminar ficha de bombero
   * @param {number} id - ID de la ficha
   * @returns {Promise<Object>} - Respuesta de la eliminación
   */
  async deleteFichaBombero(id) {
    try {
      const response = await axios.delete(`/fichaBombero/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting ficha bombero:', error);
      return error.response?.data || { 
        status: 'Error', 
        message: 'Error al eliminar la ficha del bombero' 
      };
    }
  }

  /**
   * Obtener todas las fichas de bomberos con filtros opcionales
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} - Lista de fichas
   */
  async getFichasBombero(filters = {}) {
    try {
      const response = await axios.get('/fichaBombero/', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error getting fichas bombero:', error);
      return error.response?.data || { 
        status: 'Error', 
        message: 'Error al obtener las fichas de bomberos' 
      };
    }
  }

  /**
   * Crear ficha de bombero con imagen de perfil
   * @param {Object} fichaData - Datos de la ficha
   * @param {File} profileImage - Imagen de perfil (opcional)
   * @returns {Promise<Object>} - Respuesta de la creación
   */
  async createFichaBomberoWithImage(fichaData, profileImage = null) {
    try {
      // Si hay imagen, subirla primero
      if (profileImage && fichaData.idBombero) {
        const fileService = (await import('./file.service.js')).default;
        const uploadResult = await fileService.uploadProfileImage(fichaData.idBombero, profileImage);
        
        if (uploadResult.success) {
          fichaData.fotoPerfilURL = uploadResult.data.fileName;
          fichaData.fotoPerfilKEY = uploadResult.data.fileName;
        } else {
          return {
            status: 'Error',
            message: 'Error al subir la imagen de perfil: ' + uploadResult.message
          };
        }
      }

      // Crear la ficha
      return await this.createFichaBombero(fichaData);
    } catch (error) {
      console.error('Error creating ficha bombero with image:', error);
      return {
        status: 'Error',
        message: 'Error al crear la ficha del bombero con imagen'
      };
    }
  }

  /**
   * Actualizar imagen de perfil de una ficha
   * @param {number} fichaId - ID de la ficha
   * @param {number} bomberoId - ID del bombero
   * @param {File} profileImage - Nueva imagen de perfil
   * @returns {Promise<Object>} - Respuesta de la actualización
   */
  async updateProfileImage(fichaId, bomberoId, profileImage) {
    try {
      const fileService = (await import('./file.service.js')).default;
      
      // Subir nueva imagen
      const uploadResult = await fileService.uploadProfileImage(bomberoId, profileImage);
      
      if (uploadResult.success) {
        // Actualizar la ficha con la nueva imagen
        const updateData = {
          fotoPerfilURL: uploadResult.data.fileName,
          fotoPerfilKEY: uploadResult.data.fileName
        };
        
        return await this.updateFichaBombero(fichaId, updateData);
      } else {
        return {
          status: 'Error',
          message: 'Error al subir la imagen de perfil: ' + uploadResult.message
        };
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      return {
        status: 'Error',
        message: 'Error al actualizar la imagen de perfil'
      };
    }
  }

  /**
   * Obtener URL firmada de imagen de perfil
   * @param {string} fileName - Nombre del archivo
   * @returns {Promise<string>} - URL firmada
   */
  async getProfileImageUrl(fileName) {
    try {
      const fileService = (await import('./file.service.js')).default;
      const result = await fileService.getSignedUrl('bomberos-uploads-profiles', fileName);
      
      if (result.success) {
        return result.data.url;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error getting profile image URL:', error);
      return null;
    }
  }
}

export default new FichaBomberoService();
