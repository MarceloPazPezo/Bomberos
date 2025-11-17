"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  createTipoEvento,
  deleteTipoEvento,
  getTipoEvento,
  getTiposEvento,
  updateTipoEvento,
} from "../controllers/tipoEvento.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", authorizePermisos(["tipoEvento:obtener"]), getTiposEvento);
router.get("/detalle/:id", authorizePermisos(["tipoEvento:obtener"]), getTipoEvento);
router.patch("/detalle/:id", authorizePermisos(["tipoEvento:admin"]), updateTipoEvento);
router.delete("/detalle/:id", authorizePermisos(["tipoEvento:admin"]), deleteTipoEvento);
router.post("/", authorizePermisos(["tipoEvento:admin"]), createTipoEvento);

export default router;

