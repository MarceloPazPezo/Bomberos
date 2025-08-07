"use strict";
import {
  deleteRoleService,
  getRoleService,
  getRolesService,
  updateRoleService,
  createRoleService,
} from "../services/role.service.js";
import {
  roleBodyValidation,
  roleQueryValidation,
  roleCreateValidation,
} from "../validations/role.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getRole(req, res) {
  try {
    const { id, nombre } = req.query;
    const { error } = roleQueryValidation.validate({ id, nombre });

    if (error) return handleErrorClient(res, 400, error.message);

    const [role, errorRole] = await getRoleService({ id, nombre });

    if (errorRole) return handleErrorClient(res, 404, errorRole);

    handleSuccess(res, 200, "Rol encontrado", role);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getRoles(req, res) {
  try {
    const [roles, errorRoles] = await getRolesService();

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
    const { id, nombre } = req.query;
    const { body } = req;

    const { error: queryError } = roleQueryValidation.validate({
      id,
      nombre,
    });

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

    const [role, roleError] = await updateRoleService({ id, nombre }, value);

    if (roleError)
      return handleErrorClient(res, 400, "Error modificando al rol", roleError);

    handleSuccess(res, 200, "Rol modificado correctamente", role);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteRole(req, res) {
  try {
    const { id, nombre } = req.query;

    const { error: queryError } = roleQueryValidation.validate({
      id,
      nombre,
    });

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const [roleDelete, errorRoleDelete] = await deleteRoleService({
      id,
      nombre,
    });

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
