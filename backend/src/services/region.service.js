"use strict";
import { AppDataSource } from "../config/configDb.js";

/**
 * Obtiene todas las regiones
 * @returns {Promise<Array>} Lista de regiones
 */
export async function getRegionesService() {
  try {
    const regionRepository = AppDataSource.getRepository("Region");
    const regiones = await regionRepository.find({
      relations: ["comunas"],
      order: { nombre: "ASC" }
    });
    return [regiones, null];
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