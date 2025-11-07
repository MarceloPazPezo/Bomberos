"use strict";
import { Router } from 'express';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizePermisos, authorizeRoles } from "../middlewares/authorization.middleware.js";
import { obtenerHistorialCompania } from '../controllers/historial.controller.js';

const router = Router();

/**
 * Rutas para gestión de historial de compañías
 * Todas las rutas requieren autenticación
 */
// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

// Rutas específicas
router.get('/historial/:idCompania',authorizeRoles(['Administrador', 'Supervisor', 'Bombero']) ,obtenerHistorialCompania);
export default router;