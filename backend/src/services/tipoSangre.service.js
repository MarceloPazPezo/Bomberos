"use strict";
import { AppDataSource } from "../config/configDb.js";
import logger from "../config/configLogger.js";

/**
 * Obtiene todos los tipos de sangre disponibles
 * @returns {Promise<Array>} [tiposSangre, error]
 */
export async function getTiposSangreService() {
  try {
    logger.info("getTiposSangreService - Obteniendo tipos de sangre");
    
    const tipoSangreRepository = AppDataSource.getRepository("TipoSangre");
    
    const tiposSangre = await tipoSangreRepository.find({
      order: { nombre: "ASC" }
    });

    logger.info(`getTiposSangreService - Se obtuvieron ${tiposSangre.length} tipos de sangre`);
    return [tiposSangre, null];
  } catch (error) {
    logger.error("getTiposSangreService - Error:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtiene un tipo de sangre por su ID
 * @param {number} id - ID del tipo de sangre
 * @returns {Promise<Array>} [tipoSangre, error]
 */
export async function getTipoSangreByIdService(id) {
  try {
    logger.info(`getTipoSangreByIdService - Obteniendo tipo de sangre con ID: ${id}`);
    
    const tipoSangreRepository = AppDataSource.getRepository("TipoSangre");
    
    const tipoSangre = await tipoSangreRepository.findOne({
      where: { id }
    });

    if (!tipoSangre) {
      logger.warn(`getTipoSangreByIdService - Tipo de sangre con ID ${id} no encontrado`);
      return [null, "Tipo de sangre no encontrado"];
    }

    logger.info(`getTipoSangreByIdService - Tipo de sangre encontrado: ${tipoSangre.nombre}`);
    return [tipoSangre, null];
  } catch (error) {
    logger.error("getTipoSangreByIdService - Error:", error);
    return [null, "Error interno del servidor"];
  }
}
