"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { listarParaRevision } from "../controllers/revisionPartes.controller.js";

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

// GET /incidentes/revision?estados=ENVIADO,APROBADO,RECHAZADO
// Permite ver partes: ENVIADO/APROBADO/CORREGIR para todos, BORRADOR solo para redactor
router.get("/revision", authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:revisar", "parte_emergencia:admin"]), listarParaRevision);

export default router;
