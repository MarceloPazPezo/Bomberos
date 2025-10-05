"use strict";
import { carroService } from '../services/carro.service.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';
import { validateCreateCarro, validateUpdateCarro, validateDeleteCarro } from '../validations/carro.validation.js';
import logger from '../config/configLogger.js';

/**
 * Controlador para gestión de carros
 */
export class CarroController {
  /**
   * Obtener todos los carros
   */
  static async getAll(req, res) {
    try {
      logger.info('CarroController.getAll - Obteniendo todos los carros');
      
      const carros = await carroService.getAll();
      
      if (!carros || carros.length === 0) {
        logger.info('CarroController.getAll - No se encontraron carros');
        return handleSuccess(res, 200, 'No se encontraron carros', []);
      }
      
      logger.info(`CarroController.getAll - Se obtuvieron ${carros.length} carros`);
      return handleSuccess(res, 200, 'Carros obtenidos exitosamente', carros);
    } catch (error) {
      logger.error('CarroController.getAll - Error:', error);
      return handleErrorServer(res, 500, 'Error al obtener carros');
    }
  }

  /**
   * Crear un nuevo carro
   */
  static async create(req, res) {
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
      logger.info(`CarroController.create - Creando carro: ${patente}`);

      const nuevoCarro = await carroService.create({ patente, capacidadPasajeros, idCompania });

      logger.info(`CarroController.create - Carro creado con ID: ${nuevoCarro.id}`);
      return handleSuccess(res, 201, 'Carro creado exitosamente', nuevoCarro);
    } catch (error) {
      logger.error('CarroController.create - Error:', error);

      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Ya existe un carro con esa patente')) {
        return handleErrorClient(res, 400, 'Ya existe un carro con esa patente');
      }

      return handleErrorServer(res, 500, 'Error al crear carro');
    }
  }

  /**
   * Actualizar un carro existente
   */
  static async update(req, res) {
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
      logger.info(`CarroController.update - Actualizando carro ID: ${id} con patente: ${patente}`);
      
      const carroActualizado = await carroService.update(parseInt(id), { patente, capacidadPasajeros, idCompania });
      
      if (!carroActualizado) {
        logger.warn(`CarroController.update - Carro con ID ${id} no encontrado`);
        return handleErrorClient(res, 404, 'Carro no encontrado');
      }
      
      logger.info(`CarroController.update - Carro actualizado exitosamente`);
      return handleSuccess(res, 200, 'Carro actualizado exitosamente', carroActualizado);
    } catch (error) {
      logger.error('CarroController.update - Error:', error);
      
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Ya existe otro carro con esa patente')) {
        return handleErrorClient(res, 400, 'Ya existe otro carro con esa patente');
      }
      
      return handleErrorServer(res, 500, 'Error al actualizar carro');
    }
  }

  /**
   * Eliminar un carro
   */
  static async delete(req, res) {
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
      logger.info(`CarroController.delete - Eliminando carro con ID: ${id}`);

      const carroEliminado = await carroService.delete(parseInt(id));

      if (!carroEliminado) {
        logger.warn(`CarroController.delete - Carro con ID ${id} no encontrado`);
        return handleErrorClient(res, 404, 'Carro no encontrado');
      }

      logger.info(`CarroController.delete - Carro eliminado exitosamente`);
      return handleSuccess(res, 200, 'Carro eliminado exitosamente', carroEliminado);
    } catch (error) {
      logger.error('CarroController.delete - Error:', error);

      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return handleErrorClient(res, 400, 'No se puede eliminar el carro porque está siendo utilizado en incidentes');
      }

      return handleErrorServer(res, 500, 'Error al eliminar carro');
    }
  }

  /**
   * Obtener carros por compañía
   */
  static async getByCompania(req, res) {
    try {
      const { idCompania } = req.params;
      logger.info(`CarroController.getByCompania - Obteniendo carros para compañía ID: ${idCompania}`);

      const carros = await carroService.getByCompania(parseInt(idCompania));

      if (!carros || carros.length === 0) {
        logger.info(`CarroController.getByCompania - No se encontraron carros para la compañía ${idCompania}`);
        return handleSuccess(res, 200, 'No se encontraron carros para esta compañía', []);
      }

      logger.info(`CarroController.getByCompania - Se obtuvieron ${carros.length} carros para la compañía ${idCompania}`);
      return handleSuccess(res, 200, 'Carros obtenidos exitosamente', carros);
    } catch (error) {
      logger.error('CarroController.getByCompania - Error:', error);
      return handleErrorServer(res, 500, 'Error al obtener carros por compañía');
    }
  }
}