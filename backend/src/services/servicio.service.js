import { AppDataSource } from '../config/configDb.js';
import logger from '../config/configLogger.js';

const servicioRepository = AppDataSource.getRepository('Servicio');
const acudeServicioRepository = AppDataSource.getRepository('AcudeServicio');

/**
 * Servicio para gestionar servicios
 */
export class ServicioService {
  /**
   * Obtener todos los servicios con paginación
   */
  static async getAll(queryParams = {}) {
    try {
      logger.info('ServicioService.getAll - Obteniendo servicios con paginación');
      
      const servicios = await servicioRepository.find({
        select: ['id', 'nombre'],
        order: { nombre: 'ASC' }
      });
      
      // Por ahora, establecer incidentesCount en 0 para todos los servicios
      // TODO: Implementar conteo de incidentes cuando se resuelva el problema del JOIN
      const serviciosConCount = servicios.map(servicio => ({
        id: servicio.id,
        nombre: servicio.nombre,
        incidentesCount: 0
      }));
      
      logger.info(`ServicioService.getAll - Se encontraron ${serviciosConCount.length} servicios`);
      return serviciosConCount;
    } catch (error) {
      logger.error('ServicioService.getAll - Error:', error);
      throw error;
    }
  }


  /**
   * Crear un nuevo servicio
   */
  static async create(data) {
    try {
      const { nombre } = data;
      logger.info(`ServicioService.create - Creando servicio: ${nombre}`);
      
      // Normalizar el nombre a minúsculas para evitar duplicados
      const nombreNormalizado = nombre.trim().toLowerCase();
      
      // Verificar si ya existe un servicio con ese nombre normalizado
      const existingServicio = await servicioRepository.findOne({
        where: { nombre: nombreNormalizado }
      });
      
      if (existingServicio) {
        logger.warn(`ServicioService.create - Ya existe un servicio con el nombre: ${nombreNormalizado}`);
        throw new Error('Ya existe un servicio con ese nombre');
      }
      
      const nuevoServicio = servicioRepository.create({ nombre: nombreNormalizado });
      const servicioGuardado = await servicioRepository.save(nuevoServicio);
      
      logger.info(`ServicioService.create - Servicio creado con ID: ${servicioGuardado.id}`);
      return servicioGuardado;
    } catch (error) {
      logger.error('ServicioService.create - Error:', error);
      throw error;
    }
  }

  /**
   * Actualizar un servicio
   */
  static async update(id, data) {
    try {
      const { nombre } = data;
      logger.info(`ServicioService.update - Actualizando servicio ID: ${id} con nombre: ${nombre}`);
      
      const servicio = await servicioRepository.findOne({
        where: { id }
      });
      
      if (!servicio) {
        logger.warn(`ServicioService.update - Servicio con ID ${id} no encontrado`);
        return null;
      }
      
      // Normalizar el nombre a minúsculas para evitar duplicados
      const nombreNormalizado = nombre.trim().toLowerCase();
      
      // Verificar si ya existe otro servicio con ese nombre normalizado
      const existingServicio = await servicioRepository.findOne({
        where: { nombre: nombreNormalizado }
      });
      
      if (existingServicio && existingServicio.id !== parseInt(id)) {
        logger.warn(`ServicioService.update - Ya existe otro servicio con el nombre: ${nombreNormalizado}`);
        throw new Error('Ya existe un servicio con ese nombre');
      }
      
      servicio.nombre = nombreNormalizado;
      const servicioActualizado = await servicioRepository.save(servicio);
      
      logger.info(`ServicioService.update - Servicio actualizado exitosamente`);
      return servicioActualizado;
    } catch (error) {
      logger.error('ServicioService.update - Error:', error);
      throw error;
    }
  }

  /**
   * Eliminar un servicio
   */
  static async delete(id) {
    try {
      logger.info(`ServicioService.delete - Eliminando servicio con ID: ${id}`);
      
      const servicio = await servicioRepository.findOne({
        where: { id }
      });
      
      if (!servicio) {
        logger.warn(`ServicioService.delete - Servicio con ID ${id} no encontrado`);
        return null;
      }
      
      // Verificar si hay incidentes usando este servicio
      const incidentesCount = await acudeServicioRepository.count({
        where: { idServicio: id }
      });
      
      if (incidentesCount > 0) {
        logger.warn(`ServicioService.delete - No se puede eliminar el servicio ${servicio.nombre} porque está siendo usado por ${incidentesCount} incidentes`);
        throw new Error(`No se puede eliminar el servicio porque está siendo utilizado por ${incidentesCount} incidentes`);
      }
      
      await servicioRepository.remove(servicio);
      
      logger.info(`ServicioService.delete - Servicio eliminado exitosamente`);
      return servicio;
    } catch (error) {
      logger.error('ServicioService.delete - Error:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso de servicios
   */
  static async getUsageStats() {
    try {
      logger.info('ServicioService.getUsageStats - Obteniendo estadísticas de uso');
      
      const servicios = await servicioRepository.find({
        order: { nombre: 'ASC' }
      });
      
      const stats = await Promise.all(
        servicios.map(async (servicio) => {
          const incidentesCount = await acudeServicioRepository.count({
            where: { idServicio: servicio.id }
          });
          
          return {
            id: servicio.id,
            nombre: servicio.nombre,
            incidentesCount
          };
        })
      );
      
      logger.info(`ServicioService.getUsageStats - Estadísticas obtenidas para ${stats.length} servicios`);
      return stats;
    } catch (error) {
      logger.error('ServicioService.getUsageStats - Error:', error);
      throw error;
    }
  }
}

export const servicioService = ServicioService;
