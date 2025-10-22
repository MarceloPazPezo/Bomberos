"use strict";
import {
  deleteRolService,
  getRolService,
  getRolesService,
  updateRolService,
  createRolService,
} from "../services/rol.service.js";
import {
  rolBodyValidation,
  rolQueryValidation,
  rolCreateValidation,
} from "../validations/rol.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getRol(req, res) {
  try {
    const { id } = req.params;
    
    // Convertir id a número
    const queryParams = {
      id: parseInt(id, 10),
    };
    
    const { error } = rolQueryValidation.validate(queryParams);

    if (error) return handleErrorClient(res, 400, error.message);

    const [rol, errorRol] = await getRolService(queryParams);

    if (errorRol) return handleErrorClient(res, 404, errorRol);

    handleSuccess(res, 200, "Rol encontrado", rol);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getRoles(req, res) {
  try {
    const { page, limit } = req.query;
    const [roles, errorRoles] = await getRolesService({ page, limit });

    if (errorRoles) return handleErrorClient(res, 404, errorRoles);

    roles.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Roles encontrados", roles);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateRol(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    // Convertir id a número
    const queryParams = {
      id: parseInt(id, 10),
    };

    const { error: queryError } = rolQueryValidation.validate(queryParams);

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const { value, error: bodyError } = rolBodyValidation.validate(body);

    if (bodyError)
      return handleErrorClient(
        res,
        400,
        "Error de validación en los datos enviados",
        bodyError.message,
      );

    const [rol, rolError] = await updateRolService(queryParams, value);

    if (rolError)
      return handleErrorClient(res, 400, "Error modificando al rol", rolError);

    handleSuccess(res, 200, "Rol modificado correctamente", rol);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteRol(req, res) {
  try {
    const { id } = req.params;

    // Convertir id a número
    const queryParams = {
      id: parseInt(id, 10),
    };
    
    const { error: queryError } = rolQueryValidation.validate(queryParams);

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const [rolDelete, errorRolDelete] = await deleteRolService(queryParams);

    if (errorRolDelete) {
      // Si el error es porque el rol no existe, usar 404
      if (errorRolDelete === "Rol no encontrado") {
        return handleErrorClient(
          res,
          404,
          "Rol no encontrado",
          errorRolDelete,
        );
      }
      // Si el error es porque está asignado a bomberos, usar 409 (Conflict)
      return handleErrorClient(
        res,
        409,
        "No se puede eliminar el rol",
        errorRolDelete,
      );
    }

    handleSuccess(res, 200, "Rol eliminado correctamente", rolDelete);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createRol(req, res) {
  try {
    const { body } = req;

    const { value, error } = rolCreateValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, error.message);
    }

    const [rol, errorRol] = await createRolService(value);

    if (errorRol) return handleErrorClient(res, 400, errorRol);

    handleSuccess(res, 201, "Rol creado correctamente", rol);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
