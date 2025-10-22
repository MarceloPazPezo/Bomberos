import minioService from '../services/minio.service.js';
import logger from '../config/configLogger.js';
import { BUCKETS } from '../config/configMinIO.js';

class FileController {
  /**
   * Subir imagen de perfil de bombero
   */
  async uploadProfileImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo de imagen'
        });
      }

      const { bomberoId } = req.params;
      const fileName = minioService.generateUniqueFileName(
        req.file.originalname,
        `bombero_${bomberoId}`
      );

      const result = await minioService.uploadFile(
        BUCKETS.PROFILES,
        fileName,
        req.file.buffer,
        req.file.mimetype,
        {
          'original-name': req.file.originalname,
          'bombero-id': bomberoId,
          'upload-date': new Date().toISOString()
        }
      );

      logger.info(`[MINIO] Imagen de perfil subida para bombero ${bomberoId}: ${fileName}`);

      res.status(201).json({
        success: true,
        message: 'Imagen de perfil subida correctamente',
        data: {
          fileName,
          size: result.size,
          contentType: result.contentType,
          bucket: BUCKETS.PROFILES
        }
      });
    } catch (error) {
      logger.error('[MINIO] Error subiendo imagen de perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Subir imagen de compañía
   */
  async uploadCompanyImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo de imagen'
        });
      }

      const { companiaId } = req.params;
      const fileName = minioService.generateUniqueFileName(
        req.file.originalname,
        `compania_${companiaId}`
      );

      const result = await minioService.uploadFile(
        BUCKETS.COMPANIES,
        fileName,
        req.file.buffer,
        req.file.mimetype,
        {
          'original-name': req.file.originalname,
          'compania-id': companiaId,
          'upload-date': new Date().toISOString()
        }
      );

      logger.info(`[MINIO] Imagen de compañía subida para compañía ${companiaId}: ${fileName}`);

      res.status(201).json({
        success: true,
        message: 'Imagen de compañía subida correctamente',
        data: {
          fileName,
          size: result.size,
          contentType: result.contentType,
          bucket: BUCKETS.COMPANIES
        }
      });
    } catch (error) {
      logger.error('[MINIO] Error subiendo imagen de compañía:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Subir documento
   */
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo de documento'
        });
      }

      const fileName = minioService.generateUniqueFileName(req.file.originalname);

      const result = await minioService.uploadFile(
        BUCKETS.DOCUMENTS,
        fileName,
        req.file.buffer,
        req.file.mimetype,
        {
          'original-name': req.file.originalname,
          'upload-date': new Date().toISOString(),
          'uploaded-by': req.user?.id || 'anonymous'
        }
      );

      logger.info(`[MINIO] Documento subido: ${fileName}`);

      res.status(201).json({
        success: true,
        message: 'Documento subido correctamente',
        data: {
          fileName,
          size: result.size,
          contentType: result.contentType,
          bucket: BUCKETS.DOCUMENTS
        }
      });
    } catch (error) {
      logger.error('[MINIO] Error subiendo documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Subir paquete de tiles
   */
  async uploadTiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron archivos de tiles'
        });
      }

      const { comunaId, isPublic = false } = req.body;
      const bucket = isPublic === 'true' ? BUCKETS.TILES_PUBLIC : BUCKETS.TILES_PRIVATE;
      
      const uploadedFiles = [];

      for (const file of req.files) {
        const fileName = minioService.generateUniqueFileName(
          file.originalname,
          `comuna_${comunaId}`
        );

        const result = await minioService.uploadFile(
          bucket,
          fileName,
          file.buffer,
          file.mimetype,
          {
            'original-name': file.originalname,
            'comuna-id': comunaId,
            'is-public': isPublic,
            'upload-date': new Date().toISOString()
          }
        );

        uploadedFiles.push({
          fileName,
          size: result.size,
          contentType: result.contentType
        });
      }

      logger.info(`[MINIO] ${uploadedFiles.length} tiles subidos para comuna ${comunaId}`);

      res.status(201).json({
        success: true,
        message: `${uploadedFiles.length} tiles subidos correctamente`,
        data: {
          files: uploadedFiles,
          bucket,
          comunaId
        }
      });
    } catch (error) {
      logger.error('[MINIO] Error subiendo tiles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener URL firmada para descarga
   */
  async getSignedUrl(req, res) {
    try {
      const { bucket, fileName } = req.params;
      const { expiry } = req.query;

      const url = await minioService.getSignedUrl(
        bucket,
        fileName,
        expiry ? parseInt(expiry) : undefined
      );

      res.json({
        success: true,
        data: {
          url,
          expiresIn: expiry || 3600
        }
      });
    } catch (error) {
      logger.error('[MINIO] Error generando URL firmada:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando URL firmada',
        error: error.message
      });
    }
  }

  /**
   * Descargar archivo directamente
   */
  async downloadFile(req, res) {
    try {
      const { bucket, fileName } = req.params;

      const fileBuffer = await minioService.downloadFile(bucket, fileName);
      const fileInfo = await minioService.getFileInfo(bucket, fileName);

      res.set({
        'Content-Type': fileInfo.contentType,
        'Content-Length': fileInfo.size,
        'Content-Disposition': `attachment; filename="${fileName}"`
      });

      res.send(fileBuffer);
    } catch (error) {
      logger.error('[MINIO] Error descargando archivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error descargando archivo',
        error: error.message
      });
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(req, res) {
    try {
      const { bucket, fileName } = req.params;

      await minioService.deleteFile(bucket, fileName);

      logger.info(`[MINIO] Archivo eliminado: ${bucket}/${fileName}`);

      res.json({
        success: true,
        message: 'Archivo eliminado correctamente'
      });
    } catch (error) {
      logger.error('[MINIO] Error eliminando archivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando archivo',
        error: error.message
      });
    }
  }

  /**
   * Listar archivos en un bucket
   */
  async listFiles(req, res) {
    try {
      const { bucket } = req.params;
      const { prefix } = req.query;

      const files = await minioService.listFiles(bucket, prefix);

      res.json({
        success: true,
        data: {
          files,
          count: files.length
        }
      });
    } catch (error) {
      logger.error('[MINIO] Error listando archivos:', error);
      res.status(500).json({
        success: false,
        message: 'Error listando archivos',
        error: error.message
      });
    }
  }

  /**
   * Obtener información de un archivo
   */
  async getFileInfo(req, res) {
    try {
      const { bucket, fileName } = req.params;

      const fileInfo = await minioService.getFileInfo(bucket, fileName);

      res.json({
        success: true,
        data: fileInfo
      });
    } catch (error) {
      logger.error('[MINIO] Error obteniendo información del archivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo información del archivo',
        error: error.message
      });
    }
  }

  /**
   * Obtener URL pública para tiles
   */
  async getPublicTileUrl(req, res) {
    try {
      const { fileName } = req.params;

      const url = minioService.getPublicTileUrl(fileName);

      res.json({
        success: true,
        data: {
          url
        }
      });
    } catch (error) {
      logger.error('[MINIO] Error obteniendo URL pública:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo URL pública',
        error: error.message
      });
    }
  }
}

export default new FileController();
