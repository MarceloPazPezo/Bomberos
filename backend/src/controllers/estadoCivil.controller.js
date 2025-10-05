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
      const { page, limit } = req.query;
      logger.info('EstadoCivilController.getAll - Iniciando obtención de estados civiles con paginación');
      
      const result = await estadoCivilService.getAll({ page, limit });
      
      if (!result.estadosCiviles || result.estadosCiviles.length === 0) {
        logger.info('EstadoCivilController.getAll - No se encontraron estados civiles');
        return handleSuccess(res, 204, 'No se encontraron estados civiles');
      }
      
      logger.info(`EstadoCivilController.getAll - Se obtuvieron ${result.estadosCiviles.length} estados civiles de ${result.total} total`);
      return handleSuccess(res, 200, 'Estados civiles obtenidos exitosamente', {
        estadosCiviles: result.estadosCiviles,
        pagination: {
          total: result.total,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          totalPages: Math.ceil(result.total / (parseInt(limit) || 10))
        }
      });
    } catch (error) {
      logger.error('EstadoCivilController.getAll - Error:', error);
      return handleErrorServer(res, 500, 'Error al obtener estados civiles');
    }
  }

  /**
   * Obtener un estado civil por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      logger.info(`EstadoCivilController.getById - Obteniendo estado civil con ID: ${id}`);
      
      const estadoCivil = await estadoCivilService.getById(parseInt(id));
      
      if (!estadoCivil) {
        logger.warn(`EstadoCivilController.getById - Estado civil con ID ${id} no encontrado`);
        return handleErrorClient(res, 404, 'Estado civil no encontrado');
      }
      
      logger.info(`EstadoCivilController.getById - Estado civil obtenido: ${estadoCivil.nombre}`);
      return handleSuccess(res, 200, 'Estado civil obtenido exitosamente', estadoCivil);
    } catch (error) {
      logger.error('EstadoCivilController.getById - Error:', error);
      return handleErrorServer(res, 500, 'Error al obtener estado civil');
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
   * Actualizar un estado civil
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      logger.info(`EstadoCivilController.update - Actualizando estado civil ID: ${id} con nombre: ${nombre}`);
      
      const estadoCivilActualizado = await estadoCivilService.update(parseInt(id), { nombre });
      
      if (!estadoCivilActualizado) {
        logger.warn(`EstadoCivilController.update - Estado civil con ID ${id} no encontrado`);
        return handleErrorClient(res, 404, 'Estado civil no encontrado');
      }
      
      logger.info(`EstadoCivilController.update - Estado civil actualizado exitosamente`);
      return handleSuccess(res, 200, 'Estado civil actualizado exitosamente', estadoCivilActualizado);
    } catch (error) {
      logger.error('EstadoCivilController.update - Error:', error);
      
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Ya existe un estado civil con ese nombre')) {
        return handleErrorClient(res, 400, 'Ya existe un estado civil con ese nombre');
      }
      
      return handleErrorServer(res, 500, 'Error al actualizar estado civil');
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

  /**
   * Obtener estadísticas de uso de estados civiles
   */
  static async getUsageStats(req, res) {
    try {
      logger.info('EstadoCivilController.getUsageStats - Obteniendo estadísticas de uso');
      
      const stats = await estadoCivilService.getUsageStats();
      
      logger.info(`EstadoCivilController.getUsageStats - Estadísticas obtenidas para ${stats.length} estados civiles`);
      return handleSuccess(res, 200, 'Estadísticas obtenidas exitosamente', stats);
    } catch (error) {
      logger.error('EstadoCivilController.getUsageStats - Error:', error);
      return handleErrorServer(res, 500, 'Error al obtener estadísticas');
    }
  }
}
