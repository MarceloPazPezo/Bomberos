"use strict";
import { AppDataSource } from "../config/configDb.js";
import { In } from "typeorm";

// Devuelve una lista de incidentes con su último estado y datos básicos de resumen
// options: {
//   redactorId?: number,                // si se provee, filtra por idRedactor
//   allowedEstados?: string[]           // nombres de estado permitidos (case-insensitive)
//   excludeBorradorExcepto?: number     // excluir BORRADOR excepto los del redactorId especificado
// }
export async function obtenerIncidentesResumenService(options = {}) {
  const mgr = AppDataSource.manager;
  const incidenteRepo = mgr.getRepository("Incidente");
  const estadoRepo = mgr.getRepository("EstadoEstablecido");
  const bomberoRepo = mgr.getRepository("Bombero");

  // 1) Obtener todos los incidentes (podrías paginar/filtrar más adelante)
  const where = {};
  if (options && Number.isInteger(options.redactorId)) {
    where.idRedactor = options.redactorId;
  }
  const incidentes = await incidenteRepo.find({
    where,
    relations: {
      subtipo: {
        clasificacionEmergencia: true,
        claveRadial: true
      },
      compania: true,
      direccion: true
    }
  });
  if (!Array.isArray(incidentes) || incidentes.length === 0) return [];

  const ids = incidentes.map(i => Number(i.id)).filter(n => Number.isInteger(n));
  if (ids.length === 0) return [];

  // 1.1) Resolver nombres de redactores (creador) a partir de idRedactor
  //     Construimos un mapa id -> nombre completo para uso en el resumen.
  const toArray = (v) => Array.isArray(v)
    ? v
    : (typeof v === 'string' && v.trim() ? v.split(',').map(s => s.trim()).filter(Boolean) : []);
  const fullName = (b) => {
    const ns = toArray(b?.nombres);
    const as = toArray(b?.apellidos);
    const name = [...ns, ...as].filter(Boolean).join(' ').trim();
    return name || b?.email || b?.run || (b?.id != null ? `ID ${b.id}` : "");
  };
  const redactorIds = Array.from(new Set(
    incidentes
      .map(inc => Number(inc.idRedactor))
      .filter(n => Number.isInteger(n))
  ));
  let nombreByRedactorId = new Map();
  if (redactorIds.length > 0) {
    try {
      const redactores = await bomberoRepo.findBy({ id: In(redactorIds) });
      nombreByRedactorId = new Map(redactores.map(b => [b.id, fullName(b)]));
    } catch {
      nombreByRedactorId = new Map();
    }
  }

  // 2) Obtener último estado por incidente usando subquery para evitar parámetros inconsistentes
  const sub = estadoRepo.createQueryBuilder("ee2")
    .select("ee2.idIncidente", "idIncidente")
    .addSelect("MAX(ee2.fechaHora)", "maxFecha")
    .where("ee2.idIncidente IN (:...ids)", { ids })
    .groupBy("ee2.idIncidente");

  // 3) Cargar esos últimos estados con join al EstadoReporte (para el nombre) y al Bombero (para el revisor)
  const ultimos = await estadoRepo.createQueryBuilder("ee")
    .innerJoin("(" + sub.getQuery() + ")", "m", 'm."idIncidente" = ee."idIncidente" AND m."maxFecha" = ee."fechaHora"')
    .leftJoinAndSelect("ee.estado", "estado")
    .leftJoinAndSelect("ee.bombero", "bombero")
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

    // Nombre del creador (redactor) a partir de idRedactor
    const creadorNombre = nombreByRedactorId.get(Number(inc.idRedactor))
      // fallback por si viene cargada la relación eager "redactor"
      || (inc.redactor ? fullName(inc.redactor) : "");

    // Nombre del bombero que hizo el último cambio de estado (revisor)
    const revisorNombre = ee?.bombero ? fullName(ee.bombero) : "";

    return {
      id: inc.id,
      titulo: inc.descripcionPreliminar || "(Sin título)",
      tipo: inc.subtipo?.clasificacionEmergencia?.descripcion || inc.subtipo?.descripcion || "",
      // La entidad Compania no tiene 'numero'; usamos nombre si está disponible
      compania: inc.compania?.nombre || "",
      creador: creadorNombre,
      fecha: (fecha && hora) ? `${fecha} ${hora}` : (fecha || ""),
      estado: estadoNombre ? estadoNombre.toUpperCase() : "",
      estadoFechaHora: ee?.fechaHora || null,
      comentario: ee?.comentario || null,
      revisor: revisorNombre, // ⭐ AGREGADO: quién hizo el comentario
      // Detalle adicional para el drawer
      detalle: {
        direccion: inc.direccion ? `${inc.direccion.calle} ${inc.direccion.numero || "S/N"}` : "",
        comunaId: inc.direccion?.idComuna || null,
        descripcionPreliminar: inc.descripcionPreliminar || "",
        claveRadial: inc.subtipo?.claveRadial?.nombre || "",
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

  // Filtrado opcional por estados permitidos
  let result = resumen;
  if (options && Array.isArray(options.allowedEstados) && options.allowedEstados.length > 0) {
    const allowed = new Set(options.allowedEstados.map(s => String(s).trim().toUpperCase()).filter(Boolean));
    result = result.filter(r => allowed.has(String(r.estado || '').toUpperCase()));
  }

  // Filtrar BORRADOR si se especifica excludeBorradorExcepto
  if (options && Number.isInteger(options.excludeBorradorExcepto)) {
    result = result.filter(r => {
      const esBorrador = String(r.estado || '').toUpperCase() === 'BORRADOR';
      if (!esBorrador) return true; // No es borrador, incluir
      // Es borrador: incluir solo si es del redactor especificado
      const incidente = incidentes.find(inc => inc.id === r.id);
      return Number(incidente?.idRedactor) === Number(options.excludeBorradorExcepto);
    });
  }

  // Ordenar por fecha del último estado (desc), y como fallback por fecha de despacho
  result.sort((a, b) => {
    const da = a.estadoFechaHora ? new Date(a.estadoFechaHora).getTime() : (a.fecha ? new Date(a.fecha).getTime() : 0);
    const db = b.estadoFechaHora ? new Date(b.estadoFechaHora).getTime() : (b.fecha ? new Date(b.fecha).getTime() : 0);
    return db - da;
  });

  return result;
}

export default { obtenerIncidentesResumenService };
