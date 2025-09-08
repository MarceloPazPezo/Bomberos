"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import {
  deleteBombero,
  getBombero,
  getBomberos,
  updateBombero,
  createBombero,
  changeBomberoStatus,
} from "../controllers/bombero.controller.js";

const router = Router();

router.use(authenticateJwt);

// GET /api/bombero/ -> Obtener todos los bomberos
router.get("/", authorizePermisos(["bombero:leer"]), getBomberos);

// GET /api/bombero/detail/:id -> Obtener un bombero específico por su ID o RUT
router.get(
  "/detail/:id",
  authorizePermisos(["bombero:leer_especifico"]),
  getBombero,
);

// PATCH /api/bombero/detail/:id -> Actualizar un bombero específico por su ID
router.patch(
  "/detail/:id",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar"]),
  updateBombero,
);

// DELETE /api/bombero/detail/:id -> Eliminar un bombero específico por su ID
router.delete(
  "/detail/:id",
  authorizePermisos(["bombero:eliminar"]),
  deleteBombero,
);

// POST /api/bombero/-> Creamos un bombero
router.post(
  "/",
  cleanEmptyStrings,
  authorizePermisos(["bombero:crear"]),
  createBombero,
);

// PATCH /api/bombero/estado/:id -> Cambiar estado activo/inactivo de un bombero
router.patch(
  "/estado/:id",
  authorizePermisos(["bombero:cambiar_estado"]),
  changeBomberoStatus,
);

export default router;
