"use strict";

import { getRedisSubscriber } from '../config/configRedis.js';
import { getUserChannel, getCompaniaChannel, getRolChannel } from '../helpers/notification.helper.js';
import { getIO } from '../index.js';
import logger from '../config/configLogger.js';

/**
 * Módulo de notificaciones WebSocket
 * Maneja la suscripción a canales Redis y emisión de notificaciones en tiempo real
 */

let redisSubscriber = null;
let isSubscribed = false;
let isInitialized = false;

/**
 * Mapa de usuarios suscritos a notificaciones
 * Estructura: { bomberoId: { socketId: Set, companias: Set, roles: Set } }
 */
const subscribedUsers = new Map();

/**
 * Inicializa el sistema de notificaciones WebSocket
 */
export async function initializeNotificationSocket() {
  try {
    // Evitar inicialización múltiple
    if (isInitialized) {
      logger.info('[NOTIFICATION_SOCKET] Sistema ya inicializado, omitiendo...');
      return;
    }

    redisSubscriber = getRedisSubscriber();
    
    if (!redisSubscriber) {
      throw new Error('Redis subscriber no está disponible');
    }

    // Verificar que el subscriber esté listo
    if (!redisSubscriber.isReady) {
      throw new Error('Redis subscriber no está listo');
    }
    
    // Configurar eventos del suscriptor Redis
    redisSubscriber.on('error', (error) => {
      logger.error('[NOTIFICATION_SOCKET] Error en suscriptor Redis:', error);
    });

    isInitialized = true;
    logger.info('[NOTIFICATION_SOCKET] Sistema WebSocket inicializado correctamente');
  } catch (error) {
    logger.error('[NOTIFICATION_SOCKET] Error inicializando WebSocket:', error);
    throw error;
  }
}

/**
 * Suscribe un usuario a sus canales de notificaciones
 * @param {string} bomberoId - ID del bombero
 * @param {string} socketId - ID del socket
 * @param {Object} userInfo - Información del usuario (companiaId, rolId)
 */
