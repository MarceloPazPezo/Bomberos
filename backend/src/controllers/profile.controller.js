"use strict";
import { getUserService, updateUserService } from "../services/user.service.js";
import {
  userBodyValidation,
  userQueryValidation,
  changePasswordValidation,
} from "../validations/user.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getMyProfile(req, res) {
  try {
    const { id } = req.user;

    if (id === undefined) {
      return handleErrorClient(
        res,
        401,
        "Usuario no autenticado o ID no disponible.",
      );
    }

    const { error } = userQueryValidation.validate({ id });

    if (error) return handleErrorClient(res, 400, error.message);

    const [user, errorUser] = await getUserService({ id });

    if (errorUser) return handleErrorClient(res, 404, errorUser);

    handleSuccess(res, 200, "Perfil de usuario encontrado", user);
  } catch (error) {
    console.error("Error en getMyProfile:", error);
    handleErrorServer(res, 500, "Error interno al obtener el perfil.");
  }
}

export async function updateMyProfile(req, res) {
  try {
    const { id } = req.user;
    const { body } = req;

    if (id === undefined) {
      return handleErrorClient(
        res,
        401,
        "Usuario no autenticado o ID no disponible.",
      );
    }

    const { error } = userQueryValidation.validate({ id });

    if (error) return handleErrorClient(res, 400, error.message);

    const { error: bodyError } = userBodyValidation.validate(body);

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

    const [user, errorUser] = await updateUserService({ id }, body);

    if (errorUser) return handleErrorClient(res, 404, errorUser);

    handleSuccess(res, 200, "Perfil de usuario actualizado", user);
  } catch (error) {
    console.error("Error en updateMyProfile:", error);
    handleErrorServer(res, 500, "Error interno al actualizar el perfil.");
  }
}

export async function changeMyPassword(req, res) {
  try {
    const { id } = req.user;
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

    const [user, errorUser] = await updateUserService(
      { id },
      { currentPassword, newPassword },
    );

    if (errorUser) return handleErrorClient(res, 400, errorUser);

    handleSuccess(res, 200, "Contraseña actualizada correctamente");
  } catch (error) {
    console.error("Error en changeMyPassword:", error);
    handleErrorServer(res, 500, "Error interno al cambiar la contraseña.");
  }
}
