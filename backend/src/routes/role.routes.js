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
} from "../controllers/role.controller.js";


const router = Router();

router.use(authenticateJwt);

// GET /api/role/ -> Obtener todos los roles
router.get(
  "/",
  authorizePermissions(["role:read"]), // Permiso para leer roles
  getRoles
);

// GET /api/role/detail/:id -> Obtener un rol específico por su ID
router.get(
  "/detail/", // :id es el ID del rol que se quiere obtener
  authorizePermissions(["role:read"]), // Permiso para leer un rol específico
  getRole
);

// PATCH /api/role/detail/:id -> Actualizar un rol específico por su ID
router.patch(
  "/detail/",
  authorizePermissions(["role:update"]), // Permiso para actualizar un rol específico
  updateRole
);

// DELETE /api/role/detail/:id -> Eliminar un rol específico por su ID
router.delete(
  "/detail/", // :id es el ID del rol que se quiere eliminar
  authorizePermissions(["role:delete"]), // Permiso para eliminar un rol
  deleteRole
);

// POST /api/role/ -> Crear un rol
router.post(
  "/", // Crear en la raíz de la colección de roles
  authorizePermissions(["role:create"]), // Permiso para crear un rol
  createRole
);


export default router;