"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { actualizarEvento, crearEvento, eliminarEvento, obtenerAsistenciaEvento, 
    obtenerEventos,obtenerEventosRecurrentes,obtenerTiposEvento, registrarAsistenciaEvento } from "../controllers/caledarioOperativo.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/eventos", authorizePermisos(["evento:obtener", "evento:admin"]), obtenerEventos);
router.post("/eventos", authorizePermisos(["evento:crear", "evento:admin"]), crearEvento);
router.put("/eventos/:id", authorizePermisos(["evento:actualizar", "evento:admin"]), actualizarEvento);
router.delete("/eventos/:id", authorizePermisos(["evento:eliminar", "evento:admin"]), eliminarEvento);
router.get("/eventos-recurrentes", authorizePermisos(["evento:obtener", "evento:admin"]), obtenerEventosRecurrentes);
router.get("/tipos-evento", obtenerTiposEvento);
router.post("/eventos/registrar-asistencia/:idEvento", authorizePermisos(["evento:obtener", "evento:admin"]), registrarAsistenciaEvento);
router.get("/eventos/asistencia/:idEvento", authorizePermisos(["evento:obtener", "evento:admin"]), obtenerAsistenciaEvento);

export default router;

