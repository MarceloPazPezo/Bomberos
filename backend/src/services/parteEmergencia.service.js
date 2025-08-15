"use strict";
import { AppDataSource } from "../config/configDb.js";
import ParteEmergencia from "../entities/parte_emergencia.entity.js";

export const createParteEmergenciaService = async (data) => {
    try {
        const parteEmergenciaRepository = AppDataSource.getRepository(ParteEmergencia);
        const newParteEmergencia = parteEmergenciaRepository.create(data);
        await parteEmergenciaRepository.save(newParteEmergencia);
        console.log("Parte de emergencia creada:");

        return newParteEmergencia;
    } catch (error) {
        console.error("Error al crear parte de emergencia:", error);
        throw new Error(`Error al crear parte de emergencia: ${error.message}`);
    }
}

export const updateParteEmergenciaService = async (id, data) => {
    try {
        const parteEmergenciaRepository = AppDataSource.getRepository(ParteEmergencia);
        let parteEmergencia = await parteEmergenciaRepository.findOneBy({ id: id });
        if (!parteEmergencia) {
            throw new Error("Parte de emergencia no encontrado");
        }
        parteEmergenciaRepository.merge(parteEmergencia, data);
        const updatedParteEmergencia = await parteEmergenciaRepository.save(parteEmergencia);
        console.log("Parte de emergencia actualizado:");

        return updatedParteEmergencia;
    } catch (error) {
        console.log("Error al actualizar parte de emergencia:", error);
        throw new Error(`Error al actualizar parte de emergencia: ${error.message}`);
    }
}