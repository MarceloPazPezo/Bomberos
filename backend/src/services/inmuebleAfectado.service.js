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
/*
 servicio para obtener inmuebles afectados por parte_id (deberia haber 0 o 1)

 Este service lo usare en parteEmergencia.controller.js para verificar si ya existe un  
 inmueble afectado y tambien verificar si existe un afectado (como un afectado esta asociado a un
 inmueble afectado, si existe un inmueble afectado, entonces existe un afectado).

 segun como se guardan los partes de la primera de cabrero, las otras casas afectadas se guarda solo datos 
 del dueño de casa (tabla afectado + direccion(misma tabla)) a diferencia de la casa principal que se 
 guarda en (tabla inmuebleAfectado + (tabla afectado - direccion(pq está en tabla ParteEmergencia)))

*/
export const getInmuebleAfectadoByIdParteService = async (parte_id) => { 
    try {
        console.log("Obteniendo inmueble afectado por parte_id:", parte_id);
        const inmuebleAfectadoRepository = AppDataSource.getRepository(inmuebleAfectado);
        const inmuebleAfectadoData = await inmuebleAfectadoRepository.findOneBy({ parte_id: parte_id });
        //retornar la fila encontrada o null si no existe
        //console.log("Inmueble afectado encontrado:", inmuebleAfectadoData);
        return inmuebleAfectadoData;
        
    } catch (error) {
        console.log("Error al obtener inmueble afectado por parte_id:", error);
        throw new Error(`Error al obtener inmueble afectado por parte_id: ${error.message}`);       
    }
}