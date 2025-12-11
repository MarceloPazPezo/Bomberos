import { BUCKETS, FILE_CONFIG, minioClient, getMinioClientForPresigned } from '../config/configMinIO.js';
import logger from '../config/configLogger.js';
import mime from 'mime-types';

// Module-level references for functional API
const client = minioClient;
const buckets = BUCKETS;
const config = FILE_CONFIG;

export async function uploadFile(bucket, fileName, fileBuffer, contentType, metadata = {}) {
  try {
    const bucketName = bucket;

    const bucketExists = await client.bucketExists(bucketName);
    if (!bucketExists) {
      throw new Error(`Bucket ${bucketName} no existe`);
    }

    const result = await client.putObject(
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

export async function downloadFile(bucket, fileName) {
  try {
    const stream = await client.getObject(bucket, fileName);
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

export async function getSignedUrl(bucket, fileName, expiry = config.SIGNED_URL_EXPIRY) {
  try {
    const presignedClient = getMinioClientForPresigned();
    const url = await presignedClient.presignedGetObject(bucket, fileName, expiry);

    // Si MINIO_PUBLIC_URL está configurado, reescribir la URL para usar el proxy
    if (config.MINIO_PUBLIC_URL) {
      try {
        const urlObj = new URL(url);
        const publicUrl = new URL(config.MINIO_PUBLIC_URL);

        // Reemplazar protocolo, host y puerto
        urlObj.protocol = publicUrl.protocol;
        urlObj.host = publicUrl.host; // Incluye hostname y port

        // Ajustar path si hay prefijo (ej: /minio/)
        if (publicUrl.pathname && publicUrl.pathname !== '/') {
          // url original: /bucket/file...
          // public path: /minio
          // resultado: /minio/bucket/file...
          const originalPath = urlObj.pathname;
          // Evitar doble slash //
          const prefix = publicUrl.pathname.replace(/\/$/, '');
          urlObj.pathname = `${prefix}${originalPath}`;
        }

        const finalUrl = urlObj.toString();
        logger.debug(`[MINIO] URL reescrita con MINIO_PUBLIC_URL: ${finalUrl}`);
        return finalUrl;
      } catch (err) {
        logger.warn(`[MINIO] Error reescribiendo URL con MINIO_PUBLIC_URL: ${err.message}`);
        // Fallback a la URL original si falla el parsing
      }
    }

    logger.info(`[MINIO] URL firmada generada para: ${bucket}/${fileName}`);
    return url;
  } catch (error) {
    logger.error(`[MINIO] Error generando URL firmada para ${fileName}:`, error);
    throw error;
  }
}

export async function getSignedUploadUrl(bucket, fileName, expiry = config.SIGNED_URL_EXPIRY) {
  try {
    const url = await client.presignedPutObject(bucket, fileName, expiry);
    const urlObj = new URL(url);

    // Si MINIO_PUBLIC_URL está configurado, reemplazar la base de la URL
    if (config.MINIO_PUBLIC_URL) {
      try {
        const publicUrl = new URL(config.MINIO_PUBLIC_URL);
        // Reemplazar protocolo, hostname y puerto, manteniendo la ruta y parámetros de la URL original
        urlObj.protocol = publicUrl.protocol;
        urlObj.hostname = publicUrl.hostname;
        urlObj.port = publicUrl.port;
        // Si MINIO_PUBLIC_URL tiene un pathname, agregarlo antes de la ruta del bucket
        if (publicUrl.pathname && publicUrl.pathname !== '/') {
          // La URL original tiene formato: /bucket/fileName?params
          // Necesitamos: /minio/bucket/fileName?params
          const originalPath = urlObj.pathname;
          urlObj.pathname = `${publicUrl.pathname.replace(/\/$/, '')}${originalPath}`;
        }

        const finalUrl = urlObj.toString();
        logger.info(`[MINIO] URL firmada de subida generada usando MINIO_PUBLIC_URL para: ${bucket}/${fileName}`);
        logger.debug(`[MINIO] URL original: ${url}, URL final: ${finalUrl}`);
        return finalUrl;
      } catch (error) {
        logger.warn(`[MINIO] Error procesando MINIO_PUBLIC_URL, usando método alternativo: ${error.message}`);
      }
    }

    // Método alternativo: Reemplazar host interno con externo si está configurado
    if (config.MINIO_EXTERNAL_ENDPOINT) {
      urlObj.hostname = config.MINIO_EXTERNAL_ENDPOINT;
    }
    if (config.MINIO_EXTERNAL_PORT) {
      urlObj.port = config.MINIO_EXTERNAL_PORT;
    }
    if (config.MINIO_EXTERNAL_USE_SSL === 'true') {
      urlObj.protocol = 'https:';
    } else {
      urlObj.protocol = 'http:';
    }

    const finalUrl = urlObj.toString();
    logger.info(`[MINIO] URL firmada de subida generada para: ${bucket}/${fileName}`);
    logger.debug(`[MINIO] URL final: ${finalUrl}`);
    return finalUrl;
  } catch (error) {
    logger.error(`[MINIO] Error generando URL firmada de subida para ${fileName}:`, error);
    throw error;
  }
}

export async function deleteFile(bucket, fileName) {
  try {
    await client.removeObject(bucket, fileName);
    logger.info(`[MINIO] Archivo eliminado: ${bucket}/${fileName}`);
    return true;
  } catch (error) {
    logger.error(`[MINIO] Error eliminando archivo ${fileName}:`, error);
    throw error;
  }
}

export async function listFiles(bucket, prefix = '') {
  try {
    const files = [];
    const stream = client.listObjects(bucket, prefix, true);
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

export async function fileExists(bucket, fileName) {
  try {
    await client.statObject(bucket, fileName);
    return true;
  } catch (error) {
    if (error.code === 'NotFound') return false;
    throw error;
  }
}

export async function getFileInfo(bucket, fileName) {
  try {
    const stat = await client.statObject(bucket, fileName);
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

export function validateFileType(contentType, fileType) {
  const allowedTypes = {
    image: config.ALLOWED_IMAGE_TYPES,
    document: config.ALLOWED_DOCUMENT_TYPES,
    tile: config.ALLOWED_TILE_TYPES
  };
  return allowedTypes[fileType]?.includes(contentType) || false;
}

export function generateUniqueFileName(originalName, userId = null) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  const prefix = userId ? `${userId}_` : '';
  return `${prefix}${baseName}_${timestamp}_${random}.${extension}`;
}

export function getPublicTileUrl(fileName) {
  return `${client.protocol}//${client.host}:${client.port}/${buckets.TESSELAS_PUBLICAS}/${fileName}`;
}

export function scheduleFileDeletion(bucket, fileName, delaySeconds) {
  if (!Number.isFinite(delaySeconds) || delaySeconds <= 0) {
    logger.warn(`[MINIO] Eliminación programada omitida para ${bucket}/${fileName}: delay inválido (${delaySeconds})`);
    return null;
  }

  const timeout = setTimeout(async () => {
    try {
      await deleteFile(bucket, fileName);
      logger.info(`[MINIO] Archivo eliminado automáticamente tras ${delaySeconds}s: ${bucket}/${fileName}`);
    } catch (error) {
      logger.error(`[MINIO] Error eliminando automáticamente ${bucket}/${fileName}: ${error.message}`);
    }
  }, delaySeconds * 1000);

  if (typeof timeout.unref === 'function') {
    timeout.unref();
  }

  return timeout;
}

// Default export object for backward compatibility (allows importing default minioService)
const minioService = {
  uploadFile,
  downloadFile,
  getSignedUrl,
  getSignedUploadUrl,
  deleteFile,
  listFiles,
  fileExists,
  getFileInfo,
  validateFileType,
  generateUniqueFileName,
  getPublicTileUrl,
  scheduleFileDeletion
};

export default minioService;
