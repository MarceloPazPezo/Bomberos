"use strict";
import Location from "../models/Location.js";
import { spatialSequelize } from "../config/spatialDb.js";
import { AppDataSource } from "../config/configDb.js";
import User from "../entities/user.entity.js";

export const locationService = {
  // Crear nueva ubicación
  async createLocation(locationData, userId = null) {
    try {
      const { name, description, lat, lng, radius, type, metadata, area } =
        locationData;

      // Validar coordenadas
      if (!lat || !lng) {
        throw new Error("Latitud y longitud son requeridas");
      }

      // Crear punto geográfico
      const coordinates = spatialSequelize.fn("ST_Point", lng, lat);
      const coordinatesWithSRID = spatialSequelize.fn(
        "ST_SetSRID",
        coordinates,
        4326,
      );

      const locationPayload = {
        name,
        description,
        coordinates: coordinatesWithSRID,
        radius,
        type,
        metadata: metadata || {},
        created_by_user_id: userId,
      };

      // Si hay área, agregarla
      if (area && area.coordinates) {
        locationPayload.area = spatialSequelize.fn(
          "ST_GeomFromGeoJSON",
          JSON.stringify(area),
        );
      }

      const location = await Location.create(locationPayload);
      return await this.getLocationById(location.id);
    } catch (error) {
      console.error("Error creating location:", error);
      throw error;
    }
  },

  // Obtener ubicación por ID
  async getLocationById(id) {
    try {
      const location = await Location.findByPk(id, {
        attributes: {
          include: [
            [
              spatialSequelize.fn(
                "ST_AsGeoJSON",
                spatialSequelize.col("coordinates"),
              ),
              "coordinates_geojson",
            ],
            [
              spatialSequelize.fn("ST_AsGeoJSON", spatialSequelize.col("area")),
              "area_geojson",
            ],
          ],
        },
      });

      if (!location) {
        throw new Error("Ubicación no encontrada");
      }

      return this.formatLocationResponse(location);
    } catch (error) {
      console.error("Error getting location:", error);
      throw error;
    }
  },

  // Buscar ubicaciones cercanas
  async findNearbyLocations(lat, lng, radiusInMeters = 1000, options = {}) {
    try {
      const { limit = 50, offset = 0, type, active = true } = options;

      const whereConditions = { active };
      if (type) whereConditions.type = type;

      const locations = await Location.findNearby(lat, lng, radiusInMeters, {
        where: whereConditions,
        limit,
        offset,
        attributes: {
          include: [
            [
              spatialSequelize.fn(
                "ST_AsGeoJSON",
                spatialSequelize.col("coordinates"),
              ),
              "coordinates_geojson",
            ],
            [
              spatialSequelize.fn(
                "ST_Distance",
                spatialSequelize.col("coordinates"),
                spatialSequelize.fn(
                  "ST_SetSRID",
                  spatialSequelize.fn("ST_Point", lng, lat),
                  4326,
                ),
              ),
              "distance_meters",
            ],
          ],
        },
      });

      return locations.map((location) => this.formatLocationResponse(location));
    } catch (error) {
      console.error("Error finding nearby locations:", error);
      throw error;
    }
  },

  // Buscar ubicaciones dentro de límites (bounding box)
  async findLocationsInBounds(bounds, options = {}) {
    try {
      const { northEast, southWest } = bounds;
      const { limit = 100, offset = 0, type, active = true } = options;

      const whereConditions = { active };
      if (type) whereConditions.type = type;

      const locations = await Location.findWithinBounds(northEast, southWest, {
        where: whereConditions,
        limit,
        offset,
        attributes: {
          include: [
            [
              spatialSequelize.fn(
                "ST_AsGeoJSON",
                spatialSequelize.col("coordinates"),
              ),
              "coordinates_geojson",
            ],
          ],
        },
      });

      return locations.map((location) => this.formatLocationResponse(location));
    } catch (error) {
      console.error("Error finding locations in bounds:", error);
      throw error;
    }
  },

  // Buscar ubicaciones dentro de un polígono
  async findLocationsInPolygon(polygonGeoJSON, options = {}) {
    try {
      const { limit = 100, offset = 0, type, active = true } = options;

      const whereConditions = { active };
      if (type) whereConditions.type = type;

      const locations = await Location.findWithinPolygon(polygonGeoJSON, {
        where: whereConditions,
        limit,
        offset,
        attributes: {
          include: [
            [
              spatialSequelize.fn(
                "ST_AsGeoJSON",
                spatialSequelize.col("coordinates"),
              ),
              "coordinates_geojson",
            ],
          ],
        },
      });

      return locations.map((location) => this.formatLocationResponse(location));
    } catch (error) {
      console.error("Error finding locations in polygon:", error);
      throw error;
    }
  },

  // Actualizar ubicación
  async updateLocation(id, updateData, userId = null) {
    try {
      const location = await Location.findByPk(id);
      if (!location) {
        throw new Error("Ubicación no encontrada");
      }

      // Verificar permisos si es necesario
      if (
        userId &&
        location.created_by_user_id &&
        location.created_by_user_id !== userId
      ) {
        // Aquí podrías verificar permisos con TypeORM
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { id: userId },
          relations: ["roles", "roles.permissions"],
        });

        const hasPermission = user?.roles?.some((role) =>
          role.permissions?.some(
            (permission) => permission.nombre === "locations:update_all",
          ),
        );

        if (!hasPermission) {
          throw new Error("No tienes permisos para actualizar esta ubicación");
        }
      }

      const updatePayload = { ...updateData };

      // Si se actualizan coordenadas
      if (updateData.lat && updateData.lng) {
        const coordinates = spatialSequelize.fn(
          "ST_Point",
          updateData.lng,
          updateData.lat,
        );
        updatePayload.coordinates = spatialSequelize.fn(
          "ST_SetSRID",
          coordinates,
          4326,
        );
        delete updatePayload.lat;
        delete updatePayload.lng;
      }

      // Si se actualiza área
      if (updateData.area) {
        updatePayload.area = spatialSequelize.fn(
          "ST_GeomFromGeoJSON",
          JSON.stringify(updateData.area),
        );
      }

      await location.update(updatePayload);
      return await this.getLocationById(id);
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  },

  // Eliminar ubicación
  async deleteLocation(id, userId = null) {
    try {
      const location = await Location.findByPk(id);
      if (!location) {
        throw new Error("Ubicación no encontrada");
      }

      // Verificar permisos similar al update
      if (
        userId &&
        location.created_by_user_id &&
        location.created_by_user_id !== userId
      ) {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { id: userId },
          relations: ["roles", "roles.permissions"],
        });

        const hasPermission = user?.roles?.some((role) =>
          role.permissions?.some(
            (permission) => permission.nombre === "locations:delete_all",
          ),
        );

        if (!hasPermission) {
          throw new Error("No tienes permisos para eliminar esta ubicación");
        }
      }

      await location.destroy();
      return { message: "Ubicación eliminada correctamente" };
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error;
    }
  },

  // Obtener estadísticas geoespaciales
  async getLocationStats() {
    try {
      const stats = await Location.findAll({
        attributes: [
          "type",
          [spatialSequelize.fn("COUNT", spatialSequelize.col("id")), "count"],
        ],
        where: { active: true },
        group: ["type"],
        raw: true,
      });

      const totalLocations = await Location.count({ where: { active: true } });

      return {
        total: totalLocations,
        by_type: stats,
      };
    } catch (error) {
      console.error("Error getting location stats:", error);
      throw error;
    }
  },

  // Formatear respuesta de ubicación
  formatLocationResponse(location) {
    const locationData = location.toJSON();

    // Parsear coordenadas GeoJSON
    if (locationData.coordinates_geojson) {
      const coords = JSON.parse(locationData.coordinates_geojson);
      locationData.coordinates = coords;
      locationData.lat = coords.coordinates[1];
      locationData.lng = coords.coordinates[0];
      delete locationData.coordinates_geojson;
    }

    // Parsear área GeoJSON si existe
    if (locationData.area_geojson) {
      locationData.area = JSON.parse(locationData.area_geojson);
      delete locationData.area_geojson;
    }

    return locationData;
  },
};
