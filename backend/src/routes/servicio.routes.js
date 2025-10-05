import { Router } from 'express';
import { ServicioController } from '../controllers/servicio.controller.js';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizePermisos } from '../middlewares/authorization.middleware.js';
import logger from '../config/configLogger.js';

const router = Router();

/**
 * Rutas para gestión de servicios
 * Todas las rutas requieren autenticación y permisos de administración
 */

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

/**
 * @route GET /api/servicios
 * @desc Obtener todos los servicios
 * @access Private (servicio:obtener o servicio:admin)
 */
router.get('/', authorizePermisos(['servicio:obtener', 'servicio:admin']), async (req, res) => {
  try {
    logger.info('Servicios routes - GET / - Obteniendo todos los servicios');
    await ServicioController.getAll(req, res);
  } catch (error) {
    logger.error('Servicios routes - GET / - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /api/servicios
 * @desc Crear un nuevo servicio
 * @access Private (Admin)
 */
router.post('/', authorizePermisos(['servicio:admin']), async (req, res) => {
  try {
    logger.info('Servicios routes - POST / - Creando nuevo servicio');
    await ServicioController.create(req, res);
  } catch (error) {
    logger.error('Servicios routes - POST / - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});


/**
 * @route DELETE /api/servicios/:id
 * @desc Eliminar un servicio
 * @access Private (Admin)
 */
router.delete('/:id', authorizePermisos(['servicio:admin']), async (req, res) => {
  try {
    logger.info(`Servicios routes - DELETE /:id - Eliminando servicio con ID: ${req.params.id}`);
    await ServicioController.delete(req, res);
  } catch (error) {
    logger.error('Servicios routes - DELETE /:id - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;