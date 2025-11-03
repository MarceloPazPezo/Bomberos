"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  createEstadoEpp,
  deleteEstadoEpp,
  getEstadoEpp,
  getEstadosEpp,
  updateEstadoEpp,
} from "../controllers/estadoEpp.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", authorizePermisos(["estado_epp:obtener"]), getEstadosEpp);
router.get("/detalle/:id", authorizePermisos(["estado_epp:obtener"]), getEstadoEpp);
router.patch("/detalle/:id", authorizePermisos(["estado_epp:admin"]), updateEstadoEpp);
router.delete("/detalle/:id", authorizePermisos(["estado_epp:admin"]), deleteEstadoEpp);
router.post("/", authorizePermisos(["estado_epp:admin"]), createEstadoEpp);

export default router;

