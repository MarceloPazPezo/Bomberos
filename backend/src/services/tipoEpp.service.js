"use strict";
import TipoEpp from "../entities/tipoEpp.entity.js";
import { AppDataSource } from "../config/configDb.js";
import logger from "../config/configLogger.js";

export async function getTipoEppService(query) {
  try {
    const { id, nombre } = query;

    const tipoEppRepository = AppDataSource.getRepository(TipoEpp);

    const tipoEppFound = await tipoEppRepository.findOne({
      where: id ? { id } : nombre ? { nombre } : {},
    });

    if (!tipoEppFound) return [null, "Tipo de EPP no encontrado"];

    const tipoEppData = {
      id: tipoEppFound.id,
      nombre: tipoEppFound.nombre,
    };
    return [tipoEppData, null];
  } catch (error) {
    logger.error("Error al obtener el tipo de EPP:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getTiposEppService(queryParams = {}) {
  try {
    const tipoEppRepository = AppDataSource.getRepository(TipoEpp);

    const queryBuilder = tipoEppRepository
      .createQueryBuilder("tipoEpp")
      .select([
        "tipoEpp.id",
        "tipoEpp.nombre",
      ])
      .orderBy("tipoEpp.nombre", "ASC");

    // Solo aplicar paginación si se especifican parámetros
    if (queryParams.page || queryParams.limit) {
      const { page = 1, limit = 10 } = queryParams;
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
    }

    const [tiposEpp, total] = await queryBuilder.getManyAndCount();

    if (!tiposEpp || tiposEpp.length === 0) {
      return [[], null, 0];
    }

    const tiposEppSummarized = tiposEpp.map((tipoEpp) => ({
      id: tipoEpp.id,
      nombre: tipoEpp.nombre,
    }));

    return [tiposEppSummarized, null, total];
  } catch (error) {
    logger.error("Error al obtener los tipos de EPP:", error);
    return [null, "Error interno del servidor al obtener tipos de EPP."];
  }
}

export async function updateTipoEppService(query, body) {
  try {
    const { id } = query;

    const tipoEppRepository = AppDataSource.getRepository(TipoEpp);

    const tipoEppFound = await tipoEppRepository.findOne({
      where: { id },
    });

    if (!tipoEppFound) return [null, "Tipo de EPP no encontrado"];

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
      const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
      if (!namePattern.test(nombreTrimmed)) {
        return [null, "El nombre solo puede contener letras, espacios, apóstrofes o guiones"];
      }

      // Verificar si ya existe otro tipo con el mismo nombre
      const existingTipoEpp = await tipoEppRepository.findOne({
        where: { nombre: nombreTrimmed },
      });

      if (existingTipoEpp && existingTipoEpp.id !== tipoEppFound.id) {
        return [null, "Ya existe un tipo de EPP con el mismo nombre"];
      }

      tipoEppFound.nombre = nombreTrimmed;
    }

    const savedTipoEpp = await tipoEppRepository.save(tipoEppFound);

    const tipoEppData = {
      id: savedTipoEpp.id,
      nombre: savedTipoEpp.nombre,
    };

    return [tipoEppData, null];
  } catch (error) {
    logger.error("Error al modificar un tipo de EPP:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteTipoEppService(query) {
  try {
    const { id } = query;

    const tipoEppRepository = AppDataSource.getRepository(TipoEpp);

    const tipoEppFound = await tipoEppRepository.findOne({
      where: { id },
    });

    if (!tipoEppFound) {
      return [null, "Tipo de EPP no encontrado"];
    }

    // Verificar si el tipo de EPP está siendo usado por algún EPP
    const eppsCount = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM "epp" WHERE "idTipoEpp" = $1`,
      [tipoEppFound.id]
    );

    const count = parseInt(eppsCount[0].count);
    
    if (count > 0) {
      return [null, `No se puede eliminar el tipo de EPP "${tipoEppFound.nombre}" porque está asociado a ${count} EPP(s)`];
    }

    // Eliminar el tipo de EPP
    await tipoEppRepository.remove(tipoEppFound);

    return [{ id: tipoEppFound.id, nombre: tipoEppFound.nombre }, null];
  } catch (error) {
    logger.error("Error al eliminar un tipo de EPP:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createTipoEppService(tipoEppData) {
  try {
    if (!tipoEppData) {
      return [null, "Datos del tipo de EPP no proporcionados"];
    }
    
    // Validar que el nombre existe y no está vacío
    if (!tipoEppData.nombre || tipoEppData.nombre.trim().length === 0) {
      return [null, "El nombre del tipo de EPP es requerido"];
    }

    const nombreTrimmed = tipoEppData.nombre.trim();

    // Validar longitud mínima
    if (nombreTrimmed.length < 2) {
      return [null, "El nombre debe tener como mínimo 2 caracteres"];
    }

    // Validar longitud máxima (varchar(50))
    if (nombreTrimmed.length > 50) {
      return [null, "El nombre debe tener como máximo 50 caracteres"];
    }

    // Validar patrón de caracteres (solo letras, espacios, apóstrofes y guiones)
    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
    if (!namePattern.test(nombreTrimmed)) {
      return [null, "El nombre solo puede contener letras, espacios, apóstrofes o guiones"];
    }

    const tipoEppRepository = AppDataSource.getRepository(TipoEpp);

    // Validar unicidad
    const existingTipoEpp = await tipoEppRepository.findOne({
      where: { nombre: nombreTrimmed },
    });

    if (existingTipoEpp) {
      return [null, "Ya existe un tipo de EPP con el mismo nombre"];
    }

    const newTipoEpp = tipoEppRepository.create({
      nombre: nombreTrimmed,
    });

    const savedTipoEpp = await tipoEppRepository.save(newTipoEpp);

    const tipoEppResponseData = {
      id: savedTipoEpp.id,
      nombre: savedTipoEpp.nombre,
    };

    return [tipoEppResponseData, null];
  } catch (error) {
    logger.error("Error al crear tipo de EPP:", error);
    return [null, "Error interno del servidor"];
  }
}

