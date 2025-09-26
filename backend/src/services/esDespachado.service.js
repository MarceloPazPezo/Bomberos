import { AppDataSource } from "../config/configDb.js";
import EsDespachado from "../entities/esDespachado.entity.js";

export async function crearDespachoService(data, manager = null) {
  const repo = (manager || AppDataSource).getRepository(EsDespachado);
  const ent = repo.create(data);
  await repo.save(ent);
  return true;
}
