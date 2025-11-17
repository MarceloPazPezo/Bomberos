"use strict";

import { getRedisClient, getRedisSubscriber } from '../config/configRedis.js';
import {
  createNotification,
  createNotificationsForUsers,
  formatNotificationForSocket,
  getCompaniaChannel,
  getNotificationKey,
  getNotificationTTL,
  getRolChannel,
  getUserChannel,
  getUserNotificationsKey,
  getUserUnreadCountKey,
  NOTIFICATION_LIMITS,
  validateNotification
} from '../helpers/notification.helper.js';
import logger from '../config/configLogger.js';

// Functional implementation: module-level Redis references
let redisClient = null;
let redisSubscriber = null;

export async function initialize() {
  try {
    redisClient = getRedisClient();
    redisSubscriber = getRedisSubscriber();

    if (!redisClient || !redisSubscriber) {
      throw new Error('No se pudieron obtener las conexiones Redis');
    }

    const pingResult = await redisClient.ping();
    if (pingResult !== 'PONG') {
      throw new Error('Redis no responde correctamente');
    }

    logger.info('[NOTIFICATION_SERVICE] Servicio base inicializado correctamente');
  } catch (error) {
    logger.error('[NOTIFICATION_SERVICE] Error al inicializar servicio:', error);
    throw error;
  }
}

export async function ensureInitialized() {
  if (!redisClient) {
    try {
      await initialize();
    } catch (error) {
      logger.error('[NOTIFICATION_SERVICE] Error inicializando automáticamente:', error);
      throw new Error('Servicio de notificaciones no disponible');
    }
  }
}

export async function sendIndividualNotification(notificationData, bomberoId, customTTL = null) {
  try {
    await ensureInitialized();

    const notification = createNotification({ ...notificationData, bomberoId });

    const validation = validateNotification(notification);
    if (!validation.isValid) {
      throw new Error(`Notificación inválida: ${validation.errors.join(', ')}`);
    }

    const ttl = getNotificationTTL(notification.type, customTTL);

    await saveNotification(notification, ttl);
    await incrementUnreadCount(bomberoId);
    await publishToUserChannel(notification, bomberoId);

    logger.info(`[NOTIFICATION_SERVICE] Notificación individual enviada: ${notification.id}`);
    return notification;
  } catch (error) {
    logger.error('[NOTIFICATION_SERVICE] Error enviando notificación individual:', error);
    throw error;
  }
}

export async function sendSystemNotificationToAll(notificationData, bomberoIds, customTTL = null) {
  try {
    await ensureInitialized();

    if (!bomberoIds || bomberoIds.length === 0) {
      throw new Error('Lista de usuarios vacía');
    }

    const notifications = createNotificationsForUsers(notificationData, bomberoIds);
    const batchSize = NOTIFICATION_LIMITS.BATCH_SIZE;
    const results = [];

    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (notification) => {
          const validation = validateNotification(notification);
          if (!validation.isValid) {
            logger.warn(`[NOTIFICATION_SERVICE] Notificación inválida omitida: ${validation.errors.join(', ')}`);
            return null;
          }

          const ttl = getNotificationTTL(notification.type, customTTL);
          await saveNotification(notification, ttl);
          await incrementUnreadCount(notification.bomberoId);
          await publishToUserChannel(notification, notification.bomberoId);

          return notification;
        })
      );

      results.push(...batchResults.filter((r) => r !== null));
    }

    logger.info(`[NOTIFICATION_SERVICE] Notificación del sistema enviada a ${results.length} usuarios`);
    return results;
  } catch (error) {
    logger.error('[NOTIFICATION_SERVICE] Error enviando notificación del sistema:', error);
    throw error;
  }
}

export async function sendCompaniaNotification(notificationData, companiaId, bomberoIds, customTTL = null) {
  try {
    const notifications = await sendSystemNotificationToAll({ ...notificationData, companiaId }, bomberoIds, customTTL);

    const companiaChannel = getCompaniaChannel(companiaId);
    await publishToChannel(companiaChannel, {
      type: 'COMPANIA_NOTIFICATION',
      companiaId,
      count: notifications.length,
      notification: notificationData
    });

    logger.info(`[NOTIFICATION_SERVICE] Notificación de compañía enviada: ${companiaId}`);
    return notifications;
  } catch (error) {
    logger.error('[NOTIFICATION_SERVICE] Error enviando notificación de compañía:', error);
    throw error;
  }
}

