"use strict";
import { AppDataSource } from "../config/configDb.js";
import afectado from "../entities/afectado.entity.js";

export const createAfectadoService = async (data) => {
    try {
        const afectadoRepository = AppDataSource.getRepository(afectado);
        const newAfectado = afectadoRepository.create(data);
        await afectadoRepository.save(newAfectado);
        return newAfectado;
    } catch (error) {
        console.error("Error al crear afectado:", error);
        throw new Error(`Error al crear afectado: ${error.message}`);
    }
}

export const updateAfectadoService = async (id, data) => {
    try {
        const afectadoRepository = AppDataSource.getRepository(afectado);
        let afectadoEntity = await afectadoRepository.findOneBy({ id: id });
        if (!afectadoEntity) {
            throw new Error("Afectado no encontrado");
        }
        afectadoRepository.merge(afectadoEntity, data);
        const updatedAfectado = await afectadoRepository.save(afectadoEntity);
        return updatedAfectado;
    } catch (error) {
        console.log("Error al actualizar afectado:", error);
        throw new Error(`Error al actualizar afectado: ${error.message}`);
    }
}