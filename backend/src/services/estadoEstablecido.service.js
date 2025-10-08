import { AppDataSource } from "../config/configDb.js";
import EstadoEstablecido from "../entities/estadoEstablecido.entity.js";

export async function crearEstadoEstablecidoService(data, manager = null) {
  const repo = (manager || AppDataSource).getRepository(EstadoEstablecido);
  const ent = repo.create(data);
  await repo.save(ent);
  return true;
}




export async function obtenerUltimoEstadoPorIncidenteService(idIncidente) {
  if (!Number.isFinite(Number(idIncidente))) return null;


  //lo hice con sql duro pq con typeorm salia pero como habian varias relaciones funcionaba lento asiq mejol asi (ma rapido)
  const sql = `
    SELECT
      ee."fechaHora"  AS "fechaHora",
      e.nombre    AS "estadoNombre"
    FROM "estadoEstablecido"  ee
    JOIN "estadoReporte" e ON e.id = ee."idEstado" 
    WHERE ee."idIncidente" = $1
    ORDER BY ee."fechaHora" desc
    
    LIMIT 1
  `;

  const rows = await AppDataSource.query(sql, [idIncidente]);
  const row = rows[0];
  if (!row) return null;

  return {
    idEstado: row.idEstado,
    estado: (row.estadoNombre ?? "").toString().trim().toUpperCase(),
    fechaHora: row.fechaHora,
  };
}

export default { crearEstadoEstablecidoService, obtenerUltimoEstadoPorIncidenteService };