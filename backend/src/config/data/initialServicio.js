"use strict";
import Servicio from "../../entities/servicio.entity.js";
import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";

async function crearServiciosExternos() {
  try {
    const servicioRepository = AppDataSource.getRepository(Servicio);
    const count = await servicioRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Servicios ya existen, omitiendo creación.");
      return;
    }

    const serviciosData = [
      {
        nombre: "samu",
      },
      {
        nombre: "carabineros",
      },
      {
        nombre: "bomberos",
      },
      {
        nombre: "policía",
      },
      {
        nombre: "ambulancia",
      },
      {
        nombre: "rescate",
      },
      {
        nombre: "pdi",
      },
      {
        nombre: "armada",
      },
      {
        nombre: "ejército",
      },
      {
        nombre: "fach",
      },
      {
        nombre: "gendarmería",
      },
      {
        nombre: "conaf",
      },
      {
        nombre: "shoa",
      },
      {
        nombre: "sernageomin",
      },
      {
        nombre: "municipalidad",
      },
      {
        nombre: "otro",
      },
    ];

    const servicios = serviciosData.map((servicio) => 
      servicioRepository.create(servicio)
    );
    
    await servicioRepository.save(servicios);
    logger.info(`[SERVER] ${servicios.length} servicios creados exitosamente.`);
  } catch (error) {
    logger.errorWithContext(error, { function: "crearServiciosExternos" });
    throw error;
  }
}

export { crearServiciosExternos };
