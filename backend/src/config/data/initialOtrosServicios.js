"use strict";
import { AppDataSource } from "../configDb.js";
import logger from "../logger.js";
import Servicios from "../../entities/servicio.entity.js";

async function crearServicios() {
    try {
    const serviciosRepository = AppDataSource.getRepository(Servicios);
    const count = await serviciosRepository.count();
    if (count > 0) {
        logger.info("La tabla 'Servicios' ya contiene datos. No se insertarán datos iniciales.");
        return;
    }
    const serviciosData = [
        { nombre: "SAMU" },
        { nombre: "Carabineros" },
        { nombre: "Emergencias Municipal" },
        { nombre: "CONAF" },
        { nombre: "Brigada Forestal" },
        { nombre: "Compañía Eléctrica" },
        { nombre: "Compañía de agua" },
    ];
    
    const servicios = serviciosRepository.create(serviciosData);
    await serviciosRepository.save(servicios);
    logger.info("Datos iniciales insertados en la tabla 'Servicios'.");
    } catch (error) {
        logger.error("Error al insertar datos iniciales en la tabla 'Servicios':", error);
    }
}

export default crearServicios;
