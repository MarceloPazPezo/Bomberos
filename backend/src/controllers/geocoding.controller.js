"use strict";
import { geocodeLocation, geocodeComuna } from "../services/geocoding.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

/**
 * Geocodifica una ubicación genérica
 * GET /api/geocoding?query=Ubicación&country=Chile
 */
export async function geocode(req, res) {
  try {
    const { query, country = "Chile" } = req.query;

    if (!query) {
      return handleErrorClient(res, 400, "Parámetro 'query' es requerido");
    }

    const [coordinates, error] = await geocodeLocation(query, country);

    if (error) {
      return handleErrorClient(res, 404, error);
    }

    return handleSuccess(res, 200, "Coordenadas obtenidas exitosamente", coordinates);
  } catch (error) {
    console.error("Error en geocode:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Geocodifica una comuna específica
 * GET /api/geocoding/comuna?comuna=Cabrero&region=Biobío
 */
export async function geocodeComunaEndpoint(req, res) {
  try {
    const { comuna, region } = req.query;

    if (!comuna) {
      return handleErrorClient(res, 400, "Parámetro 'comuna' es requerido");
    }

    const [coordinates, error] = await geocodeComuna(comuna, region || null);

    if (error) {
      return handleErrorClient(res, 404, error);
    }

    return handleSuccess(res, 200, "Coordenadas de comuna obtenidas exitosamente", coordinates);
  } catch (error) {
    console.error("Error en geocodeComuna:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}




