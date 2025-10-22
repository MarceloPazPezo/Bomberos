import { AppDataSource } from "../config/configDb.js";
import Inmueble from "../entities/inmueble.entity.js";

export async function crearInmuebleService(inmuebleData, manager = null) {
  try {
    const inmuebleRepository = (manager || AppDataSource).getRepository(Inmueble);
    const nuevoInmueble = inmuebleRepository.create(inmuebleData);
    const inmuebleGuardado = await inmuebleRepository.save(nuevoInmueble);
    return inmuebleGuardado.id;
  } catch (error) {
    console.error("Error al crear el inmueble:", error);
    throw error;
  }
}