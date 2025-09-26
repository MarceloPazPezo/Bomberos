"use strict";
import { AppDataSource } from "../config/configDb.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { direccionCreateValidation } from "../validations/direccion.validation.js";
import { parteEmergenciaValidation } from "../validations/parteEmergencia.validation.js";
import incidenteValidation from "../validations/incidente.validation.js";
import { crearDireccionService } from "../services/direccion.service.js";
import { crearIncidenteService, crearFaseYDanoService } from "../services/incidente.service.js";
import { crearInmuebleService } from "../services/inmueble.service.js";
import { crearAfectadoService } from "../services/afectado.service.js";
import { crearHabitaService } from "../services/habita.service.js";
import { crearVehiculoService } from "../services/vehiculo.service.js";
import { crearPasajeroService } from "../services/pasajero.service.js";
import { crearDespachoService } from "../services/esDespachado.service.js";
import { crearEstadoEstablecidoService } from "../services/estadoEstablecido.service.js";
import { crearAcudeServicioService } from "../services/acudeServicio.service.js";
import { crearAsistenciaIncidenteService } from "../services/asistenciaIncidente.service.js";
import { crearBomberoAccidentadoService } from "../services/bomberoAccidentado.service.js";

function toHHMMSS(v) {
  if (!v) return null;
  if (/^\d{2}:\d{2}:\d{2}$/.test(v)) return v; // ya incluye segundos
  if (/^\d{2}:\d{2}$/.test(v)) return `${v}:00`;
  return null; // formato inválido -> lo manejaremos en validación incidente
}

