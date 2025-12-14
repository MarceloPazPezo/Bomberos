"use strict";

import { runScheduledNotifications } from '../services/notificationTasks.service.js';
import logger from './configLogger.js';

let notificationInterval = null;

/**
 * Inicia el scheduler de notificaciones automáticas
 * Se ejecuta cada 10 minutos
 */
export function startNotificationScheduler() {
    if (notificationInterval) {
        logger.warn('[SCHEDULER] El scheduler ya está en ejecución');
        return;
    }

    // Ejecutar inmediatamente al iniciar
    logger.info('[SCHEDULER] Ejecutando primera verificación de notificaciones...');
    runScheduledNotifications().catch(error => {
        logger.error('[SCHEDULER] Error en primera ejecución:', error);
    });

    // Ejecutar cada 10 minutos (600,000 ms)
    notificationInterval = setInterval(async () => {
        try {
            logger.info('[SCHEDULER] Ejecutando verificación programada de notificaciones...');
            await runScheduledNotifications();
        } catch (error) {
            logger.error('[SCHEDULER] Error en ejecución programada:', error);
        }
    }, 10 * 60 * 1000); // 10 minutos

    logger.info('[SCHEDULER] Scheduler de notificaciones iniciado (cada 10 minutos)');
}

/**
 * Detiene el scheduler de notificaciones
 */
export function stopNotificationScheduler() {
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
        logger.info('[SCHEDULER] Scheduler de notificaciones detenido');
    }
}

/**
 * Verifica si el scheduler está activo
 */
export function isSchedulerActive() {
    return notificationInterval !== null;
}
