"use strict";
import { Router } from "express";
import {
  getPermiso,
  getPermisos,
  updatePermiso,
} from "../controllers/permiso.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", authorizePermisos(["permiso:obtener"]), getPermisos);
router.get("/detalle/:id", authorizePermisos(["permiso:admin"]), getPermiso);
router.put("/detalle/:id", authorizePermisos(["permiso:admin"]), updatePermiso);

export default router;
