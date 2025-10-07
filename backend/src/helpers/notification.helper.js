"use strict";

import { v4 as uuidv4 } from 'uuid';
import logger from '../config/configLogger.js';

/**
 * Helper para manejo de notificaciones
 * Proporciona utilidades y configuración para el sistema de notificaciones
 */

/**
 * Tipos de notificaciones disponibles
 */
export const NOTIFICATION_TYPES = {
  SISTEMA: 'SISTEMA',           // Notificaciones del sistema
  EMERGENCIA: 'EMERGENCIA',     // Emergencias críticas
  PERSONAL: 'PERSONAL',         // Notificaciones personales
  RECORDATORIO: 'RECORDATORIO', // Recordatorios
  MENSAJE_DIRECTO: 'MENSAJE_DIRECTO', // Mensajes directos
  GRUPAL: 'GRUPAL',             // Notificaciones grupales
  INCIDENTE: 'INCIDENTE',       // Notificaciones de incidentes
  EVENTO: 'EVENTO'              // Notificaciones de eventos
};

/**
 * Configuración de TTL (Time To Live) para diferentes tipos de notificaciones
 * Valores en segundos
 */
export const NOTIFICATION_TTL_CONFIG = {
  [NOTIFICATION_TYPES.SISTEMA]: 3 * 24 * 60 * 60,      // 3 días
  [NOTIFICATION_TYPES.EMERGENCIA]: 7 * 24 * 60 * 60,    // 7 días
  [NOTIFICATION_TYPES.PERSONAL]: 30 * 24 * 60 * 60,    // 30 días
  [NOTIFICATION_TYPES.RECORDATORIO]: 7 * 24 * 60 * 60,     // 7 días
  [NOTIFICATION_TYPES.MENSAJE_DIRECTO]: 14 * 24 * 60 * 60, // 14 días
  [NOTIFICATION_TYPES.GRUPAL]: 7 * 24 * 60 * 60,        // 7 días
  [NOTIFICATION_TYPES.INCIDENTE]: 30 * 24 * 60 * 60,    // 30 días
  [NOTIFICATION_TYPES.EVENTO]: 14 * 24 * 60 * 60        // 14 días
};

/**
 * Configuración de canales de publicación
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

/**
 * Configuración de claves Redis
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
 * Crea una notificación base con estructura estándar
 * @param {Object} params - Parámetros de la notificación
 * @param {string} params.type - Tipo de notificación
 * @param {string} params.title - Título de la notificación
 * @param {string} params.message - Mensaje de la notificación
 * @param {Object} params.data - Datos adicionales
 * @param {string} params.bomberoId - ID del bombero destinatario
 * @param {string} params.companiaId - ID de la compañía
 * @param {string} params.rolId - ID del rol
 * @returns {Object} Notificación creada
 */
export function createNotification({
  type,
  title,
  message,
  data = {},
  bomberoId = null,
  companiaId = null,
  rolId = null
}) {
  const notification = {
    id: uuidv4(),
    type,
    title,
    message,
    data,
    bomberoId,
    companiaId,
    rolId,
    createdAt: new Date().toISOString(),
    readAt: null
  };

  logger.info(`[NOTIFICATION] Notificación creada: ${notification.id}`, {
    type: notification.type,
    bomberoId: notification.bomberoId
  });

  return notification;
}

/**
 * Obtiene el TTL para un tipo de notificación específico
 * @param {string} type - Tipo de notificación
 * @param {number} customTTL - TTL personalizado (opcional)
 * @returns {number} TTL en segundos
 */
export function getNotificationTTL(type, customTTL = null) {
  if (customTTL && customTTL > 0) {
    return customTTL;
  }
  
  return NOTIFICATION_TTL_CONFIG[type] || NOTIFICATION_TTL_CONFIG[NOTIFICATION_TYPES.SYSTEM];
}

/**
 * Genera la clave Redis para una notificación específica
 * @param {string} notificationId - ID de la notificación
 * @returns {string} Clave Redis
 */
export function getNotificationKey(notificationId) {
  return REDIS_KEYS.NOTIFICATION.replace('{id}', notificationId);
}

/**
 * Genera la clave Redis para las notificaciones de un usuario
 * @param {string} bomberoId - ID del bombero
 * @returns {string} Clave Redis
 */
export function getUserNotificationsKey(bomberoId) {
  return REDIS_KEYS.USER_NOTIFICATIONS.replace('{bomberoId}', bomberoId);
}