export async function sendRolNotification(notificationData, rolId, bomberoIds, customTTL = null) {
  try {
    const notifications = await sendSystemNotificationToAll({ ...notificationData, rolId }, bomberoIds, customTTL);

    const rolChannel = getRolChannel(rolId);
    await publishToChannel(rolChannel, {
      type: 'ROL_NOTIFICATION',
      rolId,
      count: notifications.length,
      notification: notificationData
    });

    logger.info(`[NOTIFICATION_SERVICE] Notificación de rol enviada: ${rolId}`);
    return notifications;
  } catch (error) {
    logger.error('[NOTIFICATION_SERVICE] Error enviando notificación de rol:', error);
    throw error;
  }
}

export async function markAsRead(notificationId, bomberoId) {
  try {
    await ensureInitialized();

    const notificationKey = getNotificationKey(notificationId);
    const notification = await redisClient.get(notificationKey);

    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    const notificationData = JSON.parse(notification);
    if (notificationData.bomberoId !== bomberoId) {
      throw new Error('No autorizado para marcar esta notificación como leída');
    }

    if (!notificationData.readAt) {
      notificationData.readAt = new Date().toISOString();
      const ttl = await redisClient.ttl(notificationKey);
      await redisClient.setEx(notificationKey, ttl > 0 ? ttl : 86400, JSON.stringify(notificationData));
      await decrementUnreadCount(bomberoId);
      logger.info(`[NOTIFICATION_SERVICE] Notificación marcada como leída: ${notificationId}`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error('[NOTIFICATION_SERVICE] Error marcando notificación como leída:', error);
    throw error;
  }
}

export async function markAllAsRead(bomberoId) {
  try {
    await ensureInitialized();
    const userNotificationsKey = getUserNotificationsKey(bomberoId);
    const notificationIds = await redisClient.lRange(userNotificationsKey, 0, -1);

    let markedCount = 0;
    const currentTime = new Date().toISOString();

    for (const notificationId of notificationIds) {
      const notificationKey = getNotificationKey(notificationId);
      const notification = await redisClient.get(notificationKey);
      if (notification) {
        const notificationData = JSON.parse(notification);
        if (!notificationData.readAt) {
          notificationData.readAt = currentTime;
          const ttl = await redisClient.ttl(notificationKey);
          await redisClient.setEx(notificationKey, ttl > 0 ? ttl : 86400, JSON.stringify(notificationData));
          markedCount++;
        }
      }
    }

    await redisClient.del(getUserUnreadCountKey(bomberoId));
    logger.info(`[NOTIFICATION_SERVICE] ${markedCount} notificaciones marcadas como leídas para usuario: ${bomberoId}`);
    return markedCount;
  } catch (error) {
    logger.error('[NOTIFICATION_SERVICE] Error marcando todas las notificaciones como leídas:', error);
    throw error;
  }
}

export async function getUserNotifications(bomberoId, limit = 50, offset = 0) {
  try {
    await ensureInitialized();
    const userNotificationsKey = getUserNotificationsKey(bomberoId);
    const notificationIds = await redisClient.lRange(userNotificationsKey, offset, offset + limit - 1);

    logger.debug(`[NOTIFICATION_SERVICE] Obteniendo notificaciones para usuario ${bomberoId}`);
    logger.debug(`[NOTIFICATION_SERVICE] Clave Redis: ${userNotificationsKey}`);
    logger.debug(`[NOTIFICATION_SERVICE] IDs encontrados: ${notificationIds.length}`);

    const notifications = [];
    for (const notificationId of notificationIds) {
      const notificationKey = getNotificationKey(notificationId);
      const notification = await redisClient.get(notificationKey);
      if (notification) {
        notifications.push(JSON.parse(notification));
        logger.debug(`[NOTIFICATION_SERVICE] Notificación encontrada: ${notificationId}`);
      } else {
        logger.warn(`[NOTIFICATION_SERVICE] Notificación no encontrada: ${notificationId}`);
      }
    }

    const unreadCount = await getUnreadCount(bomberoId);
    const totalCount = await redisClient.lLen(userNotificationsKey);

    return { notifications, unreadCount, totalCount, limit, offset };
  } catch (error) {
    logger.error('[NOTIFICATION_SERVICE] Error obteniendo notificaciones del usuario:', error);
    throw error;
  }
}

export async function getUnreadCount(bomberoId) {
  try {
    await ensureInitialized();
    const unreadCountKey = getUserUnreadCountKey(bomberoId);
    const count = await redisClient.get(unreadCountKey);
    return parseInt(count) || 0;
  } catch (error) {
    logger.error('[NOTIFICATION_SERVICE] Error obteniendo contador de no leídas:', error);
    return 0;
  }
}

export async function deleteNotification(notificationId, bomberoId) {
  try {
    await ensureInitialized();
    const notificationKey = getNotificationKey(notificationId);
    const notification = await redisClient.get(notificationKey);
    if (!notification) return false;
    const notificationData = JSON.parse(notification);
    if (notificationData.bomberoId !== bomberoId) throw new Error('No autorizado para eliminar esta notificación');
    await redisClient.del(notificationKey);
    const userNotificationsKey = getUserNotificationsKey(bomberoId);
    await redisClient.lRem(userNotificationsKey, 1, notificationId);
    if (!notificationData.readAt) await decrementUnreadCount(bomberoId);
    logger.info(`[NOTIFICATION_SERVICE] Notificación eliminada: ${notificationId}`);
    return true;
  } catch (error) {
    logger.error('[NOTIFICATION_SERVICE] Error eliminando notificación:', error);
    throw error;
  }
}

export async function saveNotification(notification, ttl) {
  const notificationKey = getNotificationKey(notification.id);
  const userNotificationsKey = getUserNotificationsKey(notification.bomberoId);

  logger.debug(`[NOTIFICATION_SERVICE] Guardando notificación: ${notification.id}`);
  logger.debug(`[NOTIFICATION_SERVICE] Clave notificación: ${notificationKey}`);
  logger.debug(`[NOTIFICATION_SERVICE] Clave usuario: ${userNotificationsKey}`);
  logger.debug(`[NOTIFICATION_SERVICE] TTL: ${ttl} segundos`);

  await redisClient.setEx(notificationKey, ttl, JSON.stringify(notification));
  await redisClient.lPush(userNotificationsKey, notification.id);
  await redisClient.lTrim(userNotificationsKey, 0, NOTIFICATION_LIMITS.MAX_NOTIFICATIONS_PER_USER - 1);

  logger.debug(`[NOTIFICATION_SERVICE] Notificación guardada exitosamente: ${notification.id}`);
}

export async function incrementUnreadCount(bomberoId) {
  const unreadCountKey = getUserUnreadCountKey(bomberoId);
  await redisClient.incr(unreadCountKey);
}

export async function decrementUnreadCount(bomberoId) {
  const unreadCountKey = getUserUnreadCountKey(bomberoId);
  const count = await redisClient.decr(unreadCountKey);
  if (count < 0) {
    await redisClient.set(unreadCountKey, 0);
  }
}

export async function publishToUserChannel(notification, bomberoId) {
  const channel = getUserChannel(notification.type, bomberoId);
  const message = formatNotificationForSocket(notification);
  await publishToChannel(channel, message);
}

export async function publishToChannel(channel, message) {
  try {
    await redisClient.publish(channel, JSON.stringify(message));
    logger.debug(`[NOTIFICATION_SERVICE] Mensaje publicado en canal: ${channel}`);
  } catch (error) {
    logger.error(`[NOTIFICATION_SERVICE] Error publicando en canal ${channel}:`, error);
  }
}

// Default export shim for compatibility
const notificationService = {
  initialize,
  ensureInitialized,
  sendIndividualNotification,
  sendSystemNotificationToAll,
  sendCompaniaNotification,
  sendRolNotification,
  markAsRead,
  markAllAsRead,
  getUserNotifications,
  getUnreadCount,
  deleteNotification,
  saveNotification,
  incrementUnreadCount,
  decrementUnreadCount,
  publishToUserChannel,
  publishToChannel
};

// expose redisClient/redisSubscriber as getters for backward compatibility
Object.defineProperty(notificationService, 'redisClient', {
  get: () => redisClient
});
Object.defineProperty(notificationService, 'redisSubscriber', {
  get: () => redisSubscriber
});
export { notificationService };

export default notificationService;
