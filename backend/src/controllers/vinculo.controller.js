"use strict";
import {
  createVinculoService,
  deleteVinculoService,
  getVinculoService,
  getVinculosService,
  updateVinculoService,
} from "../services/vinculo.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import logger from "../config/configLogger.js";

export async function getVinculo(req, res) {
  try {
    const { id } = req.params;
    
    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [vinculo, errorVinculo] = await getVinculoService(queryParams);

    if (errorVinculo) return handleErrorClient(res, 404, errorVinculo);

    handleSuccess(res, 200, "Vínculo encontrado", vinculo);
  } catch (error) {
    logger.error("Error en getVinculo:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function getVinculos(req, res) {
  try {
    const { page, limit, search } = req.query;
    const [vinculos, errorVinculos, total] = await getVinculosService({ page, limit, search });

    if (errorVinculos) return handleErrorClient(res, 404, errorVinculos);

    if (!vinculos || vinculos.length === 0) {
      return handleSuccess(res, 200, "No se encontraron vínculos", []);
    }

    handleSuccess(res, 200, "Vínculos encontrados", vinculos, total);
  } catch (error) {
    logger.error("Error en getVinculos:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateVinculo(req, res) {
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

    const [vinculo, vinculoError] = await updateVinculoService(queryParams, body);

    if (vinculoError)
      return handleErrorClient(res, 400, "Error modificando el vínculo", vinculoError);

    handleSuccess(res, 200, "Vínculo modificado correctamente", vinculo);
  } catch (error) {
    logger.error("Error en updateVinculo:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteVinculo(req, res) {
  try {
    const { id } = req.params;

    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [vinculoDelete, errorVinculoDelete] = await deleteVinculoService(queryParams);

    if (errorVinculoDelete) {
      // Si el error es porque el vínculo no existe, usar 404
      if (errorVinculoDelete === "Vínculo no encontrado") {
        return handleErrorClient(
          res,
          404,
          "Vínculo no encontrado",
          errorVinculoDelete,
        );
      }
      // Si el error es porque está asignado a contactos o pasajeros, usar 409 (Conflict)
      return handleErrorClient(
        res,
        409,
        "No se puede eliminar el vínculo",
        errorVinculoDelete,
      );
    }

    handleSuccess(res, 200, "Vínculo eliminado correctamente", vinculoDelete);
  } catch (error) {
    logger.error("Error en deleteVinculo:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function createVinculo(req, res) {
  try {
    const { body } = req;

    if (!body.nombre || body.nombre.trim().length === 0) {
      return handleErrorClient(res, 400, "El nombre es requerido");
    }

    const [vinculo, errorVinculo] = await createVinculoService(body);

    if (errorVinculo) return handleErrorClient(res, 400, errorVinculo);

    handleSuccess(res, 201, "Vínculo creado correctamente", vinculo);
  } catch (error) {
    logger.error("Error en createVinculo:", error);
    handleErrorServer(res, 500, error.message);
  }
}

