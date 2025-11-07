"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { 
  obtenerclasificacionesEmergencia, 
  obtenerFaseIncidente, 
  obtenerSubtipoIncidente, 
  obtenerTipoDano,
  getSubtipoIncidente,
  getSubtiposIncidentes,
  createSubtipoIncidente,
  updateSubtipoIncidente,
  deleteSubtipoIncidente
} from "../controllers/subtipoIncidente.controller.js";

const router = Router();

// Rutas públicas (sin autenticación) - para uso en formularios
router.get("/clasificaciones", obtenerclasificacionesEmergencia);
router.get("/subtipos/:id", obtenerSubtipoIncidente);
router.get("/tiposDano", obtenerTipoDano);
router.get("/fasesIncidente", obtenerFaseIncidente);

// Rutas con autenticación para CRUD completo
router.use(authenticateJwt);

router.get("/", authorizePermisos(["subtipo_incidente:obtener"]), getSubtiposIncidentes);
router.get("/detalle/:id", authorizePermisos(["subtipo_incidente:obtener"]), getSubtipoIncidente);
router.patch("/detalle/:id", authorizePermisos(["subtipo_incidente:admin"]), updateSubtipoIncidente);
router.delete("/detalle/:id", authorizePermisos(["subtipo_incidente:admin"]), deleteSubtipoIncidente);
router.post("/", authorizePermisos(["subtipo_incidente:admin"]), createSubtipoIncidente);

export default router;