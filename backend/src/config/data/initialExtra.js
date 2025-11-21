"use strict";
import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";
import subTipoIncidente from "../../entities/subtipoIncidente.entity.js"
import clasificacionEmergencia from "../../entities/clasificacionEmergencia.entity.js";
import TipoDano from "../../entities/tipoDano.entity.js";
import faseIncidente from "../../entities/faseIncidente.entity.js";
import TipoCapacitacion from "../../entities/tipoCapacitacion.entity.js";
import Servicios from "../../entities/servicio.entity.js";
import ClaveRadial from "../../entities/claveRadial.entity.js";


async function crearTipoDano(params) {
  try {
    const tipoDanoRepository = AppDataSource.getRepository(TipoDano);
    const count = await tipoDanoRepository.count();
    if (count > 0) {
      logger.info("[SERVER] TipoDano ya existen, omitiendo creación.");
      return;
    }
    const tipoDanoData = [
      { nombre: "COMPARTIMENTAL" },
      { nombre: "MULTICOMPARTIMENTAL" },
      { nombre: "ESTRUCTURAL" },
    ];

    for (const tipoDanoItem of tipoDanoData) {
      const tipoDanoEntity = tipoDanoRepository.create(tipoDanoItem);
      await tipoDanoRepository.save(tipoDanoEntity);
    }
    logger.info("[SERVER] TipoDano creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearTipoDano" });
    throw error;
  }

}

async function crearfaseIncidente(params) {
  try {
    const faseIncidenteRepository = AppDataSource.getRepository(faseIncidente);
    const count = await faseIncidenteRepository.count();
    if (count > 0) {
      logger.info("[SERVER] faseIncidente ya existen, omitiendo creación.");
      return;
    }
    const faseIncidenteData = [
      { nombre: "IGNICIÓN" },
      { nombre: "INCREMENTO" },
      { nombre: "LATENTE" },
      { nombre: "LIBRE COMBUSTIÓN" },
      { nombre: "DECAIMIENTO" },
    ];

    for (const faseIncidenteItem of faseIncidenteData) {
      const faseIncidenteEntity = faseIncidenteRepository.create(faseIncidenteItem);
      await faseIncidenteRepository.save(faseIncidenteEntity);
    }
    logger.info("[SERVER] faseIncidente creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearfaseIncidente" });
    throw error;
  }

}


async function crearClasificacionEmergencia() {
  try {
    const clasificacionEmergenciaRepository = AppDataSource.getRepository(clasificacionEmergencia);
    const count = await clasificacionEmergenciaRepository.count();
    if (count > 0) {
      logger.info("[SERVER] ClasificacionEmergencia ya existen, omitiendo creación.");
      return;
    }
    const clasificacionEmergenciaData = [
      { nombre: "EDIFICACION" },
      { nombre: "FUEGO EN VEHICULO" },
      { nombre: "FUEGO EN MATORRALES" },
      { nombre: "RESCATE" },
      { nombre: "ACCIDENTE DE TRÁNSITO" },
      { nombre: "MATERIALES PELIGROSOS" },
      { nombre: "EMANACION DE GASES" },
      { nombre: "OTROS" },
    ];
    for (const clasificacionItem of clasificacionEmergenciaData) {
      const clasificacionEntity = clasificacionEmergenciaRepository.create(clasificacionItem);
      await clasificacionEmergenciaRepository.save(clasificacionEntity);
    }
    logger.info("[SERVER] ClasificacionEmergencia creadas exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearClasificacionEmergencia" });
    throw error;
  }
}

