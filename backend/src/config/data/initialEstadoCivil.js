"use strict";
import EstadoCivil from "../../entities/estadoCivil.entity.js";
import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";

async function crearEstadosCiviles() {
  try {
    const estadoCivilRepository = AppDataSource.getRepository(EstadoCivil);
    const count = await estadoCivilRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Estados civiles ya existen, omitiendo creación.");
      return;
    }

    const estadosCivilesData = [
      {
        nombre: "soltero",
      },
      {
        nombre: "casado",
      },
      {
        nombre: "divorciado",
      },
      {
        nombre: "viudo",
      },
      {
        nombre: "conviviente",
      },
      {
        nombre: "separado",
      },
      {
        nombre: "otro",
      },
    ];

    const estadosCiviles = estadosCivilesData.map((estado) => 
      estadoCivilRepository.create(estado)
    );
    
    await estadoCivilRepository.save(estadosCiviles);
    logger.info(`[SERVER] ${estadosCiviles.length} estados civiles creados exitosamente.`);
  } catch (error) {
    logger.errorWithContext(error, { function: "crearEstadosCiviles" });
    throw error;
  }
}

export { crearEstadosCiviles };
