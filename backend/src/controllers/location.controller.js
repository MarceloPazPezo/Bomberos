"use strict";
import { locationService } from "../services/location.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

// Crear nueva ubicación
export async function createLocation(req, res) {
  try {
    const userId = req.user?.id;
    const location = await locationService.createLocation(req.body, userId);
    
    handleSuccess(res, 201, "Ubicación creada exitosamente", location);
  } catch (error) {
    if (error.message.includes('requeridas') || error.message.includes('Latitud')) {
      handleErrorClient(res, 400, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}

// Obtener ubicación por ID
export async function getLocation(req, res) {
  try {
    const { id } = req.params;
    const location = await locationService.getLocationById(parseInt(id));
    
    handleSuccess(res, 200, "Ubicación obtenida exitosamente", location);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}

// Buscar ubicaciones cercanas
export async function getNearbyLocations(req, res) {
  try {
    const { lat, lng, radius = 1000, limit = 50, offset = 0, type } = req.query;
    
    if (!lat || !lng) {
      return handleErrorClient(res, 400, "Latitud y longitud son requeridas");
    }
    
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      type,
    };
    
    const locations = await locationService.findNearbyLocations(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius),
      options
    );
    
    handleSuccess(res, 200, "Ubicaciones cercanas obtenidas exitosamente", {
      locations,
      total: locations.length,
      params: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) },
    });
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Buscar ubicaciones en límites (bounding box)
export async function getLocationsInBounds(req, res) {
  try {
    const { neLat, neLng, swLat, swLng, limit = 100, offset = 0, type } = req.query;
    
    if (!neLat || !neLng || !swLat || !swLng) {
      return handleErrorClient(res, 400, "Coordenadas de límites son requeridas (neLat, neLng, swLat, swLng)");
    }
    
    const bounds = {
      northEast: { lat: parseFloat(neLat), lng: parseFloat(neLng) },
      southWest: { lat: parseFloat(swLat), lng: parseFloat(swLng) },
    };
    
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      type,
    };
    
    const locations = await locationService.findLocationsInBounds(bounds, options);
    
    handleSuccess(res, 200, "Ubicaciones en límites obtenidas exitosamente", {
      locations,
      total: locations.length,
      bounds,
    });
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Buscar ubicaciones en polígono
export async function getLocationsInPolygon(req, res) {
  try {
    const { polygon, limit = 100, offset = 0, type } = req.body;
    
    if (!polygon || !polygon.coordinates) {
      return handleErrorClient(res, 400, "Polígono GeoJSON es requerido");
    }
    
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      type,
    };
    
    const locations = await locationService.findLocationsInPolygon(polygon, options);
    
    handleSuccess(res, 200, "Ubicaciones en polígono obtenidas exitosamente", {
      locations,
      total: locations.length,
    });
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Actualizar ubicación
export async function updateLocation(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const location = await locationService.updateLocation(parseInt(id), req.body, userId);
    
    handleSuccess(res, 200, "Ubicación actualizada exitosamente", location);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      handleErrorClient(res, 404, error.message);
    } else if (error.message.includes('permisos')) {
      handleErrorClient(res, 403, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}

// Eliminar ubicación
export async function deleteLocation(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const result = await locationService.deleteLocation(parseInt(id), userId);
    
    handleSuccess(res, 200, result.message);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      handleErrorClient(res, 404, error.message);
    } else if (error.message.includes('permisos')) {
      handleErrorClient(res, 403, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}

// Obtener estadísticas de ubicaciones
export async function getLocationStats(req, res) {
  try {
    const stats = await locationService.getLocationStats();
    
    handleSuccess(res, 200, "Estadísticas obtenidas exitosamente", stats);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Obtener todas las ubicaciones (con paginación)
export async function getLocations(req, res) {
  try {
    const { limit = 50, offset = 0, type, active = true } = req.query;
    
    // Usar el método findAll de Sequelize con filtros
    const Location = (await import("../models/Location.js")).default;
    
    const whereConditions = { active: active === 'true' };
    if (type) whereConditions.type = type;
    
    const { count, rows: locations } = await Location.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      attributes: {
        include: [
          [Location.sequelize.fn('ST_AsGeoJSON', Location.sequelize.col('coordinates')), 'coordinates_geojson'],
        ],
      },
    });
    
    const formattedLocations = locations.map(location => 
      locationService.formatLocationResponse(location)
    );
    
    handleSuccess(res, 200, "Ubicaciones obtenidas exitosamente", {
      locations: formattedLocations,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}