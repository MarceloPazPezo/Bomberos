"use strict";

import { getRedisClient, getRedisSubscriber } from '../config/configRedis.js';
import {
  createNotification,
  getNotificationTTL,
  getNotificationKey,
  getUserNotificationsKey,
  getUserUnreadCountKey,
  getUserChannel,
  getCompaniaChannel,
  getRolChannel,
  formatNotificationForSocket,
  createNotificationsForUsers,
  validateNotification,
  NOTIFICATION_LIMITS
} from '../helpers/notification.helper.js';
import logger from '../config/configLogger.js';

/**
 * Servicio de notificaciones con Redis
 * Maneja todas las operaciones de notificaciones en Redis
 */
class NotificationService {
  constructor() {
    this.redisClient = null;
    this.redisSubscriber = null;
  }

  /**
   * Inicializa el servicio con las conexiones Redis
   */
  async initialize() {
    try {
      this.redisClient = getRedisClient();
      this.redisSubscriber = getRedisSubscriber();
      logger.info('[NOTIFICATION_SERVICE] Servicio inicializado correctamente');
    } catch (error) {
      logger.error('[NOTIFICATION_SERVICE] Error al inicializar:', error);
      throw error;
    }
  }

  /**
   * Verifica que el servicio esté inicializado
   */
  async ensureInitialized() {
    if (!this.redisClient) {
      try {
        await this.initialize();
      } catch (error) {
        logger.error('[NOTIFICATION_SERVICE] Error inicializando automáticamente:', error);
        throw new Error('Servicio de notificaciones no disponible');
      }
    }
  }

  /**
   * Envía una notificación individual a un usuario específico
   * @param {Object} notificationData - Datos de la notificación
   * @param {string} bomberoId - ID del bombero destinatario
   * @param {number} customTTL - TTL personalizado (opcional)
   * @returns {Object} Notificación creada
   */
  async sendIndividualNotification(notificationData, bomberoId, customTTL = null) {
    try {
      await this.ensureInitialized();
      
      // Crear la notificación
      const notification = createNotification({
        ...notificationData,
        bomberoId
      });

      // Validar la notificación
      const validation = validateNotification(notification);
      if (!validation.isValid) {
        throw new Error(`Notificación inválida: ${validation.errors.join(', ')}`);
      }

      // Obtener TTL
      const ttl = getNotificationTTL(notification.type, customTTL);

      // Guardar en Redis
      await this.saveNotification(notification, ttl);

      // Incrementar contador de no leídas
      await this.incrementUnreadCount(bomberoId);

      // Publicar en canal del usuario
      await this.publishToUserChannel(notification, bomberoId);

      logger.info(`[NOTIFICATION_SERVICE] Notificación individual enviada: ${notification.id}`);
      return notification;

    } catch (error) {
      logger.error('[NOTIFICATION_SERVICE] Error enviando notificación individual:', error);
      throw error;
    }
  }

  /**
   * Envía una notificación del sistema a todos los usuarios especificados
   * @param {Object} notificationData - Datos de la notificación base
   * @param {Array} bomberoIds - Lista de IDs de bomberos
   * @param {number} customTTL - TTL personalizado (opcional)
   * @returns {Array} Lista de notificaciones creadas
   */
  async sendSystemNotificationToAll(notificationData, bomberoIds, customTTL = null) {
    try {
      await this.ensureInitialized();
      
      if (!bomberoIds || bomberoIds.length === 0) {
        throw new Error('Lista de usuarios vacía');
      }

      // Crear notificaciones individuales para cada usuario
      const notifications = createNotificationsForUsers(notificationData, bomberoIds);

      // Procesar en lotes para evitar sobrecargar Redis
      const batchSize = NOTIFICATION_LIMITS.BATCH_SIZE;
      const results = [];

      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (notification) => {
            // Validar cada notificación
            const validation = validateNotification(notification);
            if (!validation.isValid) {
              logger.warn(`[NOTIFICATION_SERVICE] Notificación inválida omitida: ${validation.errors.join(', ')}`);
              return null;
            }

            const ttl = getNotificationTTL(notification.type, customTTL);
            
            // Guardar en Redis
            await this.saveNotification(notification, ttl);
            
            // Incrementar contador de no leídas
            await this.incrementUnreadCount(notification.bomberoId);
            
            // Publicar en canal del usuario
            await this.publishToUserChannel(notification, notification.bomberoId);
            
            return notification;
          })
        );

