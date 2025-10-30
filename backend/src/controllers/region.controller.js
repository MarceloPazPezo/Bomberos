"use strict";
import {
  getComunasByRegionService,
  getComunaService,
  getComunasService,
  getRegionesService,
  getRegionService
} from "../services/region.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

/**
 * Obtiene todas las regiones
 */
export async function getRegiones(req, res) {
  try {
    const [regiones, error] = await getRegionesService();

    if (error) {
      return handleErrorServer(res, 500, error);
    }

    return handleSuccess(res, 200, "Regiones obtenidas exitosamente", regiones);
  } catch (error) {
    console.error("Error en getAllRegiones:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Obtiene una región por ID
 */
export async function getRegion(req, res) {
  try {
    const { id } = req.params;
    const idRegion = parseInt(id);

    if (isNaN(idRegion)) {
      return handleErrorClient(res, 400, "ID de región inválido");
    }

    const [region, error] = await getRegionService(idRegion);

    if (error) {
      return handleErrorClient(res, 404, error);
    }

    return handleSuccess(res, 200, "Región obtenida exitosamente", region);
  } catch (error) {
    console.error("Error en getRegionById:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Obtiene todas las comunas
 */
export async function getComunas(req, res) {
  try {
    const [comunas, error] = await getComunasService();

    if (error) {
      return handleErrorServer(res, 500, error);
    }

    return handleSuccess(res, 200, "Comunas obtenidas exitosamente", comunas);
  } catch (error) {
    console.error("Error en getAllComunas:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Obtiene comunas por región
 */
export async function getComunasByRegion(req, res) {
  try {
    const { idRegion } = req.params;
    const regionId = parseInt(idRegion);

    if (isNaN(regionId)) {
      return handleErrorClient(res, 400, "ID de región inválido");
    }

    const [comunas, error] = await getComunasByRegionService(regionId);

    if (error) {
      return handleErrorServer(res, 500, error);
    }

    return handleSuccess(res, 200, "Comunas obtenidas exitosamente", comunas);
  } catch (error) {
    console.error("Error en getComunasByRegion:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Obtiene una comuna por ID
 */
export async function getComuna(req, res) {
  try {
    const { id } = req.params;
    const idComuna = parseInt(id);

    if (isNaN(idComuna)) {
      return handleErrorClient(res, 400, "ID de comuna inválido");
    }

    const [comuna, error] = await getComunaService(idComuna);

    if (error) {
      return handleErrorClient(res, 404, error);
    }

    return handleSuccess(res, 200, "Comuna obtenida exitosamente", comuna);
  } catch (error) {
    console.error("Error en getComunaById:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}