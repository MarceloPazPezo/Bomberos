"use strict";
import { AppDataSource } from '../config/configDb.js';
import logger from '../config/configLogger.js';

const carroRepository = AppDataSource.getRepository('Carro');
const esDespachadoRepository = AppDataSource.getRepository('EsDespachado');

export class CarroService {
  /**
   * Obtener todos los carros
   */
  static async getAll() {
    try {
      logger.info('CarroService.getAll - Obteniendo todos los carros');
      
      const carros = await carroRepository.find({
        select: ['id', 'patente', 'capacidadPasajeros', 'idCompania'],
        relations: ['compania'],
        order: { patente: 'ASC' }
      });
      
      // Contar incidentes por carro
      const carrosConCount = carros.map(carro => ({
        id: carro.id,
        patente: carro.patente,
        capacidadPasajeros: carro.capacidadPasajeros,
        idCompania: carro.idCompania,
        companiaNombre: carro.compania?.nombre || 'Sin compañía',
        incidentesCount: 0 // Por ahora en 0, se puede implementar después si es necesario
      }));
      
      logger.info(`CarroService.getAll - Se encontraron ${carrosConCount.length} carros`);
      return carrosConCount;
    } catch (error) {
      logger.error('CarroService.getAll - Error:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo carro
   */
  static async create(data) {
    try {
      const { patente, capacidadPasajeros, idCompania } = data;
      logger.info(`CarroService.create - Creando carro: ${patente}`);
      
      // Normalizar la patente a mayúsculas para evitar duplicados
      const patenteNormalizada = patente.trim().toUpperCase();
      
      // Verificar si ya existe un carro con esa patente
      const existingCarro = await carroRepository.findOne({
        where: { patente: patenteNormalizada }
      });
      
      if (existingCarro) {
        const error = new Error('Ya existe un carro con esa patente');
        error.code = 'ER_DUP_ENTRY';
        throw error;
      }
      
      const nuevoCarro = carroRepository.create({
        patente: patenteNormalizada,
        capacidadPasajeros: capacidadPasajeros || null,
        idCompania: parseInt(idCompania)
      });
      
      const carroGuardado = await carroRepository.save(nuevoCarro);
      
      logger.info(`CarroService.create - Carro creado con ID: ${carroGuardado.id}`);
      return carroGuardado;
    } catch (error) {
      logger.error('CarroService.create - Error:', error);
      throw error;
    }
  }

  /**
   * Actualizar un carro existente
   */
  static async update(id, data) {
    try {
      const { patente, capacidadPasajeros, idCompania } = data;
      logger.info(`CarroService.update - Actualizando carro ID: ${id}`);
      
      const carro = await carroRepository.findOne({ where: { id: parseInt(id) } });
      
      if (!carro) {
        logger.warn(`CarroService.update - Carro con ID ${id} no encontrado`);
        return null;
      }
      
      // Normalizar la patente a mayúsculas
      const patenteNormalizada = patente.trim().toUpperCase();
      
      // Verificar si ya existe otro carro con esa patente (excluyendo el actual)
      const existingCarro = await carroRepository.findOne({
        where: { patente: patenteNormalizada }
      });
      
      if (existingCarro && existingCarro.id !== parseInt(id)) {
        const error = new Error('Ya existe otro carro con esa patente');
        error.code = 'ER_DUP_ENTRY';
        throw error;
      }
      
      carro.patente = patenteNormalizada;
      carro.capacidadPasajeros = capacidadPasajeros || null;
      carro.idCompania = parseInt(idCompania);
      
      const carroActualizado = await carroRepository.save(carro);
      
      logger.info(`CarroService.update - Carro actualizado exitosamente`);
      return carroActualizado;
    } catch (error) {
      logger.error('CarroService.update - Error:', error);
      throw error;
    }
  }

  /**
   * Eliminar un carro
   */
  static async delete(id) {
    try {
      logger.info(`CarroService.delete - Eliminando carro con ID: ${id}`);
      
      const carro = await carroRepository.findOne({ where: { id: parseInt(id) } });
      
      if (!carro) {
        logger.warn(`CarroService.delete - Carro con ID ${id} no encontrado`);
        return null;
      }
      
      // Verificar si el carro está siendo utilizado en incidentes
      const incidentesCount = await esDespachadoRepository.count({
        where: { idCarro: parseInt(id) }
      });
      
      if (incidentesCount > 0) {
        const error = new Error('No se puede eliminar el carro porque está siendo utilizado en incidentes');
        error.code = 'ER_ROW_IS_REFERENCED_2';
        throw error;
      }
      
      await carroRepository.remove(carro);
      
      logger.info(`CarroService.delete - Carro eliminado exitosamente`);
      return carro;
    } catch (error) {
      logger.error('CarroService.delete - Error:', error);
      throw error;
    }
  }

  /**
   * Obtener carros por compañía
   */
  static async getByCompania(idCompania) {
    try {
      logger.info(`CarroService.getByCompania - Obteniendo carros para compañía ID: ${idCompania}`);
      
      const carros = await carroRepository.find({
        select: ['id', 'patente', 'capacidadPasajeros', 'idCompania'],
        where: { idCompania: parseInt(idCompania) },
        order: { patente: 'ASC' }
      });
      
      logger.info(`CarroService.getByCompania - Se encontraron ${carros.length} carros para la compañía ${idCompania}`);
      return carros;
    } catch (error) {
      logger.error('CarroService.getByCompania - Error:', error);
      throw error;
    }
  }
}

export const carroService = CarroService;