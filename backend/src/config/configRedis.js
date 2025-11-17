"use strict";
import { createClient } from 'redis';
import logger from './configLogger.js';
import {
  REDIS_DB,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
} from './configEnv.js';

/**
 * Configuración y conexión a Redis
 * Maneja la conexión, reconexión y eventos de Redis
 */

let redisClient = null;
let redisSubscriber = null;

// Configuración de Redis optimizada para Redis 7 con cliente v5.x
const redisConfig = {
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  password: REDIS_PASSWORD,
  database: REDIS_DB,
  socket: {
    connectTimeout: 10000,
    lazyConnect: true,
    keepAlive: 30000,
  },
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};

/**
 * Inicializar cliente Redis
 */
export async function initializeRedis() {
  try {
    logger.info('[REDIS] Inicializando conexión a Redis...');
    
    redisClient = createClient(redisConfig);

    // Eventos de conexión
    redisClient.on('connect', () => {
      logger.info('[REDIS] Cliente conectado a Redis');
    });

    redisClient.on('ready', () => {
      logger.info('[REDIS] Cliente Redis listo para recibir comandos');
    });

    redisClient.on('error', (error) => {
      logger.error('[REDIS] Error en Redis:', error);
    });

    redisClient.on('end', () => {
      logger.warn('[REDIS] Conexión a Redis cerrada');
    });

    redisClient.on('reconnecting', () => {
      logger.info('[REDIS] Reconectando a Redis...');
    });

    // Conectar al cliente
    await redisClient.connect();
    
    // Crear suscriptor separado para Pub/Sub
    redisSubscriber = createClient(redisConfig);
    
    // Eventos del suscriptor
    redisSubscriber.on('connect', () => {
      logger.info('[REDIS] Suscriptor conectado a Redis');
    });

    redisSubscriber.on('ready', () => {
      logger.info('[REDIS] Suscriptor Redis listo');
    });

    redisSubscriber.on('error', (error) => {
      logger.error('[REDIS] Error en suscriptor Redis:', error);
    });

    // Conectar al suscriptor
    await redisSubscriber.connect();
    
    // Esperar a que ambos clientes estén completamente listos
    await new Promise((resolve) => {
      const checkReady = () => {
        if (redisClient.isReady && redisSubscriber.isReady) {
          resolve();
        } else {
          setTimeout(checkReady, 10);
        }
      };
      checkReady();
    });
    
    logger.info('[REDIS] Inicializacion de Redis completada');
    return redisClient;
    
  } catch (error) {
    logger.error('[REDIS] Error al inicializar Redis:', error);
    throw error;
  }
}

/**
 * Obtener cliente Redis
 */
export function getRedisClient() {
  if (!redisClient) {
    throw new Error('[REDIS] Redis client no está inicializado. Llama a initializeRedis() primero.');
  }
  return redisClient;
}

/**
 * Obtener suscriptor Redis
 */
export function getRedisSubscriber() {
  if (!redisSubscriber) {
    throw new Error('[REDIS] Redis subscriber no está inicializado. Llama a initializeRedis() primero.');
  }
  return redisSubscriber;
}

/**
 * Verificar conexión Redis
 */
export async function checkRedisConnection() {
  try {
    if (!redisClient) {
      return { connected: false, error: '[REDIS] Cliente no inicializado' };
    }
    
    await redisClient.ping();
    return { connected: true, error: null };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

/**
 * Cerrar conexión Redis
 */
export async function closeRedisConnection() {
  try {
    if (redisSubscriber) {
      await redisSubscriber.quit();
      redisSubscriber = null;
      logger.info('[REDIS] Suscriptor Redis cerrado exitosamente');
    }
    
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
      logger.info('[REDIS] Cliente Redis cerrado exitosamente');
    }
  } catch (error) {
    logger.error('[REDIS] Error al cerrar Redis:', error);
    throw error;
  }
}

/**
 * Configuración de TTL para notificaciones
 */
export const NOTIFICATION_TTL = {
  CRITICAL: 7 * 24 * 60 * 60,      // 7 días
  EMERGENCIA: 3 * 24 * 60 * 60,     // 3 días
  PERSONAL: 30 * 24 * 60 * 60,     // 30 días
  RECORDATORIO: 7 * 24 * 60 * 60,      // 7 días
  MENSAJE_DIRECTO: 14 * 24 * 60 * 60, // 14 días
  SISTEMA: 3 * 24 * 60 * 60,        // 3 días
  GRUPAL: 7 * 24 * 60 * 60,         // 7 días
  READ: 1 * 24 * 60 * 60,          // 1 día
};

/**
 * Claves Redis para notificaciones
 */
export const REDIS_KEYS = {
  NOTIFICATION: 'notification:{id}',
  USER_NOTIFICATIONS: 'user:notifications:{bomberoId}',
  USER_UNREAD_COUNT: 'user:unread_count:{bomberoId}',
  COMPANIA_NOTIFICATIONS: 'compania:notifications:{companiaId}',
  ROL_NOTIFICATIONS: 'rol:notifications:{rolId}',
  CLEANUP_QUEUE: 'cleanup:queue',
  STATS: 'stats:notifications'
};

/**
 * Canales de publicación Redis
 */
export const NOTIFICATION_CHANNELS = {
  SISTEMA: 'notifications:sistema',
  EMERGENCIA: 'notifications:emergencia',
  COMPANIA: 'notifications:compania:{companiaId}',
  ROL: 'notifications:rol:{rolId}',
  PERSONAL: 'notifications:personal:{bomberoId}',
  MENSAJE_DIRECTO: 'notifications:direct:{bomberoId}',
  RECORDATORIO: 'notifications:reminder:{bomberoId}',
  INCIDENTE: 'notifications:incident:{incidentId}',
  EVENTO: 'notifications:event:{eventId}'
};

export default {
  initializeRedis,
  getRedisClient,
  getRedisSubscriber,
  checkRedisConnection,
  closeRedisConnection,
  NOTIFICATION_TTL,
  REDIS_KEYS,
  NOTIFICATION_CHANNELS
};
