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
      e.nombre    AS "estadoNombre",
      ee."comentario" AS "comentario"
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
    comentario: row.comentario || null,
  };
}

export async function obtenerHistorialEstadosPorIncidenteService(idIncidente) {
  if (!Number.isFinite(Number(idIncidente))) return [];

  const sql = `
    SELECT
      ee.id AS "id",
      ee."fechaHora" AS "fechaHora",
      e.nombre AS "estadoNombre",
      ee.comentario AS "comentario",
      b.nombres AS "bomberoNombres",
      b.apellidos AS "bomberoApellidos"
    FROM "estadoEstablecido" ee
    JOIN "estadoReporte" e ON e.id = ee."idEstado"
    LEFT JOIN "bomberos" b ON b.id = ee."idBombero"
    WHERE ee."idIncidente" = $1
    ORDER BY ee."fechaHora" DESC
  `;

  const rows = await AppDataSource.query(sql, [idIncidente]);

  return rows.map(row => ({
    id: row.id,
    estado: (row.estadoNombre ?? "").toString().trim().toUpperCase(),
    fechaHora: row.fechaHora,
    comentario: row.comentario || null,
    bombero: row.bomberoNombres && row.bomberoApellidos
      ? `${row.bomberoNombres} ${row.bomberoApellidos}`
      : null
  }));
}

export default {
  crearEstadoEstablecidoService,
  obtenerUltimoEstadoPorIncidenteService,
  obtenerHistorialEstadosPorIncidenteService
};