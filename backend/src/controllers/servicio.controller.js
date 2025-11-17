"use strict";
import { createServicioService, deleteServicioService, getAllServiciosService } from '../services/servicio.service.js';
import { handleErrorClient, handleErrorServer, handleSuccess } from '../handlers/responseHandlers.js';
import { validateCreateServicio, validateDeleteServicio } from '../validations/servicio.validation.js';
import logger from '../config/configLogger.js';

/**
 * Obtener todos los servicios con paginación
 * GET /api/servicio/
 */
export async function getAllServicios(req, res) {
  try {
    logger.info('getAllServicios - Obteniendo todos los servicios');
    
    const servicios = await getAllServiciosService();
    
    if (!servicios || servicios.length === 0) {
      logger.info('getAllServicios - No se encontraron servicios');
      return handleSuccess(res, 200, 'No se encontraron servicios', []);
    }
    
    logger.info(`getAllServicios - Se obtuvieron ${servicios.length} servicios`);
    return handleSuccess(res, 200, 'Servicios obtenidos exitosamente', servicios);
  } catch (error) {
    logger.error('getAllServicios - Error:', error);
    return handleErrorServer(res, 500, 'Error al obtener servicios');
  }
}

/**
 * Crear un nuevo servicio
 * POST /api/servicio/
 */
export async function createServicio(req, res) {
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
    logger.info(`createServicio - Creando servicio: ${nombre}`);
    
    const nuevoServicio = await createServicioService({ nombre });
    
    logger.info(`createServicio - Servicio creado con ID: ${nuevoServicio.id}`);
    return handleSuccess(res, 201, 'Servicio creado exitosamente', nuevoServicio);
  } catch (error) {
    logger.error('createServicio - Error:', error);
    
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Ya existe un servicio con ese nombre')) {
      return handleErrorClient(res, 400, 'Ya existe un servicio con ese nombre');
    }
    
    return handleErrorServer(res, 500, 'Error al crear servicio');
  }
}

/**
 * Eliminar un servicio
 * DELETE /api/servicio/:id
 */
export async function deleteServicio(req, res) {
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
    logger.info(`deleteServicio - Eliminando servicio con ID: ${id}`);
    
    const servicioEliminado = await deleteServicioService(parseInt(id));
    
    if (!servicioEliminado) {
      logger.warn(`deleteServicio - Servicio con ID ${id} no encontrado`);
      return handleErrorClient(res, 404, 'Servicio no encontrado');
    }
    
    logger.info(`deleteServicio - Servicio eliminado exitosamente`);
    return handleSuccess(res, 200, 'Servicio eliminado exitosamente', servicioEliminado);
  } catch (error) {
    logger.error('deleteServicio - Error:', error);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return handleErrorClient(res, 400, 'No se puede eliminar el servicio porque está siendo utilizado por incidentes');
    }
    
    return handleErrorServer(res, 500, 'Error al eliminar servicio');
  }
}
