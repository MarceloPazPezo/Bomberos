"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { geocode, geocodeComunaEndpoint } from "../controllers/geocoding.controller.js";

const router = Router();

// Las rutas de geocodificación son públicas (no requieren autenticación)
// porque solo obtienen coordenadas de ubicaciones públicas

router.get("/", geocode);
router.get("/comuna", geocodeComunaEndpoint);

export default router;




