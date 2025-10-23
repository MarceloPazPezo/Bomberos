"use strict";
import { AppDataSource } from '../config/configDb.js';
import logger from '../config/configLogger.js';

const servicioRepository = AppDataSource.getRepository('Servicio');
const acudeServicioRepository = AppDataSource.getRepository('AcudeServicio');

/**
 * Obtener todos los servicios con paginación
 */
export async function getAllServiciosService(queryParams = {}) {
  try {
    logger.info('getAllServiciosService - Obteniendo servicios con paginación');
    
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
    
    logger.info(`getAllServiciosService - Se encontraron ${serviciosConCount.length} servicios`);
    return serviciosConCount;
  } catch (error) {
    logger.error('getAllServiciosService - Error:', error);
    throw error;
  }
}

/**
 * Crear un nuevo servicio
 */
export async function createServicioService(data) {
  try {
    const { nombre } = data;
    logger.info(`createServicioService - Creando servicio: ${nombre}`);
    
    // Normalizar el nombre a minúsculas para evitar duplicados
    const nombreNormalizado = nombre.trim().toLowerCase();
    
    // Verificar si ya existe un servicio con ese nombre normalizado
    const existingServicio = await servicioRepository.findOne({
      where: { nombre: nombreNormalizado }
    });
    
    if (existingServicio) {
      logger.warn(`createServicioService - Ya existe un servicio con el nombre: ${nombreNormalizado}`);
      throw new Error('Ya existe un servicio con ese nombre');
    }
    
    const nuevoServicio = servicioRepository.create({ nombre: nombreNormalizado });
    const servicioGuardado = await servicioRepository.save(nuevoServicio);
    
    logger.info(`createServicioService - Servicio creado con ID: ${servicioGuardado.id}`);
    return servicioGuardado;
  } catch (error) {
    logger.error('createServicioService - Error:', error);
    throw error;
  }
}

/**
 * Actualizar un servicio
 */
export async function updateServicioService(id, data) {
  try {
    const { nombre } = data;
    logger.info(`updateServicioService - Actualizando servicio ID: ${id} con nombre: ${nombre}`);
    
    const servicio = await servicioRepository.findOne({
      where: { id }
    });
    
    if (!servicio) {
      logger.warn(`updateServicioService - Servicio con ID ${id} no encontrado`);
      return null;
    }
    
    // Normalizar el nombre a minúsculas para evitar duplicados
    const nombreNormalizado = nombre.trim().toLowerCase();
    
    // Verificar si ya existe otro servicio con ese nombre normalizado
    const existingServicio = await servicioRepository.findOne({
      where: { nombre: nombreNormalizado }
    });
    
    if (existingServicio && existingServicio.id !== parseInt(id)) {
      logger.warn(`updateServicioService - Ya existe otro servicio con el nombre: ${nombreNormalizado}`);
      throw new Error('Ya existe un servicio con ese nombre');
    }
    
    servicio.nombre = nombreNormalizado;
    const servicioActualizado = await servicioRepository.save(servicio);
    
    logger.info(`updateServicioService - Servicio actualizado exitosamente`);
    return servicioActualizado;
  } catch (error) {
    logger.error('updateServicioService - Error:', error);
    throw error;
  }
}

/**
 * Eliminar un servicio
 */
export async function deleteServicioService(id) {
  try {
    logger.info(`deleteServicioService - Eliminando servicio con ID: ${id}`);
    
    const servicio = await servicioRepository.findOne({
      where: { id }
    });
    
    if (!servicio) {
      logger.warn(`deleteServicioService - Servicio con ID ${id} no encontrado`);
      return null;
    }
    
    // Verificar si hay incidentes usando este servicio
    const incidentesCount = await acudeServicioRepository.count({
      where: { idServicio: id }
    });
    
    if (incidentesCount > 0) {
      logger.warn(`deleteServicioService - No se puede eliminar el servicio ${servicio.nombre} porque está siendo usado por ${incidentesCount} incidentes`);
      throw new Error(`No se puede eliminar el servicio porque está siendo utilizado por ${incidentesCount} incidentes`);
    }
    
    await servicioRepository.remove(servicio);
    
    logger.info(`deleteServicioService - Servicio eliminado exitosamente`);
    return servicio;
  } catch (error) {
    logger.error('deleteServicioService - Error:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de uso de servicios
 */
export async function getUsageStatsService() {
  try {
    logger.info('getUsageStatsService - Obteniendo estadísticas de uso');
    
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
    
    logger.info(`getUsageStatsService - Estadísticas obtenidas para ${stats.length} servicios`);
    return stats;
  } catch (error) {
    logger.error('getUsageStatsService - Error:', error);
    throw error;
  }
}
