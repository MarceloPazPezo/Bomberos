"use strict";
import { Router } from "express";
import { getTiposSangre, getTipoSangreById } from "../controllers/tipoSangre.controller.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

// Obtener todos los tipos de sangre
router.get(
  "/",
  authenticateJwt,
  authorizePermisos(["tipo_sangre:obtener"]),
  getTiposSangre
);

// Obtener un tipo de sangre por ID
router.get(
  "/:id",
  authenticateJwt,
  authorizePermisos(["tipo_sangre:obtener"]),
  getTipoSangreById
);

export default router;
