"use strict";
import { Router } from "express";
import {
  getAllPermissions,
  getPermissionCategories,
  getPermission,
  updateExistingPermission,
  getStats,
} from "../controllers/permission.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../middlewares/authorization.middleware.js";
import {
  updatePermissionSchema,
  permissionIdSchema,
  queryPermissionSchema,
} from "../validations/permission.validation.js";

const router = Router();

/**
 * Middleware de validación
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Error de validación",
        details: error.details.map((detail) => detail.message),
      });
    }
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        message: "Error de validación en parámetros",
        details: error.details.map((detail) => detail.message),
      });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        message: "Error de validación en consulta",
        details: error.details.map((detail) => detail.message),
      });
    }
    next();
  };
};

/**
 * Rutas públicas (solo lectura para usuarios autenticados)
 */

// GET /api/permissions - Obtener todos los permisos con filtros
router.get(
  "/",
  authenticateJwt,
  authorizePermissions(["permission:read"]),
  validateQuery(queryPermissionSchema),
  getAllPermissions,
);

// GET /api/permissions/categories - Obtener permisos agrupados por categoría
router.get(
  "/categories",
  authenticateJwt,
  authorizePermissions(["permission:read_categories"]),
  getPermissionCategories,
);

// GET /api/permissions/stats - Obtener estadísticas de permisos
router.get(
  "/stats",
  authenticateJwt,
  authorizePermissions(["permission:read_stats"]),
  getStats,
);

// GET /api/permissions/:id - Obtener un permiso específico
router.get(
  "/:id",
  authenticateJwt,
  authorizePermissions(["permission:read"]),
  validateParams(permissionIdSchema),
  getPermission,
);

/**
 * Rutas de actualización (solo para modificar descripciones)
 */

// PUT /api/permissions/:id - Actualizar permiso (solo descripción)
router.put(
  "/:id",
  authenticateJwt,
  authorizePermissions(["permission:update"]),
  validateParams(permissionIdSchema),
  validateBody(updatePermissionSchema),
  updateExistingPermission,
);

export default router;
