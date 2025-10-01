"use strict";
import { AppDataSource } from "../config/configDb.js";
import { In } from "typeorm";

// Devuelve una lista de incidentes con su último estado y datos básicos de resumen
export async function obtenerIncidentesResumenService() {
  const mgr = AppDataSource.manager;
  const incidenteRepo = mgr.getRepository("Incidente");
  const estadoRepo = mgr.getRepository("EstadoEstablecido");

  // 1) Obtener todos los incidentes (podrías paginar/filtrar más adelante)
  const incidentes = await incidenteRepo.find();
  if (!Array.isArray(incidentes) || incidentes.length === 0) return [];

  const ids = incidentes.map(i => Number(i.id)).filter(n => Number.isInteger(n));
  if (ids.length === 0) return [];

  // 2) Obtener último estado por incidente usando subquery para evitar parámetros inconsistentes
  const sub = estadoRepo.createQueryBuilder("ee2")
    .select("ee2.idIncidente", "idIncidente")
    .addSelect("MAX(ee2.fechaHora)", "maxFecha")
    .where("ee2.idIncidente IN (:...ids)", { ids })
    .groupBy("ee2.idIncidente");

  // 3) Cargar esos últimos estados con join al EstadoReporte (para el nombre)
  const ultimos = await estadoRepo.createQueryBuilder("ee")
    .innerJoin("(" + sub.getQuery() + ")", "m", 'm."idIncidente" = ee."idIncidente" AND m."maxFecha" = ee."fechaHora"')
    .leftJoinAndSelect("ee.estado", "estado")
    .setParameters(sub.getParameters())
    .getMany();

  const estadoByIncidente = new Map(ultimos.map(u => [u.idIncidente, u]));

  // 4) Build resumen (usar datos que vienen eager en Incidente: direccion, subtipo, compania)
  const resumen = incidentes.map(inc => {
    const ee = estadoByIncidente.get(inc.id) || null;
    const estadoNombre = ee?.estado?.nombre || null;

    // Datos base
    const fechaHoraDespacho = inc.FechaHoraDespacho || null;
    const fecha = fechaHoraDespacho ? fechaHoraDespacho.toISOString().slice(0, 10) : null;
    const hora = fechaHoraDespacho ? fechaHoraDespacho.toISOString().slice(11, 16) : null;

    return {
      id: inc.id,
      titulo: inc.descripcionPreliminar || "(Sin título)",
  tipo: inc.subtipo?.clasificacionEmergencia?.descripcion || inc.subtipo?.descripcion || "",
  // La entidad Compania no tiene 'numero'; usamos nombre si está disponible
  compania: inc.compania?.nombre || "",
      creador: inc.redactor?.nombreCompleto || "",
      fecha: fecha && hora ? `${fecha} ${hora}` : fecha || "",
      estado: estadoNombre ? estadoNombre.toUpperCase() : "",
      // Detalle adicional para el drawer
      detalle: {
        direccion: inc.direccion ? `${inc.direccion.calle} ${inc.direccion.numero || "S/N"}` : "",
        comunaId: inc.direccion?.idComuna || null,
        descripcionPreliminar: inc.descripcionPreliminar || "",
        claveRadial: inc.subtipo?.claveRadial || "",
        tipoIncendio: null, // se puede inferir desde FaseYDano si contieneFuego es true
        faseAlcanzada: null, // idem
        contieneFuego: !!inc.subtipo?.contieneFuego,
      }
    };
  });

  // 5) Si un subtipo contiene fuego, intentar cargar Fase alcanzada y Tipo de incendio (tomar el primero si existe)
  const necesitaFase = resumen.filter(r => r.detalle.contieneFuego).map(r => r.id);
  if (necesitaFase.length > 0) {
    const fyRepo = mgr.getRepository("FaseYDano");
    const fy = await fyRepo.find({ where: { idIncidente: In(necesitaFase) }, relations: { faseIncidente: true, tipoDano: true } }).catch(() => []);
    const byId = new Map(fy.map(x => [x.idIncidente, x]));
    for (const r of resumen) {
      const f = byId.get(r.id);
      if (f) {
        r.detalle.tipoIncendio = f.tipoDano?.descripcion || null;
        r.detalle.faseAlcanzada = f.faseIncidente?.descripcion || null;
      }
    }
  }

  return resumen;
}

export default { obtenerIncidentesResumenService };
