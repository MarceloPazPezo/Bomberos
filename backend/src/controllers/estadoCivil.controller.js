import { estadoCivilService } from '../services/estadoCivil.service.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';
import logger from '../config/configLogger.js';

/**
 * Controlador para gestionar estados civiles
 */
export class EstadoCivilController {
  /**
   * Obtener todos los estados civiles con paginación
   */
  static async getAll(req, res) {
    try {
      logger.info('EstadoCivilController.getAll - Obteniendo todos los estados civiles');
      
      const estadosCiviles = await estadoCivilService.getAll();
      
      if (!estadosCiviles || estadosCiviles.length === 0) {
        logger.info('EstadoCivilController.getAll - No se encontraron estados civiles');
        return handleSuccess(res, 200, 'No se encontraron estados civiles', []);
      }
      
      logger.info(`EstadoCivilController.getAll - Se obtuvieron ${estadosCiviles.length} estados civiles`);
      return handleSuccess(res, 200, 'Estados civiles obtenidos exitosamente', estadosCiviles);
    } catch (error) {
      logger.error('EstadoCivilController.getAll - Error:', error);
      return handleErrorServer(res, 500, 'Error al obtener estados civiles');
    }
  }


  /**
   * Crear un nuevo estado civil
   */
  static async create(req, res) {
    try {
      const { nombre } = req.body;
      logger.info(`EstadoCivilController.create - Creando estado civil: ${nombre}`);
      
      const nuevoEstadoCivil = await estadoCivilService.create({ nombre });
      
      logger.info(`EstadoCivilController.create - Estado civil creado con ID: ${nuevoEstadoCivil.id}`);
      return handleSuccess(res, 201, 'Estado civil creado exitosamente', nuevoEstadoCivil);
    } catch (error) {
      logger.error('EstadoCivilController.create - Error:', error);
      
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Ya existe un estado civil con ese nombre')) {
        return handleErrorClient(res, 400, 'Ya existe un estado civil con ese nombre');
      }
      
      return handleErrorServer(res, 500, 'Error al crear estado civil');
    }
  }


  /**
   * Eliminar un estado civil
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      logger.info(`EstadoCivilController.delete - Eliminando estado civil con ID: ${id}`);
      
      const estadoCivilEliminado = await estadoCivilService.delete(parseInt(id));
      
      if (!estadoCivilEliminado) {
        logger.warn(`EstadoCivilController.delete - Estado civil con ID ${id} no encontrado`);
        return handleErrorClient(res, 404, 'Estado civil no encontrado');
      }
      
      logger.info(`EstadoCivilController.delete - Estado civil eliminado exitosamente`);
      return handleSuccess(res, 200, 'Estado civil eliminado exitosamente', estadoCivilEliminado);
    } catch (error) {
      logger.error('EstadoCivilController.delete - Error:', error);
      
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return handleErrorClient(res, 400, 'No se puede eliminar el estado civil porque está siendo utilizado por afectados');
      }
      
      return handleErrorServer(res, 500, 'Error al eliminar estado civil');
    }
  }

}
