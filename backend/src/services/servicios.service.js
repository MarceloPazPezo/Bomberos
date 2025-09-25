"use strict";
import { AppDataSource } from "../config/configDb.js";
import Servicio from "../entities/servicio.entity.js";

export async function getServicios() {
    try {
        const servicios = await AppDataSource.getRepository(Servicio).find();
        console.log(servicios);
        return servicios;
    } catch (error) {
        throw error;
    }
}