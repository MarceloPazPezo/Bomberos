"use strict";
import { Router } from "express";
import { actualizarEvento, crearEvento, eliminarEvento, obtenerAsistenciaEvento, 
    obtenerEventos,obtenerEventosRecurrentes,obtenerTiposEvento, registrarAsistenciaEvento } from "../controllers/caledarioOperativo.controller.js";

const router = Router();
router.get("/eventos", obtenerEventos);
router.post("/eventos", crearEvento);
router.put("/eventos/:id", actualizarEvento);
router.delete("/eventos/:id", eliminarEvento);
router.get("/eventos-recurrentes", obtenerEventosRecurrentes);
router.get("/tipos-evento", obtenerTiposEvento);
router.post("/eventos/registrar-asistencia/:idEvento", registrarAsistenciaEvento);
router.get("/eventos/asistencia/:idEvento", obtenerAsistenciaEvento);

export default router;

