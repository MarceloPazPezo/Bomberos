"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../middlewares/authorization.middleware.js";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../controllers/profile.controller.js";

const router = Router();

router.use(authenticateJwt);

// GET /api/profile/detail/ -> Obtener el perfil del usuario autenticado
router.get(
  "/",
  authorizePermissions(["user:read_profile"]), // Permiso para leer el propio perfil
  getMyProfile
);

// PATCH /api/profile/ -> Actualizar el perfil del usuario autenticado
router.patch(
  "/",
  authorizePermissions(["user:update_profile"]), // Permiso para actualizar el propio perfil
  updateMyProfile
);

// PATCH /api/profile/change-password -> Cambiar contraseña del usuario autenticado
router.patch(
  "/change-password",
  authorizePermissions(["user:update_profile"]), // Permiso para actualizar el propio perfil
  changeMyPassword
);

export default router;