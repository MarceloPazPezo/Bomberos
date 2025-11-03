"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  createClasificacionEmergencia,
  deleteClasificacionEmergencia,
  getClasificacionEmergencia,
  getClasificacionesEmergencia,
  updateClasificacionEmergencia,
} from "../controllers/clasificacionEmergencia.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", authorizePermisos(["clasificacion_emergencia:obtener"]), getClasificacionesEmergencia);
router.get("/detalle/:id", authorizePermisos(["clasificacion_emergencia:obtener"]), getClasificacionEmergencia);
router.patch("/detalle/:id", authorizePermisos(["clasificacion_emergencia:admin"]), updateClasificacionEmergencia);
router.delete("/detalle/:id", authorizePermisos(["clasificacion_emergencia:admin"]), deleteClasificacionEmergencia);
router.post("/", authorizePermisos(["clasificacion_emergencia:admin"]), createClasificacionEmergencia);

export default router;

