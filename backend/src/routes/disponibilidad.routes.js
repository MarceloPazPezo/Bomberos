"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  deleteDisponibilidad,
  getDisponibilidad,
  getDisponibilidades,
  updateDisponibilidad,
  createDisponibilidad,
  cerrarDisponibilidad,
  getDisponibilidadActiva,
} from "../controllers/disponibilidad.controller.js";

const router = Router();

router.use(authenticateJwt);

// GET /api/disponibilidad/ -> Obtener todas las disponibilidades
router.get(
  "/",
  authorizePermisos(["disponibilidad:read_all"]),
  getDisponibilidades,
);

// GET /api/disponibilidad/detail/:id -> Obtener una disponibilidad específica por su ID
router.get(
  "/detail/:id",
  authorizePermisos(["disponibilidad:read_specific"]),
  getDisponibilidad,
);

// PATCH /api/disponibilidad/detail/:id -> Actualizar una disponibilidad específica por su ID
router.patch(
  "/detail/:id",
  authorizePermisos(["disponibilidad:update_specific"]),
  updateDisponibilidad,
);

// DELETE /api/disponibilidad/detail/:id -> Eliminar una disponibilidad específica por su ID
router.delete(
  "/detail/:id",
  authorizePermisos(["disponibilidad:delete"]),
  deleteDisponibilidad,
);

// POST /api/disponibilidad/-> Creamos una disponibilidad
router.post(
  "/",
  authorizePermisos(["disponibilidad:create"]),
  createDisponibilidad,
);

// GET /api/disponibilidad/activa/:idBombero -> Obtener disponibilidad activa de un bombero
router.get(
  "/activa/:idBombero",
  authorizePermisos(["disponibilidad:read_specific"]),
  getDisponibilidadActiva,
);

// PATCH /api/disponibilidad/cerrar -> Cerrar disponibilidad activa
router.patch(
  "/cerrar",
  authorizePermisos(["disponibilidad:update_specific"]),
  cerrarDisponibilidad,
);

export default router;
