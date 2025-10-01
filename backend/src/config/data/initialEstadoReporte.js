"use strict";
import { AppDataSource } from "../configDb.js";
import logger from "../logger.js";
import Estado from "../../entities/estadoReporte.entity.js";

async function crearEstados() {
    try {
        const estadoRepository = AppDataSource.getRepository(Estado);
        const count = await estadoRepository.count();
        if (count > 0) {
            logger.info("La tabla 'EstadoReporte' ya contiene datos. No se insertarán datos iniciales.");
            return;
        }
        const estadosData = [
            { id: 1, nombre: "Borrador" },
            { id: 2, nombre: "Enviado" },
            { id: 3, nombre: "Aprobado" },
            { id: 4, nombre: "Corregir" },
        ];

        const estados = estadoRepository.create(estadosData);
        await estadoRepository.save(estados);
        logger.info("Datos iniciales insertados en la tabla 'EstadoReporte'.");
    } catch (error) {
        logger.error("Error al insertar datos iniciales en la tabla 'EstadoReporte':", error);
    }
}

export default crearEstados;
