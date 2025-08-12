"use strict";
import {
  deleteRoleService,
  getRoleService,
  getRolesService,
  updateRoleService,
  createRoleService,
} from "../services/rol.service.js";
import {
  roleBodyValidation,
  roleQueryValidation,
  roleCreateValidation,
} from "../validations/rol.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getRole(req, res) {
  try {
    const { id } = req.params;
    
    // Convertir id a número
    const queryParams = {
      id: parseInt(id, 10),
    };
    
    const { error } = roleQueryValidation.validate(queryParams);

    if (error) return handleErrorClient(res, 400, error.message);

    const [role, errorRole] = await getRoleService(queryParams);

    if (errorRole) return handleErrorClient(res, 404, errorRole);

    handleSuccess(res, 200, "Rol encontrado", role);
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

export async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    // Convertir id a número
    const queryParams = {
      id: parseInt(id, 10),
    };

    const { error: queryError } = roleQueryValidation.validate(queryParams);

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const { value, error: bodyError } = roleBodyValidation.validate(body);

    if (bodyError)
      return handleErrorClient(
        res,
        400,
        "Error de validación en los datos enviados",
        bodyError.message,
      );

    const [role, roleError] = await updateRoleService(queryParams, value);

    if (roleError)
      return handleErrorClient(res, 400, "Error modificando al rol", roleError);

    handleSuccess(res, 200, "Rol modificado correctamente", role);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteRole(req, res) {
  try {
    const { id } = req.params;

    // Convertir id a número
    const queryParams = {
      id: parseInt(id, 10),
    };

    const { error: queryError } = roleQueryValidation.validate(queryParams);

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const [roleDelete, errorRoleDelete] = await deleteRoleService(queryParams);

    if (errorRoleDelete)
      return handleErrorClient(
        res,
        404,
        "Error eliminado al rol",
        errorRoleDelete,
      );

    handleSuccess(res, 200, "Rol eliminado correctamente", roleDelete);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createRole(req, res) {
  try {
    const { body } = req;

    const { value, error } = roleCreateValidation.validate(body);

    if (error) return handleErrorClient(res, 400, error.message);

    const [role, errorRole] = await createRoleService(value);

    if (errorRole) return handleErrorClient(res, 400, errorRole);

    handleSuccess(res, 201, "Rol creado correctamente", role);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
