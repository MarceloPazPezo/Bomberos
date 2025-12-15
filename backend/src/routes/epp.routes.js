"use strict";
import { Router } from "express";
import {
  assignEppToBombero,
  createEpp,
  deleteEpp,
  getEpp,
  getEppById,
  getEppDisponibles,
  getEstadosEpp,
  getInventarioStats,
  getTiposEpp,
  unassignEppFromBombero,
  updateEpp
} from "../controllers/epp.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateJwt);

// Rutas principales de EPP
router.get("/", getEpp); // Obtener todos los EPP con filtros
router.get("/stats", getInventarioStats); // Estadísticas del inventario
router.get("/disponibles", getEppDisponibles); // EPP disponibles
router.get("/tipos", getTiposEpp); // Tipos de EPP
router.get("/estados", getEstadosEpp); // Estados de EPP
router.get("/:id", getEppById); // Obtener EPP por ID

// Rutas que requieren permisos específicos
router.post("/",
  authorizePermisos(["epp:admin", "epp:crear"]),
  createEpp
); // Crear EPP

router.put("/:id",
  authorizePermisos(["epp:admin", "epp:actualizar"]),
  updateEpp
); // Actualizar EPP

router.delete("/:id",
  authorizePermisos(["epp:admin", "epp:eliminar"]),
  deleteEpp
); // Eliminar EPP

router.post("/:id/asignar",
  authorizePermisos(["epp:admin", "epp:asignar"]),
  assignEppToBombero
); // Asignar EPP a bombero

router.delete("/:id/asignar",
  authorizePermisos(["epp:admin", "epp:asignar"]),
  unassignEppFromBombero
); // Desasignar EPP de bombero

export default router;








