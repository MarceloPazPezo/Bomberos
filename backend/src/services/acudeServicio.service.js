import { AppDataSource } from "../config/configDb.js";
import AcudeServicio from "../entities/acudeServicio.entity.js";

export async function crearAcudeServicioService(data, manager = null) {
  const repo = (manager || AppDataSource).getRepository(AcudeServicio);
  const ent = repo.create(data);
  await repo.save(ent);
  return true;
}
