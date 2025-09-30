"use strict";
import { AppDataSource } from "../config/configDb.js";
import { In } from "typeorm";

export async function obtenerPartePorIdService(idIncidente) {
  const manager = AppDataSource.manager;
  const incidenteRepo = manager.getRepository('Incidente');

  // 1) Carga base del incidente (evitar mega JOIN con muchas relaciones)
  const incidente = await incidenteRepo.findOne({ where: { id: idIncidente } });
  if (!incidente) return null;

  // 2) Cargar colecciones relacionadas en paralelo y sólo lo necesario
  const inmRepo = manager.getRepository('Inmueble');
  const vehRepo = manager.getRepository('Vehiculo');
  const despRepo = manager.getRepository('EsDespachado');
  const accRepo = manager.getRepository('BomberoAccidentado');
  const acudeRepo = manager.getRepository('AcudeServicio');
  const asistRepo = manager.getRepository('AsistenciaIncidente');
  const faseRepo = manager.getRepository('FaseYDano');
  const comunaRepo = manager.getRepository('Comuna');

  const [inmueblesRaw, vehiculosRaw, despachos, accidentadosRaw, otrosServiciosRaw, asistenciasRaw, fases] = await Promise.all([
    inmRepo.find({ where: { idIncidente }, relations: { habitaAfectados: true, propietario: true, direccion: true } }),
    vehRepo.find({ where: { idIncidente }, relations: { dueno: true, conductor: true, pasajeros: { afectado: true, vinculo: true } } }),
    despRepo.find({ where: { idIncidente } }),
    accRepo.find({ where: { idIncidente } }),
    acudeRepo.find({ where: { idIncidente } }),
    asistRepo.find({ where: { idIncidente } }),
    faseRepo.find({ where: { idIncidente } }),
  ]);
  // Ensamblar payload similar al front (crearParte/editarParte)
  const dir = incidente.direccion; // viene eager en entidad Incidente
  // Obtener regionId puntual sin join profundo
  let regionId = null;
  if (dir?.idComuna) {
    try {
      const comuna = await comunaRepo.findOne({ where: { id: dir.idComuna } });
      regionId = comuna?.idRegion ?? null;
    } catch {}
  }
  // Construir mapa de Afectados de habitantes (Habita sólo contiene ids)
  const todasHabitas = (inmueblesRaw || []).flatMap(inm => inm.habitaAfectados || []);
  const idsAfectadosHab = Array.from(new Set(todasHabitas.map(h => h.afectadoId ?? h.idAfectado).filter(Boolean)));
  let afectadosHabMap = new Map();
  if (idsAfectadosHab.length > 0) {
    try {
      const afectadoRepo = manager.getRepository('Afectado');
      const afectados = await afectadoRepo.find({ where: { id: In(idsAfectadosHab) } });
      afectadosHabMap = new Map(afectados.map(a => [a.id, a]));
    } catch (e) {
      // si falla, el mapa queda vacío y se devolverán habitantes mínimos
    }
  }

  const inmuebles = (inmueblesRaw || []).map(inm => ({
    id: inm.id,
    tipo_construccion: inm.tipoConstruccion || '',
    n_pisos: inm.nPisos || '',
    m2_construccion: inm.m2Construccion || '',
    m2_afectado: inm.m2Afectados || '',
    danos_vivienda: inm.danosVivienda || '',
    danos_anexos: inm.danosAnexos || '',
    calle: inm.direccion?.calle || '',
    numero: inm.direccion?.numero || '',
    dueno: inm.propietario ? {
      id: inm.propietario.id,
      nombreCompleto: inm.propietario.nombreCompleto,
      run: inm.propietario.run,
      telefono: inm.propietario.telefono,
      edad: inm.propietario.edad,
      descripcionGravedad: inm.propietario.descripcionGravedad,
      esEmpresa: inm.propietario.esEmpresa,
    } : null,
    habitantes: (inm.habitaAfectados || []).map(h => {
      const idAf = h.afectadoId ?? h.idAfectado;
      const a = afectadosHabMap.get(idAf);
      return {
        id: idAf || null,
        nombreCompleto: a?.nombreCompleto || '',
        run: a?.run || null,
        telefono: a?.telefono || null,
        edad: a?.edad || null,
        descripcionGravedad: a?.descripcionGravedad || null,
        esEmpresa: false,
      };
    })
  }));

  const vehiculos = (vehiculosRaw || []).map(v => ({
    id: v.id,
    patente: v.patente,
    marca: v.marca || '',
    modelo: v.modelo || '',
    anio: null,
    color: v.color || '',
    danos_vehiculo: v.descripciondanos || '',
    dueno: v.dueno ? {
      id: v.dueno.id, nombreCompleto: v.dueno.nombreCompleto, run: v.dueno.run, telefono: v.dueno.telefono, edad: v.dueno.edad, descripcionGravedad: v.dueno.descripcionGravedad, esEmpresa: v.dueno.esEmpresa,
    } : null,
    chofer: v.conductor ? {
      id: v.conductor.id, nombreCompleto: v.conductor.nombreCompleto, run: v.conductor.run, telefono: v.conductor.telefono, edad: v.conductor.edad, descripcionGravedad: v.conductor.descripcionGravedad, esEmpresa: false,
    } : null,
    pasajeros: (v.pasajeros || []).map(p => ({ id: p.afectado?.id, nombreCompleto: p.afectado?.nombreCompleto, run: p.afectado?.run, telefono: p.afectado?.telefono, edad: p.afectado?.edad, descripcionGravedad: p.afectado?.descripcionGravedad, esEmpresa: false, idVinculo: p.vinculo?.id }))
  }));
  const materialMayor = (despachos || []).map(e => ({ id: `${e.idCarro}-${e.idBomberoMaquinista}`, unidadId: e.idCarro, conductorId: e.idBomberoMaquinista, bomberoId: e.idBomberoMaquinista, voluntarios: e.nPersonal || 0, kmSalida: e.kmSalida || null, kmLlegada: e.kmLlegada || null }));
  // Accidentados: necesitamos companiaId desde FichaBombero (idCompania)
  const accList = accidentadosRaw || [];
  let accidentados = [];
  if (accList.length > 0) {
    const idsBombero = Array.from(new Set(accList.map(a => a.idBombero).filter(Boolean)));
    let fichasByBombero = new Map();
    if (idsBombero.length > 0) {
      try {
        const fichaRepo = manager.getRepository('FichaBombero');
        const fichas = await fichaRepo.find({ where: { idBombero: In(idsBombero) } });
        fichasByBombero = new Map(fichas.map(f => [f.idBombero, f]));
      } catch (e) {
        // si falla, dejamos companiaId en null
      }
    }
    accidentados = accList.map(a => ({
      id: a.idBombero,
      companiaId: fichasByBombero.get(a.idBombero)?.idCompania ?? null,
      bomberoId: a.idBombero,
      lesiones: a.lesiones || '',
      constancia: a.constancia || '',
      comisaria: a.comisaria || '',
      acciones: a.AccionesRealizadas || ''
    }));
  }


  const otrosServicios = (otrosServiciosRaw || []).map(s => ({ id: s.idServicio, servicioId: s.idServicio, tipoUnidad: s.unidad || '', responsable: s.nombrePersonalACargo || '', personal: s.nPersonal || 0, observaciones: s.observaciones || '' }));
  const asistencia = {
    lugar: (asistenciasRaw || []).map(a => a.idBombero),
    cuartel: [] // si hay otra tabla para cuartel, agregarla; por ahora placeholder
  };
  // fase y daño: tomar el primero si existe
  const fy = Array.isArray(fases) && fases.length > 0 ? fases[0] : null;


  return {
    id: incidente.id,
    companiaId: incidente.idCompania,
    fecha: incidente.FechaHoraDespacho ? incidente.FechaHoraDespacho.toISOString().slice(0,10) : null,
    horaDespacho: incidente.FechaHoraDespacho ? incidente.FechaHoraDespacho.toISOString().slice(11,16) : null,
    hora6_0: incidente.HoraOperativo6_0 || null,
    hora6_3: incidente.HoraOperativo6_3 || null,
    hora6_9: incidente.HoraOperativo6_9 || null,
    hora6_10: incidente.HoraOperativo6_10 || null,
    comunaId: incidente.direccion?.idComuna || null,
    regionId,
    calle: incidente.direccion?.calle || '',
    numero: incidente.direccion?.numero || '',
    depto: incidente.direccion?.depto || null,
    referencia: incidente.direccion?.referencia || null,
    // En SubtipoIncidente el FK se llama 'clasificacion' y también existe la relación 'clasificacionEmergencia'
    // Por lo tanto, tomamos primero el valor de columna y, como respaldo, el id de la relación
    clasificacionId: (incidente.subtipo?.clasificacion ?? incidente.subtipo?.clasificacionEmergencia?.id) || null,
    subtipoId: incidente.idSubtipoIncidente,
    // Fallback: si no están las columnas id* por cualquier motivo, usar los ids de las relaciones
    tipoIncendioId: (fy?.idTipoDano ?? fy?.tipoDano?.id) || null,
    faseId: (fy?.idFase ?? fy?.faseIncidente?.id) || null,
    descripcionPreliminar: incidente.descripcionPreliminar || '',
    bomberoACargoId: incidente.idBomberoACargo || null,
    idRedactor: incidente.idRedactor || null,
    inmuebles, vehiculos, materialMayor, accidentados, otrosServicios, asistencia,
  };
}