/**
 * Genera la clave Redis para el contador de no leídas de un usuario
 * @param {string} bomberoId - ID del bombero
 * @returns {string} Clave Redis
 */
export function getUserUnreadCountKey(bomberoId) {
  return REDIS_KEYS.USER_UNREAD_COUNT.replace('{bomberoId}', bomberoId);
}

/**
 * Genera el canal de publicación para un usuario específico
 * @param {string} type - Tipo de canal
 * @param {string} bomberoId - ID del bombero
 * @returns {string} Canal de publicación
 */
export function getUserChannel(type, bomberoId) {
  const channelMap = {
    [NOTIFICATION_TYPES.PERSONAL]: NOTIFICATION_CHANNELS.PERSONAL,
    [NOTIFICATION_TYPES.MENSAJE_DIRECTO]: NOTIFICATION_CHANNELS.MENSAJE_DIRECTO,
    [NOTIFICATION_TYPES.RECORDATORIO]: NOTIFICATION_CHANNELS.RECORDATORIO
  };

  const channelTemplate = channelMap[type] || NOTIFICATION_CHANNELS.PERSONAL;
  return channelTemplate.replace('{bomberoId}', bomberoId);
}

/**
 * Genera el canal de publicación para una compañía
 * @param {string} companiaId - ID de la compañía
 * @returns {string} Canal de publicación
 */
export function getCompaniaChannel(companiaId) {
  return NOTIFICATION_CHANNELS.COMPANIA.replace('{companiaId}', companiaId);
}

/**
 * Genera el canal de publicación para un rol
 * @param {string} rolId - ID del rol
 * @returns {string} Canal de publicación
 */
export function getRolChannel(rolId) {
  return NOTIFICATION_CHANNELS.ROL.replace('{rolId}', rolId);
}

/**
 * Valida si un tipo de notificación es válido
 * @param {string} type - Tipo de notificación
 * @returns {boolean} True si es válido
 */
export function isValidNotificationType(type) {
  return Object.values(NOTIFICATION_TYPES).includes(type);
}

/**
 * Formatea una notificación para envío por WebSocket
 * @param {Object} notification - Notificación a formatear
 * @returns {Object} Notificación formateada
 */
export function formatNotificationForSocket(notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    createdAt: notification.createdAt,
    readAt: notification.readAt
  };
}

/**
 * Crea múltiples notificaciones para una lista de usuarios
 * @param {Object} baseNotification - Notificación base
 * @param {Array} bomberoIds - Lista de IDs de bomberos
 * @returns {Array} Lista de notificaciones creadas
 */
export function createNotificationsForUsers(baseNotification, bomberoIds) {
  return bomberoIds.map(bomberoId => ({
    ...baseNotification,
    id: uuidv4(), // Cada notificación tiene su propio ID
    bomberoId,
    createdAt: new Date().toISOString()
  }));
}

/**
 * Configuración de límites del sistema
 */
export const NOTIFICATION_LIMITS = {
  MAX_NOTIFICATIONS_PER_USER: 1000,    // Máximo de notificaciones por usuario
  MAX_MESSAGE_LENGTH: 500,             // Máximo de caracteres en mensaje
  MAX_TITLE_LENGTH: 100,               // Máximo de caracteres en título
  BATCH_SIZE: 100                      // Tamaño de lote para operaciones masivas
};

/**
 * Valida los parámetros de una notificación
 * @param {Object} notification - Notificación a validar
 * @returns {Object} Resultado de la validación
 */
export function validateNotification(notification) {
  const errors = [];

  if (!notification.title || notification.title.length > NOTIFICATION_LIMITS.MAX_TITLE_LENGTH) {
    errors.push('Título inválido o muy largo');
  }

  if (!notification.message || notification.message.length > NOTIFICATION_LIMITS.MAX_MESSAGE_LENGTH) {
    errors.push('Mensaje inválido o muy largo');
  }

  if (!isValidNotificationType(notification.type)) {
    errors.push('Tipo de notificación inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  NOTIFICATION_TYPES,
  NOTIFICATION_TTL_CONFIG,
  NOTIFICATION_CHANNELS,
  REDIS_KEYS,
  createNotification,
  getNotificationTTL,
  getNotificationKey,
  getUserNotificationsKey,
  getUserUnreadCountKey,
  getUserChannel,
  getCompaniaChannel,
  getRolChannel,
  isValidNotificationType,
  formatNotificationForSocket,
  createNotificationsForUsers,
  NOTIFICATION_LIMITS,
  validateNotification
};
