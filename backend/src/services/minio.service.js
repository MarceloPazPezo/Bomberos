import { BUCKETS, FILE_CONFIG, minioClient } from '../config/configMinIO.js';
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
    const url = await client.presignedGetObject(bucket, fileName, expiry);

    // Reemplazar host interno con externo si está configurado
    const urlObj = new URL(url);
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
    logger.info(`[MINIO] URL firmada generada para: ${bucket}/${fileName}`);
    return finalUrl;
  } catch (error) {
    logger.error(`[MINIO] Error generando URL firmada para ${fileName}:`, error);
    throw error;
  }
}

export async function getSignedUploadUrl(bucket, fileName, expiry = config.SIGNED_URL_EXPIRY) {
  try {
    const url = await client.presignedPutObject(bucket, fileName, expiry);

    // Reemplazar host interno con externo si está configurado
    const urlObj = new URL(url);
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
