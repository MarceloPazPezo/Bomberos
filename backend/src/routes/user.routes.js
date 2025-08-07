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
} from "../controllers/user.controller.js";

const router = Router();

router.use(authenticateJwt);

// GET /api/user/ -> Obtener todos los usuarios
router.get("/", authorizePermissions(["user:read_all"]), getUsers);

// GET /api/user/detail/:id -> Obtener un usuario específico por su ID o RUT
router.get("/detail/", authorizePermissions(["user:read_specific"]), getUser);

// PATCH /api/user/detail/:id -> Actualizar un usuario específico por su ID o RUT
router.patch(
  "/detail/",
  authorizePermissions(["user:update_specific"]),
  updateUser,
);

// DELETE /api/user/detail/:id -> Eliminar un usuario específico por su ID o RUT
router.delete("/detail/", authorizePermissions(["user:delete"]), deleteUser);

// POST /api/user/-> Creamos un usuario
router.post("/", authorizePermissions(["user:create"]), createUser);

// PATCH /api/user/status/:id -> Cambiar estado activo/inactivo de un usuario
router.patch("/status/:id", authorizePermissions(["user:change_status"]), changeUserStatus);

export default router;
