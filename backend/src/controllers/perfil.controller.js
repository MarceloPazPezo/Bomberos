"use strict";
import { getBomberoService, updateBomberoService } from "../services/bombero.service.js";
import {
  bomberoBodyValidation,
  bomberoQueryValidation,
  changePasswordValidation,
} from "../validations/bombero.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getMyProfile(req, res) {
  try {
    const { id, run, email } = req.bombero;

    if (id === undefined) {
      return handleErrorClient(
        res,
        401,
        "Bombero no autenticado o ID no disponible.",
      );
    }

    const { error } = bomberoQueryValidation.validate({ id, run, email });

    if (error) return handleErrorClient(res, 400, error.message);

    const [bombero, errorBombero] = await getBomberoService({ id, run, email });

    if (errorBombero) return handleErrorClient(res, 404, errorBombero);

    handleSuccess(res, 200, "Perfil de bombero encontrado", bombero);
  } catch (error) {
    console.error("Error en getMyProfile:", error);
    handleErrorServer(res, 500, "Error interno al obtener el perfil.");
  }
}

export async function updateMyProfile(req, res) {
  try {
    const { id, run, email } = req.bombero;
    const { body } = req;

    if (id === undefined) {
      return handleErrorClient(
        res,
        401,
        "Usuario no autenticado o ID no disponible.",
      );
    }

    const { error } = bomberoQueryValidation.validate({ id, run, email });

    if (error) return handleErrorClient(res, 400, error.message);

    const { error: bodyError } = bomberoBodyValidation.validate(body);

    if (bodyError) {
      const errorMessages = bodyError.details.map((detail) => {
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

    const actualizadoPor = req.bombero?.id;
    const [bombero, errorBombero] = await updateBomberoService({ id, run, email }, body, actualizadoPor);

    if (errorBombero) return handleErrorClient(res, 404, errorBombero);

    handleSuccess(res, 200, "Perfil de bombero actualizado", bombero);
  } catch (error) {
    console.error("Error en updateMyProfile:", error);
    handleErrorServer(res, 500, "Error interno al actualizar el perfil.");
  }
}

export async function changeMyPassword(req, res) {
  try {
    const { id } = req.bombero;
    const { currentPassword, newPassword } = req.body;

    if (id === undefined) {
      return handleErrorClient(
        res,
        401,
        "Usuario no autenticado o ID no disponible.",
      );
    }

    const { error } = changePasswordValidation.validate({
      currentPassword,
      newPassword,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path.join("."),
        type: detail.type,
        key: detail.context?.key,
      }));
      return handleErrorClient(res, 400, "Error de validación", errorMessages);
    }

    const actualizadoPor = req.bombero?.id;

    const [bombero, errorBombero] = await updateBomberoService(
      { id },
      { currentPassword, newPassword },
      actualizadoPor,
    );

    if (errorBombero) return handleErrorClient(res, 400, errorBombero);

    handleSuccess(res, 200, "Contraseña actualizada correctamente");
  } catch (error) {
    console.error("Error en changeMyPassword:", error);
    handleErrorServer(res, 500, "Error interno al cambiar la contraseña.");
  }
}
