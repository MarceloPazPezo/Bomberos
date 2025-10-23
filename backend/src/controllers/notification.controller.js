"use strict";

import notificationService from '../services/notification.service.js';
import { NOTIFICATION_TYPES } from '../helpers/notification.helper.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';
import logger from '../config/configLogger.js';
import { getBomberosByCompaniaService } from '../services/bombero.service.js';

/**
 * Controlador de notificaciones
 * Maneja las peticiones HTTP relacionadas con notificaciones
 */
class NotificationController {
  
  constructor() {
    // No inicializar automáticamente - se hará cuando Redis esté listo
  }
  
  async initializeService() {
    try {
      await notificationService.initialize();
      logger.info('[NOTIFICATION_CONTROLLER] Servicio de notificaciones inicializado');
    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error inicializando servicio:', error);
    }
  }
  
  /**
   * Envía una notificación individual a un usuario específico
   * POST /api/notifications/send
   */
  async sendIndividualNotification(req, res) {
    try {
      const { bomberoId, type, title, message, data, ttl } = req.body;
      const user = req.bombero; // Usuario autenticado

      // Validaciones básicas
      if (!bomberoId || !type || !title || !message) {
        return handleErrorClient(res, 400, 'Faltan campos requeridos');
      }

      if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
        return handleErrorClient(res, 400, 'Tipo de notificación inválido');
      }

      // Crear notificación
      const notificationData = {
        type,
        title,
        message,
        data: data || {}
      };

      const notification = await notificationService.sendIndividualNotification(
        notificationData,
        bomberoId,
        ttl
      );

      logger.info(`[NOTIFICATION_CONTROLLER] Notificación individual enviada por ${user.id} a ${bomberoId}`);

      return handleSuccess(res, 200, 'Notificación enviada exitosamente', {
        notification: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          bomberoId: notification.bomberoId,
          createdAt: notification.createdAt
        }
      });

    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error enviando notificación individual:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Envía una notificación del sistema a múltiples usuarios
   * POST /api/notifications/send-system
   */
  async sendSystemNotification(req, res) {
    try {
      const { bomberoIds, type, title, message, data, ttl } = req.body;
      const user = req.bombero; // Usuario autenticado

      // Validaciones básicas
      if (!bomberoIds || !Array.isArray(bomberoIds) || bomberoIds.length === 0) {
        return handleErrorClient(res, 400, 'Lista de usuarios requerida');
      }

      if (!type || !title || !message) {
        return handleErrorClient(res, 400, 'Faltan campos requeridos');
      }

      if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
        return handleErrorClient(res, 400, 'Tipo de notificación inválido');
      }

      // Crear notificación base
      const notificationData = {
        type,
        title,
        message,
        data: data || {}
      };

      const notifications = await notificationService.sendSystemNotificationToAll(
        notificationData,
        bomberoIds,
        ttl
      );

      logger.info(`[NOTIFICATION_CONTROLLER] Notificación del sistema enviada por ${user.id} a ${notifications.length} usuarios`);

      return handleSuccess(res, 200, 'Notificaciones del sistema enviadas exitosamente', {
        sent: notifications.length,
        total: bomberoIds.length,
        notifications: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          bomberoId: n.bomberoId,
          createdAt: n.createdAt
        }))
      });

    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error enviando notificación del sistema:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Envía una notificación a todos los usuarios de una compañía
   * POST /api/notifications/send-compania
   */
  async sendCompaniaNotification(req, res) {
    try {
      const { companiaId, bomberoIds, type, title, message, data, ttl } = req.body;
      const user = req.bombero; // Usuario autenticado

      logger.debug(`[NOTIFICATION_CONTROLLER] sendCompaniaNotification recibido:`, {
        companiaId,
        bomberoIds,
        type,
        title,
        message,
        data,
        ttl
      });

      // Validaciones básicas
      if (!companiaId) {
        logger.warn(`[NOTIFICATION_CONTROLLER] Validación fallida - compañía requerida:`, { companiaId });
        return handleErrorClient(res, 400, 'ID de compañía requerido');
      }

      // Obtener todos los bomberos de la compañía
      logger.info(`[NOTIFICATION_CONTROLLER] Obteniendo bomberos de la compañía ${companiaId}`);
      const [bomberos, errorBomberos] = await getBomberosByCompaniaService(companiaId);
      
      if (errorBomberos) {
        logger.error(`[NOTIFICATION_CONTROLLER] Error obteniendo bomberos de compañía:`, errorBomberos);
        return handleErrorServer(res, 500, 'Error obteniendo bomberos de la compañía');
      }

      if (!bomberos || bomberos.length === 0) {
        logger.warn(`[NOTIFICATION_CONTROLLER] No se encontraron bomberos en la compañía ${companiaId}`);
        return handleErrorClient(res, 404, 'No se encontraron bomberos en la compañía especificada');
      }

      // Extraer IDs de bomberos
      const allBomberoIds = bomberos.map(bombero => bombero.id);
      logger.info(`[NOTIFICATION_CONTROLLER] Encontrados ${allBomberoIds.length} bomberos en la compañía ${companiaId}`);

      // Si se proporcionaron bomberoIds específicos, usar solo esos (para filtrado)
      const targetBomberoIds = bomberoIds && Array.isArray(bomberoIds) && bomberoIds.length > 0 
        ? bomberoIds.filter(id => allBomberoIds.includes(id)) // Solo bomberos que pertenecen a la compañía
        : allBomberoIds; // Todos los bomberos de la compañía

      if (targetBomberoIds.length === 0) {
        logger.warn(`[NOTIFICATION_CONTROLLER] No hay bomberos válidos para notificar en la compañía ${companiaId}`);
        return handleErrorClient(res, 400, 'No hay bomberos válidos para notificar en la compañía');
      }

      logger.info(`[NOTIFICATION_CONTROLLER] Notificando a ${targetBomberoIds.length} bomberos de la compañía ${companiaId}`);

      if (!type || !title || !message) {
        logger.warn(`[NOTIFICATION_CONTROLLER] Validación fallida - campos requeridos:`, { type, title, message });
        return handleErrorClient(res, 400, 'Faltan campos requeridos');
      }

      if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
        logger.warn(`[NOTIFICATION_CONTROLLER] Validación fallida - tipo inválido:`, { 
          type, 
          validTypes: Object.values(NOTIFICATION_TYPES) 
        });
        return handleErrorClient(res, 400, `Tipo de notificación inválido. Tipos válidos: ${Object.values(NOTIFICATION_TYPES).join(', ')}`);
      }

      // Crear notificación base
      const notificationData = {
        type,
        title,
        message,
        data: data || {}
      };

      const notifications = await notificationService.sendCompaniaNotification(
        notificationData,
        companiaId,
        targetBomberoIds,
        ttl
      );

      logger.info(`[NOTIFICATION_CONTROLLER] Notificación de compañía enviada por ${user.id} a ${notifications.length} usuarios de compañía ${companiaId}`);

      return handleSuccess(res, 200, 'Notificaciones de compañía enviadas exitosamente', {
        companiaId,
        sent: notifications.length,
        total: targetBomberoIds.length,
        totalInCompania: allBomberoIds.length
      });

    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error enviando notificación de compañía:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Envía una notificación a todos los usuarios con un rol específico
   * POST /api/notifications/send-rol
   */
  async sendRolNotification(req, res) {
    try {
      const { rolId, bomberoIds, type, title, message, data, ttl } = req.body;
      const user = req.bombero; // Usuario autenticado

      // Validaciones básicas
      if (!rolId || !bomberoIds || !Array.isArray(bomberoIds) || bomberoIds.length === 0) {
        return handleErrorClient(res, 400, 'Rol y lista de usuarios requeridos');
      }

      if (!type || !title || !message) {
        return handleErrorClient(res, 400, 'Faltan campos requeridos');
      }

      if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
        return handleErrorClient(res, 400, 'Tipo de notificación inválido');
      }

      // Crear notificación base
      const notificationData = {
        type,
        title,
        message,
        data: data || {}
      };

      const notifications = await notificationService.sendRolNotification(
        notificationData,
        rolId,
        bomberoIds,
        ttl
      );

      logger.info(`[NOTIFICATION_CONTROLLER] Notificación de rol enviada por ${user.id} a ${notifications.length} usuarios con rol ${rolId}`);

      return handleSuccess(res, 200, 'Notificaciones de rol enviadas exitosamente', {
        rolId,
        sent: notifications.length,
        total: bomberoIds.length
      });

    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error enviando notificación de rol:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Obtiene las notificaciones del usuario autenticado
   * GET /api/notifications
   */
  async getUserNotifications(req, res) {
    try {
      const user = req.bombero; // Usuario autenticado
      const { limit = 50, offset = 0 } = req.query;

      const result = await notificationService.getUserNotifications(
        user.id,
        parseInt(limit),
        parseInt(offset)
      );

      logger.info(`[NOTIFICATION_CONTROLLER] Notificaciones obtenidas para usuario ${user.id}`);

      return handleSuccess(res, 200, 'Notificaciones obtenidas exitosamente', result);

    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error obteniendo notificaciones del usuario:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Obtiene el contador de notificaciones no leídas del usuario autenticado
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req, res) {
    try {
      const user = req.bombero; // Usuario autenticado

      const unreadCount = await notificationService.getUnreadCount(user.id);

      return handleSuccess(res, 200, 'Contador de no leídas obtenido exitosamente', {
        unreadCount
      });

    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error obteniendo contador de no leídas:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Marca una notificación específica como leída
   * PUT /api/notifications/:id/mark-read
   */
  async markAsRead(req, res) {
    try {
      const { id: notificationId } = req.params;
      const user = req.bombero; // Usuario autenticado

      if (!notificationId) {
        return handleErrorClient(res, 400, 'ID de notificación requerido');
      }

      const wasMarked = await notificationService.markAsRead(notificationId, user.id);

      if (wasMarked) {
        logger.info(`[NOTIFICATION_CONTROLLER] Notificación ${notificationId} marcada como leída por usuario ${user.id}`);
        return handleSuccess(res, 200, 'Notificación marcada como leída exitosamente');
      } else {
        return handleSuccess(res, 200, 'Notificación ya estaba marcada como leída');
      }

    } catch (error) {
      if (error.message === 'Notificación no encontrada') {
        return handleErrorClient(res, 404, 'Notificación no encontrada');
      }
      if (error.message === 'No autorizado para marcar esta notificación como leída') {
        return handleErrorClient(res, 403, 'No autorizado');
      }
      
      logger.error('[NOTIFICATION_CONTROLLER] Error marcando notificación como leída:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Marca todas las notificaciones del usuario como leídas
   * PUT /api/notifications/mark-all-read
   */
  async markAllAsRead(req, res) {
    try {
      const user = req.bombero; // Usuario autenticado

      const markedCount = await notificationService.markAllAsRead(user.id);

      logger.info(`[NOTIFICATION_CONTROLLER] ${markedCount} notificaciones marcadas como leídas por usuario ${user.id}`);

      return handleSuccess(res, 200, 'Notificaciones marcadas como leídas exitosamente', {
        markedCount
      });

    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error marcando todas las notificaciones como leídas:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Elimina una notificación específica
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req, res) {
    try {
      const { id: notificationId } = req.params;
      const user = req.bombero; // Usuario autenticado

      if (!notificationId) {
        return handleErrorClient(res, 400, 'ID de notificación requerido');
      }

      const wasDeleted = await notificationService.deleteNotification(notificationId, user.id);

      if (wasDeleted) {
        logger.info(`[NOTIFICATION_CONTROLLER] Notificación ${notificationId} eliminada por usuario ${user.id}`);
        return handleSuccess(res, 200, 'Notificación eliminada exitosamente');
      } else {
        return handleErrorClient(res, 404, 'Notificación no encontrada');
      }

    } catch (error) {
      if (error.message === 'No autorizado para eliminar esta notificación') {
        return handleErrorClient(res, 403, 'No autorizado');
      }
      
      logger.error('[NOTIFICATION_CONTROLLER] Error eliminando notificación:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Obtiene los tipos de notificaciones disponibles
   * GET /api/notifications/types
   */
  async getNotificationTypes(req, res) {
    try {
      return handleSuccess(res, 200, 'Tipos de notificaciones obtenidos exitosamente', {
        types: NOTIFICATION_TYPES
      });
    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error obteniendo tipos de notificaciones:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Obtiene estadísticas de notificaciones (solo para administradores)
   * GET /api/notifications/stats
   */
  async getNotificationStats(req, res) {
    try {
      const user = req.bombero; // Usuario autenticado
      
      // Aquí podrías agregar validación de permisos de administrador
      // if (!user.isAdmin) {
      //   return handleErrorClient(res, 403, 'No autorizado');
      // }

      // Por ahora, solo retornamos información básica
      const stats = {
        totalTypes: Object.keys(NOTIFICATION_TYPES).length,
        availableTypes: NOTIFICATION_TYPES,
        timestamp: new Date().toISOString()
      };

      return handleSuccess(res, 200, 'Estadísticas obtenidas exitosamente', {
        stats
      });

    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error obteniendo estadísticas:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Envía notificaciones de demostración
   * POST /api/notifications/test/send-demo (solo desarrollo)
   */
  async sendDemoNotification(req, res) {
    if (process.env.NODE_ENV !== 'development') {
      return handleErrorClient(res, 404, 'Endpoint no disponible');
    }

    try {
      const { type = 'individual', bomberoId, title, message } = req.body;
      const user = req.bombero;

      const demoNotifications = [
        {
          type: 'individual',
          title: '🧪 Notificación Individual de Prueba',
          message: 'Esta es una notificación individual de prueba para verificar el funcionamiento del sistema.',
          data: { testType: 'individual', timestamp: new Date().toISOString() }
        },
        {
          type: 'system',
          title: '🌐 Notificación del Sistema de Prueba',
          message: 'Esta es una notificación del sistema enviada a todos los usuarios para verificar el funcionamiento masivo.',
          data: { testType: 'system', timestamp: new Date().toISOString() }
        },
        {
          type: 'compania',
          title: '🏢 Notificación de Compañía de Prueba',
          message: 'Esta es una notificación enviada a todos los miembros de tu compañía para verificar el funcionamiento.',
          data: { testType: 'compania', timestamp: new Date().toISOString() }
        }
      ];

      let selectedNotification;
      if (type === 'individual') {
        selectedNotification = demoNotifications[0];
      } else if (type === 'system') {
        selectedNotification = demoNotifications[1];
      } else if (type === 'compania') {
        selectedNotification = demoNotifications[2];
      } else {
        selectedNotification = demoNotifications[0];
      }

      // Usar títulos y mensajes personalizados si se proporcionan
      if (title) selectedNotification.title = title;
      if (message) selectedNotification.message = message;

      let result;
      const targetBomberoId = bomberoId || user.id;

      if (type === 'individual') {
        result = await notificationService.sendIndividualNotification(
          selectedNotification,
          targetBomberoId
        );
      } else if (type === 'system') {
        result = await notificationService.sendSystemNotificationToAll(
          selectedNotification,
          [targetBomberoId]
        );
      } else if (type === 'compania') {
        result = await notificationService.sendCompaniaNotification(
          selectedNotification,
          user.companiaId,
          [targetBomberoId]
        );
      }

      logger.info(`[NOTIFICATION_CONTROLLER] Notificación de demo ${type} enviada por ${user.id} a ${targetBomberoId}`);

      return handleSuccess(res, 200, `Notificación de ${type} enviada exitosamente`, {
        notification: {
          type: selectedNotification.type,
          title: selectedNotification.title,
          bomberoId: targetBomberoId,
          createdAt: result?.createdAt || new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error enviando notificación de demo:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Prueba el sistema de Pub/Sub de Redis
   * POST /api/notifications/test/pubsub
   */
  async testPubSub(req, res) {
    try {
      const user = req.bombero;
      const { channel = `notifications:test:${user.id}`, message = 'Mensaje de prueba' } = req.body;

      logger.info(`[NOTIFICATION_CONTROLLER] Probando Pub/Sub en canal: ${channel}`);

      // Publicar mensaje de prueba
      const testMessage = {
        type: 'TEST',
        timestamp: new Date().toISOString(),
        message: message,
        userId: user.id
      };

      await notificationService.publishToChannel(channel, testMessage);

      return handleSuccess(res, 200, 'Mensaje de prueba publicado exitosamente', {
        channel,
        message: testMessage,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error probando Pub/Sub:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Crea notificaciones de ejemplo para pruebas
   * POST /api/notifications/test/create-sample (solo desarrollo)
   */
  async createSampleNotifications(req, res) {
    if (process.env.NODE_ENV !== 'development') {
      return handleErrorClient(res, 404, 'Endpoint no disponible');
    }

    try {
      const user = req.bombero;
      const { count = 5 } = req.body;

      const sampleNotifications = [
        {
          type: 'RECORDATORIO',
          title: 'Revisión de Equipo Programada',
          message: 'Recuerda revisar el equipo de respiración antes del próximo turno.',
          data: { priority: 'medium', equipment: 'respiratory' }
        },
        {
          type: 'PERSONAL',
          title: 'Nueva Tarea Asignada',
          message: 'Se te ha asignado una nueva tarea de mantenimiento en el vehículo #3.',
          data: { taskId: 'TASK-001', vehicle: 'V3', priority: 'high' }
        },
        {
          type: 'SYSTEM',
          title: 'Actualización del Sistema',
          message: 'El sistema ha sido actualizado con nuevas funcionalidades. Revisa la documentación.',
          data: { version: '2.1.0', features: ['notifications', 'reports'] }
        },
        {
          type: 'EMERGENCY',
          title: 'Alerta de Emergencia',
          message: 'Se ha activado el protocolo de emergencia. Todos los bomberos reportarse inmediatamente.',
          data: { alertLevel: 'critical', protocol: 'emergency' }
        },
        {
          type: 'DIRECT_MESSAGE',
          title: 'Mensaje del Supervisor',
          message: 'Buen trabajo en el último incidente. Mantén ese nivel de profesionalismo.',
          data: { sender: 'supervisor', type: 'praise' }
        }
      ];

      const createdNotifications = [];
      
      for (let i = 0; i < Math.min(count, sampleNotifications.length); i++) {
        const notification = sampleNotifications[i];
        try {
          const result = await notificationService.sendIndividualNotification(
            notification,
            user.id
          );
          createdNotifications.push(result);
          
          // Pequeña pausa entre notificaciones para evitar sobrecarga
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          logger.error(`[NOTIFICATION_CONTROLLER] Error creando notificación de ejemplo ${i}:`, error);
        }
      }

      logger.info(`[NOTIFICATION_CONTROLLER] ${createdNotifications.length} notificaciones de ejemplo creadas por ${user.id}`);

      return handleSuccess(res, 200, `${createdNotifications.length} notificaciones de ejemplo creadas`, {
        count: createdNotifications.length,
        notifications: createdNotifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          createdAt: n.createdAt
        }))
      });

    } catch (error) {
      logger.error('[NOTIFICATION_CONTROLLER] Error creando notificaciones de ejemplo:', error);
      return handleErrorServer(res, 500, 'Error interno del servidor');
    }
  }
}

export default new NotificationController();