export async function subscribeUserToNotifications(bomberoId, socketId, userInfo = {}) {
  try {
    const io = getIO();
    if (!io) {
      logger.error('[NOTIFICATION_SOCKET] Instancia de Socket.IO no disponible');
      return;
    }

    // Obtener o crear entrada del usuario
    let userEntry = subscribedUsers.get(bomberoId);
    if (!userEntry) {
      userEntry = {
        socketIds: new Set(),
        companias: new Set(),
        roles: new Set(),
        channels: new Set()
      };
      subscribedUsers.set(bomberoId, userEntry);
    }

    // Agregar socket ID
    userEntry.socketIds.add(socketId);

    // Suscribirse a canales según la información del usuario
    const channelsToSubscribe = [];

    // Canal personal del usuario
    const personalChannel = getUserChannel('PERSONAL', bomberoId);
    channelsToSubscribe.push(personalChannel);

    // Canal de mensajes directos
    const directChannel = getUserChannel('MENSAJE_DIRECTO', bomberoId);
    channelsToSubscribe.push(directChannel);

    // Canal de recordatorios
    const reminderChannel = getUserChannel('RECORDATORIO', bomberoId);
    channelsToSubscribe.push(reminderChannel);

    // Canal de compañía si se proporciona
    if (userInfo.companiaId) {
      const companiaChannel = getCompaniaChannel(userInfo.companiaId);
      channelsToSubscribe.push(companiaChannel);
      userEntry.companias.add(userInfo.companiaId);
      logger.debug(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} tiene compañía ${userInfo.companiaId} (tipo: ${typeof userInfo.companiaId}), suscribiéndose a canal: ${companiaChannel}`);
    } else {
      logger.warn(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} no tiene companiaId, no se suscribirá a notificaciones de compañía`);
    }

    // Canal de rol si se proporciona
    if (userInfo.rolId) {
      const rolChannel = getRolChannel(userInfo.rolId);
      channelsToSubscribe.push(rolChannel);
      userEntry.roles.add(userInfo.rolId);
    }

    // Suscribirse a canales nuevos usando la nueva API de Redis 5.x
    for (const channel of channelsToSubscribe) {
      if (!userEntry.channels.has(channel)) {
        try {
          await redisSubscriber.subscribe(channel, (message, channelName) => {
            logger.debug(`[NOTIFICATION_SOCKET] Mensaje recibido en canal ${channelName}:`, message);
            handleRedisMessage(channelName, message);
          });
          userEntry.channels.add(channel);
          logger.debug(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} suscrito a canal: ${channel}`);
        } catch (subscribeError) {
          logger.error(`[NOTIFICATION_SOCKET] Error suscribiéndose al canal ${channel}:`, subscribeError);
        }
      }
    }

    // Unir al socket a una sala específica para el usuario
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(`user:${bomberoId}`);
      socket.join(`notifications:${bomberoId}`);
    }

    logger.info(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} suscrito a notificaciones (socket: ${socketId})`);

  } catch (error) {
    logger.error('[NOTIFICATION_SOCKET] Error suscribiendo usuario a notificaciones:', error);
  }
}

/**
 * Desuscribe un usuario de las notificaciones
 * @param {string} bomberoId - ID del bombero
 * @param {string} socketId - ID del socket
 */
export async function unsubscribeUserFromNotifications(bomberoId, socketId) {
  try {
    const io = getIO();
    if (!io) {
      return;
    }

    const userEntry = subscribedUsers.get(bomberoId);
    if (!userEntry) {
      return;
    }

    // Remover socket ID
    userEntry.socketIds.delete(socketId);

    // Si no quedan sockets para este usuario, desuscribirse de todos los canales
    if (userEntry.socketIds.size === 0) {
      for (const channel of userEntry.channels) {
        try {
          await redisSubscriber.unsubscribe(channel);
          logger.debug(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} desuscrito de canal: ${channel}`);
        } catch (unsubscribeError) {
          logger.error(`[NOTIFICATION_SOCKET] Error desuscribiéndose del canal ${channel}:`, unsubscribeError);
        }
      }
      
      // Limpiar entrada del usuario
      subscribedUsers.delete(bomberoId);
      logger.info(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} completamente desuscrito`);
    } else {
      // Solo remover de las salas del socket específico
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(`user:${bomberoId}`);
        socket.leave(`notifications:${bomberoId}`);
      }
      logger.info(`[NOTIFICATION_SOCKET] Socket ${socketId} desuscrito del usuario ${bomberoId} (quedan ${userEntry.socketIds.size} sockets)`);
    }

  } catch (error) {
    logger.error('[NOTIFICATION_SOCKET] Error desuscribiendo usuario de notificaciones:', error);
  }
}

/**
 * Actualiza la información de suscripción de un usuario
 * @param {string} bomberoId - ID del bombero
 * @param {Object} userInfo - Nueva información del usuario
 */
export async function updateUserSubscription(bomberoId, userInfo) {
  try {
    const userEntry = subscribedUsers.get(bomberoId);
    if (!userEntry) {
      return;
    }

    const oldCompanias = new Set(userEntry.companias);
    const oldRoles = new Set(userEntry.roles);

    // Actualizar compañías
    if (userInfo.companiaId && !userEntry.companias.has(userInfo.companiaId)) {
      const companiaChannel = getCompaniaChannel(userInfo.companiaId);
      await redisSubscriber.subscribe(companiaChannel);
      userEntry.channels.add(companiaChannel);
      userEntry.companias.add(userInfo.companiaId);
      logger.debug(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} suscrito a compañía: ${userInfo.companiaId}`);
    }

    // Actualizar roles
    if (userInfo.rolId && !userEntry.roles.has(userInfo.rolId)) {
      const rolChannel = getRolChannel(userInfo.rolId);
      await redisSubscriber.subscribe(rolChannel);
      userEntry.channels.add(rolChannel);
      userEntry.roles.add(userInfo.rolId);
      logger.debug(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} suscrito a rol: ${userInfo.rolId}`);
    }

    // Desuscribirse de compañías/roles que ya no aplican (si es necesario)
    // Esta lógica dependería de si quieres mantener suscripciones históricas
    // o solo las actuales

    logger.info(`[NOTIFICATION_SOCKET] Suscripción del usuario ${bomberoId} actualizada`);

  } catch (error) {
    logger.error('[NOTIFICATION_SOCKET] Error actualizando suscripción del usuario:', error);
  }
}

