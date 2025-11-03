"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  createTipoEpp,
  deleteTipoEpp,
  getTipoEpp,
  getTiposEpp,
  updateTipoEpp,
} from "../controllers/tipoEpp.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", authorizePermisos(["tipo_epp:obtener"]), getTiposEpp);
router.get("/detalle/:id", authorizePermisos(["tipo_epp:obtener"]), getTipoEpp);
router.patch("/detalle/:id", authorizePermisos(["tipo_epp:admin"]), updateTipoEpp);
router.delete("/detalle/:id", authorizePermisos(["tipo_epp:admin"]), deleteTipoEpp);
router.post("/", authorizePermisos(["tipo_epp:admin"]), createTipoEpp);

export default router;

