"use strict";
import Vinculo from "../../entities/vinculo.entity.js";
import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";

async function crearVinculos() {
  try {
    const vinculoRepository = AppDataSource.getRepository(Vinculo);
    const count = await vinculoRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Vínculos ya existen, omitiendo creación.");
      return;
    }

    const vinculosData = [
      {
        nombre: "Padre",
      },
      {
        nombre: "Madre",
      },
      {
        nombre: "Hijo(a)",
      },
      {
        nombre: "Hermano(a)",
      },
      {
        nombre: "Cónyuge",
      },
      {
        nombre: "Pareja",
      },
      {
        nombre: "Abuelo(a)",
      },
      {
        nombre: "Tío(a)",
      },
      {
        nombre: "Primo(a)",
      },
      {
        nombre: "Amigo(a)",
      },
      {
        nombre: "Trabajo",
      },
      {
        nombre: "Vecino",
      },
      {
        nombre: "Otro",
      },
      {
        nombre: "SIN INFORMACION",
      },
    ];

    const vinculos = vinculosData.map((vinculo) => 
      vinculoRepository.create(vinculo)
    );
    
    await vinculoRepository.save(vinculos);
    logger.info(`[SERVER] ${vinculos.length} vínculos creados exitosamente.`);
  } catch (error) {
    logger.errorWithContext(error, { function: "crearVinculos" });
    throw error;
  }
}

export { crearVinculos };

