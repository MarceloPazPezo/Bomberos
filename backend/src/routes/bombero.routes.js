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

router.get("/", authorizePermisos(["bombero:obtener"]), getBomberos);
router.get(
  "/detalle/:id",
  authorizePermisos(["bombero:obtener_especifico"]),
  getBombero,
);
router.patch(
  "/detalle/:id",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar"]),
  updateBombero,
);
router.delete(
  "/detalle/:id",
  authorizePermisos(["bombero:eliminar"]),
  deleteBombero,
);
router.post(
  "/",
  cleanEmptyStrings,
  authorizePermisos(["bombero:crear"]),
  createBombero,
);
router.patch(
  "/estado/:id",
  authorizePermisos(["bombero:cambiar_estado"]),
  changeBomberoStatus,
);

export default router;
