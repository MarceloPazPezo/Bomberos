"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import {
  getRegiones,
  getRegion,
  createRegion,
  updateRegion,
  deleteRegion,
} from "../controllers/region.controller.js";

const router = Router();

router.use(authenticateJwt);

// Obtener todas las regiones
router.get("/", authorizePermisos(["region:obtener"]), getRegiones);

// Obtener región específica
router.get(
  "/detalle/:id",
  authorizePermisos(["region:admin"]),
  getRegion
);

// Crear nueva región
router.post(
  "/",
  cleanEmptyStrings,
  authorizePermisos(["region:admin"]),
  createRegion
);

// Actualizar región
router.patch(
  "/detalle/:id",
  cleanEmptyStrings,
  authorizePermisos(["region:admin"]),
  updateRegion
);

// Eliminar región
router.delete(
  "/detalle/:id",
  authorizePermisos(["region:admin"]),
  deleteRegion
);

export default router;