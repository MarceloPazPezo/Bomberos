"use strict";
import { AppDataSource } from "../config/configDb.js";
import Region from "../entities/region.entity.js";

/**
 * Obtiene todas las regiones
 * @returns {Promise<Array>} Lista de regiones
 */
export async function getRegionesService(filters = {}) {
  try {
    const regionRepository = AppDataSource.getRepository(Region);
    const qb = regionRepository
      .createQueryBuilder("region")
      .leftJoinAndSelect("region.comunas", "comuna");

    if (filters.search) {
      qb.andWhere("region.nombre ILIKE :search", { search: `%${filters.search}%` });
    }

    qb.orderBy("region.nombre", "ASC");

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [regiones, total] = await qb.getManyAndCount();

    return [{
      regiones,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    }, null];
  } catch (error) {
    console.error("Error al obtener regiones:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtiene una región por ID
 * @param {number} id - ID de la región
 * @returns {Promise<Array>} Región encontrada o error
 */
export async function getRegionService(id) {
  try {
    const regionRepository = AppDataSource.getRepository("Region");
    const region = await regionRepository.findOne({
      where: { id },
      relations: ["comunas"]
    });

    if (!region) {
      return [null, "Región no encontrada"];
    }

    return [region, null];
  } catch (error) {
    console.error("Error al obtener región:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtiene todas las comunas
 * @returns {Promise<Array>} Lista de comunas
 */
export async function getComunasService() {
  try {
    const comunaRepository = AppDataSource.getRepository("Comuna");
    const comunas = await comunaRepository.find({
      relations: ["region"],
      order: { nombre: "ASC" }
    });
    return [comunas, null];
  } catch (error) {
    console.error("Error al obtener comunas:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtiene comunas por región
 * @param {number} idRegion - ID de la región
 * @returns {Promise<Array>} Lista de comunas de la región
 */
export async function getComunasByRegionService(idRegion) {
  try {
    const comunaRepository = AppDataSource.getRepository("Comuna");
    const comunas = await comunaRepository.find({
      where: { idRegion },
      relations: ["region"],
      order: { nombre: "ASC" }
    });
    return [comunas, null];
  } catch (error) {
    console.error("Error al obtener comunas por región:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtiene una comuna por ID
 * @param {number} id - ID de la comuna
 * @returns {Promise<Array>} Comuna encontrada o error
 */
export async function getComunaService(id) {
  try {
    const comunaRepository = AppDataSource.getRepository("Comuna");
    const comuna = await comunaRepository.findOne({
      where: { id },
      relations: ["region"]
    });

    if (!comuna) {
      return [null, "Comuna no encontrada"];
    }

    return [comuna, null];
  } catch (error) {
    console.error("Error al obtener comuna:", error);
    return [null, "Error interno del servidor"];
  }
}

// Crear región
export async function createRegionService(data) {
  try {
    const repo = AppDataSource.getRepository(Region);
    const region = repo.create({ nombre: data.nombre });
    await repo.save(region);
    return [region, null];
  } catch (error) {
    return [null, error.message];
  }
}

// Actualizar región
export async function updateRegionService(id, data) {
  try {
    const repo = AppDataSource.getRepository(Region);
    const region = await repo.findOne({ where: { id } });
    if (!region) return [null, "Región no encontrada"];
    if (data.nombre) region.nombre = data.nombre;
    await repo.save(region);
    return [region, null];
  } catch (error) {
    return [null, error.message];
  }
}

// Eliminar región
export async function deleteRegionService(id) {
  try {
    const repo = AppDataSource.getRepository(Region);
    const region = await repo.findOne({ where: { id } });
    if (!region) return [null, "Región no encontrada"];
    await repo.remove(region);
    return [{ message: "Región eliminada" }, null];
  } catch (error) {
    return [null, error.message];
  }
}