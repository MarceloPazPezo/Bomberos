import { AppDataSource } from "../config/configDb.js";
import BomberoAccidentado from "../entities/bomberoAccidentado.entity.js";

export async function crearBomberoAccidentadoService(data, manager = null) {
  const repo = (manager || AppDataSource).getRepository(BomberoAccidentado);
  const ent = repo.create(data);
  await repo.save(ent);
  return true;
}
