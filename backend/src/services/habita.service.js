import { AppDataSource } from "../config/configDb.js";
import Habita from "../entities/habita.entity.js";

export async function crearHabitaService(data, manager = null) {
  const repo = (manager || AppDataSource).getRepository(Habita);
  const ent = repo.create(data);
  await repo.save(ent);
  return true;
}
