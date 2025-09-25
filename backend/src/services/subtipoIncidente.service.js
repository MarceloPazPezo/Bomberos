"use strict";
import { AppDataSource } from "../config/configDb.js";
import SubtipoIncidente from "../entities/subtipoIncidente.entity.js";
import ClasificacionEmergencia from "../entities/clasificacionEmergencia.entity.js";
import TipoDano from "../entities/tipoDano.entity.js";
import FaseIncidente from "../entities/faseIncidente.entity.js";


export async function getClasificacionEmergencia() {
   try {
    const clasificaciones = await AppDataSource.getRepository(ClasificacionEmergencia).find();
    console.log(clasificaciones);
    return clasificaciones;
    
   } catch (error) {
        throw error;
   }
}

export async function getSubtipoIncidentes(clasificacionId) {
    try {
        const subtipoIncidentes = await AppDataSource.getRepository(SubtipoIncidente).find({
            where: { clasificacion: clasificacionId },
        });
        console.log(subtipoIncidentes);
        return subtipoIncidentes;
    } catch (error) {
        throw error;
    }
}

export async function getTipoDano() {
    try {
        const tipoDano = await AppDataSource.getRepository(TipoDano).find();
        console.log(tipoDano);
        return tipoDano;
    }
    catch (error) {
        throw error;
    }
}

export async function getFaseIncidente() {
    try {
        const faseIncidente = await AppDataSource.getRepository(FaseIncidente).find();
        console.log(faseIncidente);
        return faseIncidente;
    }
    catch (error) {
        throw error;
    }
}
