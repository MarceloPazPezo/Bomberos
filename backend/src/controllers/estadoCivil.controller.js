"use strict";
import { createEstadoCivilService, deleteEstadoCivilService, getAllEstadosCivilesService } from '../services/estadoCivil.service.js';
import { handleErrorClient, handleErrorServer, handleSuccess } from '../handlers/responseHandlers.js';
import logger from '../config/configLogger.js';

/**
 * Obtener todos los estados civiles con paginación
 * GET /api/estado-civil/
 */
export async function getAllEstadosCiviles(req, res) {
  try {
    logger.info('getAllEstadosCiviles - Obteniendo todos los estados civiles');
    
    const estadosCiviles = await getAllEstadosCivilesService();
    
    if (!estadosCiviles || estadosCiviles.length === 0) {
      logger.info('getAllEstadosCiviles - No se encontraron estados civiles');
      return handleSuccess(res, 200, 'No se encontraron estados civiles', []);
    }
    
    logger.info(`getAllEstadosCiviles - Se obtuvieron ${estadosCiviles.length} estados civiles`);
    return handleSuccess(res, 200, 'Estados civiles obtenidos exitosamente', estadosCiviles);
  } catch (error) {
    logger.error('getAllEstadosCiviles - Error:', error);
    return handleErrorServer(res, 500, 'Error al obtener estados civiles');
  }
}

/**
 * Crear un nuevo estado civil
 * POST /api/estado-civil/
 */
export async function createEstadoCivil(req, res) {
  try {
    const { nombre } = req.body;
    logger.info(`createEstadoCivil - Creando estado civil: ${nombre}`);
    
    const nuevoEstadoCivil = await createEstadoCivilService({ nombre });
    
    logger.info(`createEstadoCivil - Estado civil creado con ID: ${nuevoEstadoCivil.id}`);
    return handleSuccess(res, 201, 'Estado civil creado exitosamente', nuevoEstadoCivil);
  } catch (error) {
    logger.error('createEstadoCivil - Error:', error);
    
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Ya existe un estado civil con ese nombre')) {
      return handleErrorClient(res, 400, 'Ya existe un estado civil con ese nombre');
    }
    
    return handleErrorServer(res, 500, 'Error al crear estado civil');
  }
}

/**
 * Eliminar un estado civil
 * DELETE /api/estado-civil/:id
 */
export async function deleteEstadoCivil(req, res) {
  try {
    const { id } = req.params;
    logger.info(`deleteEstadoCivil - Eliminando estado civil con ID: ${id}`);
    
    const estadoCivilEliminado = await deleteEstadoCivilService(parseInt(id));
    
    if (!estadoCivilEliminado) {
      logger.warn(`deleteEstadoCivil - Estado civil con ID ${id} no encontrado`);
      return handleErrorClient(res, 404, 'Estado civil no encontrado');
    }
    
    logger.info(`deleteEstadoCivil - Estado civil eliminado exitosamente`);
    return handleSuccess(res, 200, 'Estado civil eliminado exitosamente', estadoCivilEliminado);
  } catch (error) {
    logger.error('deleteEstadoCivil - Error:', error);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return handleErrorClient(res, 400, 'No se puede eliminar el estado civil porque está siendo utilizado por afectados');
    }
    
    return handleErrorServer(res, 500, 'Error al eliminar estado civil');
  }
}
