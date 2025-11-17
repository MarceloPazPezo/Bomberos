"use strict";
import ClaveRadial from "../../entities/claveRadial.entity.js";
import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";

async function crearClavesRadiales() {
    try {
        const claveRadialRepository = AppDataSource.getRepository(ClaveRadial);
        const count = await claveRadialRepository.count();
        if (count > 0) {
            logger.info("[SERVER] Claves radiales ya existen, omitiendo creación.");
            return;
        }

        // Definir claves radiales directamente desde los datos de initialExtra.js
        // Estas son las claves radiales que se usan en SubtipoIncidente
        const clavesRadialesData = [
            "10-0-1", "10-0-2", "10-0-3", "10-0-4", "10-0-5",
            "10-1-1", "10-1-2", "10-1-3", "10-1-4",
            "10-2-1", "10-2-2",
            "10-3-1", "10-3-2", "10-3-3", "10-3-4", "10-3-5", "10-3-6", "10-3-7", "10-3-8", "10-3-9",
            "10-4-1", "10-4-2", "10-4-3", "10-4-4",
            "10-5-1", "10-5-2", "10-5-3",
            "10-6-2", "10-6-3", "10-6-4",
            "10-7-1", "10-7-2",
            "10-8-1", "10-8-2", "10-8-3", "10-8-4", "10-8-5",
            "10-9", "10-10", "10-11", "10-12", "10-13", "10-14", "10-15"
        ];

        // Crear registros de ClaveRadial
        const clavesRadiales = clavesRadialesData.map((nombre) =>
            claveRadialRepository.create({ nombre })
        );

        await claveRadialRepository.save(clavesRadiales);
        logger.info(`[SERVER] ${clavesRadiales.length} claves radiales creadas exitosamente.`);
    } catch (error) {
        logger.errorWithContext(error, { function: "crearClavesRadiales" });
        throw error;
    }
}

export { crearClavesRadiales };

