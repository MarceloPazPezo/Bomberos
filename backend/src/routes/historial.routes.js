"use strict";
import { Router } from 'express';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizePermisos, authorizeRoles } from "../middlewares/authorization.middleware.js";
import { obtenerHistorialCompania, obtenerHistorialVoluntario, obtenerKpiAsistenciaVoluntario, obtenerKpiResponsabilidadesVoluntario, obtenerResumenActividadVoluntario, obtenerHeatmapDisponibilidadVoluntario} from '../controllers/historial.controller.js';

const router = Router();

/**
 * Rutas para gestión de historial de compañías
 * Todas las rutas requieren autenticación
 */
// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

// Rutas específicas
router.get('/compania/:idCompania',authorizeRoles(['Administrador', 'Supervisor', 'Bombero']) ,obtenerHistorialCompania);

router.get('/voluntario/:idBombero',authorizeRoles(['Administrador', 'Supervisor', 'Bombero']) ,obtenerHistorialVoluntario);

router.get('/voluntario/:idBombero/kpi-asistencia',authorizeRoles(['Administrador', 'Supervisor', 'Bombero']) ,obtenerKpiAsistenciaVoluntario);

router.get('/voluntario/:idBombero/kpi-responsabilidades',authorizeRoles(['Administrador', 'Supervisor', 'Bombero']) ,obtenerKpiResponsabilidadesVoluntario);

router.get('/voluntario/:idBombero/resumen-actividad',authorizeRoles(['Administrador', 'Supervisor', 'Bombero']) ,obtenerResumenActividadVoluntario);

router.get('/voluntario/:idBombero/heatmap-disponibilidad',authorizeRoles(['Administrador', 'Supervisor', 'Bombero']) ,obtenerHeatmapDisponibilidadVoluntario);

export default router;