"use strict";
import {
  createComunaService,
  deleteComunaService,
  getComunasByRegionService,
  getComunaService,
  getComunasService,
  updateComunaService,
} from "../services/comuna.service.js";
import {
  comunaCreateValidation,
  comunaQueryValidation,
  comunaUpdateValidation,
} from "../validations/comuna.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getComunas(req, res) {
  try {
    const filters = {
      search: req.query.search,
      idRegion: req.query.idRegion ? parseInt(req.query.idRegion) : undefined,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
    };

    const result = await getComunasService(filters);

    handleSuccess(res, 200, "Comunas obtenidas correctamente", result);
  } catch (error) {
    console.error("Error en getComunas:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function getComuna(req, res) {
  try {
    const { id } = req.params;
    const { nombre, idRegion } = req.query;

    const queryParams = {
      id: id ? parseInt(id, 10) : undefined,
      nombre,
      idRegion: idRegion ? parseInt(idRegion, 10) : undefined,
    };

    const { error } = comunaQueryValidation.validate(queryParams);
    if (error) return handleErrorClient(res, 400, error.message);

    const comuna = await getComunaService(queryParams);

    handleSuccess(res, 200, "Comuna obtenida correctamente", comuna);
  } catch (error) {
    console.error("Error en getComuna:", error);
    if (error.message === "Comuna no encontrada") {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}

export async function getComunasByRegion(req, res) {
  try {
    const { idRegion } = req.params;

    if (!idRegion || isNaN(parseInt(idRegion))) {
      return handleErrorClient(res, 400, "ID de región inválido");
    }

    const comunas = await getComunasByRegionService(parseInt(idRegion));

    handleSuccess(res, 200, "Comunas de la región obtenidas correctamente", comunas);
  } catch (error) {
    console.error("Error en getComunasByRegion:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function createComuna(req, res) {
  try {
    const { value, error } = comunaCreateValidation.validate(req.body);
    if (error) return handleErrorClient(res, 400, error.message);

    const newComuna = await createComunaService(value);

    handleSuccess(res, 201, "Comuna creada correctamente", newComuna);
  } catch (error) {
    console.error("Error en createComuna:", error);
    if (
      error.message === "La región especificada no existe"
      || error.message === "Ya existe una comuna con ese nombre en la región especificada"
    ) {
      handleErrorClient(res, 409, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}

export async function updateComuna(req, res) {
  try {
    const { id } = req.params;
    const { nombre, idRegion } = req.query;

    const queryParams = {
      id: id ? parseInt(id, 10) : undefined,
      nombre,
      idRegion: idRegion ? parseInt(idRegion, 10) : undefined,
    };

    const { error: queryError } = comunaQueryValidation.validate(queryParams);
    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message
      );
    }

    const { value, error: bodyError } = comunaUpdateValidation.validate(req.body);
    if (bodyError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en los datos enviados",
        bodyError.message
      );
    }

    const updatedComuna = await updateComunaService(queryParams, value);

    handleSuccess(res, 200, "Comuna actualizada correctamente", updatedComuna);
  } catch (error) {
    console.error("Error en updateComuna:", error);
    if (error.message === "Comuna no encontrada") {
      handleErrorClient(res, 404, error.message);
    } else if (
      error.message === "La región especificada no existe"
      || error.message === "Ya existe una comuna con ese nombre en la región especificada"
    ) {
      handleErrorClient(res, 409, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}

export async function deleteComuna(req, res) {
  try {
    const { id } = req.params;
    const { nombre } = req.query;

    const queryParams = {
      id: id ? parseInt(id, 10) : undefined,
      nombre,
    };

    const { error: queryError } = comunaQueryValidation.validate(queryParams);
    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message
      );
    }

    const deletedComuna = await deleteComunaService(queryParams);

    handleSuccess(res, 200, "Comuna eliminada correctamente", deletedComuna);
  } catch (error) {
    console.error("Error en deleteComuna:", error);
    if (error.message === "Comuna no encontrada") {
      handleErrorClient(res, 404, error.message);
    } else if (error.message.includes("No se puede eliminar la comuna")) {
      handleErrorClient(res, 409, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}