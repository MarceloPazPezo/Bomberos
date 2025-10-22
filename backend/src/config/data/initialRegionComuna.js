"use strict";
import Region from "../../entities/region.entity.js";
import Comuna from "../../entities/comuna.entity.js";
import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";
import { readFile } from 'fs/promises';

async function crearRegiones() {
  try {
    const regionRepository = AppDataSource.getRepository(Region);
    const count = await regionRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Regiones ya existen, omitiendo creación.");
      return;
    }

    const regionesData = [
      {
        nombre: "De Arica y Parinacota",
      },
      {
        nombre: "De Tarapacá",
      },
      {
        nombre: "De Antofagasta",
      },
      {
        nombre: "De Atacama",
      },
      {
        nombre: "De Coquimbo",
      },
      {
        nombre: "De Valparaíso",
      },
      {
        nombre: "Del Libertador General Bernardo O’Higgins",
      },
      {
        nombre: "Del Maule",
      },
      {
        nombre: "Del Bíobío",
      },
      {
        nombre: "De Ñuble",
      },
      {
        nombre: "De La Araucanía",
      },
      {
        nombre: "De Los Ríos",
      },
      {
        nombre: "De Los Lagos",
      },
      {
        nombre: "De Aysén del General Carlos Ibáñez del Campo",
      },
      {
        nombre: "De Magallanes y de la Antártica Chilena",
      },
      {
        nombre: "Metropolitana de Santiago",
      },
    ];

    const regiones = regionesData.map((r) => regionRepository.create(r));
    await regionRepository.save(regiones);
    logger.info("[SERVER] Regiones creadas exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearRegiones" });
    throw error;
  }
}

async function crearComunas() {
  try {
    const comunaRepository = AppDataSource.getRepository(Comuna);
    const regionRepository = AppDataSource.getRepository(Region);

    const count = await comunaRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Comunas ya existen, omitiendo creación.");
      return;
    }

    const data = await readFile(new URL('./regiones_comunas.json', import.meta.url), 'utf-8');
    const regionesComunas = JSON.parse(data);
    
    for (const regionObj of regionesComunas) {
      const region = await regionRepository.findOneBy({
        nombre: regionObj.region,
      });
      if (!region) {
        logger.warn(`[SERVER] Región no encontrada: ${regionObj.region}`);
        continue;
      }
      
      // Verificar si ya existen comunas para esta región
      const comunasExistentes = await comunaRepository.findBy({ idRegion: region.id });
      if (comunasExistentes.length > 0) {
        logger.info(`[SERVER] Comunas de ${regionObj.region} ya existen, omitiendo.`);
        continue;
      }
      
      const comunas = regionObj.comunas.map((nombreComuna) =>
        comunaRepository.create({ nombre: nombreComuna, idRegion: region.id }),
      );
      
      try {
        await comunaRepository.save(comunas);
        logger.info(
          `[SERVER] Comunas de ${regionObj.region} creadas exitosamente`,
        );
      } catch (saveError) {
        logger.error(`[SERVER] Error al guardar comunas de ${regionObj.region}:`, saveError.message);
        // Continuar con la siguiente región en lugar de fallar completamente
        continue;
      }
    }
  } catch (error) {
    logger.errorWithContext(error, { function: "crearComunas" });
    throw error;
  }
}

export { crearRegiones, crearComunas };
