"use strict";
import { AppDataSource } from "../config/configDb.js";
import Region from "../entities/region.entity.js";
import Comuna from "../entities/comuna.entity.js";
import Direccion from "../entities/direccion.entity.js";


export async function getRegionesService() {
    const regionRepository = AppDataSource.getRepository(Region);
    return await regionRepository.find();
}


export async function getComunasService(idRegion) {
    //obtenemoos comunas por id de region
    const comunaRepository = AppDataSource.getRepository(Comuna);
    return await comunaRepository.find({
        where: { region: { id: idRegion } },
    });
}
export async function crearDireccionService(direccionData, manager = null) {
    const direccionRepository = (manager || AppDataSource).getRepository(Direccion);
    const nuevaDireccion = direccionRepository.create(direccionData);
    await direccionRepository.save(nuevaDireccion);
    return nuevaDireccion.id;
}

export async function getDireccionService(idDireccion) {
    try {
        const direccionRepository = AppDataSource.getRepository(Direccion);
        const dir = await direccionRepository.findOne({
            where: { id: idDireccion },
            relations: {
                comuna: { region: true },
            },
        });
        if (!dir) return null;
        // Extra: exponer idRegion directamente para facilitar al frontend
        const idRegion = dir?.comuna?.idRegion ?? dir?.comuna?.region?.id ?? null;
        // Devolver objeto enriquecido sin romper compatibilidad
        return { ...dir, idRegion };
    } catch (error) {
        throw new Error("Error al obtener la dirección");
    }
}

export async function actualizarDireccionService(idDireccion, direccionData, manager = null) {
    try {
    const direccionRepository = (manager || AppDataSource).getRepository(Direccion);
    const direccion = await direccionRepository.findOne({ where: { id: idDireccion } });
    if (!direccion) {
        throw new Error("Dirección no encontrada");
    }
    direccionRepository.merge(direccion, direccionData);
    return await direccionRepository.save(direccion);
    } catch (error) {
        throw new Error("Error al actualizar la dirección");
    }
}



export async function eliminarDireccionService(idDireccion, manager = null) {
    try {
    const direccionRepository = (manager || AppDataSource).getRepository(Direccion);
    const direccion = await direccionRepository.findOne({ where: { id: idDireccion } });
    if (!direccion) {
        throw new Error("Dirección no encontrada");
    }
    return await direccionRepository.remove(direccion);
    } catch (error) {
        throw new Error("Error al eliminar la dirección");
    }
}


