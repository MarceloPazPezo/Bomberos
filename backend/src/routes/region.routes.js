"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  getAllRegiones,
  getRegionById,
  getAllComunas,
  getComunasByRegion,
  getComunaById,
} from "../controllers/region.controller.js";

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateJwt);

// Rutas de regiones
router.get("/regiones", 
  authorizePermisos(["region:obtener"]),
  getAllRegiones
);

router.get("/regiones/:id", 
  authorizePermisos(["region:obtener"]),
  getRegionById
);

// Rutas de comunas
router.get("/comunas", 
  authorizePermisos(["region:obtener"]),
  getAllComunas
);

router.get("/comunas/region/:idRegion", 
  authorizePermisos(["region:obtener"]),
  getComunasByRegion
);

router.get("/comunas/:id", 
  authorizePermisos(["region:obtener"]),
  getComunaById
);

export default router;