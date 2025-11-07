"use strict";
import {
  createTipoEppService,
  deleteTipoEppService,
  getTipoEppService,
  getTiposEppService,
  updateTipoEppService,
} from "../services/tipoEpp.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import logger from "../config/configLogger.js";

export async function getTipoEpp(req, res) {
  try {
    const { id } = req.params;
    
    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [tipoEpp, errorTipoEpp] = await getTipoEppService(queryParams);

    if (errorTipoEpp) return handleErrorClient(res, 404, errorTipoEpp);

    handleSuccess(res, 200, "Tipo de EPP encontrado", tipoEpp);
  } catch (error) {
    logger.error("Error en getTipoEpp:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function getTiposEpp(req, res) {
  try {
    const { page, limit, search } = req.query;
    const [tiposEpp, errorTiposEpp, total] = await getTiposEppService({ page, limit, search });

    if (errorTiposEpp) return handleErrorClient(res, 404, errorTiposEpp);

    if (!tiposEpp || tiposEpp.length === 0) {
      return handleSuccess(res, 200, "No se encontraron tipos de EPP", []);
    }

    handleSuccess(res, 200, "Tipos de EPP encontrados", tiposEpp, total);
  } catch (error) {
    logger.error("Error en getTiposEpp:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateTipoEpp(req, res) {
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

    const [tipoEpp, tipoEppError] = await updateTipoEppService(queryParams, body);

    if (tipoEppError)
      return handleErrorClient(res, 400, "Error modificando el tipo de EPP", tipoEppError);

    handleSuccess(res, 200, "Tipo de EPP modificado correctamente", tipoEpp);
  } catch (error) {
    logger.error("Error en updateTipoEpp:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteTipoEpp(req, res) {
  try {
    const { id } = req.params;

    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [tipoEppDelete, errorTipoEppDelete] = await deleteTipoEppService(queryParams);

    if (errorTipoEppDelete) {
      // Si el error es porque el tipo de EPP no existe, usar 404
      if (errorTipoEppDelete === "Tipo de EPP no encontrado") {
        return handleErrorClient(
          res,
          404,
          "Tipo de EPP no encontrado",
          errorTipoEppDelete,
        );
      }
      // Si el error es porque está asignado a EPP, usar 409 (Conflict)
      return handleErrorClient(
        res,
        409,
        "No se puede eliminar el tipo de EPP",
        errorTipoEppDelete,
      );
    }

    handleSuccess(res, 200, "Tipo de EPP eliminado correctamente", tipoEppDelete);
  } catch (error) {
    logger.error("Error en deleteTipoEpp:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function createTipoEpp(req, res) {
  try {
    const { body } = req;

    if (!body.nombre || body.nombre.trim().length === 0) {
      return handleErrorClient(res, 400, "El nombre es requerido");
    }

    const [tipoEpp, errorTipoEpp] = await createTipoEppService(body);

    if (errorTipoEpp) return handleErrorClient(res, 400, errorTipoEpp);

    handleSuccess(res, 201, "Tipo de EPP creado correctamente", tipoEpp);
  } catch (error) {
    logger.error("Error en createTipoEpp:", error);
    handleErrorServer(res, 500, error.message);
  }
}

