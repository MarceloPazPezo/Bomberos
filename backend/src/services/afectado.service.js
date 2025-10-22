import { AppDataSource } from "../config/configDb.js";
import Afectado from "../entities/afectado.entity.js";

export async function crearAfectadoService(data, manager = null) {
  const repo = (manager || AppDataSource).getRepository(Afectado);
  const ent = repo.create(data);
  const saved = await repo.save(ent);
  return saved.id;
}
