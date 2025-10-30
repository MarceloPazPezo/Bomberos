"use strict";
import {
  createTipoEventoService,
  deleteTipoEventoService,
  getTipoEventoService,
  getTiposEventoService,
  updateTipoEventoService,
} from "../services/tipoEvento.service.js";
import {
  tipoEventoBodyValidation,
  tipoEventoCreateValidation,
  tipoEventoQueryValidation,
} from "../validations/tipoEvento.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getTipoEvento(req, res) {
  try {
    const { id } = req.params;
    
    // Convertir id a número
    const queryParams = {
      id: parseInt(id, 10),
    };
    
    const { error } = tipoEventoQueryValidation.validate(queryParams);

    if (error) return handleErrorClient(res, 400, error.message);

    const [tipoEvento, errorTipoEvento] = await getTipoEventoService(queryParams);

    if (errorTipoEvento) return handleErrorClient(res, 404, errorTipoEvento);

    handleSuccess(res, 200, "Tipo de evento encontrado", tipoEvento);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getTiposEvento(req, res) {
  try {
    const { page, limit } = req.query;
    const [tiposEvento, errorTiposEvento] = await getTiposEventoService({ page, limit });

    if (errorTiposEvento) return handleErrorClient(res, 404, errorTiposEvento);

    tiposEvento.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Tipos de evento encontrados", tiposEvento);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateTipoEvento(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    // Convertir id a número
    const queryParams = {
      id: parseInt(id, 10),
    };

    const { error: queryError } = tipoEventoQueryValidation.validate(queryParams);

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const { value, error: bodyError } = tipoEventoBodyValidation.validate(body);

    if (bodyError)
      return handleErrorClient(
        res,
        400,
        "Error de validación en los datos enviados",
        bodyError.message,
      );

    const [tipoEvento, tipoEventoError] = await updateTipoEventoService(queryParams, value);

    if (tipoEventoError)
      return handleErrorClient(res, 400, "Error modificando el tipo de evento", tipoEventoError);

    handleSuccess(res, 200, "Tipo de evento modificado correctamente", tipoEvento);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteTipoEvento(req, res) {
  try {
    const { id } = req.params;

    // Convertir id a número
    const queryParams = {
      id: parseInt(id, 10),
    };
    
    const { error: queryError } = tipoEventoQueryValidation.validate(queryParams);

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const [tipoEventoDelete, errorTipoEventoDelete] = await deleteTipoEventoService(queryParams);

    if (errorTipoEventoDelete) {
      // Si el error es porque el tipo de evento no existe, usar 404
      if (errorTipoEventoDelete === "Tipo de evento no encontrado") {
        return handleErrorClient(
          res,
          404,
          "Tipo de evento no encontrado",
          errorTipoEventoDelete,
        );
      }
      // Si el error es porque está asignado a eventos, usar 409 (Conflict)
      return handleErrorClient(
        res,
        409,
        "No se puede eliminar el tipo de evento",
        errorTipoEventoDelete,
      );
    }

    handleSuccess(res, 200, "Tipo de evento eliminado correctamente", tipoEventoDelete);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createTipoEvento(req, res) {
  try {
    const { body } = req;

    const { value, error } = tipoEventoCreateValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, error.message);
    }

    const [tipoEvento, errorTipoEvento] = await createTipoEventoService(value);

    if (errorTipoEvento) return handleErrorClient(res, 400, errorTipoEvento);

    handleSuccess(res, 201, "Tipo de evento creado correctamente", tipoEvento);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

