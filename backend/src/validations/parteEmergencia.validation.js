"use strict";
import Joi from "joi";

// Reutilizamos patrones de hora HH:mm y convertiremos a HH:mm:ss en controlador
const horaPattern = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

const afectadoSubSchema = Joi.object({
  id: Joi.any().optional(), // id temporal front
  nombreCompleto: Joi.string().max(200).required(),
  run: Joi.string().max(20).allow('', null),
  telefono: Joi.string().max(20).allow('', null),
  edad: Joi.number().integer().min(0).allow(null),
  descripcionGravedad: Joi.string().max(500).allow('', null),
  esEmpresa: Joi.boolean().optional()
}).unknown(true); // permitir otros campos futuros

const inmuebleSchema = Joi.object({
  id: Joi.any().optional(),
  tipo_construccion: Joi.string().max(100).allow('', null),
  n_pisos: Joi.number().integer().min(0).allow(null),
  m2_construccion: Joi.number().integer().min(0).allow(null),
  m2_afectado: Joi.number().integer().min(0).allow(null),
  danos_vivienda: Joi.string().max(500).allow('', null),
  danos_anexos: Joi.string().max(500).allow('', null),
  calle: Joi.string().max(255).allow('', null),
  numero: Joi.alternatives(Joi.string(), Joi.number()).allow('', null),
  dueno: afectadoSubSchema.allow(null),
  habitantes: Joi.array().items(afectadoSubSchema).allow(null),
}).unknown(false);

const vehiculoSchema = Joi.object({
  id: Joi.any().optional(),
  patente: Joi.string().max(20).required(),
  marca: Joi.string().max(100).allow('', null),
  modelo: Joi.string().max(100).allow('', null),
  anio: Joi.number().integer().min(1900).max(new Date().getFullYear()+1).allow(null),
  color: Joi.string().max(50).allow('', null),
  danos_vehiculo: Joi.string().max(500).allow('', null),
  dueno: afectadoSubSchema.allow(null),
  chofer: afectadoSubSchema.allow(null),
  pasajeros: Joi.array().items(afectadoSubSchema.keys({ idVinculo: Joi.number().integer().positive().optional() })).allow(null)
}).unknown(false);

// materialMayor: permitir id temporal del front (no se persiste, solo orden/UI)
const materialMayorSchema = Joi.object({
  id: Joi.any().optional(),
  unidadId: Joi.number().integer().positive().required(),
  conductorId: Joi.number().integer().positive().required(),
  bomberoId: Joi.number().integer().positive().required(),
  voluntarios: Joi.number().integer().min(0).allow(null),
  kmSalida: Joi.number().integer().min(1).allow(null),
  kmLlegada: Joi.number().integer().min(1).allow(null)
}).custom((value, helpers) => {
  // Validación: si ambos km están presentes, kmLlegada >= kmSalida
  if (value.kmSalida !== null && value.kmSalida !== undefined && 
      value.kmLlegada !== null && value.kmLlegada !== undefined) {
    const kmSalida = Number(value.kmSalida);
    const kmLlegada = Number(value.kmLlegada);
    if (!Number.isNaN(kmSalida) && !Number.isNaN(kmLlegada) && kmLlegada < kmSalida) {
      return helpers.error('custom.kmInvalid');
    }
  }
  return value;
}, 'Kilometraje válido').messages({
  'custom.kmInvalid': 'El kilometraje de llegada debe ser igual o mayor que el de salida.'
});

const accidentadoSchema = Joi.object({
  id: Joi.any().optional(),
  companiaId: Joi.number().integer().positive().allow(null),
  bomberoId: Joi.number().integer().positive().required(),
  rut: Joi.string().max(20).allow('', null).optional().strip(), // llega del front solo para mostrar, no se persiste
  lesiones: Joi.string().max(500).allow('', null),
  constancia: Joi.string().max(100).allow('', null),
  comisaria: Joi.string().max(100).allow('', null),
  acciones: Joi.string().max(500).allow('', null)
});

const otroServicioSchema = Joi.object({
  id: Joi.any().optional(),
  servicioId: Joi.number().integer().positive().required(),
  tipoUnidad: Joi.string().max(50).allow('', null),
  responsable: Joi.string().max(100).allow('', null),
  personal: Joi.number().integer().min(0).allow(null),
  observaciones: Joi.string().max(500).allow('', null)
});

const asistenciaSchema = Joi.object({
  lugar: Joi.array().items(Joi.number().integer().positive()).default([]),
  cuartel: Joi.array().items(Joi.number().integer().positive()).default([])
});

export const parteEmergenciaValidation = Joi.object({
  companiaId: Joi.number().integer().positive().required(),
  // regionId viene del front para selects jerárquicos pero no se persiste directamente: se ignora
  regionId: Joi.number().integer().positive().optional().strip(),
  fecha: Joi.string().isoDate().required(),
  horaDespacho: Joi.string().pattern(horaPattern).required(),
  fechaHoraDespacho: Joi.string().isoDate().optional(), // nueva construcción desde el front
  hora6_0: Joi.string().pattern(horaPattern).allow('', null),
  hora6_3: Joi.string().pattern(horaPattern).allow('', null),
  hora6_9: Joi.string().pattern(horaPattern).allow('', null),
  hora6_10: Joi.string().pattern(horaPattern).allow('', null),
  comunaId: Joi.number().integer().positive().required(),
  calle: Joi.string().max(255).required(),
  numero: Joi.string().allow('', null),
  depto: Joi.alternatives(Joi.string(), Joi.number()).allow('', null),
  referencia: Joi.string().max(255).allow('', null, ''),
  clasificacionId: Joi.number().integer().positive().allow(null),
  subtipoId: Joi.number().integer().positive().allow(null),
  // Estos dos son condicionales: solo requeridos si el subtipo (clave radial) contieneFuego === true.
  // Permitimos '', null u omitir cuando no aplique; el controlador validará condicionalmente.
  tipoIncendioId: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.valid('', null)
  ).optional(),
  faseId: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.valid('', null)
  ).optional(),
  descripcionPreliminar: Joi.string().max(500).allow('', null),
  bomberoACargoId: Joi.number().integer().positive().allow(null),
  idRedactor: Joi.number().integer().positive().allow(null),
  inmuebles: Joi.array().items(inmuebleSchema).default([]),
  vehiculos: Joi.array().items(vehiculoSchema).default([]),
  materialMayor: Joi.array().items(materialMayorSchema).default([]),
  accidentados: Joi.array().items(accidentadoSchema).default([]),
  otrosServicios: Joi.array().items(otroServicioSchema).default([]),
  asistencia: asistenciaSchema.default({ lugar: [], cuartel: [] })
}).unknown(false);

export default { parteEmergenciaValidation };
