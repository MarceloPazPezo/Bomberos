"use strict";
import { Router } from 'express';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { obtenerHistorialCompania, obtenerHistorialVoluntario, obtenerKpiAsistenciaVoluntario, obtenerKpiResponsabilidadesVoluntario, obtenerResumenActividadVoluntario, obtenerHeatmapDisponibilidadVoluntario } from '../controllers/historial.controller.js';

const router = Router();

/**
 * Rutas para gestión de historial de compañías
 * Todas las rutas requieren autenticación
 */
// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

// Rutas específicas
router.get('/compania/:idCompania', authorizePermisos(["historial:obtener", "historial:admin"]), obtenerHistorialCompania);

router.get('/voluntario/:idBombero', authorizePermisos(["historial:obtener", "historial:admin"]), obtenerHistorialVoluntario);

router.get('/voluntario/:idBombero/kpi-asistencia', authorizePermisos(["historial:obtener", "historial:admin"]), obtenerKpiAsistenciaVoluntario);

router.get('/voluntario/:idBombero/kpi-responsabilidades', authorizePermisos(["historial:obtener", "historial:admin"]), obtenerKpiResponsabilidadesVoluntario);

router.get('/voluntario/:idBombero/resumen-actividad', authorizePermisos(["historial:obtener", "historial:admin"]), obtenerResumenActividadVoluntario);

router.get('/voluntario/:idBombero/heatmap-disponibilidad', authorizePermisos(["historial:obtener", "historial:admin"]), obtenerHeatmapDisponibilidadVoluntario);

export default router;