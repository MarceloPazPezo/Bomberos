"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../middlewares/authorization.middleware.js";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  createUser,
  changeUserStatus,
} from "../controllers/usuario.controller.js";

const router = Router();

router.use(authenticateJwt);

// GET /api/user/ -> Obtener todos los usuarios
router.get("/", authorizePermissions(["usuario:leer_todos"]), getUsers);

// GET /api/user/detail/:id -> Obtener un usuario específico por su ID o RUT
router.get("/detail/", authorizePermissions(["usuario:leer_especifico"]), getUser);

// PATCH /api/user/detail/:id -> Actualizar un usuario específico por su ID o RUT
router.patch(
  "/detail/",
  authorizePermissions(["usuario:actualizar_especifico"]),
  updateUser,
);

// DELETE /api/user/detail/:id -> Eliminar un usuario específico por su ID o RUT
router.delete("/detail/", authorizePermissions(["usuario:eliminar"]), deleteUser);

// POST /api/user/-> Creamos un usuario
router.post("/", authorizePermissions(["usuario:crear"]), createUser);

// PATCH /api/user/status/:id -> Cambiar estado activo/inactivo de un usuario
router.patch("/status/:id", authorizePermissions(["usuario:cambiar_estado"]), changeUserStatus);

export default router;
