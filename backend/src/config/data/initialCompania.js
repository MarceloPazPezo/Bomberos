"use strict";
import Compania from "../../entities/compania.entity.js";
import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";

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
        logoKEY: null,
        bannerKEY: null,
        idDireccion: null,
      },
      {
        nombre: "Segunda Compañía Bomberos de Santiago",
        fechaFundacion: "1890-03-15",
        email: "contacto@segundacompania.cl",
        telefono: "+56 2 3456 7890",
        logoKEY: null,
        bannerKEY: null,
        idDireccion: null,
      },
      {
        nombre: "Tercera Compañía Bomberos de Valparaíso",
        fechaFundacion: "1895-08-20",
        email: "contacto@terceracompania.cl",
        telefono: "+56 32 4567 8901",
        logoKEY: null,
        bannerKEY: null,
        idDireccion: null,
      },
      {
        nombre: "Cuarta Compañía Bomberos de Concepción",
        fechaFundacion: "1900-12-10",
        email: "contacto@cuartacompania.cl",
        telefono: "+56 41 5678 9012",
        logoKEY: null,
        bannerKEY: null,
        idDireccion: null,
      },
      {
        nombre: "Quinta Compañía Bomberos de Antofagasta",
        fechaFundacion: "1905-05-25",
        email: "contacto@quintacompania.cl",
        telefono: "+56 55 6789 0123",
        logoKEY: null,
        bannerKEY: null,
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