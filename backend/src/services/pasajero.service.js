import { AppDataSource } from "../config/configDb.js";
import Pasajero from "../entities/pasajero.entity.js";

export async function crearPasajeroService(data, manager = null) {
  const repo = (manager || AppDataSource).getRepository(Pasajero);
  const ent = repo.create(data);
  await repo.save(ent);
  return true;
}
