"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  createClaveRadial,
  deleteClaveRadial,
  getClaveRadial,
  getClavesRadiales,
  updateClaveRadial,
} from "../controllers/claveRadial.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", authorizePermisos(["clave_radial:obtener"]), getClavesRadiales);
router.get("/detalle/:id", authorizePermisos(["clave_radial:obtener"]), getClaveRadial);
router.patch("/detalle/:id", authorizePermisos(["clave_radial:admin"]), updateClaveRadial);
router.delete("/detalle/:id", authorizePermisos(["clave_radial:admin"]), deleteClaveRadial);
router.post("/", authorizePermisos(["clave_radial:admin"]), createClaveRadial);

export default router;

