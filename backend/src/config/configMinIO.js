import { Client } from 'minio';
import { 
  MINIO_ACCESS_KEY, 
  MINIO_BUCKET_NAME,
  MINIO_ENDPOINT, 
  MINIO_PORT, 
  MINIO_SECRET_KEY, 
  MINIO_USE_SSL, 
  SIGNED_URL_EXPIRY 
} from './configEnv.js';
import logger from './configLogger.js';

// Configuración de MinIO
const minioConfig = {
  endPoint: MINIO_ENDPOINT,
  port: parseInt(MINIO_PORT),
  useSSL: MINIO_USE_SSL === 'true',
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
};

// Crear cliente MinIO
export const minioClient = new Client(minioConfig);

// Configuración de buckets
export const BUCKETS = {
  PRINCIPAL: MINIO_BUCKET_NAME,
  PERFILES: `${MINIO_BUCKET_NAME}-perfiles`,
  COMPANIAS: `${MINIO_BUCKET_NAME}-companias`,
  DOCUMENTOS: `${MINIO_BUCKET_NAME}-documentos`,
  TESSELAS_PUBLICAS: `${MINIO_BUCKET_NAME}-teselas-publicas`,
  TESSELAS_PRIVADAS: `${MINIO_BUCKET_NAME}-teselas-privadas`
};

const BUCKET_LIFECYCLES = {
  [BUCKETS.DOCUMENTOS]: {
    Rule: [
      {
        ID: 'eliminar-documentos-despues-1-dia',
        Status: 'Enabled',
        Expiration: { Days: 1 },
        Filter: { Prefix: '' }
      }
    ]
  }
};

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_TILE_TYPES: ['image/png', 'image/jpeg', 'application/octet-stream'],
  SIGNED_URL_EXPIRY: parseInt(SIGNED_URL_EXPIRY) || 3600, // 1 hora por defecto
};

// Función para inicializar MinIO y crear buckets
export async function initializeMinIO() {
  try {
    // Verificar conexión
    await minioClient.listBuckets();
    logger.info('[MINIO] Conexión a MinIO establecida correctamente');

    // Crear buckets si no existen
    const bucketsToCreate = [
      BUCKETS.PRINCIPAL,
      BUCKETS.PERFILES,
      BUCKETS.COMPANIAS,
      BUCKETS.DOCUMENTOS,
      BUCKETS.TESSELAS_PUBLICAS,
      BUCKETS.TESSELAS_PRIVADAS
    ];

    for (const bucketName of bucketsToCreate) {
      try {
        const exists = await minioClient.bucketExists(bucketName);
        const lifecycleConfig = BUCKET_LIFECYCLES[bucketName];

        if (!exists) {
          await minioClient.makeBucket(bucketName, 'us-east-1');
          logger.info(`[MINIO] Bucket creado: ${bucketName}`);
          
          // Configurar política de acceso público para tiles públicos
          if (bucketName === BUCKETS.TESSELAS_PUBLICAS) {
            const publicPolicy = {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: { AWS: ['*'] },
                  Action: ['s3:GetObject'],
                  Resource: [`arn:aws:s3:::${bucketName}/*`]
                }
              ]
            };
            
            await minioClient.setBucketPolicy(bucketName, JSON.stringify(publicPolicy));
            logger.info(`[MINIO] Política pública configurada para: ${bucketName}`);
          }
        } else {
          logger.info(`[MINIO] Bucket ya existe: ${bucketName}`);
        }

        if (lifecycleConfig) {
          try {
            await minioClient.setBucketLifecycle(bucketName, lifecycleConfig);
            logger.info(`[MINIO] Ciclo de vida configurado para: ${bucketName}`);
          } catch (error) {
            logger.warn(`[MINIO] No se pudo configurar ciclo de vida para ${bucketName}: ${error.message}`);
          }
        }
      } catch (error) {
        logger.error(`[MINIO] Error creando bucket ${bucketName}:`, error);
      }
    }

    logger.info('[MINIO] Inicialización de MinIO completada');
    return true;
  } catch (error) {
    logger.error('[MINIO] Error inicializando MinIO:', error);
    throw error;
  }
}

// Función para verificar la salud de MinIO
export async function checkMinIOHealth() {
  try {
    await minioClient.listBuckets();
    return { status: 'healthy', message: 'MinIO está funcionando correctamente' };
  } catch (error) {
    logger.error('[MINIO] Error de salud de MinIO:', error);
    return { status: 'unhealthy', message: error.message };
  }
}

export default minioClient;
