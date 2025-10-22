"use strict";
import Carro from "../../entities/carro.entity.js";
import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";

async function crearCarrosPredeterminados() {
  try {
    const carroRepository = AppDataSource.getRepository(Carro);
    const count = await carroRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Carros ya existen, omitiendo creación.");
      return;
    }

    // Obtener la primera compañía para asignar los carros
    const companiaRepository = AppDataSource.getRepository('Compania');
    const primeraCompania = await companiaRepository.findOne({
      where: {},
      order: { id: 'ASC' }
    });

    if (!primeraCompania) {
      logger.warn("[SERVER] No se encontró ninguna compañía para asignar carros.");
      return;
    }

    const carrosData = [
      { patente: "ABC-123", capacidadPasajeros: 6, idCompania: primeraCompania.id },
      { patente: "DEF-456", capacidadPasajeros: 8, idCompania: primeraCompania.id },
      { patente: "GHI-789", capacidadPasajeros: 4, idCompania: primeraCompania.id },
      { patente: "JKL-012", capacidadPasajeros: 6, idCompania: primeraCompania.id },
      { patente: "MNO-345", capacidadPasajeros: 8, idCompania: primeraCompania.id },
      { patente: "PQR-678", capacidadPasajeros: 4, idCompania: primeraCompania.id },
      { patente: "STU-901", capacidadPasajeros: 6, idCompania: primeraCompania.id },
      { patente: "VWX-234", capacidadPasajeros: 8, idCompania: primeraCompania.id },
      { patente: "YZA-567", capacidadPasajeros: 4, idCompania: primeraCompania.id },
      { patente: "BCD-890", capacidadPasajeros: 6, idCompania: primeraCompania.id },
    ];

    const carros = carrosData.map((carro) =>
      carroRepository.create(carro)
    );

    await carroRepository.save(carros);
    logger.info(`[SERVER] ${carros.length} carros creados exitosamente.`);
  } catch (error) {
    logger.errorWithContext(error, { function: "crearCarrosPredeterminados" });
    throw error;
  }
}

export { crearCarrosPredeterminados };
