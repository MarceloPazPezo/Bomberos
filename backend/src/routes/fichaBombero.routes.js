"use strict";
import { Router } from "express";
import {
  createFichaBombero,
  getFichaBombero,
  updateFichaBombero,
  deleteFichaBombero,
  getFichasBombero
} from "../controllers/fichaBombero.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateJwt);

// ===========================================
// RUTAS CRUD PARA FICHA DE BOMBERO
// ===========================================

/**
 * @route POST /api/fichaBombero
 * @desc Crear nueva ficha de bombero
 * @access Private (Autenticado)
 */
router.post("/", createFichaBombero);

/**
 * @route GET /api/fichaBombero
 * @desc Obtener todas las fichas de bomberos con filtros opcionales
 * @access Private (Autenticado)
 * @query page, limit, idCompania, licenciaClaseF
 */
router.get("/", getFichasBombero);

/**
 * @route GET /api/fichaBombero/:id
 * @desc Obtener ficha de bombero por ID
 * @access Private (Autenticado)
 */
router.get("/:id", getFichaBombero);

/**
 * @route GET /api/fichaBombero/bombero/:idBombero
 * @desc Obtener ficha de bombero por ID del bombero
 * @access Private (Autenticado)
 */
router.get("/bombero/:idBombero", async (req, res, next) => {
  req.query.idBombero = req.params.idBombero;
  next();
}, getFichaBombero);

/**
 * @route PATCH /api/fichaBombero/:id
 * @desc Actualizar ficha de bombero
 * @access Private (Autenticado)
 */
router.patch("/:id", updateFichaBombero);

/**
 * @route DELETE /api/fichaBombero/:id
 * @desc Eliminar ficha de bombero
 * @access Private (Autenticado + Admin)
 */
router.delete("/:id", authorizeRoles(['admin', 'supervisor']), deleteFichaBombero);

export default router;