async function crearSubTipoIncidente() {
  try {
    const subTipoIncidenteRepository = AppDataSource.getRepository(subTipoIncidente);
    const claveRadialRepository = AppDataSource.getRepository(ClaveRadial);
    const count = await subTipoIncidenteRepository.count();
    if (count > 0) {
      logger.info("[SERVER] SubTipoIncidente ya existen, omitiendo creación.");
      return;
    }
    const subTipoIncidenteData = [
      { claveRadialName: "10-0-1", clasificacion: "1", descripcion: "EDIFICACIONES DESTINADAS A UNA O 2 VIVIENDA.", contieneFuego: true, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-0-2", clasificacion: "1", descripcion: "EDIFICACIONES CON MÁS DE 3 VIVIENDAS Y SOBRE 2 PISOS INDISTINTAMENTE SU DESTINO DE USO.", contieneFuego: true, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-0-3", clasificacion: "1", descripcion: "EDIFICACIONES DESTINADAS A LA AFLUENCIA DE PÚBLICO INSISTINTAMENTE DE SU HORARIO, INDUSTRIAS O RECINTOS COMERCIALES.", contieneFuego: true, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-0-4", clasificacion: "1", descripcion: "EDIFICACIONES CON ALTO NIVEL DE PROPAGACION O POBLACIONES CLASIFICADAS DE ALTO RIESGO.", contieneFuego: true, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-0-5", clasificacion: "1", descripcion: "EDIFICACIONES CON PRESENCIA CONFIRMADA O PRESUNCION DE ALMACENAMIENTO DE MATERIALES PELIGROSOS.", contieneFuego: true, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-1-1", clasificacion: "2", descripcion: "FUEGO EN VEHICULOS LIVIANOS Y/O MOTOCICLETAS INDISTINTAMENTE SU DESTINO DE USO.", contieneFuego: true, contieneInmuebles: false, contieneVehiculos: true },
      { claveRadialName: "10-1-2", clasificacion: "2", descripcion: "FUEGO EN VEHICULOS PESADOS DESTINADOS A CARGA O MAQUINARIA AGRICOLA", contieneFuego: true, contieneInmuebles: false, contieneVehiculos: true },
      { claveRadialName: "10-1-3", clasificacion: "2", descripcion: "FUEGO EN VEHICULOS DESTINADOS AL TRANSPORTE DE PASAJEROS.", contieneFuego: true, contieneInmuebles: false, contieneVehiculos: true },
      { claveRadialName: "10-1-4", clasificacion: "2", descripcion: "FUEGO EN VEHICULOS CON PRESENCIA DE MATERIALES PELIGROSOS.", contieneFuego: true, contieneInmuebles: false, contieneVehiculos: true },
      { claveRadialName: "10-2-1", clasificacion: "3", descripcion: "FUEGO EN MATORRALES Y/O PASTIZALES DE CONTROL RÁPIDO.", contieneFuego: true, contieneInmuebles: false, contieneVehiculos: false },
      { claveRadialName: "10-2-2", clasificacion: "3", descripcion: "FUEGO EN MATORRALES Y/O PASTIZALES CON RÁPIDO AVANCE CON PELIGRO DE PROPAGACIÓN A BOSQUE O VIVIENDAS.", contieneFuego: true, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-3-1", clasificacion: "4", descripcion: "RESCATE DE BAJA COMPLEJIDAD (ATROPELLOS, APOYO A SAMU, CAÍDAS DE NIVEL, HERIDAS CORTO PUNZANTE, PERSONAS ENCERRADAS EN INMUEBLES, ETC)." },
      { claveRadialName: "10-3-2", clasificacion: "4", descripcion: "RESCATE DE MEDIANA COMPLEJIDAD (EMPALAMIENTO, ATRAPAMIENTO, ELECTROCUCIÓN).", contieneFuego: false, contieneInmuebles: true, contieneVehiculos: true },
      { claveRadialName: "10-3-3", clasificacion: "4", descripcion: "RESCATE DE BAJO NIVEL (RÍOS, POZOS, CANALES, ZANJAS, ETC)." },
      { claveRadialName: "10-3-4", clasificacion: "4", descripcion: "RESCATE DE PERSONA POR ATROPELLO FERROVIARIO." },
      { claveRadialName: "10-3-5", clasificacion: "4", descripcion: "RESCATE SOBRE NIVEL (ANDAMIOS, TORRES DE ALTA TENCIÓN, PASARELAS, ETC)." },
      { claveRadialName: "10-3-6", clasificacion: "4", descripcion: "RESCATE DE PERSONA DESAPARECIDA." },
      { claveRadialName: "10-3-7", clasificacion: "4", descripcion: "RESCATE POR COLAPSO ESTRUCTURAL.", contieneFuego: false, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-3-8", clasificacion: "4", descripcion: "INTENTOS DE SUICIDIO QUE NO INVOLUCREN PRESENCIA CONFIRMADA O PRESUNCION DE MATERIALES PELIGROSOS." },
      { claveRadialName: "10-3-9", clasificacion: "4", descripcion: "LLAMADO A RESCATE ANIMAL." },
      { claveRadialName: "10-4-1", clasificacion: "5", descripcion: "ACCIDENTE DE TRÁNSITO QUE INVOLUCRE VEHICULOS LIVIANOS INDISTINTAMENTE LA CANTIDAD DE LESIONADOS (COLISIÓN, CHOQUE, VOLCAMIENTO, DESBARRANCAMIENTO, ETC).", contieneFuego: false, contieneInmuebles: false, contieneVehiculos: true },
      { claveRadialName: "10-4-2", clasificacion: "5", descripcion: "ACCIDENTE DE TRÁNSITO QUE INVOLUCRE VEHICULOS DE TRANSPORTE DE PASAJEROS, INDISTINTAMENTE SU PERSO Y CANTIDAD DE LESIONADOS (COLISION CHOQUE, VOLCAMIENTO, DESBARRANCAMIENTO, ETC).", contieneFuego: false, contieneInmuebles: false, contieneVehiculos: true },
      { claveRadialName: "10-4-3", clasificacion: "5", descripcion: "ACCIDENTE DE TRÁNSITO QUE INVOLUCRE VEHICULOS PESADOS O CON CARGA SIN PRESENCIA CONFIRMADA NI PRESUNCION DE TRANSPORTE DE MATERIALES PELIGROSOS (COLISIÓN, CHOQUE, VOLCAMIENTO, DESBARRANCAMIENTO, ETC)", contieneFuego: false, contieneInmuebles: false, contieneVehiculos: true },
      { claveRadialName: "10-4-4", clasificacion: "5", descripcion: "ACCIDENTE DE TRANSITO QUE INVOLUCRE VEHICULOS CON PRESENCIA CONFIRMADA O PRESUNCION DE TRANSPORTE DE MATERIALES PELIGROSOS.", contieneFuego: false, contieneInmuebles: false, contieneVehiculos: true },
      { claveRadialName: "10-5-1", clasificacion: "6", descripcion: "EMERGENCIAS CON MATERIALES PELIGROSOS EN EDIFICACIONES DESTINADAS A VIVIENDA.", contieneFuego: false, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-5-2", clasificacion: "6", descripcion: "EMERGENCIAS CON MATERIALES PELIGROSOS EN VÍA PÚBLICA." },
      { claveRadialName: "10-5-3", clasificacion: "6", descripcion: "EMERGENCIAS CON MATERIALES PELIGROSOS EN EDIFICACIONES DESTINADAS AL SECTOR INDUSTRIALY/O COMERCIAL, LUGARES CON ALTA AFLUENCIA DE PÚBLICO.", contieneFuego: false, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-6-3", clasificacion: "7", descripcion: "EMANACION DE GAS EN EDIFICACIONES DESTINADAS A VIVIENDA.", contieneFuego: false, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-6-2", clasificacion: "7", descripcion: "EMANACION DE GAS O PRESENCIA DE ESTE EN VÍA PÚBLICA." },
      { claveRadialName: "10-6-3", clasificacion: "7", descripcion: "EMANACION DE GAS EN EDIFICACIONES DESTINADAS AL SECTOR INDUSTRIAL Y/O COMERCIAL, LUGARES CON ALTA AFLUENCIA DE PÚBLICO.", contieneFuego: false, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-6-4", clasificacion: "7", descripcion: "EMANACION DE GASES COMBUSTIBLES CON CONFIRMACION O PRESUNCION DE PERSONAS INTOXICADAS EN EDIFICACIONES O VÍA PÚBLICA.", contieneFuego: false, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-7-1", clasificacion: "8", descripcion: "EMERGENCIA ELECTRICA EN VIA PUBLICA Y/O EDIFICACIONES DESTINADAS A VIVIENDA.", contieneFuego: false, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-7-2", clasificacion: "8", descripcion: "EMERGENCIA ELECTRICA EN EDIFICACIONES DESTINADAS AL SECTOR INDUSTRIAL Y/O COMERCIAL, LUGARES CON ALTA AFLUENCIA DE PÚBLICO.", contieneFuego: false, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-8-1", clasificacion: "8", descripcion: "EMERGENCIA DE CAIDA DE ARBOL." },
      { claveRadialName: "10-8-2", clasificacion: "8", descripcion: "EMERGENCIA DE INUNDACIONES O SALIDAS DE RÍOS." },
      { claveRadialName: "10-8-3", clasificacion: "8", descripcion: "EMERGENCIA DE VOLADURA DE TECHOS Y/O INFRAESTRUCTURA", contieneFuego: false, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-8-4", clasificacion: "8", descripcion: "EMERGENCIA DE HABILITACION DE RUTAS." },
      { claveRadialName: "10-8-5", clasificacion: "8", descripcion: "EMERGENCIA NO CLASIFICADAS." },
      { claveRadialName: "10-9", clasificacion: "8", descripcion: "OTROS SERVICIOS, DESPACHO SEGÚN REQUERIMIENTO ESPECIFICO DE LA SOLICITUD.", contieneFuego: true, contieneInmuebles: true, contieneVehiculos: true },
      { claveRadialName: "10-10", clasificacion: "8", descripcion: "LLAMADO A REBROTE DE INCENDIO.", contieneFuego: true, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-11", clasificacion: "8", descripcion: "APOLLO A SERVICIO AÉREO.", contieneFuego: true, contieneInmuebles: true, contieneVehiculos: false },
      { claveRadialName: "10-12", clasificacion: "8", descripcion: "APOYO A OTROS CUERPOS DE BOMBEROS, DESPACHO SEGÚN REQUERIMIENTO ESPECIFICO DE LA SOLICITUD.", contieneFuego: true, contieneInmuebles: true, contieneVehiculos: true },
      { claveRadialName: "10-13", clasificacion: "8", descripcion: "ATENTADO TERRORISTA." },
      { claveRadialName: "10-14", clasificacion: "8", descripcion: "ACCIDENTE AÉREO." },
      { claveRadialName: "10-15", clasificacion: "8", descripcion: "SIMULACRO, DESPACHO SEGUN COORDINACIÓN." },
    ];

    for (const subTipoIncidenteItem of subTipoIncidenteData) {
      const claveRadialEntity = await claveRadialRepository.findOne({ where: { nombre: subTipoIncidenteItem.claveRadialName } });

      if (claveRadialEntity) {
        const subTipoIncidenteEntity = subTipoIncidenteRepository.create({
          ...subTipoIncidenteItem,
          claveRadial: claveRadialEntity
        });
        await subTipoIncidenteRepository.save(subTipoIncidenteEntity);
      } else {
        logger.warn(`[SERVER] Clave radial ${subTipoIncidenteItem.claveRadialName} no encontrada, omitiendo creación de subtipo.`);
      }
    }
    logger.info("[SERVER] SubTipoIncidente creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearSubTipoIncidente" });
    throw error;
  }
}

async function crearServicios() {
  try {
    const serviciosRepository = AppDataSource.getRepository(Servicios);
    const count = await serviciosRepository.count();
    if (count > 0) {
      logger.info("La tabla 'Servicios' ya contiene datos. No se insertarán datos iniciales.");
      return;
    }
    const serviciosData = [
      { nombre: "SAMU" },
      { nombre: "Carabineros" },
      { nombre: "Emergencias Municipal" },
      { nombre: "CONAF" },
      { nombre: "Brigada Forestal" },
      { nombre: "Compañía Eléctrica" },
      { nombre: "Compañía de agua" },
    ];

    const servicios = serviciosRepository.create(serviciosData);
    await serviciosRepository.save(servicios);
    logger.info("Datos iniciales insertados en la tabla 'Servicios'.");
  } catch (error) {
    logger.error("Error al insertar datos iniciales en la tabla 'Servicios':", error);
  }
}

async function crearTiposSangre() {
  try {
    const tipoSangreRepository = AppDataSource.getRepository("TipoSangre");

    // Verificar si ya existen tipos de sangre
    const tiposExistentes = await tipoSangreRepository.count();
    if (tiposExistentes > 0) {
      logger.info(`[SERVER] Tipos de sangre ya existen (${tiposExistentes} registros)`);
      return;
    }

    // Tipos de sangre estándar
    const tiposSangre = [
      { nombre: "O+" },
      { nombre: "O-" },
      { nombre: "A+" },
      { nombre: "A-" },
      { nombre: "B+" },
      { nombre: "B-" },
      { nombre: "AB+" },
      { nombre: "AB-" }
    ];

    // Insertar tipos de sangre
    await tipoSangreRepository.save(tiposSangre);
    logger.info(`[SERVER] ${tiposSangre.length} tipos de sangre creados exitosamente`);
  } catch (error) {
    logger.errorWithContext(error, { function: "inicializarTiposSangre" });
    throw error;
  }
}

/**
 * Inicializa los estados de reporte disponibles
 */
async function crearEstadosReporte() {
  try {
    const estadoReporteRepository = AppDataSource.getRepository("EstadoReporte");

    // Verificar si ya existen estados de reporte
    const estadosExistentes = await estadoReporteRepository.count();
    if (estadosExistentes > 0) {
      logger.info(`[SERVER] Estados de reporte ya existen (${estadosExistentes} registros)`);
      return;
    }

    // Estados de reporte estándar
    const estadosReporte = [
      { id: 1, nombre: "Borrador", color: "#FFA500" }, //color naranja
      { id: 2, nombre: "Enviado", color: "#0000FF" }, //color azul
      { id: 3, nombre: "Aprobado", color: "#008000" }, //color verde
      { id: 4, nombre: "Corregir", color: "#FF0000" }, //color rojo
    ];

    // Insertar estados de reporte
    await estadoReporteRepository.save(estadosReporte);
    logger.info(`[SERVER] ${estadosReporte.length} estados de reporte creados exitosamente`);
  } catch (error) {
    logger.errorWithContext(error, { function: "inicializarEstadosReporte" });
    throw error;
  }
}

async function crearTiposCapacitacion() {
  try {
    const tipoCapacitacionRepository = AppDataSource.getRepository(TipoCapacitacion);

    // Verificar si ya existen tipos de capacitación
    const tiposExistentes = await tipoCapacitacionRepository.count();
    if (tiposExistentes > 0) {
      logger.info(`[SERVER] Tipos de capacitación ya existen (${tiposExistentes} registros)`);
      return;
    }

    // Tipos de capacitación comunes para bomberos
    const tiposCapacitacionData = [
      {
        nombre: "Primeros Auxilios",
        descripcion: "Capacitación básica en atención de emergencias médicas y primeros auxilios"
      },
      {
        nombre: "Rescate Vehicular",
        descripcion: "Técnicas de rescate y extricación de personas atrapadas en vehículos"
      },
      {
        nombre: "Manejo de Materiales Peligrosos",
        descripcion: "Capacitación en identificación, manejo y control de materiales peligrosos (HAZMAT)"
      },
      {
        nombre: "Combate de Incendios",
        descripcion: "Técnicas fundamentales de combate de incendios estructurales y forestales"
      },
      {
        nombre: "Rescate Acuático",
        descripcion: "Procedimientos de rescate en ambientes acuáticos, ríos, pozos y canales"
      },
      {
        nombre: "Rescate en Altura",
        descripcion: "Técnicas de rescate vertical y trabajo en altura con cuerdas y equipos especializados"
      },
      {
        nombre: "Búsqueda y Rescate",
        descripcion: "Técnicas de búsqueda y localización de personas desaparecidas o atrapadas"
      },
      {
        nombre: "Operaciones con Escaleras",
        descripcion: "Uso seguro y eficiente de escaleras aéreas y de extensión"
      },
      {
        nombre: "Ventilación",
        descripcion: "Técnicas de ventilación táctica para control de humo y gases en incendios"
      },
      {
        nombre: "Operaciones de Bomba",
        descripcion: "Operación y mantenimiento de bombas contra incendios y sistemas de agua"
      },
      {
        nombre: "Comunicaciones de Emergencia",
        descripcion: "Protocolos de comunicación radial y sistemas de emergencia"
      },
      {
        nombre: "Seguridad en Escena",
        descripcion: "Protocolos de seguridad personal y control de escena en emergencias"
      },
      {
        nombre: "Rescate de Colapso Estructural",
        descripcion: "Técnicas especializadas para rescate en estructuras colapsadas"
      },
      {
        nombre: "Emergencias con Gases",
        descripcion: "Procedimientos para emergencias con fugas de gas y gases combustibles"
      },
      {
        nombre: "Manejo de Escombros",
        descripcion: "Técnicas seguras para remoción y manejo de escombros en emergencias"
      },
      {
        nombre: "Apoyo Psicológico en Emergencias",
        descripcion: "Primeros auxilios psicológicos y apoyo a víctimas y compañeros"
      }
    ];

    for (const tipoData of tiposCapacitacionData) {
      const tipoEntity = tipoCapacitacionRepository.create(tipoData);
      await tipoCapacitacionRepository.save(tipoEntity);
    }

    logger.info(`[SERVER] ${tiposCapacitacionData.length} tipos de capacitación creados exitosamente`);
  } catch (error) {
    logger.errorWithContext(error, { function: "crearTiposCapacitacion" });
    throw error;
  }
}

export { crearSubTipoIncidente, crearClasificacionEmergencia, crearTipoDano, crearfaseIncidente, crearServicios, crearTiposSangre, crearEstadosReporte, crearTiposCapacitacion };