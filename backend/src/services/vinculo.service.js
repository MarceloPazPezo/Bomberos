"use strict";
import Vinculo from "../entities/vinculo.entity.js";
import { AppDataSource } from "../config/configDb.js";
import logger from "../config/configLogger.js";

export async function getVinculoService(query) {
  try {
    const { id, nombre } = query;

    const vinculoRepository = AppDataSource.getRepository(Vinculo);

    const vinculoFound = await vinculoRepository.findOne({
      where: id ? { id } : nombre ? { nombre } : {},
    });

    if (!vinculoFound) return [null, "Vínculo no encontrado"];

    const vinculoData = {
      id: vinculoFound.id,
      nombre: vinculoFound.nombre,
    };
    return [vinculoData, null];
  } catch (error) {
    logger.error("Error al obtener el vínculo:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getVinculosService(queryParams = {}) {
  try {
    const vinculoRepository = AppDataSource.getRepository(Vinculo);

    const queryBuilder = vinculoRepository
      .createQueryBuilder("vinculo")
      .select([
        "vinculo.id",
        "vinculo.nombre",
      ])
      .orderBy("vinculo.nombre", "ASC");

    // Solo aplicar paginación si se especifican parámetros
    if (queryParams.page || queryParams.limit) {
      const { page = 1, limit = 10 } = queryParams;
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
    }

    const [vinculos, total] = await queryBuilder.getManyAndCount();

    if (!vinculos || vinculos.length === 0) {
      return [[], null, 0];
    }

    const vinculosSummarized = vinculos.map((vinculo) => ({
      id: vinculo.id,
      nombre: vinculo.nombre,
    }));

    return [vinculosSummarized, null, total];
  } catch (error) {
    logger.error("Error al obtener los vínculos:", error);
    return [null, "Error interno del servidor al obtener vínculos."];
  }
}

export async function updateVinculoService(query, body) {
  try {
    const { id } = query;

    const vinculoRepository = AppDataSource.getRepository(Vinculo);

    const vinculoFound = await vinculoRepository.findOne({
      where: { id },
    });

    if (!vinculoFound) return [null, "Vínculo no encontrado"];

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

      // Validar longitud máxima (varchar(100))
      if (nombreTrimmed.length > 100) {
        return [null, "El nombre debe tener como máximo 100 caracteres"];
      }

      // Validar patrón de caracteres
      const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
      if (!namePattern.test(nombreTrimmed)) {
        return [null, "El nombre solo puede contener letras, espacios, apóstrofes o guiones"];
      }

      // Verificar si ya existe otro vínculo con el mismo nombre
      const existingVinculo = await vinculoRepository.findOne({
        where: { nombre: nombreTrimmed },
      });

      if (existingVinculo && existingVinculo.id !== vinculoFound.id) {
        return [null, "Ya existe un vínculo con el mismo nombre"];
      }

      vinculoFound.nombre = nombreTrimmed;
    }

    const savedVinculo = await vinculoRepository.save(vinculoFound);

    const vinculoData = {
      id: savedVinculo.id,
      nombre: savedVinculo.nombre,
    };

    return [vinculoData, null];
  } catch (error) {
    logger.error("Error al modificar un vínculo:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteVinculoService(query) {
  try {
    const { id } = query;

    const vinculoRepository = AppDataSource.getRepository(Vinculo);

    const vinculoFound = await vinculoRepository.findOne({
      where: { id },
    });

    if (!vinculoFound) {
      return [null, "Vínculo no encontrado"];
    }

    // Verificar si el vínculo está siendo usado por contactos de emergencia
    const contactosCount = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM "contactoEmergencia" WHERE "idVinculo" = $1`,
      [vinculoFound.id]
    );

    const contactosCountNum = parseInt(contactosCount[0].count);

    // Verificar si el vínculo está siendo usado por pasajeros
    const pasajerosCount = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM "pasajero" WHERE "idVinculo" = $1`,
      [vinculoFound.id]
    );

    const pasajerosCountNum = parseInt(pasajerosCount[0].count);
    const totalCount = contactosCountNum + pasajerosCountNum;

    if (totalCount > 0) {
      let message = `No se puede eliminar el vínculo "${vinculoFound.nombre}" porque está asociado a `;
      if (contactosCountNum > 0 && pasajerosCountNum > 0) {
        message += `${contactosCountNum} contacto(s) de emergencia y ${pasajerosCountNum} pasajero(s)`;
      } else if (contactosCountNum > 0) {
        message += `${contactosCountNum} contacto(s) de emergencia`;
      } else {
        message += `${pasajerosCountNum} pasajero(s)`;
      }
      return [null, message];
    }

    // Eliminar el vínculo
    await AppDataSource.query(`DELETE FROM "vinculo" WHERE id = $1`, [vinculoFound.id]);

    return [{ id: vinculoFound.id, nombre: vinculoFound.nombre }, null];
  } catch (error) {
    logger.error("Error al eliminar un vínculo:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createVinculoService(vinculoData) {
  try {
    if (!vinculoData) {
      return [null, "Datos del vínculo no proporcionados"];
    }
    
    // Validar que el nombre existe y no está vacío
    if (!vinculoData.nombre || vinculoData.nombre.trim().length === 0) {
      return [null, "El nombre del vínculo es requerido"];
    }

    const nombreTrimmed = vinculoData.nombre.trim();

    // Validar longitud mínima
    if (nombreTrimmed.length < 2) {
      return [null, "El nombre debe tener como mínimo 2 caracteres"];
    }

    // Validar longitud máxima (varchar(100))
    if (nombreTrimmed.length > 100) {
      return [null, "El nombre debe tener como máximo 100 caracteres"];
    }

    // Validar patrón de caracteres (solo letras, espacios, apóstrofes y guiones)
    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
    if (!namePattern.test(nombreTrimmed)) {
      return [null, "El nombre solo puede contener letras, espacios, apóstrofes o guiones"];
    }

    const vinculoRepository = AppDataSource.getRepository(Vinculo);

    // Validar unicidad
    const existingVinculo = await vinculoRepository.findOne({
      where: { nombre: nombreTrimmed },
    });

    if (existingVinculo) {
      return [null, "Ya existe un vínculo con el mismo nombre"];
    }

    const newVinculo = vinculoRepository.create({
      nombre: nombreTrimmed,
    });

    const savedVinculo = await vinculoRepository.save(newVinculo);

    const vinculoResponseData = {
      id: savedVinculo.id,
      nombre: savedVinculo.nombre,
    };

    return [vinculoResponseData, null];
  } catch (error) {
    logger.error("Error al crear vínculo:", error);
    return [null, "Error interno del servidor"];
  }
}

