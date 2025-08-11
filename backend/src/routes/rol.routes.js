"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../middlewares/authorization.middleware.js";
import {
  deleteRole,
  getRole,
  getRoles,
  updateRole,
  createRole,
} from "../controllers/rol.controller.js";


const router = Router();

router.use(authenticateJwt);

// GET /api/role/ -> Obtener todos los roles
router.get(
  "/",
  authorizePermissions(["rol:leer"]), // Permiso para leer roles
  getRoles,
);

// GET /api/role/detail/:id -> Obtener un rol específico por su ID
router.get(
  "/detail/:id",
  authorizePermissions(["rol:leer"]), // Permiso para leer un rol específico
  getRole,
);

// PATCH /api/role/:id -> Actualizar un rol específico por su ID
router.patch(
  "/detail/:id",
  authorizePermissions(["rol:actualizar"]), // Permiso para actualizar un rol específico
  updateRole,
);

// DELETE /api/role/:id -> Eliminar un rol específico por su ID
router.delete(
  "/detail/:id",
  authorizePermissions(["rol:eliminar"]), // Permiso para eliminar un rol
  deleteRole,
);

// POST /api/role/ -> Crear un nuevo rol
router.post(
  "/",
  authorizePermissions(["rol:crear"]), // Permiso para crear un rol
  createRole,
);


export default router;