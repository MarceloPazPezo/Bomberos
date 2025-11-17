"use strict";
import { Router } from 'express';
import { createEstadoCivil, deleteEstadoCivil, getAllEstadosCiviles } from '../controllers/estadoCivil.controller.js';
import {
  handleValidationErrors,
  validateCreateEstadoCivil,
  validateDeleteEstadoCivil
} from '../validations/estadoCivil.validation.js';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizePermisos } from '../middlewares/authorization.middleware.js';
import logger from '../config/configLogger.js';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

router.get('/', authorizePermisos(['estadoCivil:obtener', 'estadoCivil:admin']), async (req, res) => {
  try {
    logger.info('EstadoCivil routes - GET / - Obteniendo todos los estados civiles');
    await getAllEstadosCiviles(req, res);
  } catch (error) {
    logger.error('EstadoCivil routes - GET / - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

router.post('/', authorizePermisos(['estadoCivil:admin']), validateCreateEstadoCivil, handleValidationErrors, async (req, res) => {
  try {
    logger.info('EstadoCivil routes - POST / - Creando nuevo estado civil');
    await createEstadoCivil(req, res);
  } catch (error) {
    logger.error('EstadoCivil routes - POST / - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

router.delete('/:id', authorizePermisos(['estadoCivil:admin']), validateDeleteEstadoCivil, handleValidationErrors, async (req, res) => {
  try {
    logger.info(`EstadoCivil routes - DELETE /:id - Eliminando estado civil con ID: ${req.params.id}`);
    await deleteEstadoCivil(req, res);
  } catch (error) {
    logger.error('EstadoCivil routes - DELETE /:id - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;
