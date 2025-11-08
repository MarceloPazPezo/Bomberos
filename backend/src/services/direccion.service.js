"use strict";
import { AppDataSource } from "../config/configDb.js";
import { validarCoordenadas } from "../helpers/geometry.helper.js";

/**
 * Crea una nueva dirección
 * @param {Object} direccionData - Datos de la dirección
 * @returns {Promise<Array>} Dirección creada o error
 */
export async function createDireccionService(direccionData) {
  try {
    const direccionRepository = AppDataSource.getRepository("Direccion");
    const comunaRepository = AppDataSource.getRepository("Comuna");
    const comuna = await comunaRepository.findOne({
      where: { id: direccionData.idComuna }
    });

    if (!comuna) {
      return [null, "Comuna no encontrada"];
    }

    // Crear la dirección básica
    const nuevaDireccion = direccionRepository.create({
      calle: direccionData.calle,
      numero: direccionData.numero,
      depto: direccionData.depto || null,
      referencia: direccionData.referencia || null,
      codigoPostal: direccionData.codigoPostal || null,
      idComuna: direccionData.idComuna,
      creadoPor: direccionData.creadoPor || null,
      actualizadoPor: direccionData.actualizadoPor || null
    });

    const direccionGuardada = await direccionRepository.save(nuevaDireccion);

    // Si hay coordenadas, actualizar con el punto geométrico
    if (direccionData.latitud && direccionData.longitud) {
      if (!validarCoordenadas(direccionData.latitud, direccionData.longitud)) {
        return [null, "Coordenadas inválidas. Latitud debe estar entre -90 y 90, longitud entre -180 y 180"];
      }
      
      // Actualizar con el punto geométrico usando SQL directo
      await AppDataSource.query(
        `UPDATE direcciones 
         SET punto = ST_SetSRID(ST_MakePoint($1, $2), 4326)
         WHERE id = $3`,
        [direccionData.longitud, direccionData.latitud, direccionGuardada.id]
      );
    }

    // Obtener dirección completa con coordenadas extraídas
    const direccionCompleta = await direccionRepository
      .createQueryBuilder("direccion")
      .leftJoinAndSelect("direccion.comuna", "comuna")
      .leftJoinAndSelect("comuna.region", "region")
      .addSelect("ST_Y(direccion.punto)", "lat")
      .addSelect("ST_X(direccion.punto)", "lng")
      .where("direccion.id = :id", { id: direccionGuardada.id })
      .getRawOne();

    if (!direccionCompleta) {
      return [null, "Error al obtener dirección creada"];
    }

    // Formatear resultado
    const direccionFormateada = {
      id: direccionCompleta.direccion_id,
      calle: direccionCompleta.direccion_calle,
      numero: direccionCompleta.direccion_numero,
      depto: direccionCompleta.direccion_depto,
      referencia: direccionCompleta.direccion_referencia,
      codigoPostal: direccionCompleta.direccion_codigoPostal,
      idComuna: direccionCompleta.direccion_idComuna,
      latitud: direccionCompleta.lat ? parseFloat(direccionCompleta.lat) : null,
      longitud: direccionCompleta.lng ? parseFloat(direccionCompleta.lng) : null,
      comuna: direccionCompleta.comuna ? {
        id: direccionCompleta.comuna_id,
        nombre: direccionCompleta.comuna_nombre,
        region: direccionCompleta.region ? {
          id: direccionCompleta.region_id,
          nombre: direccionCompleta.region_nombre
        } : null
      } : null,
      creadoEl: direccionCompleta.direccion_creadoEl,
      actualizadoEl: direccionCompleta.direccion_actualizadoEl
    };

    return [direccionFormateada, null];
  } catch (error) {
    console.error("Error al crear dirección:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtiene una dirección por ID
 * @param {number} id - ID de la dirección
 * @returns {Promise<Array>} Dirección encontrada o error
 */
export async function getDireccionService(id) {
  try {
    const direccionRepository = AppDataSource.getRepository("Direccion");
    
    // Obtener dirección con coordenadas extraídas
    const direccionRaw = await direccionRepository
      .createQueryBuilder("direccion")
      .leftJoinAndSelect("direccion.comuna", "comuna")
      .leftJoinAndSelect("comuna.region", "region")
      .addSelect("ST_Y(direccion.punto)", "lat")
      .addSelect("ST_X(direccion.punto)", "lng")
      .where("direccion.id = :id", { id })
      .getRawOne();

    if (!direccionRaw) {
      return [null, "Dirección no encontrada"];
    }

    // Formatear resultado
    const direccion = {
      id: direccionRaw.direccion_id,
      calle: direccionRaw.direccion_calle,
      numero: direccionRaw.direccion_numero,
      depto: direccionRaw.direccion_depto,
      referencia: direccionRaw.direccion_referencia,
      codigoPostal: direccionRaw.direccion_codigoPostal,
      idComuna: direccionRaw.direccion_idComuna,
      latitud: direccionRaw.lat ? parseFloat(direccionRaw.lat) : null,
      longitud: direccionRaw.lng ? parseFloat(direccionRaw.lng) : null,
      comuna: direccionRaw.comuna ? {
        id: direccionRaw.comuna_id,
        nombre: direccionRaw.comuna_nombre,
        region: direccionRaw.region ? {
          id: direccionRaw.region_id,
          nombre: direccionRaw.region_nombre
        } : null
      } : null,
      creadoEl: direccionRaw.direccion_creadoEl,
      actualizadoEl: direccionRaw.direccion_actualizadoEl
    };

    return [direccion, null];
  } catch (error) {
    console.error("Error al obtener dirección:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Actualiza una dirección
 * @param {number} id - ID de la dirección
 * @param {Object} direccionData - Datos actualizados
 * @returns {Promise<Array>} Dirección actualizada o error
 */
export async function updateDireccionService(id, direccionData) {
  try {
    const direccionRepository = AppDataSource.getRepository("Direccion");

    const direccionExistente = await direccionRepository.findOne({
      where: { id }
    });

    if (!direccionExistente) {
      return [null, "Dirección no encontrada"];
    }

    if (direccionData.idComuna && direccionData.idComuna !== direccionExistente.idComuna) {
      const comunaRepository = AppDataSource.getRepository("Comuna");
      const comuna = await comunaRepository.findOne({
        where: { id: direccionData.idComuna }
      });

      if (!comuna) {
        return [null, "Comuna no encontrada"];
      }
    }

    // Preparar datos de actualización (solo campos que se proporcionen)
    const updateData = {
      calle: direccionData.calle,
      numero: direccionData.numero,
      depto: direccionData.depto !== undefined ? (direccionData.depto || null) : undefined,
      referencia: direccionData.referencia !== undefined ? (direccionData.referencia || null) : undefined,
      codigoPostal: direccionData.codigoPostal !== undefined ? (direccionData.codigoPostal || null) : undefined,
      actualizadoPor: direccionData.actualizadoPor || null,
      actualizadoEl: new Date()
    };

    // Solo actualizar idComuna si se proporciona un valor válido
    if (direccionData.idComuna !== undefined && direccionData.idComuna !== null) {
      updateData.idComuna = direccionData.idComuna;
    }

    // Remover campos undefined del objeto de actualización
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Actualizar campos básicos
    await direccionRepository.update(id, updateData);

    // Actualizar punto geométrico si hay coordenadas
    if (direccionData.latitud !== undefined && direccionData.longitud !== undefined) {
      if (direccionData.latitud && direccionData.longitud) {
        if (!validarCoordenadas(direccionData.latitud, direccionData.longitud)) {
          return [null, "Coordenadas inválidas. Latitud debe estar entre -90 y 90, longitud entre -180 y 180"];
        }
        
        await AppDataSource.query(
          `UPDATE direcciones 
           SET punto = ST_SetSRID(ST_MakePoint($1, $2), 4326)
           WHERE id = $3`,
          [direccionData.longitud, direccionData.latitud, id]
        );
      } else {
        // Si se envían null, eliminar el punto
        await AppDataSource.query(
          `UPDATE direcciones SET punto = NULL WHERE id = $1`,
          [id]
        );
      }
    }

    // Obtener dirección actualizada con coordenadas
    const direccionActualizadaRaw = await direccionRepository
      .createQueryBuilder("direccion")
      .leftJoinAndSelect("direccion.comuna", "comuna")
      .leftJoinAndSelect("comuna.region", "region")
      .addSelect("ST_Y(direccion.punto)", "lat")
      .addSelect("ST_X(direccion.punto)", "lng")
      .where("direccion.id = :id", { id })
      .getRawOne();

    if (!direccionActualizadaRaw) {
      return [null, "Error al obtener dirección actualizada"];
    }

    // Formatear resultado
    const direccionActualizada = {
      id: direccionActualizadaRaw.direccion_id,
      calle: direccionActualizadaRaw.direccion_calle,
      numero: direccionActualizadaRaw.direccion_numero,
      depto: direccionActualizadaRaw.direccion_depto,
      referencia: direccionActualizadaRaw.direccion_referencia,
      codigoPostal: direccionActualizadaRaw.direccion_codigoPostal,
      idComuna: direccionActualizadaRaw.direccion_idComuna,
      latitud: direccionActualizadaRaw.lat ? parseFloat(direccionActualizadaRaw.lat) : null,
      longitud: direccionActualizadaRaw.lng ? parseFloat(direccionActualizadaRaw.lng) : null,
      comuna: direccionActualizadaRaw.comuna ? {
        id: direccionActualizadaRaw.comuna_id,
        nombre: direccionActualizadaRaw.comuna_nombre,
        region: direccionActualizadaRaw.region ? {
          id: direccionActualizadaRaw.region_id,
          nombre: direccionActualizadaRaw.region_nombre
        } : null
      } : null,
      creadoEl: direccionActualizadaRaw.direccion_creadoEl,
      actualizadoEl: direccionActualizadaRaw.direccion_actualizadoEl
    };

    return [direccionActualizada, null];
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Elimina una dirección
 * @param {number} id - ID de la dirección
 * @returns {Promise<Array>} Resultado de la eliminación
 */
export async function deleteDireccionService(id) {
  try {
    const direccionRepository = AppDataSource.getRepository("Direccion");

    const direccion = await direccionRepository.findOne({
      where: { id }
    });

    if (!direccion) {
      return [null, "Dirección no encontrada"];
    }

    await direccionRepository.remove(direccion);

    return [true, null];
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Busca direcciones por criterios
 * @param {Object} criterios - Criterios de búsqueda
 * @returns {Promise<Array>} Lista de direcciones encontradas
 */
export async function searchDireccionesService(criterios) {
  try {
    const direccionRepository = AppDataSource.getRepository("Direccion");

    const queryBuilder = direccionRepository
      .createQueryBuilder("direccion")
      .leftJoinAndSelect("direccion.comuna", "comuna")
      .leftJoinAndSelect("comuna.region", "region");

    if (criterios.calle) {
      queryBuilder.andWhere("direccion.calle ILIKE :calle", {
        calle: `%${criterios.calle}%`
      });
    }

    if (criterios.numero) {
      queryBuilder.andWhere("direccion.numero ILIKE :numero", {
        numero: `%${criterios.numero}%`
      });
    }

    if (criterios.idComuna) {
      queryBuilder.andWhere("direccion.idComuna = :idComuna", {
        idComuna: criterios.idComuna
      });
    }

    if (criterios.idRegion) {
      queryBuilder.andWhere("region.id = :idRegion", {
        idRegion: criterios.idRegion
      });
    }

    const direcciones = await queryBuilder
      .orderBy("direccion.calle", "ASC")
      .addOrderBy("direccion.numero", "ASC")
      .getMany();

    return [direcciones, null];
  } catch (error) {
    console.error("Error al buscar direcciones:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Busca direcciones cercanas a una ubicación (consulta geoespacial)
 * @param {number} lat - Latitud del punto de referencia
 * @param {number} lng - Longitud del punto de referencia
 * @param {number} radio - Radio de búsqueda en metros (default: 5000)
 * @returns {Promise<Array>} Lista de direcciones cercanas con distancia
 */
export async function getDireccionesCercanasService(lat, lng, radio = 5000) {
  try {
    if (!validarCoordenadas(lat, lng)) {
      return [null, "Coordenadas inválidas"];
    }

    const direccionRepository = AppDataSource.getRepository("Direccion");
    
    const direcciones = await direccionRepository
      .createQueryBuilder("direccion")
      .select([
        "direccion.id",
        "direccion.calle",
        "direccion.numero",
        "direccion.depto",
      ])
      .leftJoinAndSelect("direccion.comuna", "comuna")
      .leftJoinAndSelect("comuna.region", "region")
      .addSelect("ST_Y(direccion.punto)", "lat")
      .addSelect("ST_X(direccion.punto)", "lng")
      .addSelect(
        `ST_Distance(
          direccion.punto::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
        )`,
        "distancia"
      )
      .where(`ST_DWithin(
        direccion.punto::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
        :radio
      )`)
      .andWhere("direccion.punto IS NOT NULL")
      .setParameters({ lat, lng, radio })
      .orderBy("distancia", "ASC")
      .getRawMany();

    const direccionesFormateadas = direcciones.map(d => ({
      id: d.direccion_id,
      calle: d.direccion_calle,
      numero: d.direccion_numero,
      depto: d.direccion_depto,
      coordenadas: {
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lng),
      },
      comuna: d.comuna ? {
        id: d.comuna_id,
        nombre: d.comuna_nombre,
        region: d.region ? {
          id: d.region_id,
          nombre: d.region_nombre
        } : null
      } : null,
      distancia: parseFloat(d.distancia),
    }));

    return [direccionesFormateadas, null];
  } catch (error) {
    console.error("Error al buscar direcciones cercanas:", error);
    return [null, error.message];
  }
}

/**
 * Alias para compatibilidad con código existente
 * Crea una dirección (versión con manager para transacciones)
 */
export async function crearDireccionService(direccionData, manager = null) {
  const direccionRepository = (manager || AppDataSource).getRepository("Direccion");
  const nuevaDireccion = direccionRepository.create(direccionData);
  const saved = await direccionRepository.save(nuevaDireccion);
  return saved.id;
}

/**
 * Alias para compatibilidad con código existente
 * Actualiza una dirección (versión con manager para transacciones)
 */
export async function actualizarDireccionService(idDireccion, direccionData, manager = null) {
  const direccionRepository = (manager || AppDataSource).getRepository("Direccion");
  const direccion = await direccionRepository.findOne({ where: { id: idDireccion } });
  if (!direccion) {
    throw new Error("Dirección no encontrada");
  }
  direccionRepository.merge(direccion, direccionData);
  return await direccionRepository.save(direccion);
}

/**
 * Alias para compatibilidad con código existente
 * Elimina una dirección (versión con manager para transacciones)
 */
export async function eliminarDireccionService(idDireccion, manager = null) {
  const direccionRepository = (manager || AppDataSource).getRepository("Direccion");
  const direccion = await direccionRepository.findOne({ where: { id: idDireccion } });
  if (!direccion) {
    throw new Error("Dirección no encontrada");
  }
  return await direccionRepository.remove(direccion);
}
