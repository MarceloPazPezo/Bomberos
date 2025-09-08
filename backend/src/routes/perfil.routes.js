"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../controllers/perfil.controller.js";

const router = Router();

router.use(authenticateJwt);

// GET /api/perfil/detail/ -> Obtener el perfil del bombero autenticado
router.get(
  "/",
  authorizePermisos(["bombero:leer_perfil"]), // Permiso para leer el propio perfil
  getMyProfile
);

// PATCH /api/perfil/ -> Actualizar el perfil del bombero autenticado
router.patch(
  "/",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]), // Permiso para actualizar el propio perfil
  updateMyProfile
);

// PATCH /api/perfil/cambiar-contrasena -> Cambiar contraseña del bombero autenticado
router.patch(
  "/cambiar-contrasena",
  cleanEmptyStrings,
  authorizePermisos(["bombero:cambiar_contrasena"]), // Permiso para cambiar la contraseña
  changeMyPassword
);

export default router;