"use strict";
import { Router } from "express";
import {
  getEpp,
  getEppById,
  createEpp,
  updateEpp,
  deleteEpp,
  assignEppToBombero,
  unassignEppFromBombero,
  getTiposEpp,
  getEstadosEpp,
  getEppDisponibles,
  getInventarioStats
} from "../controllers/epp.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";

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
  authorizeRoles(["admin", "supervisor"]), 
  createEpp
); // Crear EPP

router.put("/:id", 
  authorizeRoles(["admin", "supervisor"]), 
  updateEpp
); // Actualizar EPP

router.delete("/:id", 
  authorizeRoles(["admin"]), 
  deleteEpp
); // Eliminar EPP

router.post("/:id/asignar", 
  authorizeRoles(["admin", "supervisor"]), 
  assignEppToBombero
); // Asignar EPP a bombero

router.delete("/:id/asignar", 
  authorizeRoles(["admin", "supervisor"]), 
  unassignEppFromBombero
); // Desasignar EPP de bombero

export default router;








