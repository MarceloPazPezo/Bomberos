"use strict";
import { Router } from 'express';
import { getAllCarros, createCarro, updateCarro, deleteCarro, getCarrosByCompania } from '../controllers/carro.controller.js';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizePermisos } from '../middlewares/authorization.middleware.js';
import logger from '../config/configLogger.js';

const router = Router();

/**
 * Rutas para gestión de carros
 * Todas las rutas requieren autenticación y permisos de administración
 */

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

/**
 * @route GET /api/carros
 * @desc Obtener todos los carros
 * @access Private (carro:obtener o carro:admin)
 */
router.get('/', authorizePermisos(['carro:obtener', 'carro:admin']), async (req, res) => {
  try {
    logger.info('Carros routes - GET / - Obteniendo todos los carros');
    await getAllCarros(req, res);
  } catch (error) {
    logger.error('Carros routes - GET / - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /api/carros
 * @desc Crear un nuevo carro
 * @access Private (Admin)
 */
router.post('/', authorizePermisos(['carro:admin']), async (req, res) => {
  try {
    logger.info('Carros routes - POST / - Creando nuevo carro');
    await createCarro(req, res);
  } catch (error) {
    logger.error('Carros routes - POST / - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route PUT /api/carros/:id
 * @desc Actualizar un carro existente
 * @access Private (Admin)
 */
router.put('/:id', authorizePermisos(['carro:admin']), async (req, res) => {
  try {
    logger.info(`Carros routes - PUT /:id - Actualizando carro con ID: ${req.params.id}`);
    await updateCarro(req, res);
  } catch (error) {
    logger.error('Carros routes - PUT /:id - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route DELETE /api/carros/:id
 * @desc Eliminar un carro
 * @access Private (Admin)
 */
router.delete('/:id', authorizePermisos(['carro:admin']), async (req, res) => {
  try {
    logger.info(`Carros routes - DELETE /:id - Eliminando carro con ID: ${req.params.id}`);
    await deleteCarro(req, res);
  } catch (error) {
    logger.error('Carros routes - DELETE /:id - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/carros/compania/:idCompania
 * @desc Obtener carros por compañía
 * @access Private (carro:obtener o carro:admin)
 */
router.get('/compania/:idCompania', authorizePermisos(['carro:obtener', 'carro:admin']), async (req, res) => {
  try {
    logger.info(`Carros routes - GET /compania/:idCompania - Obteniendo carros para compañía ID: ${req.params.idCompania}`);
    await getCarrosByCompania(req, res);
  } catch (error) {
    logger.error('Carros routes - GET /compania/:idCompania - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;
