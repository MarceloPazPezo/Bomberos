"use strict";
import EstadoEpp from "../entities/estadoEpp.entity.js";
import { AppDataSource } from "../config/configDb.js";
import logger from "../config/configLogger.js";

export async function getEstadoEppService(query) {
  try {
    const { id, nombre } = query;

    const estadoEppRepository = AppDataSource.getRepository(EstadoEpp);

    const estadoEppFound = await estadoEppRepository.findOne({
      where: id ? { id } : nombre ? { nombre } : {},
    });

    if (!estadoEppFound) return [null, "Estado de EPP no encontrado"];

    const estadoEppData = {
      id: estadoEppFound.id,
      nombre: estadoEppFound.nombre,
    };
    return [estadoEppData, null];
  } catch (error) {
    logger.error("Error al obtener el estado de EPP:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getEstadosEppService(queryParams = {}) {
  try {
    const estadoEppRepository = AppDataSource.getRepository(EstadoEpp);

    const queryBuilder = estadoEppRepository
      .createQueryBuilder("estadoEpp")
      .select([
        "estadoEpp.id",
        "estadoEpp.nombre",
      ])
      .orderBy("estadoEpp.nombre", "ASC");

    // Solo aplicar paginación si se especifican parámetros
    if (queryParams.page || queryParams.limit) {
      const { page = 1, limit = 10 } = queryParams;
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
    }

    const [estadosEpp, total] = await queryBuilder.getManyAndCount();

    if (!estadosEpp || estadosEpp.length === 0) {
      return [[], null, 0];
    }

    const estadosEppSummarized = estadosEpp.map((estadoEpp) => ({
      id: estadoEpp.id,
      nombre: estadoEpp.nombre,
    }));

    return [estadosEppSummarized, null, total];
  } catch (error) {
    logger.error("Error al obtener los estados de EPP:", error);
    return [null, "Error interno del servidor al obtener estados de EPP."];
  }
}

export async function updateEstadoEppService(query, body) {
  try {
    const { id } = query;

    const estadoEppRepository = AppDataSource.getRepository(EstadoEpp);

    const estadoEppFound = await estadoEppRepository.findOne({
      where: { id },
    });

    if (!estadoEppFound) return [null, "Estado de EPP no encontrado"];

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

      // Verificar si ya existe otro estado con el mismo nombre
      const existingEstadoEpp = await estadoEppRepository.findOne({
        where: { nombre: nombreTrimmed },
      });

      if (existingEstadoEpp && existingEstadoEpp.id !== estadoEppFound.id) {
        return [null, "Ya existe un estado de EPP con el mismo nombre"];
      }

      estadoEppFound.nombre = nombreTrimmed;
    }

    const savedEstadoEpp = await estadoEppRepository.save(estadoEppFound);

    const estadoEppData = {
      id: savedEstadoEpp.id,
      nombre: savedEstadoEpp.nombre,
    };

    return [estadoEppData, null];
  } catch (error) {
    logger.error("Error al modificar un estado de EPP:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteEstadoEppService(query) {
  try {
    const { id } = query;

    const estadoEppRepository = AppDataSource.getRepository(EstadoEpp);

    const estadoEppFound = await estadoEppRepository.findOne({
      where: { id },
    });

    if (!estadoEppFound) {
      return [null, "Estado de EPP no encontrado"];
    }

    // Verificar si el estado de EPP está siendo usado por algún EPP
    const eppsCount = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM "epp" WHERE "idEstadoEpp" = $1`,
      [estadoEppFound.id]
    );

    const count = parseInt(eppsCount[0].count);
    
    if (count > 0) {
      return [null, `No se puede eliminar el estado de EPP "${estadoEppFound.nombre}" porque está asociado a ${count} EPP(s)`];
    }

    // Eliminar el estado de EPP
    await estadoEppRepository.remove(estadoEppFound);

    return [{ id: estadoEppFound.id, nombre: estadoEppFound.nombre }, null];
  } catch (error) {
    logger.error("Error al eliminar un estado de EPP:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createEstadoEppService(estadoEppData) {
  try {
    if (!estadoEppData) {
      return [null, "Datos del estado de EPP no proporcionados"];
    }
    
    // Validar que el nombre existe y no está vacío
    if (!estadoEppData.nombre || estadoEppData.nombre.trim().length === 0) {
      return [null, "El nombre del estado de EPP es requerido"];
    }

    const nombreTrimmed = estadoEppData.nombre.trim();

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

    const estadoEppRepository = AppDataSource.getRepository(EstadoEpp);

    // Validar unicidad
    const existingEstadoEpp = await estadoEppRepository.findOne({
      where: { nombre: nombreTrimmed },
    });

    if (existingEstadoEpp) {
      return [null, "Ya existe un estado de EPP con el mismo nombre"];
    }

    const newEstadoEpp = estadoEppRepository.create({
      nombre: nombreTrimmed,
    });

    const savedEstadoEpp = await estadoEppRepository.save(newEstadoEpp);

    const estadoEppResponseData = {
      id: savedEstadoEpp.id,
      nombre: savedEstadoEpp.nombre,
    };

    return [estadoEppResponseData, null];
  } catch (error) {
    logger.error("Error al crear estado de EPP:", error);
    return [null, "Error interno del servidor"];
  }
}