/**
 * Maneja mensajes recibidos de Redis
 * @param {string} channel - Canal donde se recibió el mensaje
 * @param {string} message - Mensaje recibido
 */
async function handleRedisMessage(channel, message) {
  try {
    const io = getIO();
    if (!io) {
      return;
    }

    const messageData = JSON.parse(message);
    
    logger.debug(`[NOTIFICATION_SOCKET] Mensaje recibido en canal ${channel}:`, messageData);

    // Determinar el tipo de canal y los usuarios a notificar
    let targetUsers = new Set();

    if (channel.includes('notifications:personal:')) {
      // Canal personal - extraer bomberoId
      const bomberoId = channel.split(':')[2];
      targetUsers.add(bomberoId);
      
    } else if (channel.includes('notifications:direct:')) {
      // Canal de mensaje directo - extraer bomberoId
      const bomberoId = channel.split(':')[2];
      targetUsers.add(bomberoId);
      
    } else if (channel.includes('notifications:reminder:')) {
      // Canal de recordatorios - extraer bomberoId
      const bomberoId = channel.split(':')[2];
      targetUsers.add(bomberoId);
      
    } else if (channel.includes('notifications:compania:')) {
      // Canal de compañía - encontrar todos los usuarios suscritos a esta compañía
      const companiaId = channel.split(':')[2];
      logger.debug(`[NOTIFICATION_SOCKET] Procesando mensaje de compañía ${companiaId}`);
      logger.debug(`[NOTIFICATION_SOCKET] Usuarios suscritos actuales:`, Array.from(subscribedUsers.keys()));
      
      for (const [bomberoId, userEntry] of subscribedUsers.entries()) {
        const userCompanias = Array.from(userEntry.companias);
        logger.debug(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} tiene compañías:`, userCompanias);
        logger.debug(`[NOTIFICATION_SOCKET] Tipos - companiaId: ${typeof companiaId} (${companiaId}), userCompanias:`, userCompanias.map(c => `${typeof c} (${c})`));
        
        // Convertir ambos a string para comparar
        const companiaIdStr = String(companiaId);
        const hasCompania = userCompanias.some(c => String(c) === companiaIdStr);
        
        if (hasCompania) {
          targetUsers.add(bomberoId);
          logger.debug(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} agregado como objetivo para compañía ${companiaId}`);
        } else {
          logger.debug(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} NO coincide con compañía ${companiaId}`);
        }
      }
      
      logger.debug(`[NOTIFICATION_SOCKET] Usuarios objetivo para compañía ${companiaId}:`, Array.from(targetUsers));
      
    } else if (channel.includes('notifications:rol:')) {
      // Canal de rol - encontrar todos los usuarios suscritos a este rol
      const rolId = channel.split(':')[2];
      for (const [bomberoId, userEntry] of subscribedUsers.entries()) {
        if (userEntry.roles.has(rolId)) {
          targetUsers.add(bomberoId);
        }
      }
      
    } else if (channel === 'notifications:system') {
      // Canal del sistema - notificar a todos los usuarios conectados
      targetUsers = new Set(subscribedUsers.keys());
      
    } else if (channel === 'notifications:emergency') {
      // Canal de emergencias - notificar a todos los usuarios conectados
      targetUsers = new Set(subscribedUsers.keys());
    }

    // Enviar notificación a los usuarios objetivo
    logger.debug(`[NOTIFICATION_SOCKET] Enviando notificación a ${targetUsers.size} usuarios`);
    
    for (const bomberoId of targetUsers) {
      const userEntry = subscribedUsers.get(bomberoId);
      if (userEntry && userEntry.socketIds.size > 0) {
        // Enviar a la sala del usuario específico
        const notificationData = {
          ...messageData,
          channel,
          timestamp: new Date().toISOString()
        };
        
        io.to(`user:${bomberoId}`).emit('notification', notificationData);
        
        logger.debug(`[NOTIFICATION_SOCKET] Notificación enviada a usuario ${bomberoId} en sala user:${bomberoId}`, notificationData);
      } else {
        logger.warn(`[NOTIFICATION_SOCKET] Usuario ${bomberoId} no tiene sockets activos o no está suscrito`);
      }
    }

  } catch (error) {
    logger.error('[NOTIFICATION_SOCKET] Error manejando mensaje Redis:', error);
  }
}

/**
 * Emite una notificación directamente a un usuario específico
 * @param {string} bomberoId - ID del bombero
 * @param {Object} notification - Datos de la notificación
 */
export function emitDirectNotification(bomberoId, notification) {
  try {
    const io = getIO();
    if (!io) {
      return;
    }

    io.to(`user:${bomberoId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });

    logger.debug(`[NOTIFICATION_SOCKET] Notificación directa enviada a usuario ${bomberoId}`);

  } catch (error) {
    logger.error('[NOTIFICATION_SOCKET] Error enviando notificación directa:', error);
  }
}

