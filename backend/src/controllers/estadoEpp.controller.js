"use strict";
import {
  createEstadoEppService,
  deleteEstadoEppService,
  getEstadoEppService,
  getEstadosEppService,
  updateEstadoEppService,
} from "../services/estadoEpp.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import logger from "../config/configLogger.js";

export async function getEstadoEpp(req, res) {
  try {
    const { id } = req.params;
    
    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [estadoEpp, errorEstadoEpp] = await getEstadoEppService(queryParams);

    if (errorEstadoEpp) return handleErrorClient(res, 404, errorEstadoEpp);

    handleSuccess(res, 200, "Estado de EPP encontrado", estadoEpp);
  } catch (error) {
    logger.error("Error en getEstadoEpp:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function getEstadosEpp(req, res) {
  try {
    const { page, limit, search } = req.query;
    const [estadosEpp, errorEstadosEpp, total] = await getEstadosEppService({ page, limit, search });

    if (errorEstadosEpp) return handleErrorClient(res, 404, errorEstadosEpp);

    if (!estadosEpp || estadosEpp.length === 0) {
      return handleSuccess(res, 200, "No se encontraron estados de EPP", []);
    }

    handleSuccess(res, 200, "Estados de EPP encontrados", estadosEpp, total);
  } catch (error) {
    logger.error("Error en getEstadosEpp:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateEstadoEpp(req, res) {
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

    const [estadoEpp, estadoEppError] = await updateEstadoEppService(queryParams, body);

    if (estadoEppError)
      return handleErrorClient(res, 400, "Error modificando el estado de EPP", estadoEppError);

    handleSuccess(res, 200, "Estado de EPP modificado correctamente", estadoEpp);
  } catch (error) {
    logger.error("Error en updateEstadoEpp:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteEstadoEpp(req, res) {
  try {
    const { id } = req.params;

    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [estadoEppDelete, errorEstadoEppDelete] = await deleteEstadoEppService(queryParams);

    if (errorEstadoEppDelete) {
      // Si el error es porque el estado de EPP no existe, usar 404
      if (errorEstadoEppDelete === "Estado de EPP no encontrado") {
        return handleErrorClient(
          res,
          404,
          "Estado de EPP no encontrado",
          errorEstadoEppDelete,
        );
      }
      // Si el error es porque está asignado a EPP, usar 409 (Conflict)
      return handleErrorClient(
        res,
        409,
        "No se puede eliminar el estado de EPP",
        errorEstadoEppDelete,
      );
    }

    handleSuccess(res, 200, "Estado de EPP eliminado correctamente", estadoEppDelete);
  } catch (error) {
    logger.error("Error en deleteEstadoEpp:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function createEstadoEpp(req, res) {
  try {
    const { body } = req;

    if (!body.nombre || body.nombre.trim().length === 0) {
      return handleErrorClient(res, 400, "El nombre es requerido");
    }

    const [estadoEpp, errorEstadoEpp] = await createEstadoEppService(body);

    if (errorEstadoEpp) return handleErrorClient(res, 400, errorEstadoEpp);

    handleSuccess(res, 201, "Estado de EPP creado correctamente", estadoEpp);
  } catch (error) {
    logger.error("Error en createEstadoEpp:", error);
    handleErrorServer(res, 500, error.message);
  }
}

