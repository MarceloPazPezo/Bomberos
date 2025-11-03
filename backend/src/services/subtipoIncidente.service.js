"use strict";
import { AppDataSource } from "../config/configDb.js";
import SubtipoIncidente from "../entities/subtipoIncidente.entity.js";
import ClasificacionEmergencia from "../entities/clasificacionEmergencia.entity.js";
import TipoDano from "../entities/tipoDano.entity.js";
import FaseIncidente from "../entities/faseIncidente.entity.js";
import ClaveRadial from "../entities/claveRadial.entity.js";
import logger from "../config/configLogger.js";


export async function getClasificacionEmergencia() {
   try {
    const clasificaciones = await AppDataSource.getRepository(ClasificacionEmergencia).find();

    return clasificaciones;
    
   } catch (error) {
        throw error;
   }
}

export async function getSubtipoIncidentes(clasificacionId) {
    try {
        const subtipoIncidentes = await AppDataSource.getRepository(SubtipoIncidente).find({
            where: { clasificacion: clasificacionId },
        });
      
        return subtipoIncidentes;
    } catch (error) {
        throw error;
    }
}

export async function getTipoDano() {
    try {
        const tipoDano = await AppDataSource.getRepository(TipoDano).find();
     
        return tipoDano;
    }
    catch (error) {
        throw error;
    }
}

export async function getFaseIncidente() {
    try {
        const faseIncidente = await AppDataSource.getRepository(FaseIncidente).find();
      
        return faseIncidente;
    }
    catch (error) {
        throw error;
    }
}

// ===== CRUD COMPLETO PARA SUBTIPO INCIDENTE =====

