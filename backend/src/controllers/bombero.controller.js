"use strict";
import {
  deleteBomberoService,
  getBomberoService,
  getBomberosService,
  updateBomberoService,
  createBomberoService,
  changeBomberoStatusService,
} from "../services/bombero.service.js";
import {
  bomberoBodyValidation,
  bomberoQueryValidation,
  bomberoCreateValidation,
} from "../validations/bombero.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getBombero(req, res) {
  try {
    const { id } = req.params;
    const { run, email } = req.query;

    const { error } = bomberoQueryValidation.validate({
      id,
      run,
      email,
    });

    if (error) return handleErrorClient(res, 400, error.message);

    const [bombero, errorBombero] = await getBomberoService({
      id,
      run,
      email,
    });

    if (errorBombero) return handleErrorClient(res, 404, errorBombero);

    handleSuccess(res, 200, "Bombero encontrado", bombero);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getBomberos(req, res) {
  try {
    // Validar TODOS los parámetros de query de una sola vez
    const { error } = bomberoQueryValidation.validate(req.query);
    if (error) return handleErrorClient(res, 400, error.message);

    // Si la validación pasa, usar directamente req.query
    const [bomberos, errorBomberos] = await getBomberosService(req.query);

    if (errorBomberos) return handleErrorClient(res, 404, errorBomberos);

    bomberos.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Bomberos encontrados", bomberos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateBombero(req, res) {
  try {
    const { id } = req.params;
    const { run, email } = req.query;
    const { body } = req;

    const { error: queryError } = bomberoQueryValidation.validate({
      id,
      run,
      email,
    });

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const { error: bodyError } = bomberoBodyValidation.validate(body);

    if (bodyError) {
      const errorMessages = bodyError.details.map((detail) => {
        let message = detail.message;

        return {
          message: message,
          path: detail.path.join("."),
          type: detail.type,
          key: detail.context?.key,
        };
      });
      return handleErrorClient(res, 400, "Error de validación", errorMessages);
    }

    const actualizadoPor = req.bombero?.id; // ID del bombero que realiza la actualización

    const [bombero, bomberoError] = await updateBomberoService(
      { id, run, email },
      body,
      actualizadoPor,
    );

    if (bomberoError) {
      return handleErrorClient(
        res,
        400,
        "Error modificando al bombero",
        bomberoError,
      );
    }

    handleSuccess(res, 200, "Bombero modificado correctamente", bombero);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteBombero(req, res) {
  try {
    const { id } = req.params;
    const { run, email } = req.query;

    const { error: queryError } = bomberoQueryValidation.validate({
      id,
      run,
      email,
    });

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const [bomberoDelete, errorBomberoDelete] = await deleteBomberoService({
      id,
      run,
      email,
    });

    if (errorBomberoDelete)
      return handleErrorClient(
        res,
        404,
        "Error eliminado al bombero",
        errorBomberoDelete,
      );

    handleSuccess(res, 200, "Bombero eliminado correctamente", bomberoDelete);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createBombero(req, res) {
  try {
    const { body } = req;
    const creadoPor = req.bombero?.id;

    const { value, error } = bomberoCreateValidation.validate(body);

    if (error) {
      const errorMessages = error.details.map((detail) => {
        let message = detail.message;

        return {
          message: message,
          path: detail.path.join("."), // 'path' es un array de segmentos de la ruta al error
          type: detail.type, // El tipo de error (ej: 'object.unknown')
          key: detail.context?.key, // La clave específica si es un error de 'object.unknown'
        };
      });
      return handleErrorClient(res, 400, "Error de validación", errorMessages);
    }

    const [bombero, errorBombero] = await createBomberoService(value, creadoPor);

    if (errorBombero) return handleErrorClient(res, 400, errorBombero);

    handleSuccess(res, 201, "Bombero creado correctamente", bombero);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function changeBomberoStatus(req, res) {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, "ID de bombero inválido");
    }

    if (typeof activo !== "boolean") {
      return handleErrorClient(
        res,
        400,
        "El campo 'activo' debe ser un valor booleano",
      );
    }

    const [bombero, errorBombero] = await changeBomberoStatusService(
      parseInt(id),
      activo,
      req.bombero?.id, // Pasar el ID del bombero actual para validación de jerarquía
    );

    if (errorBombero) return handleErrorClient(res, 404, errorBombero);

    handleSuccess(
      res,
      200,
      `Bombero ${activo ? "activado" : "desactivado"} correctamente`,
      bombero,
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
