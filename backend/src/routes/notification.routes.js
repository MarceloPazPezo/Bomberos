"use strict";

import { Router } from 'express';
import notificationController from '../controllers/notification.controller.js';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizeRoles } from '../middlewares/authorization.middleware.js';

const router = Router();

/**
 * Rutas de notificaciones
 * Todas las rutas requieren autenticación
 */

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

/**
 * @route   GET /api/notifications/types
 * @desc    Obtiene los tipos de notificaciones disponibles
 * @access  Private
 */
router.get('/types', notificationController.getNotificationTypes);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Obtiene el contador de notificaciones no leídas del usuario
 * @access  Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route   GET /api/notifications
 * @desc    Obtiene las notificaciones del usuario autenticado
 * @access  Private
 * @query   limit - Límite de notificaciones (default: 50)
 * @query   offset - Offset para paginación (default: 0)
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Marca todas las notificaciones del usuario como leídas
 * @access  Private
 */
router.put('/mark-all-read', notificationController.markAllAsRead);

/**
 * @route   PUT /api/notifications/:id/mark-read
 * @desc    Marca una notificación específica como leída
 * @access  Private
 * @param   id - ID de la notificación
 */
router.put('/:id/mark-read', notificationController.markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Elimina una notificación específica
 * @access  Private
 * @param   id - ID de la notificación
 */
router.delete('/:id', notificationController.deleteNotification);

/**
 * ===========================================
 * RUTAS DE ENVÍO DE NOTIFICACIONES
 * ===========================================
 * - Individual y compañía: Cualquier bombero autenticado
 * - Sistema y rol: Solo administradores/supervisores
 */

/**
 * @route   POST /api/notifications/send
 * @desc    Envía una notificación individual a un usuario específico
 * @access  Private (Cualquier bombero autenticado)
 * @body    { bomberoId, type, title, message, data?, ttl? }
 */
router.post('/send', notificationController.sendIndividualNotification);

/**
 * @route   POST /api/notifications/send-system
 * @desc    Envía una notificación del sistema a múltiples usuarios
 * @access  Private (Solo para notificaciones masivas importantes)
 * @body    { bomberoIds[], type, title, message, data?, ttl? }
 */
router.post('/send-system', 
  authorizeRoles(['Administrador', 'Supervisor']),
  notificationController.sendSystemNotification
);

/**
 * @route   POST /api/notifications/send-compania
 * @desc    Envía una notificación a todos los usuarios de una compañía
 * @access  Private (Cualquier bombero puede notificar a su compañía)
 * @body    { companiaId, bomberoIds[], type, title, message, data?, ttl? }
 */
router.post('/send-compania', notificationController.sendCompaniaNotification);

/**
 * @route   POST /api/notifications/send-rol
 * @desc    Envía una notificación a todos los usuarios con un rol específico
 * @access  Private (Solo para comunicación específica por roles)
 * @body    { rolId, bomberoIds[], type, title, message, data?, ttl? }
 */
router.post('/send-rol', 
  authorizeRoles(['Administrador', 'Supervisor']),
  notificationController.sendRolNotification
);

/**
 * @route   GET /api/notifications/stats
 * @desc    Obtiene estadísticas de notificaciones
 * @access  Private (Requiere permisos de administrador)
 */
router.get('/stats',
  authorizeRoles(['Administrador']),
  notificationController.getNotificationStats
);

/**
 * ===========================================
 * RUTAS DE PRUEBA (SOLO DESARROLLO)
 * ===========================================
 */

/**
 * @route   POST /api/notifications/test/send-demo
 * @desc    Envía notificaciones de prueba para demostración
 * @access  Private (Solo para desarrollo)
 * @body    { type: 'individual' | 'system' | 'compania', bomberoId?, title?, message? }
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test/send-demo', notificationController.sendDemoNotification);
  
  /**
   * @route   POST /api/notifications/test/create-sample
   * @desc    Crea notificaciones de ejemplo para pruebas
   * @access  Private (Solo para desarrollo)
   */
  router.post('/test/create-sample', notificationController.createSampleNotifications);
  
  /**
   * @route   POST /api/notifications/test/pubsub
   * @desc    Prueba el sistema de Pub/Sub de Redis
   * @access  Private (Solo para desarrollo)
   * @body    { channel?, message? }
   */
  router.post('/test/pubsub', notificationController.testPubSub);
}

export default router;
