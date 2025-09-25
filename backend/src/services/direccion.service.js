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

