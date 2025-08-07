"use strict";
import { DataTypes } from "sequelize";
import { spatialSequelize } from "../config/spatialDb.js";

const Location = spatialSequelize.define(
  "Location",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Punto geográfico (lat, lng) - SRID 4326 (WGS84)
    coordinates: {
      type: DataTypes.GEOMETRY("POINT", 4326),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Las coordenadas son requeridas",
        },
      },
    },
    // Área/polígono opcional
    area: {
      type: DataTypes.GEOMETRY("POLYGON", 4326),
      allowNull: true,
    },
    // Radio de influencia en metros
    radius: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 100,
      validate: {
        min: 0,
      },
    },
    // Tipo de ubicación
    type: {
      type: DataTypes.ENUM(
        "point_of_interest",
        "business",
        "residence",
        "landmark",
        "other",
      ),
      defaultValue: "point_of_interest",
    },
    // Metadatos adicionales
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    // Estado activo/inactivo
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Referencia al usuario que creó la ubicación (relación con TypeORM)
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID del usuario de la tabla usuarios (TypeORM)",
    },
  },
  {
    tableName: "locations",
    timestamps: true,
    indexes: [
      // Índice espacial para consultas geográficas rápidas
      {
        name: "idx_locations_coordinates",
        fields: ["coordinates"],
        using: "gist",
      },
      // Índice para área si se usa
      {
        name: "idx_locations_area",
        fields: ["area"],
        using: "gist",
      },
      // Índices regulares
      {
        name: "idx_locations_type",
        fields: ["type"],
      },
      {
        name: "idx_locations_active",
        fields: ["active"],
      },
    ],
  },
);

// Métodos de instancia
Location.prototype.getLatLng = function () {
  if (this.coordinates && this.coordinates.coordinates) {
    const [lng, lat] = this.coordinates.coordinates;
    return { lat, lng };
  }
  return null;
};

Location.prototype.toGeoJSON = function () {
  return {
    type: "Feature",
    geometry: this.coordinates,
    properties: {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      radius: this.radius,
      metadata: this.metadata,
      active: this.active,
    },
  };
};

// Métodos estáticos para consultas espaciales
Location.findNearby = async function (
  lat,
  lng,
  radiusInMeters = 1000,
  options = {},
) {
  const point = spatialSequelize.fn("ST_Point", lng, lat);
  const pointWithSRID = spatialSequelize.fn("ST_SetSRID", point, 4326);

  return await this.findAll({
    where: spatialSequelize.where(
      spatialSequelize.fn(
        "ST_DWithin",
        spatialSequelize.col("coordinates"),
        pointWithSRID,
        radiusInMeters,
      ),
      true,
    ),
    order: [
      [
        spatialSequelize.fn(
          "ST_Distance",
          spatialSequelize.col("coordinates"),
          pointWithSRID,
        ),
        "ASC",
      ],
    ],
    ...options,
  });
};

Location.findWithinBounds = async function (
  northEast,
  southWest,
  options = {},
) {
  const { lat: neLat, lng: neLng } = northEast;
  const { lat: swLat, lng: swLng } = southWest;

  const polygon = spatialSequelize.fn(
    "ST_MakeEnvelope",
    swLng,
    swLat,
    neLng,
    neLat,
    4326,
  );

  return await this.findAll({
    where: spatialSequelize.where(
      spatialSequelize.fn(
        "ST_Within",
        spatialSequelize.col("coordinates"),
        polygon,
      ),
      true,
    ),
    ...options,
  });
};

Location.findWithinPolygon = async function (polygonGeoJSON, options = {}) {
  return await this.findAll({
    where: spatialSequelize.where(
      spatialSequelize.fn(
        "ST_Within",
        spatialSequelize.col("coordinates"),
        spatialSequelize.fn(
          "ST_GeomFromGeoJSON",
          JSON.stringify(polygonGeoJSON),
        ),
      ),
      true,
    ),
    ...options,
  });
};

export default Location;
