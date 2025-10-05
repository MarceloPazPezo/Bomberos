import { AppDataSource } from '../config/configDb.js';
import logger from '../config/configLogger.js';

const estadoCivilRepository = AppDataSource.getRepository('EstadoCivil');
const afectadoRepository = AppDataSource.getRepository('Afectado');

/**
 * Servicio para gestionar estados civiles
 */
export class EstadoCivilService {
  /**
   * Obtener todos los estados civiles con paginación
   */
  static async getAll(queryParams = {}) {
    try {
      logger.info('EstadoCivilService.getAll - Obteniendo estados civiles con paginación');
      
      const estadosCiviles = await estadoCivilRepository.find({
        select: ['id', 'nombre'],
        order: { nombre: 'ASC' }
      });
      
      // Contar afectados por estado civil
      const estadosCivilesConCount = estadosCiviles.map(estado => ({
        id: estado.id,
        nombre: estado.nombre,
        afectadosCount: 0 // Por ahora en 0, se puede implementar después si es necesario
      }));
      
      logger.info(`EstadoCivilService.getAll - Se encontraron ${estadosCivilesConCount.length} estados civiles`);
      return estadosCivilesConCount;
    } catch (error) {
      logger.error('EstadoCivilService.getAll - Error:', error);
      throw error;
    }
  }

  /**
   * Obtener un estado civil por ID
   */
  static async getById(id) {
    try {
      logger.info(`EstadoCivilService.getById - Obteniendo estado civil con ID: ${id}`);
      
      const estadoCivil = await estadoCivilRepository.findOne({
        where: { id }
      });
      
      if (!estadoCivil) {
        logger.warn(`EstadoCivilService.getById - Estado civil con ID ${id} no encontrado`);
        return null;
      }
      
      logger.info(`EstadoCivilService.getById - Estado civil encontrado: ${estadoCivil.nombre}`);
      return estadoCivil;
    } catch (error) {
      logger.error('EstadoCivilService.getById - Error:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo estado civil
   */
  static async create(data) {
    try {
      const { nombre } = data;
      logger.info(`EstadoCivilService.create - Creando estado civil: ${nombre}`);
      
      // Normalizar el nombre a minúsculas para evitar duplicados
      const nombreNormalizado = nombre.trim().toLowerCase();
      
      // Verificar si ya existe un estado civil con ese nombre normalizado
      const existingEstadoCivil = await estadoCivilRepository.findOne({
        where: { nombre: nombreNormalizado }
      });
      
      if (existingEstadoCivil) {
        logger.warn(`EstadoCivilService.create - Ya existe un estado civil con el nombre: ${nombreNormalizado}`);
        throw new Error('Ya existe un estado civil con ese nombre');
      }
      
      const nuevoEstadoCivil = estadoCivilRepository.create({ nombre: nombreNormalizado });
      const estadoCivilGuardado = await estadoCivilRepository.save(nuevoEstadoCivil);
      
      logger.info(`EstadoCivilService.create - Estado civil creado con ID: ${estadoCivilGuardado.id}`);
      return estadoCivilGuardado;
    } catch (error) {
      logger.error('EstadoCivilService.create - Error:', error);
      throw error;
    }
  }

  /**
   * Actualizar un estado civil
   */
  static async update(id, data) {
    try {
      const { nombre } = data;
      logger.info(`EstadoCivilService.update - Actualizando estado civil ID: ${id} con nombre: ${nombre}`);
      
      const estadoCivil = await estadoCivilRepository.findOne({
        where: { id }
      });
      
      if (!estadoCivil) {
        logger.warn(`EstadoCivilService.update - Estado civil con ID ${id} no encontrado`);
        return null;
      }
      
      // Normalizar el nombre a minúsculas para evitar duplicados
      const nombreNormalizado = nombre.trim().toLowerCase();
      
      // Verificar si ya existe otro estado civil con ese nombre normalizado
      const existingEstadoCivil = await estadoCivilRepository.findOne({
        where: { nombre: nombreNormalizado }
      });
      
      if (existingEstadoCivil && existingEstadoCivil.id !== parseInt(id)) {
        logger.warn(`EstadoCivilService.update - Ya existe otro estado civil con el nombre: ${nombreNormalizado}`);
        throw new Error('Ya existe un estado civil con ese nombre');
      }
      
      estadoCivil.nombre = nombreNormalizado;
      const estadoCivilActualizado = await estadoCivilRepository.save(estadoCivil);
      
      logger.info(`EstadoCivilService.update - Estado civil actualizado exitosamente`);
      return estadoCivilActualizado;
    } catch (error) {
      logger.error('EstadoCivilService.update - Error:', error);
      throw error;
    }
  }

  /**
   * Eliminar un estado civil
   */
  static async delete(id) {
    try {
      logger.info(`EstadoCivilService.delete - Eliminando estado civil con ID: ${id}`);
      
      const estadoCivil = await estadoCivilRepository.findOne({
        where: { id }
      });
      
      if (!estadoCivil) {
        logger.warn(`EstadoCivilService.delete - Estado civil con ID ${id} no encontrado`);
        return null;
      }
      
      // Verificar si hay afectados usando este estado civil
      const afectadosCount = await afectadoRepository.count({
        where: { idEstadoCivil: id }
      });
      
      if (afectadosCount > 0) {
        logger.warn(`EstadoCivilService.delete - No se puede eliminar el estado civil ${estadoCivil.nombre} porque está siendo usado por ${afectadosCount} afectados`);
        throw new Error(`No se puede eliminar el estado civil porque está siendo utilizado por ${afectadosCount} afectados`);
      }
      
      await estadoCivilRepository.remove(estadoCivil);
      
      logger.info(`EstadoCivilService.delete - Estado civil eliminado exitosamente`);
      return estadoCivil;
    } catch (error) {
      logger.error('EstadoCivilService.delete - Error:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso de estados civiles
   */
  static async getUsageStats() {
    try {
      logger.info('EstadoCivilService.getUsageStats - Obteniendo estadísticas de uso');
      
      const estadosCiviles = await estadoCivilRepository.find({
        order: { nombre: 'ASC' }
      });
      
      const stats = await Promise.all(
        estadosCiviles.map(async (estadoCivil) => {
          const afectadosCount = await afectadoRepository.count({
            where: { idEstadoCivil: estadoCivil.id }
          });
          
          return {
            id: estadoCivil.id,
            nombre: estadoCivil.nombre,
            afectadosCount
          };
        })
      );
      
      logger.info(`EstadoCivilService.getUsageStats - Estadísticas obtenidas para ${stats.length} estados civiles`);
      return stats;
    } catch (error) {
      logger.error('EstadoCivilService.getUsageStats - Error:', error);
      throw error;
    }
  }
}

export const estadoCivilService = EstadoCivilService;
