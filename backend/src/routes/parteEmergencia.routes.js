"use strict";
import { Router } from "express";

import { crearParteEmergencia, obtenerParteEmergenciaPorId, actualizarParteEmergencia } from "../controllers/parteEmergencia.controller.js";

const router = Router();
router.post("/", crearParteEmergencia);
router.get("/:id", obtenerParteEmergenciaPorId);
router.put("/:id", actualizarParteEmergencia);
export default router;