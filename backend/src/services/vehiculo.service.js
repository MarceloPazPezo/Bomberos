import { AppDataSource } from "../config/configDb.js";
import Vehiculo from "../entities/vehiculo.entity.js";

export async function crearVehiculoService(data, manager = null) {
  const repo = (manager || AppDataSource).getRepository(Vehiculo);
  const ent = repo.create(data);
  const saved = await repo.save(ent);
  return saved.id;
}
