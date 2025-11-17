"use strict";
import { Router } from 'express';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizePermisos, authorizeRoles } from "../middlewares/authorization.middleware.js";

import { 
  cantidadDeIncidentesDiasdelaSemana, 
  cantidadDeIncidentesMeses,
  clavesRadialesMasRepetidas,
  incidentesPorFranjaHoraria,
  heatmapDiaHora,
  asistenciaPromedio,
  porcentajeParticipacionIncidentes,
  heatmapDisponibilidad,
  cantidadDeEventosDiasdelaSemana,
  cantidadDeEventosMeses,
  cantidadDeEventosPorGranularidad,
  cantidadDeEventosPorTipo,
  promedioAsistenciaPorTipoEvento,
  tendenciaMensualAsistencia,
  evolucionEventosYAsistentes,
  porcentajeParticipacion,
  rankingClasificaciones,
  incidentesPorPeriodo,
  rankingAsistencia
} from '../controllers/dashboard.controller.js';

import { getTiposEvento } from '../controllers/tipoEvento.controller.js';

const router = Router();
/**
 * Rutas para el dashboard
 * Todas las rutas requieren autenticación
 */
// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);
// Rutas específicas
router.post('/compania/incidente/diasdelaSemana', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), cantidadDeIncidentesDiasdelaSemana);

router.post('/compania/incidente/meses', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), cantidadDeIncidentesMeses);

router.post('/compania/incidente/clavesRadiales', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), clavesRadialesMasRepetidas);

router.post('/compania/incidente/franjaHoraria', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), incidentesPorFranjaHoraria);

router.post('/compania/incidente/heatmapDiaHora', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), heatmapDiaHora);

router.post('/compania/incidente/heatmapDisponibilidad', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), heatmapDisponibilidad);

router.post('/compania/kpi/asistenciaPromedio', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), asistenciaPromedio);

router.post('/compania/kpi/participacionIncidentes', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), porcentajeParticipacionIncidentes);

// Nuevo: ranking de clasificaciones de emergencia (Bump Chart)
router.post('/compania/incidente/rankingClasificaciones', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), rankingClasificaciones);

// Nuevo: incidentes agrupados por periodo (días, meses, años)
router.post('/compania/incidente/periodo', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), incidentesPorPeriodo);

// ============================================
// Rutas para Dashboard de Eventos
// ============================================
router.post('/compania/evento/diasdelaSemana', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), cantidadDeEventosDiasdelaSemana);

router.post('/compania/evento/meses', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), cantidadDeEventosMeses);

router.post('/compania/evento/granularidad', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), cantidadDeEventosPorGranularidad);

// Nuevo: eventos por tipo (comparte filtro de fechas)
router.post('/compania/evento/tipo', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), cantidadDeEventosPorTipo);

// Nuevo: promedio de asistencia por tipo de evento
router.post('/compania/evento/asistencia/promedio', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), promedioAsistenciaPorTipoEvento);

// Nuevo: tendencia mensual de asistencia a eventos
router.post('/compania/evento/asistencia/tendencia', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), tendenciaMensualAsistencia);

// Nuevo: evolución diaria de eventos y asistentes (con filtro opcional por tipo)
router.post('/compania/evento/evolucion', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), evolucionEventosYAsistentes);

// Nuevo: porcentaje de participación de voluntarios en eventos
router.post('/compania/evento/participacion', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), porcentajeParticipacion);

// Obtener lista de tipos de evento para los filtros del dashboard
router.get('/tipos-evento', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), getTiposEvento);

// Nuevo: ranking de asistencia de voluntarios (incidentes + eventos)
router.post('/compania/asistencia/ranking', authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), rankingAsistencia);


export default router;