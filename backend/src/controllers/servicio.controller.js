import { servicioService } from '../services/servicio.service.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';
import { validateCreateServicio, validateDeleteServicio } from '../validations/servicio.validation.js';
import logger from '../config/configLogger.js';

/**
 * Controlador para gestionar servicios
 */
export class ServicioController {
  /**
   * Obtener todos los servicios con paginación
   */
  static async getAll(req, res) {
    try {
      logger.info('ServicioController.getAll - Obteniendo todos los servicios');
      
      const servicios = await servicioService.getAll();
      
      if (!servicios || servicios.length === 0) {
        logger.info('ServicioController.getAll - No se encontraron servicios');
        return handleSuccess(res, 200, 'No se encontraron servicios', []);
      }
      
      logger.info(`ServicioController.getAll - Se obtuvieron ${servicios.length} servicios`);
      return handleSuccess(res, 200, 'Servicios obtenidos exitosamente', servicios);
    } catch (error) {
      logger.error('ServicioController.getAll - Error:', error);
      return handleErrorServer(res, 500, 'Error al obtener servicios');
    }
  }


  /**
   * Crear un nuevo servicio
   */
  static async create(req, res) {
    try {
      // Validar datos de entrada
      const validation = validateCreateServicio(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: validation.errors
        });
      }
      
      const { nombre } = validation.data;
      logger.info(`ServicioController.create - Creando servicio: ${nombre}`);
      
      const nuevoServicio = await servicioService.create({ nombre });
      
      logger.info(`ServicioController.create - Servicio creado con ID: ${nuevoServicio.id}`);
      return handleSuccess(res, 201, 'Servicio creado exitosamente', nuevoServicio);
    } catch (error) {
      logger.error('ServicioController.create - Error:', error);
      
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Ya existe un servicio con ese nombre')) {
        return handleErrorClient(res, 400, 'Ya existe un servicio con ese nombre');
      }
      
      return handleErrorServer(res, 500, 'Error al crear servicio');
    }
  }


  /**
   * Eliminar un servicio
   */
  static async delete(req, res) {
    try {
      // Validar parámetros
      const validation = validateDeleteServicio(req.params);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación en parámetros',
          errors: validation.errors
        });
      }
      
      const { id } = req.params;
      logger.info(`ServicioController.delete - Eliminando servicio con ID: ${id}`);
      
      const servicioEliminado = await servicioService.delete(parseInt(id));
      
      if (!servicioEliminado) {
        logger.warn(`ServicioController.delete - Servicio con ID ${id} no encontrado`);
        return handleErrorClient(res, 404, 'Servicio no encontrado');
      }
      
      logger.info(`ServicioController.delete - Servicio eliminado exitosamente`);
      return handleSuccess(res, 200, 'Servicio eliminado exitosamente', servicioEliminado);
    } catch (error) {
      logger.error('ServicioController.delete - Error:', error);
      
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return handleErrorClient(res, 400, 'No se puede eliminar el servicio porque está siendo utilizado por incidentes');
      }
      
      return handleErrorServer(res, 500, 'Error al eliminar servicio');
    }
  }

}