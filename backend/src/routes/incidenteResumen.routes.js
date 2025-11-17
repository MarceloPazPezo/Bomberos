"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { listarIncidentesResumen } from "../controllers/incidenteResumen.controller.js";

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

// GET /api/incidentes/resumen - Listar resumen de incidentes (partes)
// Permite ver partes de emergencia (generalmente de la compañía del usuario o solo los propios según permisos)
router.get("/resumen", authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), listarIncidentesResumen);

export default router;
