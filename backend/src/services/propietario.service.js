"use strict";
import { AppDataSource } from "../config/configDb.js";
import propietario from "../entities/propietario.entity.js";

export const createPropietarioService = async (data) => {
    try {
        const propietarioRepository = AppDataSource.getRepository(propietario);
        const newPropietario = propietarioRepository.create(data);
        await propietarioRepository.save(newPropietario);
        return newPropietario;
    } catch (error) {
        console.error("Error al crear propietario:", error);
        throw new Error(`Error al crear propietario: ${error.message}`);
    }
}

export const updatePropietarioService = async (id, data) => {
    try {
        const propietarioRepository = AppDataSource.getRepository(propietario);
        let propietarioEntity = await propietarioRepository.findOneBy({ id: id });
        if (!propietarioEntity) {
            throw new Error("Propietario no encontrado");
        }
        propietarioRepository.merge(propietarioEntity, data);
        const updatedPropietario = await propietarioRepository.save(propietarioEntity);
        return updatedPropietario;
    } catch (error) {
        console.log("Error al actualizar propietario:", error);
        throw new Error(`Error al actualizar propietario: ${error.message}`);
    }
}

export const deletePropietarioService = async (id) => {
    try {
        const propietarioRepository = AppDataSource.getRepository(propietario);
        const deleteResult = await propietarioRepository.delete(id);
        if (deleteResult.affected === 0) {
            throw new Error("Propietario no encontrado o ya eliminado");
        }
        return { message: "Propietario eliminado correctamente" };
    } catch (error) {
        console.error("Error al eliminar propietario:", error);
        throw new Error(`Error al eliminar propietario: ${error.message}`);
    }
}