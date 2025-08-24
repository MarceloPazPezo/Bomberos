"use strict";
import { AppDataSource } from "../config/configDb.js";
import inmuebleAfectado from "../entities/inmuble_afectado.entity.js";

export const createInmuebleAfectadoService = async (data) => {
    try {
        const inmuebleAfectadoRepository = AppDataSource.getRepository(inmuebleAfectado);
        const newInmuebleAfectado = inmuebleAfectadoRepository.create(data);
        await inmuebleAfectadoRepository.save(newInmuebleAfectado);
        return newInmuebleAfectado;
    } catch (error) {
        console.error("Error al crear inmueble afectado:", error);
        throw new Error(`Error al crear inmueble afectado: ${error.message}`);
    }
}
export const updateInmuebleAfectadoService = async (id, data) => {
    try {
        const inmuebleAfectadoRepository = AppDataSource.getRepository(inmuebleAfectado);
        let inmuebleAfectado2 = await inmuebleAfectadoRepository.findOneBy({ id: id });
        console.log("Inmueble afectado antes de actualizar:", inmuebleAfectado2);
        if (!inmuebleAfectado2) {
            throw new Error("Inmueble afectado no encontrado");
        }
        inmuebleAfectadoRepository.merge(inmuebleAfectado2, data);
        const updatedInmuebleAfectado = await inmuebleAfectadoRepository.save(inmuebleAfectado2);
       
        return updatedInmuebleAfectado;
    } catch (error) {
        console.log("Error al actualizar inmueble afectado:", error);
        throw new Error(`Error al actualizar inmueble afectado: ${error.message}`);
    }
}
