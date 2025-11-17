"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
} from "../controllers/perfil.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", authorizePermisos(["bombero:obtener_perfil"]), getMyProfile);
router.patch(
  "/",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  updateMyProfile,
);
router.patch(
  "/cambiar-contrasena",
  cleanEmptyStrings,
  authorizePermisos(["bombero:cambiar_contrasena"]),
  changeMyPassword,
);

export default router;
