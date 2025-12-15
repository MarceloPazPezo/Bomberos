"use strict";

import { Router } from 'express';
import {
  createSampleNotifications,
  deleteNotification,
  getNotificationStats,
  getNotificationTypes,
  getUnreadCount,
  getUserNotifications,
  markAllAsRead,
  markAsRead,
  sendCompaniaNotification,
  sendDemoNotification,
  sendIndividualNotification,
  sendRolNotification,
  sendSystemNotification,
  testPubSub,
} from '../controllers/notification.controller.js';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizePermisos } from '../middlewares/authorization.middleware.js';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

router.get('/types', getNotificationTypes);

router.get('/unread-count', getUnreadCount);

router.get('/', getUserNotifications);

router.put('/mark-all-read', markAllAsRead);

router.put('/:id/mark-read', markAsRead);

router.delete('/:id', deleteNotification);

// Rutas de envío de notificaciones
router.post('/send', sendIndividualNotification);

router.post('/send-system', authorizePermisos(["notification:enviar_sistema", "notification:admin"]), sendSystemNotification);

router.post('/send-compania', sendCompaniaNotification);

router.post('/send-rol', authorizePermisos(["notification:enviar_rol", "notification:admin"]), sendRolNotification);

router.get('/stats', authorizePermisos(["notification:estadisticas", "notification:admin"]), getNotificationStats);

// Rutas de tareas programadas
router.post('/tasks/run-scheduled', authorizePermisos(["notification:admin"]), async (req, res) => {
  try {
    const { runScheduledNotifications } = await import('../services/notificationTasks.service.js');
    const results = await runScheduledNotifications();
    res.status(200).json({
      state: "Success",
      message: "Tareas de notificaciones ejecutadas",
      data: results
    });
  } catch (error) {
    res.status(500).json({
      state: "Error",
      message: error.message || "Error ejecutando tareas"
    });
  }
});

// Rutas de prueba (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  router.post('/test/send-demo', sendDemoNotification);
  router.post('/test/create-sample', createSampleNotifications);
  router.post('/test/pubsub', testPubSub);
}

export default router;
