"use strict";
import { Router } from "express";

import { crearParteEmergencia, obtenerParteEmergenciaPorId, actualizarParteEmergencia, obtenerParteEmergenciaDetallado, obtenerUltimoEstadoIncidente } from "../controllers/parteEmergencia.controller.js";

const router = Router();
router.post("/", crearParteEmergencia);
router.get("/:id", obtenerParteEmergenciaPorId);
router.get("/:id/detallado", obtenerParteEmergenciaDetallado);
router.get("/:id/estado", obtenerUltimoEstadoIncidente);
router.put("/:id", actualizarParteEmergencia);
export default router;