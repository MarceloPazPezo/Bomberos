"use strict";
import { AppDataSource } from "../config/configDb.js";
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

    const direccionCompleta = await direccionRepository.findOne({
      where: { id: direccionGuardada.id },
      relations: ["comuna", "comuna.region"]
    });

    return [direccionCompleta, null];
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
    const direccion = await direccionRepository.findOne({
      where: { id },
      relations: ["comuna", "comuna.region"]
    });

    if (!direccion) {
      return [null, "Dirección no encontrada"];
    }

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

    await direccionRepository.update(id, {
      calle: direccionData.calle,
      numero: direccionData.numero,
      depto: direccionData.depto || null,
      referencia: direccionData.referencia || null,
      codigoPostal: direccionData.codigoPostal || null,
      idComuna: direccionData.idComuna,
      actualizadoPor: direccionData.actualizadoPor || null,
      actualizadoEl: new Date()
    });

    const direccionActualizada = await direccionRepository.findOne({
      where: { id },
      relations: ["comuna", "comuna.region"]
    });

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
