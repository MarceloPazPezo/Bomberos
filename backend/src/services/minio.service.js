import { minioClient, BUCKETS, FILE_CONFIG } from '../config/configMinIO.js';
import logger from '../config/configLogger.js';
import mime from 'mime-types';

class MinIOService {
  constructor() {
    this.client = minioClient;
    this.buckets = BUCKETS;
    this.config = FILE_CONFIG;
  }

  /**
   * Subir archivo a MinIO
   * @param {string} bucket - Nombre del bucket
   * @param {string} fileName - Nombre del archivo
   * @param {Buffer} fileBuffer - Buffer del archivo
   * @param {string} contentType - Tipo de contenido
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>} - Información del archivo subido
   */
  async uploadFile(bucket, fileName, fileBuffer, contentType, metadata = {}) {
    try {
      // Usar el nombre del bucket directamente
      const bucketName = bucket;
      
      // Verificar que el bucket existe
      const bucketExists = await this.client.bucketExists(bucketName);
      if (!bucketExists) {
        throw new Error(`Bucket ${bucketName} no existe`);
      }

      // Subir archivo
      const result = await this.client.putObject(
        bucketName,
        fileName,
        fileBuffer,
        fileBuffer.length,
        {
          'Content-Type': contentType,
          ...metadata
        }
      );

      logger.info(`[MINIO] Archivo subido: ${bucketName}/${fileName}`);
      
      return {
        success: true,
        bucket: bucketName,
        fileName,
        etag: result.etag,
        size: fileBuffer.length,
        contentType,
        metadata
      };
    } catch (error) {
      logger.error(`[MINIO] Error subiendo archivo ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Descargar archivo de MinIO
   * @param {string} bucket - Nombre del bucket
   * @param {string} fileName - Nombre del archivo
   * @returns {Promise<Buffer>} - Buffer del archivo
   */
  async downloadFile(bucket, fileName) {
    try {
      const stream = await this.client.getObject(bucket, fileName);
      
      // Convertir stream a buffer
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      logger.error(`[MINIO] Error descargando archivo ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Generar URL firmada para acceso temporal
   * @param {string} bucket - Nombre del bucket
   * @param {string} fileName - Nombre del archivo
   * @param {number} expiry - Tiempo de expiración en segundos
   * @returns {Promise<string>} - URL firmada
   */
  async getSignedUrl(bucket, fileName, expiry = this.config.SIGNED_URL_EXPIRY) {
    try {
      const url = await this.client.presignedGetObject(
        bucket,
        fileName,
        expiry
      );
      
      logger.info(`[MINIO] URL firmada generada para: ${bucket}/${fileName}`);
      return url;
    } catch (error) {
      logger.error(`[MINIO] Error generando URL firmada para ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Generar URL firmada para subida
   * @param {string} bucket - Nombre del bucket
   * @param {string} fileName - Nombre del archivo
   * @param {number} expiry - Tiempo de expiración en segundos
   * @returns {Promise<string>} - URL firmada para subida
   */
  async getSignedUploadUrl(bucket, fileName, expiry = this.config.SIGNED_URL_EXPIRY) {
    try {
      const url = await this.client.presignedPutObject(
        bucket,
        fileName,
        expiry
      );
      
      logger.info(`[MINIO] URL firmada de subida generada para: ${bucket}/${fileName}`);
      return url;
    } catch (error) {
      logger.error(`[MINIO] Error generando URL firmada de subida para ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar archivo de MinIO
   * @param {string} bucket - Nombre del bucket
   * @param {string} fileName - Nombre del archivo
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  async deleteFile(bucket, fileName) {
    try {
      await this.client.removeObject(bucket, fileName);
      
      logger.info(`[MINIO] Archivo eliminado: ${bucket}/${fileName}`);
      return true;
    } catch (error) {
      logger.error(`[MINIO] Error eliminando archivo ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Listar archivos en un bucket
   * @param {string} bucket - Nombre del bucket
   * @param {string} prefix - Prefijo para filtrar archivos
   * @returns {Promise<Array>} - Lista de archivos
   */
  async listFiles(bucket, prefix = '') {
    try {
      const files = [];
      
      const stream = this.client.listObjects(bucket, prefix, true);
      
      for await (const obj of stream) {
        files.push({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
          etag: obj.etag
        });
      }
      
      return files;
    } catch (error) {
      logger.error(`[MINIO] Error listando archivos en ${bucket}:`, error);
      throw error;
    }
  }

  /**
   * Verificar si un archivo existe
   * @param {string} bucket - Nombre del bucket
   * @param {string} fileName - Nombre del archivo
   * @returns {Promise<boolean>} - True si el archivo existe
   */
  async fileExists(bucket, fileName) {
    try {
      await this.client.statObject(bucket, fileName);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
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
      const stat = await this.client.statObject(bucket, fileName);
      
      return {
        name: fileName,
        size: stat.size,
        lastModified: stat.lastModified,
        etag: stat.etag,
        contentType: stat.metaData['content-type'],
        metadata: stat.metaData
      };
    } catch (error) {
      logger.error(`[MINIO] Error obteniendo información del archivo ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Validar tipo de archivo
   * @param {string} contentType - Tipo de contenido
   * @param {string} fileType - Tipo de archivo (image, document, tile)
   * @returns {boolean} - True si es válido
   */
  validateFileType(contentType, fileType) {
    const allowedTypes = {
      image: this.config.ALLOWED_IMAGE_TYPES,
      document: this.config.ALLOWED_DOCUMENT_TYPES,
      tile: this.config.ALLOWED_TILE_TYPES
    };

    return allowedTypes[fileType]?.includes(contentType) || false;
  }

  /**
   * Generar nombre único para archivo
   * @param {string} originalName - Nombre original del archivo
   * @param {string} userId - ID del usuario (opcional)
   * @returns {string} - Nombre único del archivo
   */
  generateUniqueFileName(originalName, userId = null) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    
    const prefix = userId ? `${userId}_` : '';
    return `${prefix}${baseName}_${timestamp}_${random}.${extension}`;
  }

  /**
   * Obtener URL pública para tiles (sin autenticación)
   * @param {string} fileName - Nombre del archivo
   * @returns {string} - URL pública
   */
  getPublicTileUrl(fileName) {
    return `${this.client.protocol}//${this.client.host}:${this.client.port}/${this.buckets.TILES_PUBLIC}/${fileName}`;
  }
}

export default new MinIOService();
