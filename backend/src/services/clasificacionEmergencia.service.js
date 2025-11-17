"use strict";
import { AppDataSource } from "../config/configDb.js";
import ClasificacionEmergencia from "../entities/clasificacionEmergencia.entity.js";
import logger from "../config/configLogger.js";

export async function getClasificacionEmergenciaService(query) {
  try {
    const { id } = query;

    const clasificacionRepository = AppDataSource.getRepository(ClasificacionEmergencia);

    const clasificacionFound = await clasificacionRepository.findOne({
      where: { id },
    });

    if (!clasificacionFound) return [null, "Clasificación de emergencia no encontrada"];

    const clasificacionData = {
      id: clasificacionFound.id,
      nombre: clasificacionFound.nombre
    };
    return [clasificacionData, null];
  } catch (error) {
    logger.error("Error al obtener la clasificación de emergencia:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getClasificacionesEmergenciaService(queryParams = {}) {
  try {
    const clasificacionRepository = AppDataSource.getRepository(ClasificacionEmergencia);

    const queryBuilder = clasificacionRepository
      .createQueryBuilder("clasificacion")
      .select(["clasificacion.id", "clasificacion.nombre"])
      .orderBy("clasificacion.nombre", "ASC");

    // Solo aplicar paginación si se especifican parámetros
    if (queryParams.page || queryParams.limit) {
      const { page = 1, limit = 10 } = queryParams;
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
    }

    const [clasificaciones, total] = await queryBuilder.getManyAndCount();

    if (!clasificaciones || clasificaciones.length === 0) {
      return [[], null, 0];
    }

    return [clasificaciones, null, total];
  } catch (error) {
    logger.error("Error al obtener las clasificaciones de emergencia:", error);
    return [null, "Error interno del servidor al obtener clasificaciones de emergencia."];
  }
}

export async function updateClasificacionEmergenciaService(query, body) {
  try {
    const { id } = query;

    const clasificacionRepository = AppDataSource.getRepository(ClasificacionEmergencia);

    const clasificacionFound = await clasificacionRepository.findOne({
      where: { id },
    });

    if (!clasificacionFound) return [null, "Clasificación de emergencia no encontrada"];

    // Validar y actualizar campos
    if (body.nombre !== undefined) {
      const nombreTrimmed = body.nombre.trim();
      
      if (nombreTrimmed.length === 0) {
        return [null, "El nombre no puede estar vacío"];
      }

      if (nombreTrimmed.length > 100) {
        return [null, "El nombre debe tener como máximo 100 caracteres"];
      }

      // Verificar unicidad (excepto el mismo registro)
      const existeConMismoNombre = await clasificacionRepository.findOne({
        where: { nombre: nombreTrimmed }
      });

      if (existeConMismoNombre && existeConMismoNombre.id !== id) {
        return [null, `Ya existe una clasificación de emergencia con el nombre "${nombreTrimmed}"`];
      }

      clasificacionFound.nombre = nombreTrimmed;
    }

    const savedClasificacion = await clasificacionRepository.save(clasificacionFound);

    const clasificacionData = {
      id: savedClasificacion.id,
      nombre: savedClasificacion.nombre
    };

    return [clasificacionData, null];
  } catch (error) {
    logger.error("Error al modificar una clasificación de emergencia:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteClasificacionEmergenciaService(query) {
  try {
    const { id } = query;

    const clasificacionRepository = AppDataSource.getRepository(ClasificacionEmergencia);

    const clasificacionFound = await clasificacionRepository.findOne({
      where: { id },
    });

    if (!clasificacionFound) {
      return [null, "Clasificación de emergencia no encontrada"];
    }

    // Verificar si la clasificación está siendo usada por algún subtipo de incidente
    const subtiposCount = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM "subTipoIncidente" WHERE "clasificacion" = $1`,
      [clasificacionFound.id]
    );

    const count = parseInt(subtiposCount[0].count);
    
    if (count > 0) {
      return [null, `No se puede eliminar la clasificación de emergencia "${clasificacionFound.nombre}" porque está asociada a ${count} subtipo(s) de incidente`];
    }

    // Eliminar la clasificación
    await clasificacionRepository.remove(clasificacionFound);

    return [{ id: clasificacionFound.id, nombre: clasificacionFound.nombre }, null];
  } catch (error) {
    logger.error("Error al eliminar una clasificación de emergencia:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createClasificacionEmergenciaService(clasificacionData) {
  try {
    if (!clasificacionData) {
      return [null, "Datos de la clasificación de emergencia no proporcionados"];
    }
    
    const clasificacionRepository = AppDataSource.getRepository(ClasificacionEmergencia);

    // Validar nombre
    if (!clasificacionData.nombre || clasificacionData.nombre.trim().length === 0) {
      return [null, "El nombre es requerido"];
    }

    const nombreTrimmed = clasificacionData.nombre.trim();

    if (nombreTrimmed.length > 100) {
      return [null, "El nombre debe tener como máximo 100 caracteres"];
    }

    // Verificar unicidad
    const existeClasificacion = await clasificacionRepository.findOne({
      where: { nombre: nombreTrimmed }
    });

    if (existeClasificacion) {
      return [null, `Ya existe una clasificación de emergencia con el nombre "${nombreTrimmed}"`];
    }

    const newClasificacion = clasificacionRepository.create({
      nombre: nombreTrimmed,
    });

    const savedClasificacion = await clasificacionRepository.save(newClasificacion);

    const clasificacionResponseData = {
      id: savedClasificacion.id,
      nombre: savedClasificacion.nombre
    };

    return [clasificacionResponseData, null];
  } catch (error) {
    logger.error("Error al crear clasificación de emergencia:", error);
    return [null, "Error interno del servidor"];
  }
}

