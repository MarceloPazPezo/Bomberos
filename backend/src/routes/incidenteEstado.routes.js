"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cambiarEstadoIncidente } from "../controllers/incidenteEstado.controller.js";

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

// POST /incidentes/:id/cambiar-estado  body: { estado: 'APROBADO'|'CORREGIR', idBombero }
// Permite aprobar y rechazar partes (incluido en parte_emergencia:revisar)
router.post("/:id/cambiar-estado", authorizePermisos(["parte_emergencia:revisar", "parte_emergencia:admin"]), cambiarEstadoIncidente);

export default router;
