"use strict";
import { AppDataSource } from "../config/configDb.js";
import VehiculoAfectado from "../entities/vehiculo_afectado.entity.js";


export const createVehiculoAfectadoService = async (data) => {
    try {
        console.log("Datos recibidos para crear vehículo afectado:", data);
        const vehiculoRepository = AppDataSource.getRepository(VehiculoAfectado);
        const newVehiculo = vehiculoRepository.create(data);
        await vehiculoRepository.save(newVehiculo);
        return newVehiculo;
    } catch (error) {
        console.error("Error al crear vehículo afectado:", error);
        throw new Error(`Error al crear vehículo afectado: ${error.message}`);
    }
}
export const updateVehiculoAfectadoService = async (id, data) => {
    try {
        const vehiculoRepository = AppDataSource.getRepository(VehiculoAfectado);
        let vehiculo2 = await vehiculoRepository.findOneBy({ id: id });
        console.log("Vehículo antes de actualizar:", vehiculo2);
        if (!vehiculo2) {
            throw new Error("Vehículo no encontrado");
        }
        vehiculoRepository.merge(vehiculo2, data);
        const updatedVehiculo = await vehiculoRepository.save(vehiculo2);
       
        return updatedVehiculo;
    } catch (error) {
        console.log("Error al actualizar vehículo afectado:", error);
        throw new Error(`Error al actualizar vehículo afectado: ${error.message}`);
    }
}

//eliminar varios vehículos por sus ids
export const deleteVehiculosAfectadosService = async (ids) => {
    try {
        if (!Array.isArray(ids) || ids.length === 0) throw new Error("Lista de IDs requerida");
        const vehiculoRepository = AppDataSource.getRepository(VehiculoAfectado);
        const deleteResult = await vehiculoRepository.delete(ids);
        if (deleteResult.affected === 0) {
            console.log("No se eliminaron vehículos, IDs no encontrados");
        }
        return deleteResult;
    } catch (error) {
        console.error("Error al eliminar vehículos afectados:", error);
        throw new Error(`Error al eliminar vehículos afectados: ${error.message}`);
    }
}

//obtener todos los vehículos por id_parte
export const getVehiculosByIdParteService = async (id_parte) => {
    try {
        const vehiculoRepository = AppDataSource.getRepository(VehiculoAfectado);
        const vehiculos = await vehiculoRepository.findBy({ parte_id: id_parte });
        //setear para devolver un array con solo ids.
        const ids = vehiculos.map(v => v.id);
        console.log("IDs de vehículos encontrados:", ids);
        return ids;
    } catch (error) {
        console.error("Error al obtener vehículos por id_parte:", error);
        throw new Error(`Error al obtener vehículos por id_parte: ${error.message}`);
    }
}