import { AppDataSource } from "../config/configDb.js";
import Incidente  from "../entities/incidente.entity.js";
import FaseYDano from "../entities/faseYDano.entity.js";

export async function crearIncidenteService(incidenteData, manager = null) {
  try {
    const incidenteRepository = (manager || AppDataSource).getRepository(Incidente);
    const nuevoIncidente = incidenteRepository.create(incidenteData);
       const incidenteGuardado = await incidenteRepository.save(nuevoIncidente);
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