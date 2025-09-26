import { AppDataSource } from "../config/configDb.js";
import EstadoEstablecido from "../entities/estadoEstablecido.entity.js";

export async function crearEstadoEstablecidoService(data, manager = null) {
  const repo = (manager || AppDataSource).getRepository(EstadoEstablecido);
  const ent = repo.create(data);
  await repo.save(ent);
  return true;
}

export default { crearEstadoEstablecidoService };