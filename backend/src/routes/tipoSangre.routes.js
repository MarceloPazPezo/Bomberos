"use strict";
import { Router } from "express";
import { TipoSangreController } from "../controllers/tipoSangre.controller.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

// Obtener todos los tipos de sangre
router.get(
  "/",
  authenticateJwt,
  authorizePermisos(["tipo_sangre:obtener"]),
  TipoSangreController.getTiposSangre
);

// Obtener un tipo de sangre por ID
router.get(
  "/:id",
  authenticateJwt,
  authorizePermisos(["tipo_sangre:obtener"]),
  TipoSangreController.getTipoSangreById
);

export default router;
