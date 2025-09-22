"use strict";
import { AppDataSource } from "../config/configDb.js";
import Region from "../entities/region.entity.js";

/**
 * Obtiene todas las regiones con filtros opcionales
 */
export async function getRegionesService(filters = {}) {
  try {
    const regionRepository = AppDataSource.getRepository(Region);
    const queryBuilder = regionRepository.createQueryBuilder("region");

    // Aplicar filtros
    if (filters.search) {
      queryBuilder.andWhere(
        "region.nombre ILIKE :search",
        { search: `%${filters.search}%` }
      );
    }

    // Ordenar por nombre
    queryBuilder.orderBy("region.nombre", "ASC");

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 50; // Más alto porque son pocos registros
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [regiones, total] = await queryBuilder.getManyAndCount();

    return {
      regiones,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error al obtener regiones: ${error.message}`);
  }
}

/**
 * Obtiene una región por su ID o nombre
 */
export async function getRegionService(query) {
  try {
    const { id, nombre } = query;
    const regionRepository = AppDataSource.getRepository(Region);

    const region = await regionRepository.findOne({
      where: [{ id }, { nombre }],
      relations: ["comunas"],
    });

    if (!region) {
      throw new Error("Región no encontrada");
    }

    return region;
  } catch (error) {
    throw new Error(`Error al obtener región: ${error.message}`);
  }
}

/**
 * Crea una nueva región
 */
export async function createRegionService(regionData) {
  try {
    const regionRepository = AppDataSource.getRepository(Region);

    // Verificar que no exista una región con el mismo nombre
    const existingRegion = await regionRepository.findOne({
      where: { nombre: regionData.nombre },
    });

    if (existingRegion) {
      throw new Error("Ya existe una región con ese nombre");
    }

    const newRegion = regionRepository.create(regionData);
    const savedRegion = await regionRepository.save(newRegion);

    return savedRegion;
  } catch (error) {
    throw new Error(`Error al crear región: ${error.message}`);
  }
}

/**
 * Actualiza una región existente
 */
export async function updateRegionService(query, updateData) {
  try {
    const { id, nombre } = query;
    const regionRepository = AppDataSource.getRepository(Region);

    const region = await regionRepository.findOne({
      where: [{ id }, { nombre }],
    });

    if (!region) {
      throw new Error("Región no encontrada");
    }

    // Si se está actualizando el nombre, verificar que no exista otra con el mismo nombre
    if (updateData.nombre && updateData.nombre !== region.nombre) {
      const existingRegion = await regionRepository.findOne({
        where: { nombre: updateData.nombre },
      });

      if (existingRegion) {
        throw new Error("Ya existe una región con ese nombre");
      }
    }

    // Actualizar campos
    Object.assign(region, updateData);
    const updatedRegion = await regionRepository.save(region);

    return updatedRegion;
  } catch (error) {
    throw new Error(`Error al actualizar región: ${error.message}`);
  }
}

/**
 * Elimina una región
 */
export async function deleteRegionService(query) {
  try {
    const { id, nombre } = query;
    const regionRepository = AppDataSource.getRepository(Region);

    const region = await regionRepository.findOne({
      where: [{ id }, { nombre }],
      relations: ["comunas"],
    });

    if (!region) {
      throw new Error("Región no encontrada");
    }

    // Verificar si la región tiene comunas asociadas
    if (region.comunas && region.comunas.length > 0) {
      throw new Error(`No se puede eliminar la región "${region.nombre}" porque tiene ${region.comunas.length} comuna(s) asociada(s)`);
    }

    await regionRepository.remove(region);

    return region;
  } catch (error) {
    throw new Error(`Error al eliminar región: ${error.message}`);
  }
}