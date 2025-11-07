"use strict";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import {
  getClasificacionEmergenciaService,
  getClasificacionesEmergenciaService,
  createClasificacionEmergenciaService,
  updateClasificacionEmergenciaService,
  deleteClasificacionEmergenciaService
} from "../services/clasificacionEmergencia.service.js";
import logger from "../config/configLogger.js";

export async function getClasificacionEmergencia(req, res) {
  try {
    const { id } = req.params;
    
    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [clasificacion, errorClasificacion] = await getClasificacionEmergenciaService(queryParams);

    if (errorClasificacion) return handleErrorClient(res, 404, errorClasificacion);

    handleSuccess(res, 200, "Clasificación de emergencia encontrada", clasificacion);
  } catch (error) {
    logger.error("Error en getClasificacionEmergencia:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function getClasificacionesEmergencia(req, res) {
  try {
    const { page, limit } = req.query;
    const [clasificaciones, errorClasificaciones, total] = await getClasificacionesEmergenciaService({ 
      page, 
      limit
    });

    if (errorClasificaciones) return handleErrorClient(res, 404, errorClasificaciones);

    if (!clasificaciones || clasificaciones.length === 0) {
      return handleSuccess(res, 200, "No se encontraron clasificaciones de emergencia", []);
    }

    handleSuccess(res, 200, "Clasificaciones de emergencia encontradas", clasificaciones, total);
  } catch (error) {
    logger.error("Error en getClasificacionesEmergencia:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateClasificacionEmergencia(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const queryParams = {
      id: parseInt(id, 10),
    };

    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [clasificacion, clasificacionError] = await updateClasificacionEmergenciaService(queryParams, body);

    if (clasificacionError)
      return handleErrorClient(res, 400, "Error modificando la clasificación de emergencia", clasificacionError);

    handleSuccess(res, 200, "Clasificación de emergencia modificada correctamente", clasificacion);
  } catch (error) {
    logger.error("Error en updateClasificacionEmergencia:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteClasificacionEmergencia(req, res) {
  try {
    const { id } = req.params;

    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [clasificacionDelete, errorClasificacionDelete] = await deleteClasificacionEmergenciaService(queryParams);

    if (errorClasificacionDelete) {
      // Si el error es porque la clasificación no existe, usar 404
      if (errorClasificacionDelete === "Clasificación de emergencia no encontrada") {
        return handleErrorClient(
          res,
          404,
          "Clasificación de emergencia no encontrada",
          errorClasificacionDelete,
        );
      }
      // Si el error es porque está asignada a subtipos, usar 409 (Conflict)
      return handleErrorClient(
        res,
        409,
        "No se puede eliminar la clasificación de emergencia",
        errorClasificacionDelete,
      );
    }

    handleSuccess(res, 200, "Clasificación de emergencia eliminada correctamente", clasificacionDelete);
  } catch (error) {
    logger.error("Error en deleteClasificacionEmergencia:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function createClasificacionEmergencia(req, res) {
  try {
    const { body } = req;

    if (!body.nombre || body.nombre.trim().length === 0) {
      return handleErrorClient(res, 400, "El nombre es requerido");
    }

    const [clasificacion, errorClasificacion] = await createClasificacionEmergenciaService(body);

    if (errorClasificacion) return handleErrorClient(res, 400, errorClasificacion);

    handleSuccess(res, 201, "Clasificación de emergencia creada correctamente", clasificacion);
  } catch (error) {
    logger.error("Error en createClasificacionEmergencia:", error);
    handleErrorServer(res, 500, error.message);
  }
}

