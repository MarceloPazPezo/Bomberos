"use strict";
import {
  createTipoCapacitacionService,
  deleteTipoCapacitacionService,
  getTipoCapacitacionService,
  getTiposCapacitacionService,
  updateTipoCapacitacionService,
} from "../services/tipoCapacitacion.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import logger from "../config/configLogger.js";

export async function getTipoCapacitacion(req, res) {
  try {
    const { id } = req.params;

    const queryParams = {
      id: parseInt(id, 10),
    };

    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [tipoCapacitacion, errorTipoCapacitacion] = await getTipoCapacitacionService(
      queryParams
    );

    if (errorTipoCapacitacion)
      return handleErrorClient(res, 404, errorTipoCapacitacion);

    handleSuccess(res, 200, "Tipo de capacitación encontrado", tipoCapacitacion);
  } catch (error) {
    logger.error("Error en getTipoCapacitacion:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function getTiposCapacitacion(req, res) {
  try {
    const { page, limit, search } = req.query;
    const [tiposCapacitacion, errorTiposCapacitacion, total] =
      await getTiposCapacitacionService({ page, limit, search });

    if (errorTiposCapacitacion)
      return handleErrorClient(res, 404, errorTiposCapacitacion);

    if (!tiposCapacitacion || tiposCapacitacion.length === 0) {
      return handleSuccess(res, 200, "No se encontraron tipos de capacitación", []);
    }

    handleSuccess(res, 200, "Tipos de capacitación encontrados", tiposCapacitacion, total);
  } catch (error) {
    logger.error("Error en getTiposCapacitacion:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function createTipoCapacitacion(req, res) {
  try {
    const { body } = req;

    if (!body.nombre || body.nombre.trim().length === 0) {
      return handleErrorClient(res, 400, "El nombre es requerido");
    }

    const [tipoCapacitacion, errorTipoCapacitacion] =
      await createTipoCapacitacionService(body);

    if (errorTipoCapacitacion)
      return handleErrorClient(res, 400, errorTipoCapacitacion);

    handleSuccess(res, 201, "Tipo de capacitación creado correctamente", tipoCapacitacion);
  } catch (error) {
    logger.error("Error en createTipoCapacitacion:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateTipoCapacitacion(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const queryParams = {
      id: parseInt(id, 10),
    };

    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [tipoCapacitacion, tipoCapacitacionError] =
      await updateTipoCapacitacionService(queryParams, body);

    if (tipoCapacitacionError)
      return handleErrorClient(
        res,
        400,
        "Error modificando el tipo de capacitación",
        tipoCapacitacionError
      );

    handleSuccess(res, 200, "Tipo de capacitación modificado correctamente", tipoCapacitacion);
  } catch (error) {
    logger.error("Error en updateTipoCapacitacion:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteTipoCapacitacion(req, res) {
  try {
    const { id } = req.params;

    const queryParams = {
      id: parseInt(id, 10),
    };

    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [tipoCapacitacionDelete, errorTipoCapacitacionDelete] =
      await deleteTipoCapacitacionService(queryParams);

    if (errorTipoCapacitacionDelete) {
      if (errorTipoCapacitacionDelete === "Tipo de capacitación no encontrado") {
        return handleErrorClient(res, 404, "Tipo de capacitación no encontrado", errorTipoCapacitacionDelete);
      }
      return handleErrorClient(
        res,
        409,
        "No se puede eliminar el tipo de capacitación",
        errorTipoCapacitacionDelete
      );
    }

    handleSuccess(res, 200, "Tipo de capacitación eliminado correctamente", tipoCapacitacionDelete);
  } catch (error) {
    logger.error("Error en deleteTipoCapacitacion:", error);
    handleErrorServer(res, 500, error.message);
  }
}