export async function crearParteEmergencia(req, res) {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return handleErrorClient(res, 400, "Payload inválido");
  }
  const { error: parteError, value: parteData } = parteEmergenciaValidation.validate(payload, { abortEarly: true });
  if (parteError) {
    return handleErrorClient(res, 400, `Error validación parte: ${parteError.details[0].message}`);
  }
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { companiaId, fecha, horaDespacho, fechaHoraDespacho: fechaHoraDespachoFront, hora6_0, hora6_3, hora6_9, hora6_10, comunaId, calle, numero, depto, referencia, descripcionPreliminar, bomberoACargoId, subtipoId: idSubtipoIncidente, tipoIncendioId, faseId, idRedactor, inmuebles = [], vehiculos = [], materialMayor = [], accidentados = [], otrosServicios = [], asistencia = { lugar: [], cuartel: [] } } = parteData;
    const dirPrincipal = { calle, numero: String(numero), depto: depto || null, referencia: referencia || null, idComuna: comunaId, creadoPor: idRedactor || null, actualizadoPor: null };
    const { error: dirError } = direccionCreateValidation.validate(dirPrincipal);
    if (dirError) { await queryRunner.rollbackTransaction(); return handleErrorClient(res, 400, `Error validación dirección: ${dirError.details[0].message}`); }
    const manager = queryRunner.manager;
    const idDireccion = await crearDireccionService(dirPrincipal, manager);
    // Construir FechaHoraDespacho de forma robusta
    let fechaHoraDespacho = null;
    if (fechaHoraDespachoFront) {
      // Priorizar valor construido por el front
      const d = new Date(fechaHoraDespachoFront);
      if (!isNaN(d.getTime())) {
        fechaHoraDespacho = d;
        console.log('[crearParteEmergencia] Usando fechaHoraDespacho del front:', fechaHoraDespachoFront);
      }
    }
    if (!fechaHoraDespacho && fecha && horaDespacho) {
      const fechaTrim = String(fecha).trim();
      const horaTrim = String(horaDespacho).trim();
      try {
        const [yy, mm, dd] = fechaTrim.split('-').map(n => Number(n));
        const [hh, mi] = horaTrim.split(':').map(n => Number(n));
        if ([yy, mm, dd, hh, mi].every(n => Number.isInteger(n)) && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 && hh >= 0 && hh <= 23 && mi >= 0 && mi <= 59) {
          fechaHoraDespacho = new Date(yy, mm - 1, dd, hh, mi, 0, 0);
        }
      } catch (e) { console.warn('[crearParteEmergencia] Error parse manual fecha/hora', e.message); }
      console.log('[crearParteEmergencia] FechaHoraDespacho (fallback build):', fechaHoraDespacho);
    }
    const incidenteData = {
      idCompania: companiaId,
      FechaHoraDespacho: fechaHoraDespacho,
      HoraOperativo6_0: toHHMMSS(hora6_0),
      HoraOperativo6_3: toHHMMSS(hora6_3),
      HoraOperativo6_9: toHHMMSS(hora6_9),
      HoraOperativo6_10: toHHMMSS(hora6_10),
      descripcionPreliminar: descripcionPreliminar || null,
      idBomberoACargo: bomberoACargoId || null,
      idDireccion,
      idRedactor: idRedactor || null,
      idSubtipoIncidente: idSubtipoIncidente || null,
      creadoPor: idRedactor || null,
      actualizadoPor: null
    };
    const { error: incidenteErr } = incidenteValidation.incidenteCreateValidation.validate(incidenteData);
    if (incidenteErr) { await queryRunner.rollbackTransaction(); return handleErrorClient(res, 400, `Error validación incidente: ${incidenteErr.details[0].message}`); }
    const incidenteCreado = await crearIncidenteService(incidenteData, manager);
    const idIncidente = incidenteCreado.id;
    console.log('[crearParteEmergencia] Incidente creado id:', idIncidente, 'FechaHoraDespacho:', incidenteCreado.FechaHoraDespacho);
    if (tipoIncendioId && faseId) { await crearFaseYDanoService({ idIncidente, idFase: faseId, idTipoDano: tipoIncendioId }, manager); }
    // Preparar idVinculo por defecto para pasajeros (evitar FK inexistente). Nombre único para reuso.
    let defaultVinculoId = null;
    try {
      const vinculoRepo = manager.getRepository('Vinculo');
      const nombreDefaultVinculo = 'SIN INFORMACION';
      let vinculo = await vinculoRepo.findOne({ where: { nombre: nombreDefaultVinculo } });
      if (!vinculo) {
        try {
          vinculo = await vinculoRepo.save(vinculoRepo.create({ nombre: nombreDefaultVinculo }));
        } catch (innerErr) {
          // Posible condición de carrera: otro request pudo crear el registro; re intentar fetch
          vinculo = await vinculoRepo.findOne({ where: { nombre: nombreDefaultVinculo } });
        }
      }
      if (vinculo) defaultVinculoId = vinculo.id;
    } catch (vErr) {
      console.warn('No se pudo preparar vinculo por defecto, se intentará continuar. Detalle:', vErr.message);
    }
    for (const inm of inmuebles) {
      let idDireccionInmueble = null;
      if (inm.calle || inm.numero) {
        const dirInm = { calle: inm.calle || 'S/N', numero: String(inm.numero || 'S/N'), depto: null, referencia: null, idComuna: comunaId, creadoPor: idRedactor || null, actualizadoPor: null };
        const { error: dirInmErr } = direccionCreateValidation.validate(dirInm);
        if (!dirInmErr) { idDireccionInmueble = await crearDireccionService(dirInm, manager); }
      }
      let idPropietario = null;
      if (inm.dueno) { idPropietario = await crearAfectadoService({ nombreCompleto: inm.dueno.nombreCompleto, run: inm.dueno.run || null, telefono: inm.dueno.telefono || null, edad: inm.dueno.edad || null, descripcionGravedad: inm.dueno.descripcionGravedad || null, esEmpresa: !!inm.dueno.esEmpresa, idIncidente, idDireccion: idDireccionInmueble, idEstadoCivil: null }, manager); }
      const idInmueble = await crearInmuebleService({ tipoConstruccion: inm.tipo_construccion || null, nPisos: inm.n_pisos || null, m2Construccion: inm.m2_construccion || null, m2Afectados: inm.m2_afectado || null, danosVivienda: inm.danos_vivienda || null, danosAnexos: inm.danos_anexos || null, idIncidente, idPropietario: idPropietario || null, idDireccion: idDireccionInmueble || null }, manager);
      if (Array.isArray(inm.habitantes)) { for (const hab of inm.habitantes) { const idAfectadoHab = await crearAfectadoService({ nombreCompleto: hab.nombreCompleto, run: hab.run || null, telefono: hab.telefono || null, edad: hab.edad || null, descripcionGravedad: hab.descripcionGravedad || null, esEmpresa: false, idIncidente, idDireccion: idDireccionInmueble, idEstadoCivil: null }, manager); await crearHabitaService({ idInmueble, idAfectado: idAfectadoHab }, manager); } }
    }
    for (const v of vehiculos) {
      let idDueno = null, idConductor = null;
      if (v.dueno) { idDueno = await crearAfectadoService({ nombreCompleto: v.dueno.nombreCompleto, run: v.dueno.run || null, telefono: v.dueno.telefono || null, edad: v.dueno.edad || null, descripcionGravedad: v.dueno.descripcionGravedad || null, esEmpresa: !!v.dueno.esEmpresa, idIncidente, idDireccion: null, idEstadoCivil: null }, manager); }
      if (v.chofer) { idConductor = await crearAfectadoService({ nombreCompleto: v.chofer.nombreCompleto, run: v.chofer.run || null, telefono: v.chofer.telefono || null, edad: v.chofer.edad || null, descripcionGravedad: v.chofer.descripcionGravedad || null, esEmpresa: false, idIncidente, idDireccion: null, idEstadoCivil: null }, manager); }
      const idVehiculo = await crearVehiculoService({ patente: v.patente, color: v.color || null, marca: v.marca || null, modelo: v.modelo || null, descripciondanos: v.danos_vehiculo || null, idDueno: idDueno || null, idConductor: idConductor || null, idIncidente }, manager);
      if (Array.isArray(v.pasajeros)) {
        for (const p of v.pasajeros) {
          const idAfectadoPas = await crearAfectadoService({ nombreCompleto: p.nombreCompleto, run: p.run || null, telefono: p.telefono || null, edad: p.edad || null, descripcionGravedad: p.descripcionGravedad || null, esEmpresa: false, idIncidente, idDireccion: null, idEstadoCivil: null }, manager);
          // Permitir que el front envíe p.idVinculo, si no usar default o fallback a 1 (último recurso)
          const idVinculo = p.idVinculo ? Number(p.idVinculo) : (defaultVinculoId || 1);
          try {
            await crearPasajeroService({ idVehiculo, idAfectado: idAfectadoPas, idVinculo, esCopiloto: false }, manager);
          } catch (pasErr) {
            console.error('Error creando pasajero (vehiculo:', idVehiculo, 'afectado:', idAfectadoPas, 'idVinculo:', idVinculo, '):', pasErr.message);
            throw pasErr; // relanzar para rollback consistente
          }
        }
      }
    }
    for (const m of materialMayor) { await crearDespachoService({ idBomberoMaquinista: Number(m.conductorId), idIncidente, idCarro: Number(m.unidadId), kmSalida: m.kmSalida || null, kmLlegada: m.kmLlegada || null, nPersonal: m.voluntarios || null }, manager); }
    for (const a of accidentados) { await crearBomberoAccidentadoService({ idBombero: Number(a.bomberoId), idIncidente, lesiones: a.lesiones || null, constancia: a.constancia || null, AccionesRealizadas: a.acciones || null, comisaria: a.comisaria || null }, manager); }
    for (const s of otrosServicios) { await crearAcudeServicioService({ idServicio: Number(s.servicioId), idIncidente, unidad: s.tipoUnidad || '', observaciones: s.observaciones || null, nPersonal: s.personal || null, nombrePersonalACargo: s.responsable || null }, manager); }
    if (asistencia && Array.isArray(asistencia.lugar)) { for (const idBombero of asistencia.lugar) { await crearAsistenciaIncidenteService({ idBombero: Number(idBombero), idIncidente }, manager); } }
    // Registrar EstadoEstablecido inicial: idEstado=1, idBombero=idRedactor
    try {
      if (idRedactor) {
        await crearEstadoEstablecidoService({ idBombero: Number(idRedactor), idEstado: 1, idIncidente, fechaHora: new Date() }, manager);
      }
    } catch (ee) {
      console.warn('No se pudo registrar EstadoEstablecido inicial:', ee?.message);
    }
    await queryRunner.commitTransaction();
    return handleSuccess(res, 201, "Parte de emergencia creado", { idIncidente, FechaHoraDespacho: incidenteCreado.FechaHoraDespacho });
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('Error creando parte emergencia:', err);
    return handleErrorServer(res, 500, err.message);
  } finally { await queryRunner.release(); }
}
