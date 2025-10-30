"use strict";
import { Router } from "express";
import { obtenerclasificacionesEmergencia, obtenerFaseIncidente, obtenerSubtipoIncidente, obtenerTipoDano } from "../controllers/subtipoIncidente.controller.js";

const router = Router();
router.get("/clasificaciones", obtenerclasificacionesEmergencia);
router.get("/subtipos/:id", obtenerSubtipoIncidente);
router.get("/tiposDano", obtenerTipoDano);
router.get("/fasesIncidente", obtenerFaseIncidente);

export default router;