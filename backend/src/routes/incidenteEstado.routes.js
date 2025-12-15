"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cambiarEstadoIncidente } from "../controllers/incidenteEstado.controller.js";

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

// POST /incidentes/:id/cambiar-estado  body: { estado: 'APROBADO'|'CORREGIR'|'ENVIADO', idBombero }
// Permite enviar a revisión (ENVIADO) con actualizar, o aprobar/rechazar (APROBADO/CORREGIR) con revisar
router.post("/:id/cambiar-estado", authorizePermisos(["parte_emergencia:actualizar", "parte_emergencia:revisar", "parte_emergencia:admin"]), cambiarEstadoIncidente);

// GET /incidentes/:id/historial-estados
// Obtiene el historial completo de estados de un incidente
import { obtenerHistorialEstados } from "../controllers/incidenteEstado.controller.js";
router.get("/:id/historial-estados", obtenerHistorialEstados);

export default router;
