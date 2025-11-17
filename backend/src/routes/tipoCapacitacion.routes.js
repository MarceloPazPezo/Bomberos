"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  createTipoCapacitacion,
  deleteTipoCapacitacion,
  getTipoCapacitacion,
  getTiposCapacitacion,
  updateTipoCapacitacion,
} from "../controllers/tipoCapacitacion.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", authorizePermisos(["capacitacion:obtener"]), getTiposCapacitacion);
router.get("/detalle/:id", authorizePermisos(["capacitacion:obtener"]), getTipoCapacitacion);
router.patch("/detalle/:id", authorizePermisos(["capacitacion:admin"]), updateTipoCapacitacion);
router.delete("/detalle/:id", authorizePermisos(["capacitacion:admin"]), deleteTipoCapacitacion);
router.post("/", authorizePermisos(["capacitacion:admin"]), createTipoCapacitacion);

export default router;

