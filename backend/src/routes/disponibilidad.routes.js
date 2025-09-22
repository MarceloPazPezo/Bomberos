"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  deleteDisponibilidad,
  getDisponibilidad,
  getDisponibilidades,
  createDisponibilidad,
  cerrarDisponibilidad,
  getDisponibilidadActiva,
} from "../controllers/disponibilidad.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get(
  "/",
  authorizePermisos(["disponibilidad:obtener"]),
  getDisponibilidades,
);
router.post(
  "/",
  authorizePermisos(["disponibilidad:crear"]),
  createDisponibilidad,
);
router.patch(
  "/cerrar",
  authorizePermisos(["disponibilidad:actualizar"]),
  cerrarDisponibilidad,
);
router.get(
  "/detalle/:id",
  authorizePermisos(["disponibilidad:admin"]),
  getDisponibilidad,
);
router.delete(
  "/detalle/:id",
  authorizePermisos(["disponibilidad:admin"]),
  deleteDisponibilidad,
);
router.get(
  "/detalle/activa/:idBombero",
  authorizePermisos(["disponibilidad:admin"]),
  getDisponibilidadActiva,
);

export default router;
