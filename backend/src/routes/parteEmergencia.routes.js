"use strict";
import { Router } from "express";

import { actualizarParteEmergencia, borrarParteEmergencia, 
    crearParteEmergencia, obtenerParteEmergenciaDetallado, 
    obtenerParteEmergenciaPorId, obtenerUltimoEstadoIncidente } from "../controllers/parteEmergencia.controller.js";

const router = Router();
router.post("/", crearParteEmergencia);
router.get("/:id", obtenerParteEmergenciaPorId);
router.get("/:id/detallado", obtenerParteEmergenciaDetallado);
router.get("/:id/estado", obtenerUltimoEstadoIncidente);
router.put("/:id", actualizarParteEmergencia);
router.delete("/incidente/:id", borrarParteEmergencia);

export default router;