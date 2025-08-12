"use strict";
import { Router } from "express";
import {
  getSystemConfig,
  updateSystemConfig,
  createSystemConfig
} from "../controllers/sistema.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";

const router = Router();

// Obtener configuraciones (accesible para usuarios autenticados)
router.get("/", authenticateJwt, getSystemConfig);

// Crear nueva configuración (solo administradores)
router.post("/", authenticateJwt, isAdmin, createSystemConfig);

// Actualizar configuración (solo administradores)
router.put("/:key", authenticateJwt, isAdmin, updateSystemConfig);

export default router;