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
import { authorizeRoles } from '../middlewares/authorization.middleware.js';

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

router.post('/send-system', authorizeRoles(['Administrador', 'Supervisor']), sendSystemNotification);

router.post('/send-compania', sendCompaniaNotification);

router.post('/send-rol', authorizeRoles(['Administrador', 'Supervisor']), sendRolNotification);

router.get('/stats', authorizeRoles(['Administrador']), getNotificationStats);

// Rutas de prueba (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  router.post('/test/send-demo', sendDemoNotification);
  router.post('/test/create-sample', createSampleNotifications);
  router.post('/test/pubsub', testPubSub);
}

export default router;
