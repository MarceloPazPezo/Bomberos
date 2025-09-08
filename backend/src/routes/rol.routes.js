"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  deleteRol,
  getRol,
  getRoles,
  updateRol,
  createRol,
} from "../controllers/rol.controller.js";


const router = Router();

router.use(authenticateJwt);

// GET /api/rol/ -> Obtener todos los roles
router.get(
  "/",
  authorizePermisos(["rol:leer"]), // Permiso para leer roles
  getRoles,
);

// GET /api/rol/detail/:id -> Obtener un rol específico por su ID
router.get(
  "/detail/:id",
  authorizePermisos(["rol:leer_especifico"]), // Permiso para leer un rol específico
  getRol,
);

// PATCH /api/rol/:id -> Actualizar un rol específico por su ID
router.patch(
  "/detail/:id",
  authorizePermisos(["rol:actualizar"]), // Permiso para actualizar un rol específico
  updateRol,
);

// DELETE /api/rol/:id -> Eliminar un rol específico por su ID
router.delete(
  "/detail/:id",
  authorizePermisos(["rol:eliminar"]), // Permiso para eliminar un rol
  deleteRol,
);

// POST /api/rol/ -> Crear un nuevo rol
router.post(
  "/",
  authorizePermisos(["rol:crear"]), // Permiso para crear un rol
  createRol,
);


export default router;