export async function getSubtipoIncidenteService(query) {
  try {
    const { id } = query;

    const subtipoRepository = AppDataSource.getRepository(SubtipoIncidente);

    const subtipoFound = await subtipoRepository.findOne({
      where: { id },
      relations: ['clasificacionEmergencia']
    });

    if (!subtipoFound) return [null, "Subtipo de incidente no encontrado"];

    const subtipoData = {
      id: subtipoFound.id,
      claveRadial: subtipoFound.claveRadial,
      clasificacion: subtipoFound.clasificacion,
      descripcion: subtipoFound.descripcion,
      contieneFuego: subtipoFound.contieneFuego,
      contieneInmuebles: subtipoFound.contieneInmuebles,
      contieneVehiculos: subtipoFound.contieneVehiculos,
      clasificacionEmergencia: subtipoFound.clasificacionEmergencia ? {
        id: subtipoFound.clasificacionEmergencia.id,
        nombre: subtipoFound.clasificacionEmergencia.nombre
      } : null
    };
    return [subtipoData, null];
  } catch (error) {
    logger.error("Error al obtener el subtipo de incidente:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getSubtiposIncidentesService(queryParams = {}) {
  try {
    const subtipoRepository = AppDataSource.getRepository(SubtipoIncidente);

    const queryBuilder = subtipoRepository
      .createQueryBuilder("subtipo")
      .leftJoinAndSelect("subtipo.clasificacionEmergencia", "clasificacion")
      .select([
        "subtipo.id",
        "subtipo.claveRadial",
        "subtipo.clasificacion",
        "subtipo.descripcion",
        "subtipo.contieneFuego",
        "subtipo.contieneInmuebles",
        "subtipo.contieneVehiculos",
        "clasificacion.id",
        "clasificacion.nombre"
      ])
      .orderBy("subtipo.claveRadial", "ASC");

    // Filtro por clasificación si se proporciona
    if (queryParams.clasificacion) {
      queryBuilder.where("subtipo.clasificacion = :clasificacion", { clasificacion: queryParams.clasificacion });
    }

    // Solo aplicar paginación si se especifican parámetros
    if (queryParams.page || queryParams.limit) {
      const { page = 1, limit = 10 } = queryParams;
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
    }

    const [subtipos, total] = await queryBuilder.getManyAndCount();

    if (!subtipos || subtipos.length === 0) {
      return [[], null, 0];
    }

    const subtiposSummarized = subtipos.map((subtipo) => ({
      id: subtipo.id,
      claveRadial: subtipo.claveRadial,
      clasificacion: subtipo.clasificacion,
      descripcion: subtipo.descripcion,
      contieneFuego: subtipo.contieneFuego,
      contieneInmuebles: subtipo.contieneInmuebles,
      contieneVehiculos: subtipo.contieneVehiculos,
      clasificacionEmergencia: subtipo.clasificacionEmergencia ? {
        id: subtipo.clasificacionEmergencia.id,
        nombre: subtipo.clasificacionEmergencia.nombre
      } : null
    }));

    return [subtiposSummarized, null, total];
  } catch (error) {
    logger.error("Error al obtener los subtipos de incidente:", error);
    return [null, "Error interno del servidor al obtener subtipos de incidente."];
  }
}

export async function updateSubtipoIncidenteService(query, body) {
  try {
    const { id } = query;

    const subtipoRepository = AppDataSource.getRepository(SubtipoIncidente);
    const clasificacionRepository = AppDataSource.getRepository(ClasificacionEmergencia);
    const claveRadialRepository = AppDataSource.getRepository(ClaveRadial);

    const subtipoFound = await subtipoRepository.findOne({
      where: { id },
    });

    if (!subtipoFound) return [null, "Subtipo de incidente no encontrado"];

    // Validar y actualizar campos
    if (body.claveRadial !== undefined) {
      const claveRadialTrimmed = body.claveRadial.trim();
      
      if (claveRadialTrimmed.length === 0) {
        return [null, "La clave radial no puede estar vacía"];
      }

      if (claveRadialTrimmed.length > 10) {
        return [null, "La clave radial debe tener como máximo 10 caracteres"];
      }

      // Verificar que la clave radial existe en la tabla ClaveRadial
      const claveRadialExiste = await claveRadialRepository.findOne({
        where: { nombre: claveRadialTrimmed }
      });

      if (!claveRadialExiste) {
        return [null, `La clave radial "${claveRadialTrimmed}" no existe. Debe crearla primero en la tabla de claves radiales.`];
      }

      subtipoFound.claveRadial = claveRadialTrimmed;
    }

    if (body.clasificacion !== undefined) {
      const clasificacionId = parseInt(body.clasificacion, 10);
      
      if (isNaN(clasificacionId) || clasificacionId <= 0) {
        return [null, "La clasificación debe ser un ID válido"];
      }

      // Verificar que la clasificación existe
      const clasificacionExiste = await clasificacionRepository.findOne({
        where: { id: clasificacionId }
      });

      if (!clasificacionExiste) {
        return [null, "La clasificación de emergencia no existe"];
      }

      subtipoFound.clasificacion = clasificacionId;
    }

    if (body.descripcion !== undefined) {
      const descripcionTrimmed = body.descripcion.trim();
      
      if (descripcionTrimmed.length === 0) {
        return [null, "La descripción no puede estar vacía"];
      }

      if (descripcionTrimmed.length > 200) {
        return [null, "La descripción debe tener como máximo 200 caracteres"];
      }

      subtipoFound.descripcion = descripcionTrimmed;
    }

    if (body.contieneFuego !== undefined) {
      subtipoFound.contieneFuego = Boolean(body.contieneFuego);
    }

    if (body.contieneInmuebles !== undefined) {
      subtipoFound.contieneInmuebles = Boolean(body.contieneInmuebles);
    }

    if (body.contieneVehiculos !== undefined) {
      subtipoFound.contieneVehiculos = Boolean(body.contieneVehiculos);
    }

    const savedSubtipo = await subtipoRepository.save(subtipoFound);

    // Cargar relaciones para la respuesta
    const subtipoWithRelations = await subtipoRepository.findOne({
      where: { id: savedSubtipo.id },
      relations: ['clasificacionEmergencia']
    });

    const subtipoData = {
      id: subtipoWithRelations.id,
      claveRadial: subtipoWithRelations.claveRadial,
      clasificacion: subtipoWithRelations.clasificacion,
      descripcion: subtipoWithRelations.descripcion,
      contieneFuego: subtipoWithRelations.contieneFuego,
      contieneInmuebles: subtipoWithRelations.contieneInmuebles,
      contieneVehiculos: subtipoWithRelations.contieneVehiculos,
      clasificacionEmergencia: subtipoWithRelations.clasificacionEmergencia ? {
        id: subtipoWithRelations.clasificacionEmergencia.id,
        nombre: subtipoWithRelations.clasificacionEmergencia.nombre
      } : null
    };

    return [subtipoData, null];
  } catch (error) {
    logger.error("Error al modificar un subtipo de incidente:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteSubtipoIncidenteService(query) {
  try {
    const { id } = query;

    const subtipoRepository = AppDataSource.getRepository(SubtipoIncidente);

    const subtipoFound = await subtipoRepository.findOne({
      where: { id },
    });

    if (!subtipoFound) {
      return [null, "Subtipo de incidente no encontrado"];
    }

    // Verificar si el subtipo está siendo usado por algún incidente
    const incidentesCount = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM "incidente" WHERE "idSubtipoIncidente" = $1`,
      [subtipoFound.id]
    );

    const count = parseInt(incidentesCount[0].count);
    
    if (count > 0) {
      return [null, `No se puede eliminar el subtipo de incidente "${subtipoFound.claveRadial}" porque está asociado a ${count} incidente(s)`];
    }

    // Eliminar el subtipo
    await subtipoRepository.remove(subtipoFound);

    return [{ id: subtipoFound.id, claveRadial: subtipoFound.claveRadial }, null];
  } catch (error) {
    logger.error("Error al eliminar un subtipo de incidente:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createSubtipoIncidenteService(subtipoData) {
  try {
    if (!subtipoData) {
      return [null, "Datos del subtipo de incidente no proporcionados"];
    }
    
    const subtipoRepository = AppDataSource.getRepository(SubtipoIncidente);
    const clasificacionRepository = AppDataSource.getRepository(ClasificacionEmergencia);
    const claveRadialRepository = AppDataSource.getRepository(ClaveRadial);

    // Validar clave radial
    if (!subtipoData.claveRadial || subtipoData.claveRadial.trim().length === 0) {
      return [null, "La clave radial es requerida"];
    }

    const claveRadialTrimmed = subtipoData.claveRadial.trim();

    if (claveRadialTrimmed.length > 10) {
      return [null, "La clave radial debe tener como máximo 10 caracteres"];
    }

    // Verificar que la clave radial existe en la tabla ClaveRadial
    const claveRadialExiste = await claveRadialRepository.findOne({
      where: { nombre: claveRadialTrimmed }
    });

    if (!claveRadialExiste) {
      return [null, `La clave radial "${claveRadialTrimmed}" no existe. Debe crearla primero en la tabla de claves radiales.`];
    }

    // Validar clasificación
    if (!subtipoData.clasificacion) {
      return [null, "La clasificación es requerida"];
    }

    const clasificacionId = parseInt(subtipoData.clasificacion, 10);

    if (isNaN(clasificacionId) || clasificacionId <= 0) {
      return [null, "La clasificación debe ser un ID válido"];
    }

    const clasificacionExiste = await clasificacionRepository.findOne({
      where: { id: clasificacionId }
    });

    if (!clasificacionExiste) {
      return [null, "La clasificación de emergencia no existe"];
    }

    // Validar descripción
    if (!subtipoData.descripcion || subtipoData.descripcion.trim().length === 0) {
      return [null, "La descripción es requerida"];
    }

    const descripcionTrimmed = subtipoData.descripcion.trim();

    if (descripcionTrimmed.length > 200) {
      return [null, "La descripción debe tener como máximo 200 caracteres"];
    }

    const newSubtipo = subtipoRepository.create({
      claveRadial: claveRadialTrimmed,
      clasificacion: clasificacionId,
      descripcion: descripcionTrimmed,
      contieneFuego: Boolean(subtipoData.contieneFuego) || false,
      contieneInmuebles: Boolean(subtipoData.contieneInmuebles) || false,
      contieneVehiculos: Boolean(subtipoData.contieneVehiculos) || false,
    });

    const savedSubtipo = await subtipoRepository.save(newSubtipo);

    // Cargar relaciones para la respuesta
    const subtipoWithRelations = await subtipoRepository.findOne({
      where: { id: savedSubtipo.id },
      relations: ['clasificacionEmergencia']
    });

    const subtipoResponseData = {
      id: subtipoWithRelations.id,
      claveRadial: subtipoWithRelations.claveRadial,
      clasificacion: subtipoWithRelations.clasificacion,
      descripcion: subtipoWithRelations.descripcion,
      contieneFuego: subtipoWithRelations.contieneFuego,
      contieneInmuebles: subtipoWithRelations.contieneInmuebles,
      contieneVehiculos: subtipoWithRelations.contieneVehiculos,
      clasificacionEmergencia: subtipoWithRelations.clasificacionEmergencia ? {
        id: subtipoWithRelations.clasificacionEmergencia.id,
        nombre: subtipoWithRelations.clasificacionEmergencia.nombre
      } : null
    };

    return [subtipoResponseData, null];
  } catch (error) {
    logger.error("Error al crear subtipo de incidente:", error);
    return [null, "Error interno del servidor"];
  }
}
