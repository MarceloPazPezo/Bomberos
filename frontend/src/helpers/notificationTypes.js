/**
 * Tipos de notificaciones disponibles
 * Copia para el frontend - no incluye dependencias de Node.js
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