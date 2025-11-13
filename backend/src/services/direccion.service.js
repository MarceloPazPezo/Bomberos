"use strict";
import { AppDataSource } from "../config/configDb.js";
import { validarCoordenadas } from "../helpers/geometry.helper.js";
import Direccion from "../entities/direccion.entity.js";

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
      actualizadoPor: direccionData.actualizadoPor || null,
      idPuntoGeografico: direccionData.idPuntoGeografico || null
    });

    const direccionGuardada = await direccionRepository.save(nuevaDireccion);

    // Obtener dirección completa con relaciones
    const direccionCompleta = await direccionRepository.findOne({
      where: { id: direccionGuardada.id },
      relations: ["comuna", "comuna.region", "puntoGeografico"]
    });

    if (!direccionCompleta) {
      return [null, "Error al obtener dirección creada"];
    }

    // Formatear resultado (latitud y longitud vendrán del puntoGeografico si existe)
    const direccionFormateada = {
      id: direccionCompleta.id,
      calle: direccionCompleta.calle,
      numero: direccionCompleta.numero,
      depto: direccionCompleta.depto,
      referencia: direccionCompleta.referencia,
      codigoPostal: direccionCompleta.codigoPostal,
      idComuna: direccionCompleta.idComuna,
      latitud: direccionData.latitud || null,
      longitud: direccionData.longitud || null,
      comuna: direccionCompleta.comuna ? {
        id: direccionCompleta.comuna.id,
        nombre: direccionCompleta.comuna.nombre,
        region: direccionCompleta.comuna.region ? {
          id: direccionCompleta.comuna.region.id,
          nombre: direccionCompleta.comuna.region.nombre
        } : null
      } : null,
      creadoEl: direccionCompleta.creadoEl,
      actualizadoEl: direccionCompleta.actualizadoEl
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

    // Obtener dirección con relaciones
    const direccion = await direccionRepository.findOne({
      where: { id },
      relations: ["comuna", "comuna.region", "puntoGeografico"]
    });

    if (!direccion) {
      return [null, "Dirección no encontrada"];
    }

    // Formatear resultado
    const direccionFormateada = {
      id: direccion.id,
      calle: direccion.calle,
      numero: direccion.numero,
      depto: direccion.depto,
      referencia: direccion.referencia,
      codigoPostal: direccion.codigoPostal,
      idComuna: direccion.idComuna,
      latitud: null,
      longitud: null,
      comuna: direccion.comuna ? {
        id: direccion.comuna.id,
        nombre: direccion.comuna.nombre,
        region: direccion.comuna.region ? {
          id: direccion.comuna.region.id,
          nombre: direccion.comuna.region.nombre
        } : null
      } : null,
      creadoEl: direccion.creadoEl,
      actualizadoEl: direccion.actualizadoEl
    };

    return [direccionFormateada, null];
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

    // Solo actualizar idPuntoGeografico si se proporciona
    if (direccionData.idPuntoGeografico !== undefined) {
      updateData.idPuntoGeografico = direccionData.idPuntoGeografico;
    }

    // Remover campos undefined del objeto de actualización
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Actualizar campos básicos
    await direccionRepository.update(id, updateData);

    // Obtener dirección actualizada con relaciones
    const direccionActualizada = await direccionRepository.findOne({
      where: { id },
      relations: ["comuna", "comuna.region", "puntoGeografico"]
    });

    if (!direccionActualizada) {
      return [null, "Error al obtener dirección actualizada"];
    }

    // Formatear resultado (latitud y longitud del direccionData)
    const direccionFormateada = {
      id: direccionActualizada.id,
      calle: direccionActualizada.calle,
      numero: direccionActualizada.numero,
      depto: direccionActualizada.depto,
      referencia: direccionActualizada.referencia,
      codigoPostal: direccionActualizada.codigoPostal,
      idComuna: direccionActualizada.idComuna,
      latitud: direccionData.latitud || null,
      longitud: direccionData.longitud || null,
      comuna: direccionActualizada.comuna ? {
        id: direccionActualizada.comuna.id,
        nombre: direccionActualizada.comuna.nombre,
        region: direccionActualizada.comuna.region ? {
          id: direccionActualizada.comuna.region.id,
          nombre: direccionActualizada.comuna.region.nombre
        } : null
      } : null,
      creadoEl: direccionActualizada.creadoEl,
      actualizadoEl: direccionActualizada.actualizadoEl
    };

    return [direccionFormateada, null];
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
 * NOTA: Esta función ya no funciona correctamente porque las coordenadas
 * ahora se almacenan en puntos_geograficos, no en direcciones.
 * Se mantiene para compatibilidad pero devuelve array vacío.
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

    // Las coordenadas ahora están en puntos_geograficos, no en direcciones
    // Esta función necesita ser reimplementada para buscar en puntos_geograficos
    // y luego obtener las direcciones relacionadas
    console.warn("getDireccionesCercanasService: Esta función necesita ser reimplementada para el nuevo esquema");
    return [[], null];
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
