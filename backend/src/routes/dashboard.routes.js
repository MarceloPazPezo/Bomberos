"use strict";
import { Router } from 'express';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizePermisos } from "../middlewares/authorization.middleware.js";

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
router.post('/compania/incidente/diasdelaSemana', authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), cantidadDeIncidentesDiasdelaSemana);

router.post('/compania/incidente/meses', authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), cantidadDeIncidentesMeses);

router.post('/compania/incidente/clavesRadiales', authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), clavesRadialesMasRepetidas);

router.post('/compania/incidente/franjaHoraria', authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), incidentesPorFranjaHoraria);

router.post('/compania/incidente/heatmapDiaHora', authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), heatmapDiaHora);

router.post('/compania/incidente/heatmapDisponibilidad', authorizePermisos(["disponibilidad:obtener", "disponibilidad:admin"]), heatmapDisponibilidad);

router.post('/compania/kpi/asistenciaPromedio', authorizePermisos(["parte_emergencia:obtener", "evento:obtener"]), asistenciaPromedio);

router.post('/compania/kpi/participacionIncidentes', authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), porcentajeParticipacionIncidentes);

// Nuevo: ranking de clasificaciones de emergencia (Bump Chart)
router.post('/compania/incidente/rankingClasificaciones', authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), rankingClasificaciones);

// Nuevo: incidentes agrupados por periodo (días, meses, años)
router.post('/compania/incidente/periodo', authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), incidentesPorPeriodo);

// ============================================
// Rutas para Dashboard de Eventos
// ============================================
router.post('/compania/evento/diasdelaSemana', authorizePermisos(["evento:obtener", "evento:admin"]), cantidadDeEventosDiasdelaSemana);

router.post('/compania/evento/meses', authorizePermisos(["evento:obtener", "evento:admin"]), cantidadDeEventosMeses);

router.post('/compania/evento/granularidad', authorizePermisos(["evento:obtener", "evento:admin"]), cantidadDeEventosPorGranularidad);

// Nuevo: eventos por tipo (comparte filtro de fechas)
router.post('/compania/evento/tipo', authorizePermisos(["evento:obtener", "evento:admin"]), cantidadDeEventosPorTipo);

// Nuevo: promedio de asistencia por tipo de evento
router.post('/compania/evento/asistencia/promedio', authorizePermisos(["evento:obtener", "evento:admin"]), promedioAsistenciaPorTipoEvento);

// Nuevo: tendencia mensual de asistencia a eventos
router.post('/compania/evento/asistencia/tendencia', authorizePermisos(["evento:obtener", "evento:admin"]), tendenciaMensualAsistencia);

// Nuevo: evolución diaria de eventos y asistentes (con filtro opcional por tipo)
router.post('/compania/evento/evolucion', authorizePermisos(["evento:obtener", "evento:admin"]), evolucionEventosYAsistentes);

// Nuevo: porcentaje de participación de voluntarios en eventos
router.post('/compania/evento/participacion', authorizePermisos(["evento:obtener", "evento:admin"]), porcentajeParticipacion);

// Obtener lista de tipos de evento para los filtros del dashboard
router.get('/tipos-evento', authorizePermisos(["tipoEvento:obtener", "evento:obtener"]), getTiposEvento);

// Nuevo: ranking de asistencia de voluntarios (incidentes + eventos)
router.post('/compania/asistencia/ranking', authorizePermisos(["bombero:obtener", "bombero:admin"]), rankingAsistencia);


export default router;