"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  getComuna,
  getComunas,
  getComunasByRegion,
  getRegion,
  getRegiones,
  createRegion,
  updateRegion,
  deleteRegion,
} from "../controllers/region.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/regiones",
  authorizePermisos(["region:obtener"]),
  getRegiones
);

router.get("/regiones/:id",
  authorizePermisos(["region:obtener"]),
  getRegion
);

router.post("/regiones",
  authorizePermisos(["region:admin"]),
  createRegion
);

router.put("/regiones/:id",
  authorizePermisos(["region:admin"]),
  updateRegion
);

router.delete("/regiones/:id",
  authorizePermisos(["region:admin"]),
  deleteRegion
);

router.get("/comunas",
  authorizePermisos(["region:obtener"]),
  getComunas
);

router.get("/comunas/region/:idRegion",
  authorizePermisos(["region:obtener"]),
  getComunasByRegion
);

router.get("/comunas/:id",
  authorizePermisos(["region:obtener"]),
  getComuna
);

export default router;