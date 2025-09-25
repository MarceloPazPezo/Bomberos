"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import {
  getComunas,
  getComuna,
  getComunasByRegion,
  createComuna,
  updateComuna,
  deleteComuna,
} from "../controllers/comuna.controller.js";

const router = Router();

router.use(authenticateJwt);

// Obtener todas las comunas
router.get("/", authorizePermisos(["comuna:obtener"]), getComunas);

// Obtener comunas por región
router.get(
  "/region/:idRegion",
  authorizePermisos(["comuna:obtener"]),
  getComunasByRegion
);

// Obtener comuna específica
router.get(
  "/detalle/:id",
  authorizePermisos(["comuna:admin"]),
  getComuna
);

// Crear nueva comuna
router.post(
  "/",
  cleanEmptyStrings,
  authorizePermisos(["comuna:admin"]),
  createComuna
);

// Actualizar comuna
router.patch(
  "/detalle/:id",
  cleanEmptyStrings,
  authorizePermisos(["comuna:admin"]),
  updateComuna
);

// Eliminar comuna
router.delete(
  "/detalle/:id",
  authorizePermisos(["comuna:admin"]),
  deleteComuna
);

export default router;