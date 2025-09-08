"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import {
  getCompania,
  getCompanias,
  createCompania,
  updateCompania,
  deleteCompania,
  getCompaniaBombero,
} from "../controllers/compania.controller.js";

const router = Router();

router.use(authenticateJwt);

// GET /api/compania/ -> Obtener todas las compañías con filtros y paginación
router.get("/", authorizePermisos(["compania:leer"]), getCompanias);

// GET /api/compania/detail/:id -> Obtener una compañía específica por su ID
router.get(
  "/detail/:id",
  authorizePermisos(["compania:leer_especifico"]),
  getCompania,
);

// GET /api/compania/bombero/:idBombero -> Obtener la compañía asociada a un bombero
router.get(
  "/bombero/:idBombero",
  authorizePermisos(["compania:leer_bombero"]),
  getCompaniaBombero,
);

// POST /api/compania/ -> Crear una nueva compañía
router.post(
  "/",
  cleanEmptyStrings,
  authorizePermisos(["compania:crear"]),
  createCompania,
);

// PATCH /api/compania/detail/:id -> Actualizar una compañía específica por su ID
router.patch(
  "/detail/:id",
  cleanEmptyStrings,
  authorizePermisos(["compania:actualizar"]),
  updateCompania,
);

// DELETE /api/compania/detail/:id -> Eliminar una compañía específica por su ID
router.delete(
  "/detail/:id",
  authorizePermisos(["compania:eliminar"]),
  deleteCompania,
);

export default router;
