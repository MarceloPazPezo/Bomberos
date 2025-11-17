import { AppDataSource } from "../config/configDb.js";
import Incidente  from "../entities/incidente.entity.js";
import FaseYDano from "../entities/faseYDano.entity.js";
import { createPuntoGeograficoService } from "./puntoGeografico.service.js";
import logger from "../config/configLogger.js";

export async function crearIncidenteService(incidenteData, manager = null) {
  try {
    const incidenteRepository = (manager || AppDataSource).getRepository(Incidente);
    const nuevoIncidente = incidenteRepository.create(incidenteData);
    const incidenteGuardado = await incidenteRepository.save(nuevoIncidente);
    
    // Crear punto geográfico automáticamente si hay dirección con coordenadas
    if (incidenteData.idDireccion) {
      try {
        const direccionRepository = AppDataSource.getRepository("Direccion");
        const direccion = await direccionRepository.findOne({
          where: { id: incidenteData.idDireccion },
          relations: ["comuna", "puntoGeografico"]
        });
        
        // Solo crear punto si la dirección no tiene uno asociado y tiene coordenadas
        if (direccion && !direccion.idPuntoGeografico) {
          // Intentar obtener coordenadas de la dirección (si existen en algún campo temporal o geocoding)
          // Por ahora, necesitaremos que las coordenadas vengan del frontend o de un servicio de geocoding
          logger.info(`[INCIDENTE_SERVICE] Dirección ${direccion.id} para incidente ${incidenteGuardado.id} no tiene punto geográfico asociado`);
          // TODO: Implementar geocoding o recibir coordenadas del frontend
        }
      } catch (error) {
        logger.warn(`[INCIDENTE_SERVICE] No se pudo crear punto geográfico para incidente ${incidenteGuardado.id}:`, error.message);
        // No fallar la creación del incidente si falla la creación del punto
      }
    }
    
    return incidenteGuardado; // devolver objeto completo para validar FechaHoraDespacho
  } catch (error) {
    console.error("Error al crear el incidente:", error);
    throw error;
  }
}

export async function crearFaseYDanoService(faseData, manager = null) {
    try {
        const faseRepository = (manager || AppDataSource).getRepository(FaseYDano);
        const nuevaFase = faseRepository.create(faseData);
        const faseGuardada = await faseRepository.save(nuevaFase);
        return faseGuardada.id;
    } catch (error) {
        console.error("Error al crear la fase y daño:", error);
        throw error;
    }
}

export async function borrarIncidenteService(incidenteId, manager = null) {
  try {
    const incidenteRepository = (manager || AppDataSource).getRepository(Incidente);
    const incidente = await incidenteRepository.findOneBy({ id: incidenteId });
    if (!incidente) {
      throw new Error("Incidente no encontrado");
    }
    await incidenteRepository.remove(incidente);
    return true;
  } catch (error) {
    console.error("Error al borrar el incidente:", error);
    throw error;
  }
}