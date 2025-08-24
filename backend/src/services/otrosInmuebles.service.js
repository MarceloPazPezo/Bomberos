"use strict";
import { AppDataSource } from "../config/configDb.js";
import otroInmueble from "../entities/otroInmuebleAfectado.entity.js";

export const createOtroInmuebleService = async (data) => {
    try {
        const otroInmuebleRepository = AppDataSource.getRepository(otroInmueble);
        const newOtroInmueble = otroInmuebleRepository.create(data);
        await otroInmuebleRepository.save(newOtroInmueble);
        return newOtroInmueble;
    } catch (error) {
        console.error("Error al crear otro inmueble:", error);
        throw new Error(`Error al crear otro inmueble: ${error.message}`);
    }
}

export const updateOtroInmuebleService = async (id, data) => {
    try {
        const otroInmuebleRepository = AppDataSource.getRepository(otroInmueble);
        let otroInmueble2 = await otroInmuebleRepository.findOneBy({ id: id });
        console.log("Otro inmueble antes de actualizar:", otroInmueble2);
        if (!otroInmueble2) {
            throw new Error("Otro inmueble no encontrado");
        }
        otroInmuebleRepository.merge(otroInmueble2, data);
        const updatedOtroInmueble = await otroInmuebleRepository.save(otroInmueble2);
       
        return updatedOtroInmueble;
    } catch (error) {
        console.log("Error al actualizar otro inmueble:", error);
        throw new Error(`Error al actualizar otro inmueble: ${error.message}`);
    }
}

//eliminar varios otros inmuebles por sus ids
export const deleteOtrosInmueblesService = async (ids) => {
    try {
        const otroInmuebleRepository = AppDataSource.getRepository(otroInmueble);
        const deleteResult = await otroInmuebleRepository.delete(ids);
        return deleteResult;
    } catch (error) {
        console.error("Error al eliminar otros inmuebles:", error);
        throw new Error(`Error al eliminar otros inmuebles: ${error.message}`);
    }
}

//obtener todos los otros inmuebles por id_parte
export const getOtrosInmueblesByIdParteService = async (id_parte) => {
    try {
        const otroInmuebleRepository = AppDataSource.getRepository(otroInmueble);
        const otrosInmuebles = await otroInmuebleRepository.findBy({ parte_id: id_parte });
        //setear para devolver un array con solo ids.
        const ids = otrosInmuebles.map(oi => oi.id);
        console.log("IDs de otros inmuebles encontrados:", ids);
        return ids;
    } catch (error) {
        console.error("Error al obtener otros inmuebles por id_parte:", error);
        throw new Error(`Error al obtener otros inmuebles por id_parte: ${error.message}`);
    }
}