"use strict";
import {
  getPermissions,
  getPermissionsByCategory,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionStats,
} from "../services/permiso.service.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

const getAllPermissions = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      isActive: req.query.isActive ? req.query.isActive === "true" : undefined,
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await getPermissions(filters);

    handleSuccess(res, 200, "Permisos obtenidos correctamente", result);
  } catch (error) {
    console.error("Error en getAllPermissions:", error);
    handleErrorServer(res, 500, error.message);
  }
};

const getPermissionCategories = async (req, res) => {
  try {
    const groupedPermissions = await getPermissionsByCategory();

    handleSuccess(
      res,
      200,
      "Permisos por categoría obtenidos correctamente",
      groupedPermissions,
    );
  } catch (error) {
    console.error("Error en getPermissionCategories:", error);
    handleErrorServer(res, 500, error.message);
  }
};

const getPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await getPermissionById(parseInt(id));

    handleSuccess(res, 200, "Permiso obtenido correctamente", permission);
  } catch (error) {
    console.error("Error en getPermission:", error);
    if (error.message === "Permiso no encontrado") {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
};

const createNewPermission = async (req, res) => {
  try {
    const permissionData = req.body;
    const newPermission = await createPermission(permissionData);

    handleSuccess(res, 201, "Permiso creado correctamente", newPermission);
  } catch (error) {
    console.error("Error en createNewPermission:", error);
    if (error.message === "Ya existe un permiso con ese nombre") {
      handleErrorClient(res, 409, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
};

const updateExistingPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPermission = await updatePermission(parseInt(id), updateData);

    handleSuccess(
      res,
      200,
      "Permiso actualizado correctamente",
      updatedPermission,
    );
  } catch (error) {
    console.error("Error en updateExistingPermission:", error);
    if (error.message === "Permiso no encontrado") {
      handleErrorClient(res, 404, error.message);
    } else if (error.message === "Ya existe un permiso con ese nombre") {
      handleErrorClient(res, 409, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
};

const removePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deletePermission(parseInt(id));

    handleSuccess(res, 200, result.message);
  } catch (error) {
    console.error("Error en removePermission:", error);
    if (error.message === "Permiso no encontrado") {
      handleErrorClient(res, 404, error.message);
    } else if (
      error.message ===
      "No se puede eliminar un permiso que está asignado a roles"
    ) {
      handleErrorClient(res, 409, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await getPermissionStats();

    handleSuccess(
      res,
      200,
      "Estadísticas de permisos obtenidas correctamente",
      stats,
    );
  } catch (error) {
    console.error("Error en getStats:", error);
    handleErrorServer(res, 500, error.message);
  }
};

export {
  getAllPermissions,
  getPermissionCategories,
  getPermission,
  createNewPermission,
  updateExistingPermission,
  removePermission,
  getStats,
};
