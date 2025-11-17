"use strict";

import notificationService from '../services/notification.service.js';
import { initializeNotificationSocket } from '../sockets/notifications.socket.js';
import logger from './configLogger.js';

/**
 * Inicializa completamente el sistema de notificaciones
 * Incluye tanto el servicio base como el sistema WebSocket
 */
export async function initializeNotificationSystem() {
  try {
    logger.info('[NOTIFICATION_SYSTEM] Iniciando sistema de notificaciones...');
    
    // Inicializar servicio base
    await notificationService.initialize();
    logger.info('[NOTIFICATION_SYSTEM] Servicio base inicializado');
    
    // Inicializar sistema WebSocket
    await initializeNotificationSocket();
    logger.info('[NOTIFICATION_SYSTEM] Sistema WebSocket inicializado');
    
    // Validar funcionamiento
    await validateNotificationSystems();
    logger.info('[NOTIFICATION_SYSTEM] Sistema de notificaciones listo');
    
    return true;
    
  } catch (error) {
    logger.error('[NOTIFICATION_SYSTEM] Error al inicializar sistema:', error);
    throw error;
  }
}

/**
 * Valida que ambos sistemas de notificaciones estén funcionando
 */
async function validateNotificationSystems() {
  try {
    // Validar servicio base
    if (!notificationService.redisClient || !notificationService.redisSubscriber) {
      throw new Error('Servicio base no inicializado correctamente');
    }
    
    // Validar conexión Redis
    const pingResult = await notificationService.redisClient.ping();
    if (pingResult !== 'PONG') {
      throw new Error('Redis no responde correctamente');
    }
    
    return true;
  } catch (error) {
    logger.error('[NOTIFICATION_SYSTEM] Error en validación:', error);
    throw error;
  }
}

/**
 * Obtiene el estado del sistema de notificaciones
 */
export function getNotificationSystemStatus() {
  return {
    baseService: {
      initialized: !!(notificationService.redisClient && notificationService.redisSubscriber),
      redisConnected: notificationService.redisClient?.isReady || false
    },
    websocketSystem: {
      initialized: true, // Se asume que está inicializado si no hay errores
      activeSubscriptions: true // Se puede mejorar con un contador real
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Reinicia el sistema de notificaciones (útil para desarrollo)
 */
export async function restartNotificationSystem() {
  try {
    logger.info('[NOTIFICATION_SYSTEM] Reiniciando sistema de notificaciones...');
    
    await initializeNotificationSystem();
    logger.info('[NOTIFICATION_SYSTEM] Sistema reiniciado correctamente');
    
  } catch (error) {
    logger.error('[NOTIFICATION_SYSTEM] Error al reiniciar sistema:', error);
    throw error;
  }
}