export async function actualizarParteCompletoService(idIncidente, payload, manager) {
  const mgr = manager || AppDataSource.manager;

  // 1) Cargar estado actual
  const incidenteRepo = mgr.getRepository('Incidente');
  const dirRepo = mgr.getRepository('Direccion');
  const inmRepo = mgr.getRepository('Inmueble');
  const habRepo = mgr.getRepository('Habita');
  const afectadoRepo = mgr.getRepository('Afectado');
  const vehRepo = mgr.getRepository('Vehiculo');
  const pasRepo = mgr.getRepository('Pasajero');
  const despRepo = mgr.getRepository('EsDespachado');
  const accRepo = mgr.getRepository('BomberoAccidentado');
  const acudeRepo = mgr.getRepository('AcudeServicio');
  const faseRepo = mgr.getRepository('FaseYDano');

  const incidente = await incidenteRepo.findOne({ where: { id: idIncidente }, relations: { inmuebleAfectado: { habitaAfectados: true }, vehiculos: { pasajeros: true }, carrodespachado: true, bomberoAccidentados: true, otroServicio: true, faseYDano: true, direccion: true } });
  if (!incidente) throw new Error('Incidente no encontrado');

  // 2) Actualizar Incidente y Dirección principal
  const fechaStr = payload.fecha;
  const horaStr = payload.horaDespacho;
  let fechaHora = null;
  if (payload.fechaHoraDespacho) {
    const d = new Date(payload.fechaHoraDespacho);
    if (!isNaN(d.getTime())) fechaHora = d;
  }
  if (!fechaHora && fechaStr && horaStr) {
    const [yy, mm, dd] = fechaStr.split('-').map(Number);
    const [hh, mi] = horaStr.split(':').map(Number);
    if ([yy, mm, dd, hh, mi].every(n => Number.isInteger(n))) {
      fechaHora = new Date(yy, mm-1, dd, hh, mi, 0, 0);
    }
  }
  incidente.idCompania = payload.companiaId;
  incidente.descripcionPreliminar = payload.descripcionPreliminar || null;
  incidente.FechaHoraDespacho = fechaHora;
  incidente.HoraOperativo6_0 = payload.hora6_0 || null;
  incidente.HoraOperativo6_3 = payload.hora6_3 || null;
  incidente.HoraOperativo6_9 = payload.hora6_9 || null;
  incidente.HoraOperativo6_10 = payload.hora6_10 || null;
  incidente.idBomberoACargo = payload.bomberoACargoId || null;
  incidente.idRedactor = payload.idRedactor || null;
  // Subtipo: mantener siempre el actual salvo que venga uno válido (>0) para actualizar

  let newSubtipoId = incidente.idSubtipoIncidente; // valor actual por defecto
  if (Object.prototype.hasOwnProperty.call(payload, 'subtipoId')) {
    const v = payload.subtipoId;
    if (typeof v === 'number' && Number.isInteger(v) && v > 0) {
      newSubtipoId = v; // actualizar a nuevo subtipo
    } else if (v === null || v === '') {
      // No borrar por defecto: se conserva el valor existente
      newSubtipoId = incidente.idSubtipoIncidente;
    }
  }
  // Usar update parcial para evitar efectos colaterales con relaciones eager
  await incidenteRepo.update({ id: idIncidente }, {
    idCompania: incidente.idCompania,
    descripcionPreliminar: incidente.descripcionPreliminar,
    FechaHoraDespacho: incidente.FechaHoraDespacho,
    HoraOperativo6_0: incidente.HoraOperativo6_0,
    HoraOperativo6_3: incidente.HoraOperativo6_3,
    HoraOperativo6_9: incidente.HoraOperativo6_9,
    HoraOperativo6_10: incidente.HoraOperativo6_10,
    idBomberoACargo: incidente.idBomberoACargo,
    idRedactor: incidente.idRedactor,
    idSubtipoIncidente: newSubtipoId,
  });

  // Dirección
  let dir = incidente.direccion;
  if (!dir) { dir = dirRepo.create({ calle: payload.calle, numero: String(payload.numero), depto: payload.depto || null, referencia: payload.referencia || null, idComuna: payload.comunaId, creadoPor: payload.idRedactor || null }); dir = await dirRepo.save(dir); await incidenteRepo.update({ id: idIncidente }, { idDireccion: dir.id }); }
  else { dir.calle = payload.calle; dir.numero = String(payload.numero); dir.depto = payload.depto || null; dir.referencia = payload.referencia || null; dir.idComuna = payload.comunaId; await dirRepo.save(dir); }

  // 3) Fase y Daño (si aplica): estrategia simple -> eliminar previos y crear si payload trae ambos
  if (incidente.faseYDano?.length) {
    for (const f of incidente.faseYDano) await faseRepo.remove(f);
  }
  if (payload.tipoIncendioId && payload.faseId) {
    await faseRepo.save(faseRepo.create({ idIncidente, idTipoDano: payload.tipoIncendioId, idFase: payload.faseId }));
  }

  // Helper: upsert Afectado (por nombreCompleto+run si no viene id)
  const upsertAfectado = async (a) => {
    if (!a) return null;
    if (a.id) {
      const ex = await afectadoRepo.findOne({ where: { id: a.id } });
      if (ex) {
        ex.nombreCompleto = a.nombreCompleto;
        ex.run = a.run || null; ex.telefono = a.telefono || null; ex.edad = a.edad || null; ex.descripcionGravedad = a.descripcionGravedad || null; ex.esEmpresa = !!a.esEmpresa; ex.idIncidente = idIncidente; await afectadoRepo.save(ex); return ex.id;
      }
    }
    const ent = afectadoRepo.create({ nombreCompleto: a.nombreCompleto, run: a.run || null, telefono: a.telefono || null, edad: a.edad || null, descripcionGravedad: a.descripcionGravedad || null, esEmpresa: !!a.esEmpresa, idIncidente: idIncidente });
    const saved = await afectadoRepo.save(ent); return saved.id;
  };

  // 4) Inmuebles: calcular conjuntos por id; eliminar los que no vienen, upsert/crear los enviados
  const actualesInm = await inmRepo.find({ where: { idIncidente }, relations: { habitaAfectados: true } });
  const idsPayloadInm = new Set((payload.inmuebles || []).map(i => i.id).filter(Boolean));
  for (const ex of actualesInm) { if (!idsPayloadInm.has(ex.id)) { // eliminar dependientes
      if (ex.habitaAfectados?.length) { for (const h of ex.habitaAfectados) await habRepo.remove(h); }
      await inmRepo.remove(ex);
    } }
  for (const i of (payload.inmuebles || [])) {
    // dirección de inmueble (opcional): simplificación -> no reusa, crea si viene
    let idDireccionInm = null;
    if (i.calle || i.numero) {
      const d = dirRepo.create({ calle: i.calle || 'S/N', numero: String(i.numero || 'S/N'), depto: null, referencia: null, idComuna: payload.comunaId, creadoPor: payload.idRedactor || null });
      const ds = await dirRepo.save(d); idDireccionInm = ds.id;
    }
    let idProp = null; if (i.dueno) idProp = await upsertAfectado(i.dueno);
    if (i.id) {
      const ex = await inmRepo.findOne({ where: { id: i.id }, relations: { habitaAfectados: true } });
      if (ex) {
        ex.tipoConstruccion = i.tipo_construccion || null; ex.nPisos = i.n_pisos || null; ex.m2Construccion = i.m2_construccion || null; ex.m2Afectados = i.m2_afectado || null; ex.danosVivienda = i.danos_vivienda || null; ex.danosAnexos = i.danos_anexos || null; ex.idPropietario = idProp || null; if (idDireccionInm) ex.idDireccion = idDireccionInm; await inmRepo.save(ex);
        // Habita: eliminar todos y recrear según payload
        if (ex.habitaAfectados?.length) { for (const h of ex.habitaAfectados) await habRepo.remove(h); }
        if (Array.isArray(i.habitantes)) {
          for (const h of i.habitantes) {
            const idAf = await upsertAfectado(h);
            await habRepo.save(habRepo.create({ inmuebleId: ex.id, afectadoId: idAf }));
          }
        }
      }
    } else {
      const ent = inmRepo.create({ tipoConstruccion: i.tipo_construccion || null, nPisos: i.n_pisos || null, m2Construccion: i.m2_construccion || null, m2Afectados: i.m2_afectado || null, danosVivienda: i.danos_vivienda || null, danosAnexos: i.danos_anexos || null, idIncidente, idPropietario: idProp || null, idDireccion: idDireccionInm || null });
      const saved = await inmRepo.save(ent);
      if (Array.isArray(i.habitantes)) {
        for (const h of i.habitantes) {
          const idAf = await upsertAfectado(h);
          await habRepo.save(habRepo.create({ inmuebleId: saved.id, afectadoId: idAf }));
        }
      }
    }
  }

  // 5) Vehículos: eliminar faltantes; upsert dueno/chofer; pasajeros recreate por vehiculo
  const actualesVeh = await vehRepo.find({ where: { idIncidente }, relations: { pasajeros: true } });
  const idsPayloadVeh = new Set((payload.vehiculos || []).map(v => v.id).filter(Boolean));
  for (const ex of actualesVeh) { if (!idsPayloadVeh.has(ex.id)) { if (ex.pasajeros?.length) { for (const p of ex.pasajeros) await pasRepo.remove(p); } await vehRepo.remove(ex); } }
  for (const v of (payload.vehiculos || [])) {
    const idDueno = await upsertAfectado(v.dueno);
    const idConductor = await upsertAfectado(v.chofer);
    if (v.id) {
      const ex = await vehRepo.findOne({ where: { id: v.id }, relations: { pasajeros: true } });
      if (ex) {
        ex.patente = v.patente; ex.color = v.color || null; ex.marca = v.marca || null; ex.modelo = v.modelo || null; ex.descripciondanos = v.danos_vehiculo || null; ex.idDueno = idDueno || null; ex.idConductor = idConductor || null; await vehRepo.save(ex);
        if (ex.pasajeros?.length) { for (const p of ex.pasajeros) await pasRepo.remove(p); }
        if (Array.isArray(v.pasajeros)) { for (const p of v.pasajeros) { const idA = await upsertAfectado(p); const idVinculo = p.idVinculo ? Number(p.idVinculo) : 1; await pasRepo.save(pasRepo.create({ idVehiculo: ex.id, idAfectado: idA, idVinculo, esCopiloto: false })); } }
      }
    } else {
      const ent = vehRepo.create({ patente: v.patente, color: v.color || null, marca: v.marca || null, modelo: v.modelo || null, descripciondanos: v.danos_vehiculo || null, idDueno: idDueno || null, idConductor: idConductor || null, idIncidente });
      const saved = await vehRepo.save(ent);
      if (Array.isArray(v.pasajeros)) { for (const p of v.pasajeros) { const idA = await upsertAfectado(p); const idVinculo = p.idVinculo ? Number(p.idVinculo) : 1; await pasRepo.save(pasRepo.create({ idVehiculo: saved.id, idAfectado: idA, idVinculo, esCopiloto: false })); } }
    }
  }

  // 6) Material mayor: tabla compuesta -> estrategia recreate completa
  const actualesDesp = await despRepo.find({ where: { idIncidente } });
  if (actualesDesp.length) { for (const d of actualesDesp) await despRepo.remove(d); }
  for (const m of (payload.materialMayor || [])) {
    await despRepo.save(despRepo.create({ idBomberoMaquinista: Number(m.conductorId), idIncidente, idCarro: Number(m.unidadId), kmSalida: m.kmSalida || null, kmLlegada: m.kmLlegada || null, nPersonal: m.voluntarios || null }));
  }

  // 7) Accidentados: recreate por PK compuesta (idBombero, idIncidente)
  const actualesAcc = await accRepo.find({ where: { idIncidente } });
  if (actualesAcc.length) { for (const a of actualesAcc) await accRepo.remove(a); }
  for (const a of (payload.accidentados || [])) {
    await accRepo.save(accRepo.create({ idBombero: Number(a.bomberoId), idIncidente, lesiones: a.lesiones || null, constancia: a.constancia || null, AccionesRealizadas: a.acciones || null, comisaria: a.comisaria || null }));
  }

  // 8) Otros servicios: recreate por PK compuesta (idServicio, idIncidente)
  const actualesAcude = await acudeRepo.find({ where: { idIncidente } });
  if (actualesAcude.length) { for (const s of actualesAcude) await acudeRepo.remove(s); }
  for (const s of (payload.otrosServicios || [])) {
    await acudeRepo.save(acudeRepo.create({ idServicio: Number(s.servicioId), idIncidente, unidad: s.tipoUnidad || '', observaciones: s.observaciones || null, nPersonal: s.personal || null, nombrePersonalACargo: s.responsable || null }));
  }

  // 9) Asistencia: por ahora solo lugar -> recreate
  const asistRepo = mgr.getRepository('AsistenciaIncidente');
  const actualesAsist = await asistRepo.find({ where: { idIncidente } });
  if (actualesAsist.length) { for (const ai of actualesAsist) await asistRepo.remove(ai); }
  if (payload.asistencia && Array.isArray(payload.asistencia.lugar)) {
    for (const idBombero of payload.asistencia.lugar) { await asistRepo.save(asistRepo.create({ idBombero: Number(idBombero), idIncidente })); }
  }

  return { id: idIncidente };
}

export default { obtenerPartePorIdService, actualizarParteCompletoService };