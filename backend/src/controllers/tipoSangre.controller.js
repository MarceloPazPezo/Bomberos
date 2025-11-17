"use strict";
import { getTipoSangreByIdService, getTiposSangreService } from "../services/tipoSangre.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import logger from "../config/configLogger.js";

/**
 * Obtiene todos los tipos de sangre
 * GET /api/tipo-sangre/
 */
export async function getTiposSangre(req, res) {
  try {
    logger.info("getTiposSangre - Obteniendo tipos de sangre");
    
    const [tiposSangre, error] = await getTiposSangreService();
    
    if (error) {
      logger.error("getTiposSangre - Error:", error);
      return handleErrorServer(res, 500, error);
    }

    logger.info(`getTiposSangre - Se obtuvieron ${tiposSangre.length} tipos de sangre`);
    return handleSuccess(res, 200, "Tipos de sangre obtenidos exitosamente", tiposSangre);
  } catch (error) {
    logger.error("getTiposSangre - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Obtiene un tipo de sangre por ID
 * GET /api/tipo-sangre/:id
 */
export async function getTipoSangreById(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, "ID de tipo de sangre inválido");
    }

    const idTipoSangre = parseInt(id);
    logger.info(`getTipoSangreById - Obteniendo tipo de sangre con ID: ${idTipoSangre}`);
    
    const [tipoSangre, error] = await getTipoSangreByIdService(idTipoSangre);
    
    if (error) {
      if (error === "Tipo de sangre no encontrado") {
        logger.warn(`getTipoSangreById - Tipo de sangre con ID ${idTipoSangre} no encontrado`);
        return handleErrorClient(res, 404, error);
      }
      logger.error("getTipoSangreById - Error:", error);
      return handleErrorServer(res, 500, error);
    }

    logger.info(`getTipoSangreById - Tipo de sangre encontrado: ${tipoSangre.nombre}`);
    return handleSuccess(res, 200, "Tipo de sangre obtenido exitosamente", tipoSangre);
  } catch (error) {
    logger.error("getTipoSangreById - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}
