import axios from './root.service.js';

/**
 * Servicio para manejar archivos con MinIO
 */
class FileService {
  
  /**
   * Subir imagen de perfil de bombero
   * @param {number} bomberoId - ID del bombero
   * @param {File} file - Archivo de imagen
   * @returns {Promise<Object>} - Respuesta con información del archivo subido
   */
  async uploadProfileImage(bomberoId, file) {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await axios.post(`/files/upload/profile/${bomberoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return error.response?.data || { 
        success: false, 
        message: 'Error al subir la imagen de perfil' 
      };
    }
  }

  /**
   * Subir imagen de compañía
   * @param {number} companiaId - ID de la compañía
   * @param {File} file - Archivo de imagen
   * @returns {Promise<Object>} - Respuesta con información del archivo subido
   */
  async uploadCompanyImage(companiaId, file) {
    try {
      const formData = new FormData();
      formData.append('companyImage', file);
      
      const response = await axios.post(`/files/upload/company/${companiaId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading company image:', error);
      return error.response?.data || { 
        success: false, 
        message: 'Error al subir la imagen de compañía' 
      };
    }
  }

  /**
   * Subir documento
   * @param {File} file - Archivo de documento
   * @returns {Promise<Object>} - Respuesta con información del archivo subido
   */
  async uploadDocument(file) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await axios.post('/files/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      return error.response?.data || { 
        success: false, 
        message: 'Error al subir el documento' 
      };
    }
  }

  /**
   * Obtener URL firmada para descarga de archivo
   * @param {string} bucket - Nombre del bucket
   * @param {string} fileName - Nombre del archivo
   * @param {number} expiry - Tiempo de expiración en segundos (opcional)
   * @returns {Promise<Object>} - Respuesta con URL firmada
   */
  async getSignedUrl(bucket, fileName, expiry = null) {
    try {
      const params = expiry ? { expiry } : {};
      const response = await axios.get(`/files/signed-url/${bucket}/${fileName}`, {
        params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return error.response?.data || { 
        success: false, 
        message: 'Error al obtener URL firmada' 
      };
    }
  }

  /**
   * Descargar archivo directamente
   * @param {string} bucket - Nombre del bucket
   * @param {string} fileName - Nombre del archivo
   * @returns {Promise<Blob>} - Archivo como blob
   */
  async downloadFile(bucket, fileName) {
    try {
      const response = await axios.get(`/files/download/${bucket}/${fileName}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Obtener información de un archivo
   * @param {string} bucket - Nombre del bucket
   * @param {string} fileName - Nombre del archivo
   * @returns {Promise<Object>} - Información del archivo
   */
  async getFileInfo(bucket, fileName) {
    try {
      const response = await axios.get(`/files/info/${bucket}/${fileName}`);
      return response.data;
    } catch (error) {
      console.error('Error getting file info:', error);
      return error.response?.data || { 
        success: false, 
        message: 'Error al obtener información del archivo' 
      };
    }
  }

  /**
   * Listar archivos en un bucket
   * @param {string} bucket - Nombre del bucket
   * @param {string} prefix - Prefijo para filtrar archivos (opcional)
   * @returns {Promise<Object>} - Lista de archivos
   */
  async listFiles(bucket, prefix = '') {
    try {
      const params = prefix ? { prefix } : {};
      const response = await axios.get(`/files/list/${bucket}`, {
        params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error listing files:', error);
      return error.response?.data || { 
        success: false, 
        message: 'Error al listar archivos' 
      };
    }
  }

  /**
   * Eliminar archivo
   * @param {string} bucket - Nombre del bucket
   * @param {string} fileName - Nombre del archivo
   * @returns {Promise<Object>} - Respuesta de eliminación
   */
  async deleteFile(bucket, fileName) {
    try {
      const response = await axios.delete(`/files/${bucket}/${fileName}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      return error.response?.data || { 
        success: false, 
        message: 'Error al eliminar archivo' 
      };
    }
  }

  /**
   * Obtener URL pública para tiles
   * @param {string} fileName - Nombre del archivo
   * @returns {Promise<Object>} - URL pública
   */
  async getPublicTileUrl(fileName) {
    try {
      const response = await axios.get(`/files/public/${fileName}`);
      return response.data;
    } catch (error) {
      console.error('Error getting public tile URL:', error);
      return error.response?.data || { 
        success: false, 
        message: 'Error al obtener URL pública' 
      };
    }
  }

  /**
   * Validar archivo antes de subir
   * @param {File} file - Archivo a validar
   * @param {string} type - Tipo de archivo ('image', 'document')
   * @returns {Object} - Resultado de la validación
   */
  validateFile(file, type = 'image') {
    const errors = [];
    
    if (!file) {
      errors.push('No se ha seleccionado ningún archivo');
      return { isValid: false, errors };
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('El archivo es demasiado grande. Máximo permitido: 10MB');
    }

    // Validar tipos de archivo
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    if (!allowedTypes[type]?.includes(file.type)) {
      const typeNames = {
        image: 'imágenes (JPEG, PNG, WebP, GIF)',
        document: 'documentos (PDF, Word)'
      };
      errors.push(`Tipo de archivo no permitido. Solo se permiten ${typeNames[type]}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Crear URL de preview para imagen
   * @param {File} file - Archivo de imagen
   * @returns {string} - URL de preview
   */
  createImagePreview(file) {
    if (!file) return null;
    return URL.createObjectURL(file);
  }

  /**
   * Limpiar URL de preview
   * @param {string} url - URL de preview a limpiar
   */
  revokeImagePreview(url) {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}

export default new FileService();
