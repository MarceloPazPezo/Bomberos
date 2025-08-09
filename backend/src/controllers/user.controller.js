"use strict";
import {
  deleteUserService,
  getUserService,
  getUsersService,
  updateUserService,
  createUserService,
  changeUserStatusService,
} from "../services/user.service.js";
import {
  userBodyValidation,
  userQueryValidation,
  userCreateValidation,
} from "../validations/user.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getUser(req, res) {
  try {
    const { run, id, email, telefono } = req.query;

    const { error } = userQueryValidation.validate({
      run,
      id,
      email,
      telefono,
    });

    if (error) return handleErrorClient(res, 400, error.message);

    const [user, errorUser] = await getUserService({
      run,
      id,
      email,
      telefono,
    });

    if (errorUser) return handleErrorClient(res, 404, errorUser);

    handleSuccess(res, 200, "Usuario encontrado", user);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getUsers(req, res) {
  try {
    const [users, errorUsers] = await getUsersService();

    if (errorUsers) return handleErrorClient(res, 404, errorUsers);

    users.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Usuarios encontrados", users);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateUser(req, res) {
  try {
    const { run, id, email, telefono } = req.query;
    const { body } = req;

    const { error: queryError } = userQueryValidation.validate({
      run,
      id,
      email,
      telefono,
    });

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const { error: bodyError } = userBodyValidation.validate(body);

    if (bodyError) {
      const errorMessages = bodyError.details.map((detail) => {
        let message = detail.message;

        return {
          message: message,
          path: detail.path.join("."), // 'path' es un array de segmentos de la runa al error
          type: detail.type, // El tipo de error (ej: 'object.unknown')
          key: detail.context?.key, // La clave específica si es un error de 'object.unknown'
        };
      });
      return handleErrorClient(res, 400, "Error de validación", errorMessages);
    }

    const updatedBy = req.user ? `${req.user.nombres?.join(' ')} ${req.user.apellidos?.join(' ')}`.trim() : 'Sistema';

    const [user, userError] = await updateUserService(
      { run, id, email, telefono },
      body,
      updatedBy,
    );

    if (userError)
      return handleErrorClient(
        res,
        400,
        "Error modificando al usuario",
        userError,
      );

    handleSuccess(res, 200, "Usuario modificado correctamente", user);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteUser(req, res) {
  try {
    const { run, id, email, telefono } = req.query;

    const { error: queryError } = userQueryValidation.validate({
      run,
      id,
      email,
      telefono,
    });

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const [userDelete, errorUserDelete] = await deleteUserService({
      run,
      id,
      email,
      telefono,
    });

    if (errorUserDelete)
      return handleErrorClient(
        res,
        404,
        "Error eliminado al usuario",
        errorUserDelete,
      );

    handleSuccess(res, 200, "Usuario eliminado correctamente", userDelete);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createUser(req, res) {
  try {
    const { body } = req;
    const createdBy = req.user ? `${req.user.nombres?.join(' ')} ${req.user.apellidos?.join(' ')}`.trim() : 'Sistema';

    const { value, error } = userCreateValidation.validate(body);

    if (error) return handleErrorClient(res, 400, error.message);

    const [user, errorUser] = await createUserService(value, createdBy);

    if (errorUser) return handleErrorClient(res, 400, errorUser);

    handleSuccess(res, 201, "Usuario creado correctamente", user);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function changeUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, "ID de usuario inválido");
    }

    if (typeof activo !== "boolean") {
      return handleErrorClient(
        res,
        400,
        "El campo 'activo' debe ser un valor booleano",
      );
    }

    const [user, errorUser] = await changeUserStatusService(
      parseInt(id),
      activo,
    );

    if (errorUser) return handleErrorClient(res, 404, errorUser);

    handleSuccess(
      res,
      200,
      `Usuario ${activo ? "activado" : "desactivado"} correctamente`,
      user,
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