/**
 * Emite una notificación del sistema a todos los usuarios conectados
 * @param {Object} notification - Datos de la notificación
 */
export function emitSystemNotification(notification) {
  try {
    const io = getIO();
    if (!io) {
      return;
    }

    io.emit('system_notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });

    logger.debug('[NOTIFICATION_SOCKET] Notificación del sistema emitida a todos los usuarios');

  } catch (error) {
    logger.error('[NOTIFICATION_SOCKET] Error enviando notificación del sistema:', error);
  }
}

/**
 * Obtiene estadísticas de usuarios suscritos
 * @returns {Object} Estadísticas de suscripciones
 */
export function getSubscriptionStats() {
  const stats = {
    totalUsers: subscribedUsers.size,
    totalChannels: 0,
    usersByCompania: new Map(),
    usersByRole: new Map()
  };

  for (const [bomberoId, userEntry] of subscribedUsers.entries()) {
    stats.totalChannels += userEntry.channels.size;
    
    // Estadísticas por compañía
    for (const companiaId of userEntry.companias) {
      const count = stats.usersByCompania.get(companiaId) || 0;
      stats.usersByCompania.set(companiaId, count + 1);
    }
    
    // Estadísticas por rol
    for (const rolId of userEntry.roles) {
      const count = stats.usersByRole.get(rolId) || 0;
      stats.usersByRole.set(rolId, count + 1);
    }
  }

  return stats;
}

/**
 * Limpia todas las suscripciones (útil para reinicios)
 */
export async function cleanupSubscriptions() {
  try {
    for (const [bomberoId, userEntry] of subscribedUsers.entries()) {
      for (const channel of userEntry.channels) {
        try {
          await redisSubscriber.unsubscribe(channel);
        } catch (unsubscribeError) {
          logger.error(`[NOTIFICATION_SOCKET] Error desuscribiéndose del canal ${channel}:`, unsubscribeError);
        }
      }
    }
    
    subscribedUsers.clear();
    logger.info('[NOTIFICATION_SOCKET] Todas las suscripciones limpiadas');

  } catch (error) {
    logger.error('[NOTIFICATION_SOCKET] Error limpiando suscripciones:', error);
  }
}

export default {
  initializeNotificationSocket,
  subscribeUserToNotifications,
  unsubscribeUserFromNotifications,
  updateUserSubscription,
  emitDirectNotification,
  emitSystemNotification,
  getSubscriptionStats,
  cleanupSubscriptions
};
