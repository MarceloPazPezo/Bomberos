"use strict";
import {
  createClaveRadialService,
  deleteClaveRadialService,
  getClaveRadialService,
  getClavesRadialesService,
  updateClaveRadialService,
} from "../services/claveRadial.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import logger from "../config/configLogger.js";

export async function getClaveRadial(req, res) {
  try {
    const { id } = req.params;
    
    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [claveRadial, errorClaveRadial] = await getClaveRadialService(queryParams);

    if (errorClaveRadial) return handleErrorClient(res, 404, errorClaveRadial);

    handleSuccess(res, 200, "Clave radial encontrada", claveRadial);
  } catch (error) {
    logger.error("Error en getClaveRadial:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function getClavesRadiales(req, res) {
  try {
    const { page, limit, search } = req.query;
    const [clavesRadiales, errorClavesRadiales, total] = await getClavesRadialesService({ page, limit, search });

    if (errorClavesRadiales) return handleErrorClient(res, 404, errorClavesRadiales);

    if (!clavesRadiales || clavesRadiales.length === 0) {
      return handleSuccess(res, 200, "No se encontraron claves radiales", []);
    }

    handleSuccess(res, 200, "Claves radiales encontradas", clavesRadiales, total);
  } catch (error) {
    logger.error("Error en getClavesRadiales:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateClaveRadial(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const queryParams = {
      id: parseInt(id, 10),
    };

    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    if (!body.nombre || body.nombre.trim().length === 0) {
      return handleErrorClient(res, 400, "El nombre es requerido");
    }

    const [claveRadial, claveRadialError] = await updateClaveRadialService(queryParams, body);

    if (claveRadialError)
      return handleErrorClient(res, 400, "Error modificando la clave radial", claveRadialError);

    handleSuccess(res, 200, "Clave radial modificada correctamente", claveRadial);
  } catch (error) {
    logger.error("Error en updateClaveRadial:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteClaveRadial(req, res) {
  try {
    const { id } = req.params;

    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [claveRadialDelete, errorClaveRadialDelete] = await deleteClaveRadialService(queryParams);

    if (errorClaveRadialDelete) {
      // Si el error es porque la clave radial no existe, usar 404
      if (errorClaveRadialDelete === "Clave radial no encontrada") {
        return handleErrorClient(
          res,
          404,
          "Clave radial no encontrada",
          errorClaveRadialDelete,
        );
      }
      // Si el error es porque está asignada a subtipos, usar 409 (Conflict)
      return handleErrorClient(
        res,
        409,
        "No se puede eliminar la clave radial",
        errorClaveRadialDelete,
      );
    }

    handleSuccess(res, 200, "Clave radial eliminada correctamente", claveRadialDelete);
  } catch (error) {
    logger.error("Error en deleteClaveRadial:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function createClaveRadial(req, res) {
  try {
    const { body } = req;

    if (!body.nombre || body.nombre.trim().length === 0) {
      return handleErrorClient(res, 400, "El nombre es requerido");
    }

    const [claveRadial, errorClaveRadial] = await createClaveRadialService(body);

    if (errorClaveRadial) return handleErrorClient(res, 400, errorClaveRadial);

    handleSuccess(res, 201, "Clave radial creada correctamente", claveRadial);
  } catch (error) {
    logger.error("Error en createClaveRadial:", error);
    handleErrorServer(res, 500, error.message);
  }
}

