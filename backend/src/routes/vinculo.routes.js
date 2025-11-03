"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  createVinculo,
  deleteVinculo,
  getVinculo,
  getVinculos,
  updateVinculo,
} from "../controllers/vinculo.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", authorizePermisos(["vinculo:obtener"]), getVinculos);
router.get("/detalle/:id", authorizePermisos(["vinculo:obtener"]), getVinculo);
router.patch("/detalle/:id", authorizePermisos(["vinculo:admin"]), updateVinculo);
router.delete("/detalle/:id", authorizePermisos(["vinculo:admin"]), deleteVinculo);
router.post("/", authorizePermisos(["vinculo:admin"]), createVinculo);

export default router;

