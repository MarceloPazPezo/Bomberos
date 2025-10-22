"use strict";
import RegionService from "../services/region.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

/**
 * Obtiene todas las regiones
 */
export async function getAllRegiones(req, res) {
  try {
    const [regiones, error] = await RegionService.getAllRegiones();
    
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
export async function getRegionById(req, res) {
  try {
    const { id } = req.params;
    const regionId = parseInt(id);

    if (isNaN(regionId)) {
      return handleErrorClient(res, 400, "ID de región inválido");
    }

    const [region, error] = await RegionService.getRegionById(regionId);
    
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
export async function getAllComunas(req, res) {
  try {
    const [comunas, error] = await RegionService.getAllComunas();
    
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

    const [comunas, error] = await RegionService.getComunasByRegion(regionId);
    
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
export async function getComunaById(req, res) {
  try {
    const { id } = req.params;
    const comunaId = parseInt(id);

    if (isNaN(comunaId)) {
      return handleErrorClient(res, 400, "ID de comuna inválido");
    }

    const [comuna, error] = await RegionService.getComunaById(comunaId);
    
    if (error) {
      return handleErrorClient(res, 404, error);
    }

    return handleSuccess(res, 200, "Comuna obtenida exitosamente", comuna);
  } catch (error) {
    console.error("Error en getComunaById:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}