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
  authorizePermisos(["disponibilidad:leer"]),
  getDisponibilidades,
);

// GET /api/disponibilidad/detail/:id -> Obtener una disponibilidad específica por su ID
router.get(
  "/detail/:id",
  authorizePermisos(["disponibilidad:leer_especifico"]),
  getDisponibilidad,
);

// PATCH /api/disponibilidad/detail/:id -> Actualizar una disponibilidad específica por su ID
router.patch(
  "/detail/:id",
  authorizePermisos(["disponibilidad:actualizar"]),
  updateDisponibilidad,
);

// DELETE /api/disponibilidad/detail/:id -> Eliminar una disponibilidad específica por su ID
router.delete(
  "/detail/:id",
  authorizePermisos(["disponibilidad:eliminar"]),
  deleteDisponibilidad,
);

// POST /api/disponibilidad/-> Creamos una disponibilidad
router.post(
  "/",
  authorizePermisos(["disponibilidad:crear"]),
  createDisponibilidad,
);

// GET /api/disponibilidad/activa/:idBombero -> Obtener disponibilidad activa de un bombero
router.get(
  "/activa/:idBombero",
  authorizePermisos(["disponibilidad:leer_especifico"]),
  getDisponibilidadActiva,
);

// PATCH /api/disponibilidad/cerrar -> Cerrar disponibilidad activa
router.patch(
  "/cerrar",
  authorizePermisos(["disponibilidad:cambiar_estado"]),
  cerrarDisponibilidad,
);

export default router;
