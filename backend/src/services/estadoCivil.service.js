"use strict";
import { AppDataSource } from '../config/configDb.js';
import logger from '../config/configLogger.js';

const estadoCivilRepository = AppDataSource.getRepository('EstadoCivil');
const afectadoRepository = AppDataSource.getRepository('Afectado');

/**
 * Obtener todos los estados civiles con paginación
 */
export async function getAllEstadosCivilesService(queryParams = {}) {
  try {
    logger.info('getAllEstadosCivilesService - Obteniendo estados civiles con paginación');
    
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
    
    logger.info(`getAllEstadosCivilesService - Se encontraron ${estadosCivilesConCount.length} estados civiles`);
    return estadosCivilesConCount;
  } catch (error) {
    logger.error('getAllEstadosCivilesService - Error:', error);
    throw error;
  }
}

/**
 * Obtener un estado civil por ID
 */
export async function getEstadoCivilByIdService(id) {
  try {
    logger.info(`getEstadoCivilByIdService - Obteniendo estado civil con ID: ${id}`);
    
    const estadoCivil = await estadoCivilRepository.findOne({
      where: { id }
    });
    
    if (!estadoCivil) {
      logger.warn(`getEstadoCivilByIdService - Estado civil con ID ${id} no encontrado`);
      return null;
    }
    
    logger.info(`getEstadoCivilByIdService - Estado civil encontrado: ${estadoCivil.nombre}`);
    return estadoCivil;
  } catch (error) {
    logger.error('getEstadoCivilByIdService - Error:', error);
    throw error;
  }
}

/**
 * Crear un nuevo estado civil
 */
export async function createEstadoCivilService(data) {
  try {
    const { nombre } = data;
    logger.info(`createEstadoCivilService - Creando estado civil: ${nombre}`);
    
    // Normalizar el nombre a minúsculas para evitar duplicados
    const nombreNormalizado = nombre.trim().toLowerCase();
    
    // Verificar si ya existe un estado civil con ese nombre normalizado
    const existingEstadoCivil = await estadoCivilRepository.findOne({
      where: { nombre: nombreNormalizado }
    });
    
    if (existingEstadoCivil) {
      logger.warn(`createEstadoCivilService - Ya existe un estado civil con el nombre: ${nombreNormalizado}`);
      throw new Error('Ya existe un estado civil con ese nombre');
    }
    
    const nuevoEstadoCivil = estadoCivilRepository.create({ nombre: nombreNormalizado });
    const estadoCivilGuardado = await estadoCivilRepository.save(nuevoEstadoCivil);
    
    logger.info(`createEstadoCivilService - Estado civil creado con ID: ${estadoCivilGuardado.id}`);
    return estadoCivilGuardado;
  } catch (error) {
    logger.error('createEstadoCivilService - Error:', error);
    throw error;
  }
}

/**
 * Actualizar un estado civil
 */
export async function updateEstadoCivilService(id, data) {
  try {
    const { nombre } = data;
    logger.info(`updateEstadoCivilService - Actualizando estado civil ID: ${id} con nombre: ${nombre}`);
    
    const estadoCivil = await estadoCivilRepository.findOne({
      where: { id }
    });
    
    if (!estadoCivil) {
      logger.warn(`updateEstadoCivilService - Estado civil con ID ${id} no encontrado`);
      return null;
    }
    
    // Normalizar el nombre a minúsculas para evitar duplicados
    const nombreNormalizado = nombre.trim().toLowerCase();
    
    // Verificar si ya existe otro estado civil con ese nombre normalizado
    const existingEstadoCivil = await estadoCivilRepository.findOne({
      where: { nombre: nombreNormalizado }
    });
    
    if (existingEstadoCivil && existingEstadoCivil.id !== parseInt(id)) {
      logger.warn(`updateEstadoCivilService - Ya existe otro estado civil con el nombre: ${nombreNormalizado}`);
      throw new Error('Ya existe un estado civil con ese nombre');
    }
    
    estadoCivil.nombre = nombreNormalizado;
    const estadoCivilActualizado = await estadoCivilRepository.save(estadoCivil);
    
    logger.info(`updateEstadoCivilService - Estado civil actualizado exitosamente`);
    return estadoCivilActualizado;
  } catch (error) {
    logger.error('updateEstadoCivilService - Error:', error);
    throw error;
  }
}

/**
 * Eliminar un estado civil
 */
export async function deleteEstadoCivilService(id) {
  try {
    logger.info(`deleteEstadoCivilService - Eliminando estado civil con ID: ${id}`);
    
    const estadoCivil = await estadoCivilRepository.findOne({
      where: { id }
    });
    
    if (!estadoCivil) {
      logger.warn(`deleteEstadoCivilService - Estado civil con ID ${id} no encontrado`);
      return null;
    }
    
    // Verificar si hay afectados usando este estado civil
    const afectadosCount = await afectadoRepository.count({
      where: { idEstadoCivil: id }
    });
    
    if (afectadosCount > 0) {
      logger.warn(`deleteEstadoCivilService - No se puede eliminar el estado civil ${estadoCivil.nombre} porque está siendo usado por ${afectadosCount} afectados`);
      throw new Error(`No se puede eliminar el estado civil porque está siendo utilizado por ${afectadosCount} afectados`);
    }
    
    await estadoCivilRepository.remove(estadoCivil);
    
    logger.info(`deleteEstadoCivilService - Estado civil eliminado exitosamente`);
    return estadoCivil;
  } catch (error) {
    logger.error('deleteEstadoCivilService - Error:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de uso de estados civiles
 */
export async function getUsageStatsService() {
  try {
    logger.info('getUsageStatsService - Obteniendo estadísticas de uso');
    
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
    
    logger.info(`getUsageStatsService - Estadísticas obtenidas para ${stats.length} estados civiles`);
    return stats;
  } catch (error) {
    logger.error('getUsageStatsService - Error:', error);
    throw error;
  }
}
