"use strict";
import {
  getRegionesService,
  getRegionService,
  createRegionService,
  updateRegionService,
  deleteRegionService,
} from "../services/region.service.js";
import {
  regionQueryValidation,
  regionCreateValidation,
  regionUpdateValidation,
} from "../validations/region.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getRegiones(req, res) {
  try {
    const filters = {
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
    };

    const result = await getRegionesService(filters);

    handleSuccess(res, 200, "Regiones obtenidas correctamente", result);
  } catch (error) {
    console.error("Error en getRegiones:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function getRegion(req, res) {
  try {
    const { id } = req.params;
    const { nombre } = req.query;

    const queryParams = {
      id: id ? parseInt(id, 10) : undefined,
      nombre,
    };

    const { error } = regionQueryValidation.validate(queryParams);
    if (error) return handleErrorClient(res, 400, error.message);

    const region = await getRegionService(queryParams);

    handleSuccess(res, 200, "Región obtenida correctamente", region);
  } catch (error) {
    console.error("Error en getRegion:", error);
    if (error.message === "Región no encontrada") {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}

export async function createRegion(req, res) {
  try {
    const { value, error } = regionCreateValidation.validate(req.body);
    if (error) return handleErrorClient(res, 400, error.message);

    const newRegion = await createRegionService(value);

    handleSuccess(res, 201, "Región creada correctamente", newRegion);
  } catch (error) {
    console.error("Error en createRegion:", error);
    if (error.message === "Ya existe una región con ese nombre") {
      handleErrorClient(res, 409, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}

export async function updateRegion(req, res) {
  try {
    const { id } = req.params;
    const { nombre } = req.query;

    const queryParams = {
      id: id ? parseInt(id, 10) : undefined,
      nombre,
    };

    const { error: queryError } = regionQueryValidation.validate(queryParams);
    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message
      );
    }

    const { value, error: bodyError } = regionUpdateValidation.validate(req.body);
    if (bodyError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en los datos enviados",
        bodyError.message
      );
    }

    const updatedRegion = await updateRegionService(queryParams, value);

    handleSuccess(res, 200, "Región actualizada correctamente", updatedRegion);
  } catch (error) {
    console.error("Error en updateRegion:", error);
    if (error.message === "Región no encontrada") {
      handleErrorClient(res, 404, error.message);
    } else if (error.message === "Ya existe una región con ese nombre") {
      handleErrorClient(res, 409, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}

export async function deleteRegion(req, res) {
  try {
    const { id } = req.params;
    const { nombre } = req.query;

    const queryParams = {
      id: id ? parseInt(id, 10) : undefined,
      nombre,
    };

    const { error: queryError } = regionQueryValidation.validate(queryParams);
    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message
      );
    }

    const deletedRegion = await deleteRegionService(queryParams);

    handleSuccess(res, 200, "Región eliminada correctamente", deletedRegion);
  } catch (error) {
    console.error("Error en deleteRegion:", error);
    if (error.message === "Región no encontrada") {
      handleErrorClient(res, 404, error.message);
    } else if (error.message.includes("No se puede eliminar la región")) {
      handleErrorClient(res, 409, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}