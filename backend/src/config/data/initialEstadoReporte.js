"use strict";
import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";
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
            { id: 1, nombre: "Borrador", color: "#FFA500"}, //color naranja
            { id: 2, nombre: "Enviado", color: "#0000FF"}, //color azul
            { id: 3, nombre: "Aprobado", color: "#008000"}, //color verde
            { id: 4, nombre: "Corregir", color: "#FF0000"}, //color rojo
        ];

        const estados = estadoRepository.create(estadosData);
        await estadoRepository.save(estados);
        logger.info("Datos iniciales insertados en la tabla 'EstadoReporte'.");
    } catch (error) {
        logger.error("Error al insertar datos iniciales en la tabla 'EstadoReporte':", error);
    }
}

export default crearEstados;
