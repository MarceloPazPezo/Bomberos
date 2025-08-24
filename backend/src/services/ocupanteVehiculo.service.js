"use strict";
import { AppDataSource } from "../config/configDb.js";
import ocupanteVehiculo from "../entities/ocupante_vehiculo.entity.js";

export const createOcupanteVehiculoService = async (data) => {
  try {
    const ocupanteVehiculoRepository = AppDataSource.getRepository(ocupanteVehiculo);
    const newOcupanteVehiculo = ocupanteVehiculoRepository.create(data);
    await ocupanteVehiculoRepository.save(newOcupanteVehiculo);
    return newOcupanteVehiculo;
  } catch (error) {
    console.error("Error al crear ocupante de vehículo:", error);
    throw new Error(`Error al crear ocupante de vehículo: ${error.message}`);
  }
}
export const updateOcupanteVehiculoService = async (id, data) => {
  try {
    const ocupanteVehiculoRepository = AppDataSource.getRepository(ocupanteVehiculo);
    let ocupanteVehiculo2 = await ocupanteVehiculoRepository.findOneBy({ id: id });
    console.log("Ocupante de vehículo antes de actualizar:", ocupanteVehiculo2);
    if (!ocupanteVehiculo2) {
      throw new Error("Ocupante de vehículo no encontrado");
    }
    ocupanteVehiculoRepository.merge(ocupanteVehiculo2, data);
    const updatedOcupanteVehiculo = await ocupanteVehiculoRepository.save(ocupanteVehiculo2);

    return updatedOcupanteVehiculo;
  } catch (error) {
    console.log("Error al actualizar ocupante de vehículo:", error);
    throw new Error(`Error al actualizar ocupante de vehículo: ${error.message}`);
  }
}


//eliminar varios ocupantes de vehículo por sus ids
export const deleteOcupantesVehiculoService = async (ids) => {
  try {
    const ocupanteVehiculoRepository = AppDataSource.getRepository(ocupanteVehiculo);
    const deleteResult = await ocupanteVehiculoRepository.delete(ids);
    return deleteResult;
  } catch (error) {
    console.error("Error al eliminar ocupantes de vehículo:", error);
    throw new Error(`Error al eliminar ocupantes de vehículo: ${error.message}`);
  }
}

//obtener todos los ocupantes de vehículo por id_vehiculo
export const getOcupantesByIdVehiculoService = async (id_vehiculo) => {
  try {
    const ocupanteVehiculoRepository = AppDataSource.getRepository(ocupanteVehiculo);
    const ocupantesVehiculo = await ocupanteVehiculoRepository.findBy({ vehiculo_id: id_vehiculo });
    //setear para devolver un array con solo ids.
    const ids = ocupantesVehiculo.map(ov => ov.id);
    console.log("IDs de ocupantes de vehículo encontrados:", ids);
    return ids;
  } catch (error) {
    console.error("Error al obtener ocupantes de vehículo por id_vehiculo:", error);
    throw new Error(`Error al obtener ocupantes de vehículo por id_vehiculo: ${error.message}`);
  }
}