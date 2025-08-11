"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../middlewares/authorization.middleware.js";
import {
  deleteDisponibilidad,
  getDisponibilidad,
  getDisponibilidades,
  updateDisponibilidad,
  createDisponibilidad,
  changeDisponibilidadStatus,
} from "../controllers/disponibilidad.controller.js";

const router = Router();

router.use(authenticateJwt);

// GET /api/disponibilidad/ -> Obtener todas las disponibilidades
router.get(
  "/",
  authorizePermissions(["disponibilidad:read_all"]),
  getDisponibilidades,
);

// GET /api/disponibilidad/detail/:id -> Obtener una disponibilidad específica por su ID
router.get(
  "/detail/",
  authorizePermissions(["disponibilidad:read_specific"]),
  getDisponibilidad,
);

// PATCH /api/disponibilidad/detail/:id -> Actualizar una disponibilidad específica por su ID
router.patch(
  "/detail/",
  authorizePermissions(["disponibilidad:update_specific"]),
  updateDisponibilidad,
);

// DELETE /api/disponibilidad/detail/:id -> Eliminar una disponibilidad específica por su ID
router.delete(
  "/detail/",
  authorizePermissions(["disponibilidad:delete"]),
  deleteDisponibilidad,
);

// POST /api/disponibilidad/-> Creamos una disponibilidad
router.post(
  "/",
  authorizePermissions(["disponibilidad:create"]),
  createDisponibilidad,
);

// PATCH /api/disponibilidad/status/:id -> Cambiar estado activo/inactivo de una disponibilidad
router.patch(
  "/status/:id",
  authorizePermissions(["disponibilidad:change_status"]),
  changeDisponibilidadStatus,
);

export default router;
