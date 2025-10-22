import { AppDataSource } from "../config/configDb.js";
import AsistenciaIncidente from "../entities/asistenciaIncidente.entity.js";

export async function crearAsistenciaIncidenteService(data, manager = null) {
  const repo = (manager || AppDataSource).getRepository(AsistenciaIncidente);
  const ent = repo.create(data);
  await repo.save(ent);
  return true;
}
