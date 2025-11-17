"use strict";
import {
  getPermisoService,
  getPermisosService,
  updatePermisoService,
} from "../services/permiso.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getPermisos(req, res) {
  try {
    const filters = {
      category: req.query.category,
      isActive: req.query.isActive ? req.query.isActive === "true" : undefined,
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await getPermisosService(filters);

    handleSuccess(res, 200, "Permisos obtenidos correctamente", result);
  } catch (error) {
    console.error("Error en getPermisos:", error);
    handleErrorServer(res, 500, error.message);
  }
};

export async function getPermiso(req, res) {
  try {
    const { id } = req.params;
    const permiso = await getPermisoService(parseInt(id));

    handleSuccess(res, 200, "Permiso obtenido correctamente", permiso);
  } catch (error) {
    console.error("Error en getPermiso:", error);
    if (error.message === "Permiso no encontrado") {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
};

export async function updatePermiso(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPermiso = await updatePermisoService(parseInt(id), updateData);

    handleSuccess(
      res,
      200,
      "Permiso actualizado correctamente",
      updatedPermiso,
    );
  } catch (error) {
    console.error("Error en updatePermiso:", error);
    if (error.message === "Permiso no encontrado") {
      handleErrorClient(res, 404, error.message);
    } else if (error.message === "Ya existe un permiso con ese nombre") {
      handleErrorClient(res, 409, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
};