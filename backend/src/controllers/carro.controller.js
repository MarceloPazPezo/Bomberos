"use strict";
import { createCarroService, deleteCarroService, getAllCarrosService, getCarrosByCompaniaService, updateCarroService } from '../services/carro.service.js';
import { handleErrorClient, handleErrorServer, handleSuccess } from '../handlers/responseHandlers.js';
import { validateCreateCarro, validateDeleteCarro, validateUpdateCarro } from '../validations/carro.validation.js';
import logger from '../config/configLogger.js';

/**
 * Obtener todos los carros
 * GET /api/carro/
 */
export async function getAllCarros(req, res) {
  try {
    logger.info('getAllCarros - Obteniendo todos los carros');
    
    const carros = await getAllCarrosService();
    
    if (!carros || carros.length === 0) {
      logger.info('getAllCarros - No se encontraron carros');
      return handleSuccess(res, 200, 'No se encontraron carros', []);
    }
    
    logger.info(`getAllCarros - Se obtuvieron ${carros.length} carros`);
    return handleSuccess(res, 200, 'Carros obtenidos exitosamente', carros);
  } catch (error) {
    logger.error('getAllCarros - Error:', error);
    return handleErrorServer(res, 500, 'Error al obtener carros');
  }
}

/**
 * Crear un nuevo carro
 * POST /api/carro/
 */
export async function createCarro(req, res) {
  try {
    // Validar datos de entrada
    const validation = validateCreateCarro(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validation.errors
      });
    }

    const { patente, capacidadPasajeros, idCompania } = validation.data;
    logger.info(`createCarro - Creando carro: ${patente}`);

    const nuevoCarro = await createCarroService({ patente, capacidadPasajeros, idCompania });

    logger.info(`createCarro - Carro creado con ID: ${nuevoCarro.id}`);
    return handleSuccess(res, 201, 'Carro creado exitosamente', nuevoCarro);
  } catch (error) {
    logger.error('createCarro - Error:', error);

    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Ya existe un carro con esa patente')) {
      return handleErrorClient(res, 400, 'Ya existe un carro con esa patente');
    }

    return handleErrorServer(res, 500, 'Error al crear carro');
  }
}

/**
 * Actualizar un carro existente
 * PATCH /api/carro/:id
 */
export async function updateCarro(req, res) {
  try {
    // Validar datos de entrada
    const validation = validateUpdateCarro(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validation.errors
      });
    }

    const { id } = req.params;
    const { patente, capacidadPasajeros, idCompania } = validation.data;
    logger.info(`updateCarro - Actualizando carro ID: ${id} con patente: ${patente}`);
    
    const carroActualizado = await updateCarroService(parseInt(id), { patente, capacidadPasajeros, idCompania });
    
    if (!carroActualizado) {
      logger.warn(`updateCarro - Carro con ID ${id} no encontrado`);
      return handleErrorClient(res, 404, 'Carro no encontrado');
    }
    
    logger.info(`updateCarro - Carro actualizado exitosamente`);
    return handleSuccess(res, 200, 'Carro actualizado exitosamente', carroActualizado);
  } catch (error) {
    logger.error('updateCarro - Error:', error);
    
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Ya existe otro carro con esa patente')) {
      return handleErrorClient(res, 400, 'Ya existe otro carro con esa patente');
    }
    
    return handleErrorServer(res, 500, 'Error al actualizar carro');
  }
}

/**
 * Eliminar un carro
 * DELETE /api/carro/:id
 */
export async function deleteCarro(req, res) {
  try {
    // Validar parámetros
    const validation = validateDeleteCarro(req.params);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación en parámetros',
        errors: validation.errors
      });
    }

    const { id } = req.params;
    logger.info(`deleteCarro - Eliminando carro con ID: ${id}`);

    const carroEliminado = await deleteCarroService(parseInt(id));

    if (!carroEliminado) {
      logger.warn(`deleteCarro - Carro con ID ${id} no encontrado`);
      return handleErrorClient(res, 404, 'Carro no encontrado');
    }

    logger.info(`deleteCarro - Carro eliminado exitosamente`);
    return handleSuccess(res, 200, 'Carro eliminado exitosamente', carroEliminado);
  } catch (error) {
    logger.error('deleteCarro - Error:', error);

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return handleErrorClient(res, 400, 'No se puede eliminar el carro porque está siendo utilizado en incidentes');
    }

    return handleErrorServer(res, 500, 'Error al eliminar carro');
  }
}

/**
 * Obtener carros por compañía
 * GET /api/carro/compania/:idCompania
 */
export async function getCarrosByCompania(req, res) {
  try {
    const { idCompania } = req.params;
    logger.info(`getCarrosByCompania - Obteniendo carros para compañía ID: ${idCompania}`);

    const carros = await getCarrosByCompaniaService(parseInt(idCompania));

    if (!carros || carros.length === 0) {
      logger.info(`getCarrosByCompania - No se encontraron carros para la compañía ${idCompania}`);
      return handleSuccess(res, 200, 'No se encontraron carros para esta compañía', []);
    }

    logger.info(`getCarrosByCompania - Se obtuvieron ${carros.length} carros para la compañía ${idCompania}`);
    return handleSuccess(res, 200, 'Carros obtenidos exitosamente', carros);
  } catch (error) {
    logger.error('getCarrosByCompania - Error:', error);
    return handleErrorServer(res, 500, 'Error al obtener carros por compañía');
  }
}
