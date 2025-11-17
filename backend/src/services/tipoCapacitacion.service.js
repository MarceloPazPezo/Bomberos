"use strict";
import TipoCapacitacion from "../entities/tipoCapacitacion.entity.js";
import { AppDataSource } from "../config/configDb.js";
import logger from "../config/configLogger.js";

export async function getTipoCapacitacionService(query) {
  try {
    const { id, nombre } = query;

    const tipoCapacitacionRepository = AppDataSource.getRepository(TipoCapacitacion);

    const tipoCapacitacionFound = await tipoCapacitacionRepository.findOne({
      where: id ? { id } : nombre ? { nombre } : {},
    });

    if (!tipoCapacitacionFound) return [null, "Tipo de capacitación no encontrado"];

    const tipoCapacitacionData = {
      id: tipoCapacitacionFound.id,
      nombre: tipoCapacitacionFound.nombre,
      descripcion: tipoCapacitacionFound.descripcion,
    };
    return [tipoCapacitacionData, null];
  } catch (error) {
    logger.error("Error al obtener el tipo de capacitación:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getTiposCapacitacionService(queryParams = {}) {
  try {
    const tipoCapacitacionRepository = AppDataSource.getRepository(TipoCapacitacion);

    const queryBuilder = tipoCapacitacionRepository
      .createQueryBuilder("tipoCapacitacion")
      .select([
        "tipoCapacitacion.id",
        "tipoCapacitacion.nombre",
        "tipoCapacitacion.descripcion",
      ])
      .orderBy("tipoCapacitacion.nombre", "ASC");

    if (queryParams.search) {
      queryBuilder.where("tipoCapacitacion.nombre ILIKE :search", {
        search: `%${queryParams.search}%`,
      });
    }

    if (queryParams.page || queryParams.limit) {
      const { page = 1, limit = 10 } = queryParams;
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
    }

    const [tiposCapacitacion, total] = await queryBuilder.getManyAndCount();

    if (!tiposCapacitacion || tiposCapacitacion.length === 0) {
      return [[], null, 0];
    }

    const tiposCapacitacionSummarized = tiposCapacitacion.map((tipoCapacitacion) => ({
      id: tipoCapacitacion.id,
      nombre: tipoCapacitacion.nombre,
      descripcion: tipoCapacitacion.descripcion,
    }));

    return [tiposCapacitacionSummarized, null, total];
  } catch (error) {
    logger.error("Error al obtener los tipos de capacitación:", error);
    return [null, "Error interno del servidor al obtener tipos de capacitación."];
  }
}

export async function createTipoCapacitacionService(tipoCapacitacionData) {
  try {
    if (!tipoCapacitacionData) {
      return [null, "Datos del tipo de capacitación no proporcionados"];
    }

    if (!tipoCapacitacionData.nombre || tipoCapacitacionData.nombre.trim().length === 0) {
      return [null, "El nombre del tipo de capacitación es requerido"];
    }

    const nombreTrimmed = tipoCapacitacionData.nombre.trim();

    if (nombreTrimmed.length < 2) {
      return [null, "El nombre debe tener como mínimo 2 caracteres"];
    }

    if (nombreTrimmed.length > 100) {
      return [null, "El nombre debe tener como máximo 100 caracteres"];
    }

    const tipoCapacitacionRepository = AppDataSource.getRepository(TipoCapacitacion);

    const existingTipoCapacitacion = await tipoCapacitacionRepository.findOne({
      where: { nombre: nombreTrimmed },
    });

    if (existingTipoCapacitacion) {
      return [null, "Ya existe un tipo de capacitación con el mismo nombre"];
    }

    const newTipoCapacitacion = tipoCapacitacionRepository.create({
      nombre: nombreTrimmed,
      descripcion: tipoCapacitacionData.descripcion || null,
    });

    const savedTipoCapacitacion = await tipoCapacitacionRepository.save(newTipoCapacitacion);

    const tipoCapacitacionResponseData = {
      id: savedTipoCapacitacion.id,
      nombre: savedTipoCapacitacion.nombre,
      descripcion: savedTipoCapacitacion.descripcion,
    };

    return [tipoCapacitacionResponseData, null];
  } catch (error) {
    logger.error("Error al crear tipo de capacitación:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateTipoCapacitacionService(query, body) {
  try {
    const { id } = query;

    const tipoCapacitacionRepository = AppDataSource.getRepository(TipoCapacitacion);

    const tipoCapacitacionFound = await tipoCapacitacionRepository.findOne({
      where: { id },
    });

    if (!tipoCapacitacionFound) return [null, "Tipo de capacitación no encontrado"];

    if (body.nombre) {
      const nombreTrimmed = body.nombre.trim();

      if (nombreTrimmed.length === 0) {
        return [null, "El nombre no puede estar vacío"];
      }

      if (nombreTrimmed.length < 2) {
        return [null, "El nombre debe tener como mínimo 2 caracteres"];
      }

      if (nombreTrimmed.length > 100) {
        return [null, "El nombre debe tener como máximo 100 caracteres"];
      }

      const existingTipoCapacitacion = await tipoCapacitacionRepository.findOne({
        where: { nombre: nombreTrimmed },
      });

      if (existingTipoCapacitacion && existingTipoCapacitacion.id !== tipoCapacitacionFound.id) {
        return [null, "Ya existe un tipo de capacitación con el mismo nombre"];
      }

      tipoCapacitacionFound.nombre = nombreTrimmed;
    }

    if (body.descripcion !== undefined) {
      tipoCapacitacionFound.descripcion = body.descripcion || null;
    }

    const savedTipoCapacitacion = await tipoCapacitacionRepository.save(tipoCapacitacionFound);

    const tipoCapacitacionData = {
      id: savedTipoCapacitacion.id,
      nombre: savedTipoCapacitacion.nombre,
      descripcion: savedTipoCapacitacion.descripcion,
    };

    return [tipoCapacitacionData, null];
  } catch (error) {
    logger.error("Error al modificar un tipo de capacitación:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteTipoCapacitacionService(query) {
  try {
    const { id } = query;

    const tipoCapacitacionRepository = AppDataSource.getRepository(TipoCapacitacion);

    const tipoCapacitacionFound = await tipoCapacitacionRepository.findOne({
      where: { id },
    });

    if (!tipoCapacitacionFound) {
      return [null, "Tipo de capacitación no encontrado"];
    }

    const capacitacionesCount = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM "capacitacion" WHERE "idTipoCapacitacion" = $1`,
      [tipoCapacitacionFound.id]
    );

    const capacitacionesCountNum = parseInt(capacitacionesCount[0].count);

    if (capacitacionesCountNum > 0) {
      return [
        null,
        `No se puede eliminar el tipo de capacitación "${tipoCapacitacionFound.nombre}" porque está asociado a ${capacitacionesCountNum} capacitación(es)`,
      ];
    }

    await AppDataSource.query(`DELETE FROM "tipoCapacitacion" WHERE id = $1`, [
      tipoCapacitacionFound.id,
    ]);

    return [
      { id: tipoCapacitacionFound.id, nombre: tipoCapacitacionFound.nombre },
      null,
    ];
  } catch (error) {
    logger.error("Error al eliminar un tipo de capacitación:", error);
    return [null, "Error interno del servidor"];
  }
}

