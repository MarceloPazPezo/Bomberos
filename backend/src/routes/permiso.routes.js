"use strict";
import { Router } from "express";
import {
  getPermisos,
  getPermiso,
  updatePermiso,
} from "../controllers/permiso.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";

const router = Router();

router.use(authenticateJwt);

// GET /api/permiso - Obtener todos los permisos con filtros
router.get(
  "/",
  authorizePermisos(["permiso:leer"]),
  getPermisos,
);

// GET /api/permiso/:id -> Obtener un permiso específico por su ID
router.get(
  "/:id",
  authorizePermisos(["permiso:leer"]),
  getPermiso,
);

// PUT /api/permiso/:id -> Actualizar un permiso específico por su ID
router.put(
  "/:id",
  authorizePermisos(["permiso:actualizar"]),
  updatePermiso,
);

export default router;
