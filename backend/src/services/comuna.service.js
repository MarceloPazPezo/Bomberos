"use strict";
import { AppDataSource } from "../config/configDb.js";
import Comuna from "../entities/comuna.entity.js";
import Region from "../entities/region.entity.js";

/**
 * Obtiene todas las comunas con filtros opcionales
 */
export async function getComunasService(filters = {}) {
  try {
    const comunaRepository = AppDataSource.getRepository(Comuna);
    const queryBuilder = comunaRepository
      .createQueryBuilder("comuna")
      .leftJoinAndSelect("comuna.region", "region");

    // Aplicar filtros
    if (filters.search) {
      queryBuilder.andWhere(
        "comuna.nombre ILIKE :search",
        { search: `%${filters.search}%` }
      );
    }

    if (filters.idRegion) {
      queryBuilder.andWhere("comuna.idRegion = :idRegion", {
        idRegion: filters.idRegion,
      });
    }

    // Ordenar por región y luego por nombre de comuna
    queryBuilder
      .orderBy("region.nombre", "ASC")
      .addOrderBy("comuna.nombre", "ASC");

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [comunas, total] = await queryBuilder.getManyAndCount();

    return {
      comunas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error al obtener comunas: ${error.message}`);
  }
}

/**
 * Obtiene una comuna por su ID, nombre o idRegion
 */
export async function getComunaService(query) {
  try {
    const { id, nombre, idRegion } = query;
    const comunaRepository = AppDataSource.getRepository(Comuna);

    let whereCondition = [];
    if (id) whereCondition.push({ id });
    if (nombre) whereCondition.push({ nombre });
    if (idRegion) whereCondition.push({ idRegion });

    const comuna = await comunaRepository.findOne({
      where: whereCondition,
      relations: ["region"],
    });

    if (!comuna) {
      throw new Error("Comuna no encontrada");
    }

    return comuna;
  } catch (error) {
    throw new Error(`Error al obtener comuna: ${error.message}`);
  }
}

/**
 * Obtiene todas las comunas de una región específica
 */
export async function getComunasByRegionService(idRegion) {
  try {
    const comunaRepository = AppDataSource.getRepository(Comuna);

    const comunas = await comunaRepository.find({
      where: { idRegion },
      relations: ["region"],
      order: { nombre: "ASC" },
    });

    return comunas;
  } catch (error) {
    throw new Error(`Error al obtener comunas por región: ${error.message}`);
  }
}

/**
 * Crea una nueva comuna
 */
export async function createComunaService(comunaData) {
  try {
    const comunaRepository = AppDataSource.getRepository(Comuna);
    const regionRepository = AppDataSource.getRepository(Region);

    // Verificar que la región existe
    const region = await regionRepository.findOne({
      where: { id: comunaData.idRegion },
    });

    if (!region) {
      throw new Error("La región especificada no existe");
    }

    // Verificar que no exista una comuna con el mismo nombre en la misma región
    const existingComuna = await comunaRepository.findOne({
      where: {
        nombre: comunaData.nombre,
        idRegion: comunaData.idRegion,
      },
    });

    if (existingComuna) {
      throw new Error("Ya existe una comuna con ese nombre en la región especificada");
    }

    const newComuna = comunaRepository.create(comunaData);
    const savedComuna = await comunaRepository.save(newComuna);

    // Obtener la comuna con la relación de región
    const comunaWithRegion = await comunaRepository.findOne({
      where: { id: savedComuna.id },
      relations: ["region"],
    });

    return comunaWithRegion;
  } catch (error) {
    throw new Error(`Error al crear comuna: ${error.message}`);
  }
}

/**
 * Actualiza una comuna existente
 */
export async function updateComunaService(query, updateData) {
  try {
    const { id, nombre } = query;
    const comunaRepository = AppDataSource.getRepository(Comuna);
    const regionRepository = AppDataSource.getRepository(Region);

    const comuna = await comunaRepository.findOne({
      where: [{ id }, { nombre }],
      relations: ["region"],
    });

    if (!comuna) {
      throw new Error("Comuna no encontrada");
    }

    // Si se está actualizando la región, verificar que existe
    if (updateData.idRegion && updateData.idRegion !== comuna.idRegion) {
      const region = await regionRepository.findOne({
        where: { id: updateData.idRegion },
      });

      if (!region) {
        throw new Error("La región especificada no existe");
      }
    }

    // Si se está actualizando el nombre o la región, verificar unicidad
    if (updateData.nombre || updateData.idRegion) {
      const nombreFinal = updateData.nombre || comuna.nombre;
      const idRegionFinal = updateData.idRegion || comuna.idRegion;

      const existingComuna = await comunaRepository.findOne({
        where: {
          nombre: nombreFinal,
          idRegion: idRegionFinal,
        },
      });

      if (existingComuna && existingComuna.id !== comuna.id) {
        throw new Error("Ya existe una comuna con ese nombre en la región especificada");
      }
    }

    // Actualizar campos
    Object.assign(comuna, updateData);
    const updatedComuna = await comunaRepository.save(comuna);

    // Obtener la comuna actualizada con la relación de región
    const comunaWithRegion = await comunaRepository.findOne({
      where: { id: updatedComuna.id },
      relations: ["region"],
    });

    return comunaWithRegion;
  } catch (error) {
    throw new Error(`Error al actualizar comuna: ${error.message}`);
  }
}

/**
 * Elimina una comuna
 */
export async function deleteComunaService(query) {
  try {
    const { id, nombre } = query;
    const comunaRepository = AppDataSource.getRepository(Comuna);

    const comuna = await comunaRepository.findOne({
      where: [{ id }, { nombre }],
      relations: ["region", "direcciones"],
    });

    if (!comuna) {
      throw new Error("Comuna no encontrada");
    }

    // Verificar si la comuna tiene direcciones asociadas
    if (comuna.direcciones && comuna.direcciones.length > 0) {
      throw new Error(`No se puede eliminar la comuna "${comuna.nombre}" porque tiene ${comuna.direcciones.length} dirección(es) asociada(s)`);
    }

    await comunaRepository.remove(comuna);

    return comuna;
  } catch (error) {
    throw new Error(`Error al eliminar comuna: ${error.message}`);
  }
}