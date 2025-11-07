"use strict";
import {
  createDireccionService,
  deleteDireccionService,
  getDireccionService,
  searchDireccionesService,
  updateDireccionService
} from "../services/direccion.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

/**
 * Crea una nueva dirección
 */
export async function createDireccion(req, res) {
  try {
    const direccionData = {
      ...req.body,
      creadoPor: req.bombero?.id,
      actualizadoPor: req.bombero?.id
    };

    const [direccion, error] = await createDireccionService(direccionData);

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    return handleSuccess(res, 201, "Dirección creada exitosamente", direccion);
  } catch (error) {
    console.error("Error en createDireccion:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Obtiene una dirección por ID
 */
export async function getDireccion(req, res) {
  try {
    const { id } = req.params;
    const direccionId = parseInt(id);

    if (isNaN(direccionId)) {
      return handleErrorClient(res, 400, "ID de dirección inválido");
    }

    const [direccion, error] = await getDireccionService(direccionId);

    if (error) {
      return handleErrorClient(res, 404, error);
    }

    return handleSuccess(res, 200, "Dirección obtenida exitosamente", direccion);
  } catch (error) {
    console.error("Error en getDireccionById:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Actualiza una dirección
 */
export async function updateDireccion(req, res) {
  try {
    const { id } = req.params;
    const direccionId = parseInt(id);

    if (isNaN(direccionId)) {
      return handleErrorClient(res, 400, "ID de dirección inválido");
    }

    const direccionData = {
      ...req.body,
      actualizadoPor: req.bombero?.id
    };

    const [direccion, error] = await updateDireccionService(direccionId, direccionData);

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    return handleSuccess(res, 200, "Dirección actualizada exitosamente", direccion);
  } catch (error) {
    console.error("Error en updateDireccion:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Elimina una dirección
 */
export async function deleteDireccion(req, res) {
  try {
    const { id } = req.params;
    const direccionId = parseInt(id);

    if (isNaN(direccionId)) {
      return handleErrorClient(res, 400, "ID de dirección inválido");
    }

    const [result, error] = await deleteDireccionService(direccionId);

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    return handleSuccess(res, 200, "Dirección eliminada exitosamente", { deleted: true });
  } catch (error) {
    console.error("Error en deleteDireccion:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Busca direcciones por criterios
 */
export async function searchDirecciones(req, res) {
  try {
    const criterios = req.query;
    const [direcciones, error] = await searchDireccionesService(criterios);

    if (error) {
      return handleErrorServer(res, 500, error);
    }

    return handleSuccess(res, 200, "Direcciones encontradas", direcciones);
  } catch (error) {
    console.error("Error en searchDirecciones:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}
