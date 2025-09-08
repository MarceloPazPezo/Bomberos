"use strict";
import Compania from "../../entities/compania.entity.js";
import { AppDataSource } from "../configDb.js";
import logger from "../logger.js";

async function crearCompañia() {
  try {
    const compañiaRepository = AppDataSource.getRepository(Compania);

    const count = await compañiaRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Compañía ya existen, omitiendo creación.");
      return;
    }

    const compañiaData = [
      {
        nombre: "Primera Compañía Padre Abdon Maldonado",
        fechaFundacion: "1884-06-24",
        email: "contacto@primeracompania.cl",
        telefono: "+56 2 2345 6789",
        logoURL: null,
        logoKEY: null,
        idDireccion: null,
      }
    ];

    const compañia = compañiaData.map((compañiaData) => compañiaRepository.create(compañiaData));
    await compañiaRepository.save(compañia);
    logger.info("[SERVER] Compañía creada exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearCompañia" });
    throw error;
  }
}

export { crearCompañia };