"use strict";
import { Router } from "express";
import {
  getAllPermissions,
  getPermissionCategories,
  getPermission,
  updateExistingPermission,
  getStats,
} from "../controllers/permiso.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../middlewares/authorization.middleware.js";

const router = Router();

router.use(authenticateJwt);

// GET /api/permissions - Obtener todos los permisos con filtros
router.get(
  "/",
  authorizePermissions(["permiso:leer"]),
  getAllPermissions,
);

// GET /api/permission/categories -> Obtener permisos agrupados por categorías
router.get(
  "/categories",
  authorizePermissions(["permiso:leer_categorias"]),
  getPermissionCategories,
);

// GET /api/permission/stats -> Obtener estadísticas de permisos
router.get(
  "/stats",
  authorizePermissions(["permiso:leer_estadisticas"]),
  getStats,
);

// GET /api/permission/:id -> Obtener un permiso específico por su ID
router.get(
  "/:id",
  authorizePermissions(["permiso:leer"]),
  getPermission,
);

// PUT /api/permission/:id -> Actualizar un permiso específico por su ID
router.put(
  "/:id",
  authorizePermissions(["permiso:actualizar"]),
  updateExistingPermission,
);

export default router;
