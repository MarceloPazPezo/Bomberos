"use strict";
import ClaveRadial from "../entities/claveRadial.entity.js";
import { AppDataSource } from "../config/configDb.js";
import logger from "../config/configLogger.js";

export async function getClaveRadialService(query) {
  try {
    const { id, nombre } = query;

    const claveRadialRepository = AppDataSource.getRepository(ClaveRadial);

    const claveRadialFound = await claveRadialRepository.findOne({
      where: id ? { id } : nombre ? { nombre } : {},
    });

    if (!claveRadialFound) return [null, "Clave radial no encontrada"];

    const claveRadialData = {
      id: claveRadialFound.id,
      nombre: claveRadialFound.nombre,
    };
    return [claveRadialData, null];
  } catch (error) {
    logger.error("Error al obtener la clave radial:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getClavesRadialesService(queryParams = {}) {
  try {
    const claveRadialRepository = AppDataSource.getRepository(ClaveRadial);

    const queryBuilder = claveRadialRepository
      .createQueryBuilder("claveRadial")
      .select([
        "claveRadial.id",
        "claveRadial.nombre",
      ])
      .orderBy("claveRadial.nombre", "ASC");

    // Solo aplicar paginación si se especifican parámetros
    if (queryParams.page || queryParams.limit) {
      const { page = 1, limit = 10 } = queryParams;
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
    }

    const [clavesRadiales, total] = await queryBuilder.getManyAndCount();

    if (!clavesRadiales || clavesRadiales.length === 0) {
      return [[], null, 0];
    }

    const clavesRadialesSummarized = clavesRadiales.map((claveRadial) => ({
      id: claveRadial.id,
      nombre: claveRadial.nombre,
    }));

    return [clavesRadialesSummarized, null, total];
  } catch (error) {
    logger.error("Error al obtener las claves radiales:", error);
    return [null, "Error interno del servidor al obtener claves radiales."];
  }
}

export async function updateClaveRadialService(query, body) {
  try {
    const { id } = query;

    const claveRadialRepository = AppDataSource.getRepository(ClaveRadial);

    const claveRadialFound = await claveRadialRepository.findOne({
      where: { id },
    });

    if (!claveRadialFound) return [null, "Clave radial no encontrada"];

    // Validar y actualizar el nombre si se proporciona
    if (body.nombre) {
      const nombreTrimmed = body.nombre.trim();

      // Validar que no esté vacío
      if (nombreTrimmed.length === 0) {
        return [null, "El nombre no puede estar vacío"];
      }

      // Validar longitud mínima
      if (nombreTrimmed.length < 2) {
        return [null, "El nombre debe tener como mínimo 2 caracteres"];
      }

      // Validar longitud máxima (varchar(50))
      if (nombreTrimmed.length > 50) {
        return [null, "El nombre debe tener como máximo 50 caracteres"];
      }

      // Validar patrón de caracteres
      const namePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s'-]+$/;
      if (!namePattern.test(nombreTrimmed)) {
        return [null, "El nombre solo puede contener letras, números, espacios, apóstrofes o guiones"];
      }

      // Verificar si ya existe otra clave con el mismo nombre
      const existingClaveRadial = await claveRadialRepository.findOne({
        where: { nombre: nombreTrimmed },
      });

      if (existingClaveRadial && existingClaveRadial.id !== claveRadialFound.id) {
        return [null, "Ya existe una clave radial con el mismo nombre"];
      }

      claveRadialFound.nombre = nombreTrimmed;
    }

    const savedClaveRadial = await claveRadialRepository.save(claveRadialFound);

    const claveRadialData = {
      id: savedClaveRadial.id,
      nombre: savedClaveRadial.nombre,
    };

    return [claveRadialData, null];
  } catch (error) {
    logger.error("Error al modificar una clave radial:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteClaveRadialService(query) {
  try {
    const { id } = query;

    const claveRadialRepository = AppDataSource.getRepository(ClaveRadial);

    const claveRadialFound = await claveRadialRepository.findOne({
      where: { id },
    });

    if (!claveRadialFound) {
      return [null, "Clave radial no encontrada"];
    }

    // Verificar si la clave radial está siendo usada por algún subtipo de incidente
    const subtiposCount = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM "subTipoIncidente" WHERE "claveRadial" = $1`,
      [claveRadialFound.nombre]
    );

    const count = parseInt(subtiposCount[0].count);
    
    if (count > 0) {
      return [null, `No se puede eliminar la clave radial "${claveRadialFound.nombre}" porque está asociada a ${count} subtipo(s) de incidente`];
    }

    // Eliminar la clave radial
    await claveRadialRepository.remove(claveRadialFound);

    return [{ id: claveRadialFound.id, nombre: claveRadialFound.nombre }, null];
  } catch (error) {
    logger.error("Error al eliminar una clave radial:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createClaveRadialService(claveRadialData) {
  try {
    if (!claveRadialData) {
      return [null, "Datos de la clave radial no proporcionados"];
    }
    
    // Validar que el nombre existe y no está vacío
    if (!claveRadialData.nombre || claveRadialData.nombre.trim().length === 0) {
      return [null, "El nombre de la clave radial es requerido"];
    }

    const nombreTrimmed = claveRadialData.nombre.trim();

    // Validar longitud mínima
    if (nombreTrimmed.length < 2) {
      return [null, "El nombre debe tener como mínimo 2 caracteres"];
    }

    // Validar longitud máxima (varchar(50))
    if (nombreTrimmed.length > 50) {
      return [null, "El nombre debe tener como máximo 50 caracteres"];
    }

    // Validar patrón de caracteres (letras, números, espacios, apóstrofes y guiones)
    const namePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s'-]+$/;
    if (!namePattern.test(nombreTrimmed)) {
      return [null, "El nombre solo puede contener letras, números, espacios, apóstrofes o guiones"];
    }

    const claveRadialRepository = AppDataSource.getRepository(ClaveRadial);

    // Validar unicidad
    const existingClaveRadial = await claveRadialRepository.findOne({
      where: { nombre: nombreTrimmed },
    });

    if (existingClaveRadial) {
      return [null, "Ya existe una clave radial con el mismo nombre"];
    }

    const newClaveRadial = claveRadialRepository.create({
      nombre: nombreTrimmed,
    });

    const savedClaveRadial = await claveRadialRepository.save(newClaveRadial);

    const claveRadialResponseData = {
      id: savedClaveRadial.id,
      nombre: savedClaveRadial.nombre,
    };

    return [claveRadialResponseData, null];
  } catch (error) {
    logger.error("Error al crear clave radial:", error);
    return [null, "Error interno del servidor"];
  }
}

