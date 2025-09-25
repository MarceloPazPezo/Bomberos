"use strict";
import { AppDataSource } from "../config/configDb.js";
import Carro from "../entities/carro.entity.js";

//obtener carros por compañia
export const getCarrosByCompania = async (companiaId) => {
  const carroRepository = AppDataSource.getRepository(Carro);
  const carros = await carroRepository.find({
    where: { idCompania: companiaId },
  });
  return carros;
}