"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
    actualizarParteEmergencia, borrarParteEmergencia,
    crearParteEmergencia, generarReporteParteEmergenciaPdf, obtenerParteEmergenciaDetallado,
    obtenerParteEmergenciaPorId, obtenerUltimoEstadoIncidente
} from "../controllers/parteEmergencia.controller.js";

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

// POST /api/parteEmergencia - Crear parte de emergencia
router.post("/", authorizePermisos(["parte_emergencia:crear", "parte_emergencia:admin"]), crearParteEmergencia);

// GET /api/parteEmergencia/:id - Obtener parte por ID
router.get("/:id", authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), obtenerParteEmergenciaPorId);

// GET /api/parteEmergencia/:id/detallado - Obtener parte detallado
router.get("/:id/detallado", authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), obtenerParteEmergenciaDetallado);

// GET /api/parteEmergencia/:id/estado - Obtener último estado del incidente
router.get("/:id/estado", authorizePermisos(["parte_emergencia:obtener", "parte_emergencia:admin"]), obtenerUltimoEstadoIncidente);

// POST /api/parteEmergencia/:id/reporte/pdf - Generar PDF
router.post("/:id/reporte/pdf", authorizePermisos(["parte_emergencia:generar_pdf", "parte_emergencia:admin"]), generarReporteParteEmergenciaPdf);

// PUT /api/parteEmergencia/:id - Actualizar parte
router.put("/:id", authorizePermisos(["parte_emergencia:actualizar", "parte_emergencia:admin"]), actualizarParteEmergencia);

// DELETE /api/parteEmergencia/incidente/:id - Eliminar parte
router.delete("/incidente/:id", authorizePermisos(["parte_emergencia:eliminar", "parte_emergencia:admin"]), borrarParteEmergencia);

export default router;