        results.push(...batchResults.filter(result => result !== null));
      }

      logger.info(`[NOTIFICATION_SERVICE] Notificación del sistema enviada a ${results.length} usuarios`);
      return results;

    } catch (error) {
      logger.error('[NOTIFICATION_SERVICE] Error enviando notificación del sistema:', error);
      throw error;
    }
  }

  /**
   * Envía una notificación a todos los usuarios de una compañía
   * @param {Object} notificationData - Datos de la notificación
   * @param {string} companiaId - ID de la compañía
   * @param {Array} bomberoIds - Lista de IDs de bomberos de la compañía
   * @param {number} customTTL - TTL personalizado (opcional)
   * @returns {Array} Lista de notificaciones creadas
   */
  async sendCompaniaNotification(notificationData, companiaId, bomberoIds, customTTL = null) {
    try {
      const notifications = await this.sendSystemNotificationToAll(
        { ...notificationData, companiaId },
        bomberoIds,
        customTTL
      );

      // Publicar en canal de la compañía
      const companiaChannel = getCompaniaChannel(companiaId);
      await this.publishToChannel(companiaChannel, {
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

  /**
   * Envía una notificación a todos los usuarios con un rol específico
   * @param {Object} notificationData - Datos de la notificación
   * @param {string} rolId - ID del rol
   * @param {Array} bomberoIds - Lista de IDs de bomberos con el rol
   * @param {number} customTTL - TTL personalizado (opcional)
   * @returns {Array} Lista de notificaciones creadas
   */
  async sendRolNotification(notificationData, rolId, bomberoIds, customTTL = null) {
    try {
      const notifications = await this.sendSystemNotificationToAll(
        { ...notificationData, rolId },
        bomberoIds,
        customTTL
      );

      // Publicar en canal del rol
      const rolChannel = getRolChannel(rolId);
      await this.publishToChannel(rolChannel, {
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

  /**
   * Marca una notificación como leída
   * @param {string} notificationId - ID de la notificación
   * @param {string} bomberoId - ID del bombero
   * @returns {boolean} True si se marcó como leída
   */
  async markAsRead(notificationId, bomberoId) {
    try {
      await this.ensureInitialized();
      
      const notificationKey = getNotificationKey(notificationId);
      const notification = await this.redisClient.get(notificationKey);

      if (!notification) {
        throw new Error('Notificación no encontrada');
      }

      const notificationData = JSON.parse(notification);
      
      // Verificar que pertenece al usuario
      if (notificationData.bomberoId !== bomberoId) {
        throw new Error('No autorizado para marcar esta notificación como leída');
      }

      // Marcar como leída si no lo está
      if (!notificationData.readAt) {
        notificationData.readAt = new Date().toISOString();
        
        // Actualizar en Redis
        const ttl = await this.redisClient.ttl(notificationKey);
        await this.redisClient.setEx(notificationKey, ttl > 0 ? ttl : 86400, JSON.stringify(notificationData));
        
        // Decrementar contador de no leídas
        await this.decrementUnreadCount(bomberoId);

        logger.info(`[NOTIFICATION_SERVICE] Notificación marcada como leída: ${notificationId}`);
        return true;
      }

      return false;

    } catch (error) {
      logger.error('[NOTIFICATION_SERVICE] Error marcando notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   * @param {string} bomberoId - ID del bombero
   * @returns {number} Número de notificaciones marcadas como leídas
   */
  async markAllAsRead(bomberoId) {
    try {
      await this.ensureInitialized();
      
      const userNotificationsKey = getUserNotificationsKey(bomberoId);
      const notificationIds = await this.redisClient.lRange(userNotificationsKey, 0, -1);

      let markedCount = 0;
      const currentTime = new Date().toISOString();

      for (const notificationId of notificationIds) {
        const notificationKey = getNotificationKey(notificationId);
        const notification = await this.redisClient.get(notificationKey);

        if (notification) {
          const notificationData = JSON.parse(notification);
          
          if (!notificationData.readAt) {
            notificationData.readAt = currentTime;
            const ttl = await this.redisClient.ttl(notificationKey);
            await this.redisClient.setEx(notificationKey, ttl > 0 ? ttl : 86400, JSON.stringify(notificationData));
            markedCount++;
          }
        }
      }

      // Resetear contador de no leídas
      await this.redisClient.del(getUserUnreadCountKey(bomberoId));

      logger.info(`[NOTIFICATION_SERVICE] ${markedCount} notificaciones marcadas como leídas para usuario: ${bomberoId}`);
      return markedCount;

    } catch (error) {
      logger.error('[NOTIFICATION_SERVICE] Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Obtiene las notificaciones de un usuario
   * @param {string} bomberoId - ID del bombero
   * @param {number} limit - Límite de notificaciones (opcional)
   * @param {number} offset - Offset para paginación (opcional)
   * @returns {Object} Objeto con notificaciones y metadatos
   */
  async getUserNotifications(bomberoId, limit = 50, offset = 0) {
    try {
      await this.ensureInitialized();
      
      const userNotificationsKey = getUserNotificationsKey(bomberoId);
      const notificationIds = await this.redisClient.lRange(userNotificationsKey, offset, offset + limit - 1);

      logger.debug(`[NOTIFICATION_SERVICE] Obteniendo notificaciones para usuario ${bomberoId}`);
      logger.debug(`[NOTIFICATION_SERVICE] Clave Redis: ${userNotificationsKey}`);
      logger.debug(`[NOTIFICATION_SERVICE] IDs encontrados: ${notificationIds.length}`);

      const notifications = [];
      for (const notificationId of notificationIds) {
        const notificationKey = getNotificationKey(notificationId);
        const notification = await this.redisClient.get(notificationKey);

        if (notification) {
          notifications.push(JSON.parse(notification));
          logger.debug(`[NOTIFICATION_SERVICE] Notificación encontrada: ${notificationId}`);
        } else {
          logger.warn(`[NOTIFICATION_SERVICE] Notificación no encontrada: ${notificationId}`);
        }
      }

      // Obtener contador de no leídas
      const unreadCount = await this.getUnreadCount(bomberoId);

      // Obtener total de notificaciones
      const totalCount = await this.redisClient.lLen(userNotificationsKey);

      return {
        notifications,
        unreadCount,
        totalCount,
        limit,
        offset
      };

    } catch (error) {
      logger.error('[NOTIFICATION_SERVICE] Error obteniendo notificaciones del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene el contador de notificaciones no leídas de un usuario
   * @param {string} bomberoId - ID del bombero
   * @returns {number} Número de notificaciones no leídas
   */
  async getUnreadCount(bomberoId) {
    try {
      await this.ensureInitialized();
      
      const unreadCountKey = getUserUnreadCountKey(bomberoId);
      const count = await this.redisClient.get(unreadCountKey);
      return parseInt(count) || 0;
    } catch (error) {
      logger.error('[NOTIFICATION_SERVICE] Error obteniendo contador de no leídas:', error);
      return 0;
    }
  }

  /**
   * Elimina una notificación específica
   * @param {string} notificationId - ID de la notificación
   * @param {string} bomberoId - ID del bombero
   * @returns {boolean} True si se eliminó
   */
  async deleteNotification(notificationId, bomberoId) {
    try {
      await this.ensureInitialized();
      
      const notificationKey = getNotificationKey(notificationId);
      const notification = await this.redisClient.get(notificationKey);

      if (!notification) {
        return false;
      }

      const notificationData = JSON.parse(notification);
      
      // Verificar que pertenece al usuario
      if (notificationData.bomberoId !== bomberoId) {
        throw new Error('No autorizado para eliminar esta notificación');
      }

      // Eliminar de Redis
      await this.redisClient.del(notificationKey);
      
      // Remover de la lista del usuario
      const userNotificationsKey = getUserNotificationsKey(bomberoId);
      await this.redisClient.lRem(userNotificationsKey, 1, notificationId);

      // Decrementar contador si no estaba leída
      if (!notificationData.readAt) {
        await this.decrementUnreadCount(bomberoId);
      }

      logger.info(`[NOTIFICATION_SERVICE] Notificación eliminada: ${notificationId}`);
      return true;

    } catch (error) {
      logger.error('[NOTIFICATION_SERVICE] Error eliminando notificación:', error);
      throw error;
    }
  }

  /**
   * Guarda una notificación en Redis
   * @private
   * @param {Object} notification - Notificación a guardar
   * @param {number} ttl - TTL en segundos
   */
  async saveNotification(notification, ttl) {
    const notificationKey = getNotificationKey(notification.id);
    const userNotificationsKey = getUserNotificationsKey(notification.bomberoId);

    logger.debug(`[NOTIFICATION_SERVICE] Guardando notificación: ${notification.id}`);
    logger.debug(`[NOTIFICATION_SERVICE] Clave notificación: ${notificationKey}`);
    logger.debug(`[NOTIFICATION_SERVICE] Clave usuario: ${userNotificationsKey}`);
    logger.debug(`[NOTIFICATION_SERVICE] TTL: ${ttl} segundos`);

    // Guardar la notificación con TTL
    await this.redisClient.setEx(notificationKey, ttl, JSON.stringify(notification));

    // Agregar a la lista del usuario (al inicio)
    await this.redisClient.lPush(userNotificationsKey, notification.id);

    // Mantener límite de notificaciones por usuario
    await this.redisClient.lTrim(userNotificationsKey, 0, NOTIFICATION_LIMITS.MAX_NOTIFICATIONS_PER_USER - 1);

    logger.debug(`[NOTIFICATION_SERVICE] Notificación guardada exitosamente: ${notification.id}`);
  }

  /**
   * Incrementa el contador de notificaciones no leídas
   * @private
   * @param {string} bomberoId - ID del bombero
   */
  async incrementUnreadCount(bomberoId) {
    const unreadCountKey = getUserUnreadCountKey(bomberoId);
    await this.redisClient.incr(unreadCountKey);
  }

  /**
   * Decrementa el contador de notificaciones no leídas
   * @private
   * @param {string} bomberoId - ID del bombero
   */
  async decrementUnreadCount(bomberoId) {
    const unreadCountKey = getUserUnreadCountKey(bomberoId);
    const count = await this.redisClient.decr(unreadCountKey);
    
    // Si el contador llega a negativo, resetear a 0
    if (count < 0) {
      await this.redisClient.set(unreadCountKey, 0);
    }
  }

  /**
   * Publica un mensaje en el canal de un usuario específico
   * @private
   * @param {Object} notification - Notificación a publicar
   * @param {string} bomberoId - ID del bombero
   */
  async publishToUserChannel(notification, bomberoId) {
    const channel = getUserChannel(notification.type, bomberoId);
    const message = formatNotificationForSocket(notification);
    await this.publishToChannel(channel, message);
  }

  /**
   * Publica un mensaje en un canal específico
   * @private
   * @param {string} channel - Canal de publicación
   * @param {Object} message - Mensaje a publicar
   */
  async publishToChannel(channel, message) {
    try {
      await this.redisClient.publish(channel, JSON.stringify(message));
      logger.debug(`[NOTIFICATION_SERVICE] Mensaje publicado en canal: ${channel}`);
    } catch (error) {
      logger.error(`[NOTIFICATION_SERVICE] Error publicando en canal ${channel}:`, error);
    }
  }
}

// Crear instancia singleton
const notificationService = new NotificationService();

export default notificationService;
