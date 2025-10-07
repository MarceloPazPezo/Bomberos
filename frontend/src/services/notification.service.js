import api from './root.service.js';

/**
 * Servicio de notificaciones para el frontend
 * Maneja todas las llamadas a la API relacionadas con notificaciones
 */

class NotificationService {
  /**
   * Obtiene las notificaciones del usuario autenticado
   * @param {number} limit - Límite de notificaciones
   * @param {number} offset - Offset para paginación
   * @returns {Promise<Object>} Respuesta con notificaciones y metadatos
   */
  async getUserNotifications(limit = 50, offset = 0) {
    try {
      const response = await api.get(`/notifications?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene el contador de notificaciones no leídas
   * @returns {Promise<Object>} Respuesta con el contador
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error obteniendo contador de no leídas:', error);
      throw error;
    }
  }

  /**
   * Marca una notificación como leída
   * @param {string} notificationId - ID de la notificación
   * @returns {Promise<Object>} Respuesta de la operación
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/mark-read`);
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error marcando notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   * @returns {Promise<Object>} Respuesta de la operación
   */
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Elimina una notificación específica
   * @param {string} notificationId - ID de la notificación
   * @returns {Promise<Object>} Respuesta de la operación
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error eliminando notificación:', error);
      throw error;
    }
  }

  /**
   * Obtiene los tipos de notificaciones disponibles
   * @returns {Promise<Object>} Respuesta con los tipos disponibles
   */
  async getNotificationTypes() {
    try {
      const response = await api.get('/notifications/types');
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error obteniendo tipos de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Envía una notificación individual
   * @param {string} bomberoId - ID del bombero destinatario
   * @param {string} type - Tipo de notificación
   * @param {string} title - Título de la notificación
   * @param {string} message - Mensaje de la notificación
   * @param {Object} data - Datos adicionales (opcional)
   * @param {number} ttl - TTL personalizado (opcional)
   * @returns {Promise<Object>} Respuesta de la operación
   */
  async sendIndividualNotification(bomberoId, type, title, message, data = {}, ttl = null) {
    try {
      const notificationData = {
        bomberoId,
        type,
        title,
        message,
        data,
        ttl
      };
      
      console.log('[NOTIFICATION_SERVICE] Enviando notificación individual:', notificationData);
      
      const response = await api.post('/notifications/send', notificationData);
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error enviando notificación individual:', error);
      console.error('[NOTIFICATION_SERVICE] Datos enviados:', { bomberoId, type, title, message, data, ttl });
      throw error;
    }
  }

  /**
   * Envía una notificación del sistema a múltiples usuarios
   * @param {Array} bomberoIds - Array de IDs de bomberos
   * @param {string} type - Tipo de notificación
   * @param {string} title - Título de la notificación
   * @param {string} message - Mensaje de la notificación
   * @param {Object} data - Datos adicionales (opcional)
   * @param {number} ttl - TTL personalizado (opcional)
   * @returns {Promise<Object>} Respuesta de la operación
   */
  async sendSystemNotification(bomberoIds, type, title, message, data = {}, ttl = null) {
    try {
      const notificationData = {
        bomberoIds,
        type,
        title,
        message,
        data,
        ttl
      };
      const response = await api.post('/notifications/send-system', notificationData);
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error enviando notificación del sistema:', error);
      throw error;
    }
  }

  /**
   * Prueba el sistema de Pub/Sub de Redis
   * @param {Object} params - Parámetros de la prueba
   * @param {string} params.channel - Canal de prueba
   * @param {string} params.message - Mensaje de prueba
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async testPubSub({ channel, message }) {
    try {
      console.log('[NOTIFICATION_SERVICE] Probando Pub/Sub:', { channel, message });
      
      const response = await api.post('/notifications/test/pubsub', {
        channel,
        message
      });
      
      console.log('[NOTIFICATION_SERVICE] Respuesta del test Pub/Sub:', response.data);
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error probando Pub/Sub:', error);
      throw error;
    }
  }

  /**
   * Envía una notificación a una compañía
   * @param {string} companiaId - ID de la compañía
   * @param {Array} bomberoIds - Array de IDs de bomberos
   * @param {string} type - Tipo de notificación
   * @param {string} title - Título de la notificación
   * @param {string} message - Mensaje de la notificación
   * @param {Object} data - Datos adicionales (opcional)
   * @param {number} ttl - TTL personalizado (opcional)
   * @returns {Promise<Object>} Respuesta de la operación
   */
  async sendCompaniaNotification(companiaId, bomberoIds, type, title, message, data = {}, ttl = null) {
    try {
      const notificationData = {
        companiaId,
        bomberoIds,
        type,
        title,
        message,
        data,
        ttl
      };
      const response = await api.post('/notifications/send-compania', notificationData);
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error enviando notificación de compañía:', error);
      throw error;
    }
  }

  /**
   * Envía una notificación a usuarios con un rol específico
   * @param {string} rolId - ID del rol
   * @param {Array} bomberoIds - Array de IDs de bomberos
   * @param {string} type - Tipo de notificación
   * @param {string} title - Título de la notificación
   * @param {string} message - Mensaje de la notificación
   * @param {Object} data - Datos adicionales (opcional)
   * @param {number} ttl - TTL personalizado (opcional)
   * @returns {Promise<Object>} Respuesta de la operación
   */
  async sendRolNotification(rolId, bomberoIds, type, title, message, data = {}, ttl = null) {
    try {
      const notificationData = {
        rolId,
        bomberoIds,
        type,
        title,
        message,
        data,
        ttl
      };
      const response = await api.post('/notifications/send-rol', notificationData);
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error enviando notificación de rol:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de notificaciones (solo administradores)
   * @returns {Promise<Object>} Respuesta con estadísticas
   */
  async getNotificationStats() {
    try {
      const response = await api.get('/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION_SERVICE] Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Método genérico para enviar notificaciones
   * Determina automáticamente el tipo de envío basado en los datos
   * @param {Object} notificationData - Datos de la notificación
   * @returns {Promise<Object>} Respuesta de la operación
   */
  async sendNotification(notificationData) {
    const { bomberoIds, companiaId, rolId } = notificationData;

    // Si hay un solo usuario específico, enviar individual
    if (bomberoIds && bomberoIds.length === 1) {
      return this.sendIndividualNotification({
        ...notificationData,
        bomberoId: bomberoIds[0]
      });
    }

    // Si hay múltiples usuarios y compañía, enviar a compañía
    if (companiaId && bomberoIds && bomberoIds.length > 1) {
      return this.sendCompaniaNotification(notificationData);
    }

    // Si hay múltiples usuarios y rol, enviar a rol
    if (rolId && bomberoIds && bomberoIds.length > 1) {
      return this.sendRolNotification(notificationData);
    }

    // Si hay múltiples usuarios sin compañía/rol específico, enviar del sistema
    if (bomberoIds && bomberoIds.length > 1) {
      return this.sendSystemNotification(notificationData);
    }

    throw new Error('Datos de notificación inválidos');
  }
}

// Crear instancia singleton
const notificationService = new NotificationService();

export default notificationService;
