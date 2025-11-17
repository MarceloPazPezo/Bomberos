"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { listarEstadosReporte } from "../controllers/EstadosParteEmergencia..controller.js";

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

// GET /api/estadosParte - Listar estados de parte
// Cualquier usuario con permiso de obtener partes puede ver los estados
router.get("/", authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), listarEstadosReporte);

export default router;