import { AppDataSource } from "../config/configDb.js";
import AsistenciaIncidente from "../entities/asistenciaIncidente.entity.js";

export async function crearAsistenciaIncidenteService(data, manager = null) {
  const repo = (manager || AppDataSource).getRepository(AsistenciaIncidente);
  const ent = repo.create(data);
  await repo.save(ent);
  return true;
}

export async function eliminarAsistenciasPorIncidenteService(idIncidente, manager = null) {
  const repo = (manager || AppDataSource).getRepository(AsistenciaIncidente);
  await repo.delete({ idIncidente });
  return true;
}

export async function obtenerAsistenciasPorIncidenteService(idIncidente, manager = null) {
  const repo = (manager || AppDataSource).getRepository(AsistenciaIncidente);
  return await repo.find({ where: { idIncidente } });
}
