"use strict";
import TipoEpp from "../../entities/tipoEpp.entity.js";
import EstadoEpp from "../../entities/estadoEpp.entity.js";
import Epp from "../../entities/epp.entity.js";
import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";

async function crearTiposEpp() {
  try {
    const tipoEppRepository = AppDataSource.getRepository(TipoEpp);
    const count = await tipoEppRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Tipos de EPP ya existen, omitiendo creación.");
      return;
    }

    const tiposData = [
      { nombre: "Casco" },
      { nombre: "Chaqueta" },
      { nombre: "Pantalón" },
      { nombre: "Botas" },
      { nombre: "Guantes" },
      { nombre: "Máscara" },
      { nombre: "Tanque de Aire" },
      { nombre: "Regulador" },
      { nombre: "Linterna" },
      { nombre: "Hacha" },
      { nombre: "Manguera" },
      { nombre: "Extintor" },
      { nombre: "Escalera" },
      { nombre: "Otros" }
    ];

    const tipos = tiposData.map((tipo) => tipoEppRepository.create(tipo));
    await tipoEppRepository.save(tipos);
    logger.info("[SERVER] Tipos de EPP creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearTiposEpp" });
    throw error;
  }
}

async function crearEstadosEpp() {
  try {
    const estadoEppRepository = AppDataSource.getRepository(EstadoEpp);
    const count = await estadoEppRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Estados de EPP ya existen, omitiendo creación.");
      return;
    }

    const estadosData = [
      { nombre: "Disponible" },
      { nombre: "En Uso" },
      { nombre: "Mantenimiento" },
      { nombre: "Dañado" },
      { nombre: "Fuera de Servicio" },
      { nombre: "Pendiente Reparación" }
    ];

    const estados = estadosData.map((estado) => estadoEppRepository.create(estado));
    await estadoEppRepository.save(estados);
    logger.info("[SERVER] Estados de EPP creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearEstadosEpp" });
    throw error;
  }
}

async function crearEppEjemplo() {
  try {
    const eppRepository = AppDataSource.getRepository(Epp);
    const tipoEppRepository = AppDataSource.getRepository(TipoEpp);
    const estadoEppRepository = AppDataSource.getRepository(EstadoEpp);

    const count = await eppRepository.count();
    if (count > 0) {
      logger.info("[SERVER] EPP de ejemplo ya existen, omitiendo creación.");
      return;
    }

    // Obtener tipos y estados
    const tipos = await tipoEppRepository.find();
    const estados = await estadoEppRepository.find();

    if (tipos.length === 0 || estados.length === 0) {
      logger.warn("[SERVER] No se pueden crear EPP de ejemplo sin tipos y estados");
      return;
    }

    const tipoDisponible = estados.find(e => e.nombre === "Disponible");
    const tipoMantenimiento = estados.find(e => e.nombre === "Mantenimiento");

    if (!tipoDisponible || !tipoMantenimiento) {
      logger.warn("[SERVER] Estados requeridos no encontrados para crear EPP de ejemplo");
      return;
    }

    const eppsData = [
      {
        nombre: "Casco Bombero Principal #001",
        idTipoEpp: tipos.find(t => t.nombre === "Casco")?.id,
        idEstadoEpp: tipoDisponible.id,
        descripcionDeEstado: "Casco en perfecto estado, recién inspeccionado"
      },
      {
        nombre: "Chaqueta Anti-incendios #002",
        idTipoEpp: tipos.find(t => t.nombre === "Chaqueta")?.id,
        idEstadoEpp: tipoDisponible.id,
        descripcionDeEstado: "Chaqueta certificada, sin daños visibles"
      },
      {
        nombre: "Botas de Seguridad #003",
        idTipoEpp: tipos.find(t => t.nombre === "Botas")?.id,
        idEstadoEpp: tipoMantenimiento.id,
        descripcionDeEstado: "Requiere limpieza y revisión de suela"
      },
      {
        nombre: "Guantes Térmicos #004",
        idTipoEpp: tipos.find(t => t.nombre === "Guantes")?.id,
        idEstadoEpp: tipoDisponible.id,
        descripcionDeEstado: "Guantes en excelente condición"
      },
      {
        nombre: "Máscara de Respiración #005",
        idTipoEpp: tipos.find(t => t.nombre === "Máscara")?.id,
        idEstadoEpp: tipoDisponible.id,
        descripcionDeEstado: "Máscara certificada, filtros recientemente cambiados"
      },
      {
        nombre: "Tanque de Aire #006",
        idTipoEpp: tipos.find(t => t.nombre === "Tanque de Aire")?.id,
        idEstadoEpp: tipoDisponible.id,
        descripcionDeEstado: "Tanque con presión óptima, revisión anual al día"
      },
      {
        nombre: "Linterna LED #007",
        idTipoEpp: tipos.find(t => t.nombre === "Linterna")?.id,
        idEstadoEpp: tipoDisponible.id,
        descripcionDeEstado: "Linterna de alta potencia, baterías cargadas"
      },
      {
        nombre: "Hacha de Rescate #008",
        idTipoEpp: tipos.find(t => t.nombre === "Hacha")?.id,
        idEstadoEpp: tipoDisponible.id,
        descripcionDeEstado: "Hacha afilada y en perfecto estado"
      }
    ].filter(epp => epp.idTipoEpp); // Filtrar EPP con tipos válidos

    if (eppsData.length === 0) {
      logger.warn("[SERVER] No se encontraron tipos válidos para crear EPP de ejemplo");
      return;
    }

    const epps = eppsData.map((eppData) => 
      eppRepository.create({
        ...eppData,
        creadoPor: null, // Sistema
        actualizadoPor: null
      })
    );
    
    await eppRepository.save(epps);
    logger.info(`[SERVER] ${epps.length} EPP de ejemplo creados exitosamente`);
  } catch (error) {
    logger.errorWithContext(error, { function: "crearEppEjemplo" });
    throw error;
  }
}

async function inicializarEpp() {
  try {
    logger.info("[SERVER] Inicializando sistema de EPP...");

    await crearTiposEpp();
    await crearEstadosEpp();
    await crearEppEjemplo();

    logger.info("[SERVER] Sistema de EPP inicializado exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "inicializarEpp" });
    throw error;
  }
}

export { crearTiposEpp, crearEstadosEpp, crearEppEjemplo, inicializarEpp };
