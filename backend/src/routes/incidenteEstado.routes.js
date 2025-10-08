"use strict";
import { Router } from "express";
import { cambiarEstadoIncidente } from "../controllers/incidenteEstado.controller.js";

const router = Router();

// POST /incidentes/:id/cambiar-estado  body: { estado: 'APROBADO'|'CORREGIR', idBombero }
router.post("/:id/cambiar-estado", cambiarEstadoIncidente);

export default router;
