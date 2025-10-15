import { AppDataSource } from "../config/configDb.js";
import evento from "../entities/evento.entity.js"
import tipoEvento from "../entities/tipoEvento.entity.js"

export async function obtenerEventosService() {
    const repo = AppDataSource.getRepository(evento);
    const eventos = await repo.find();
    return eventos;
}

export async function obtenerEventoPorIdService(id) {
    const repo = AppDataSource.getRepository(evento);
    const eventoEncontrado = await repo.findOneBy({ id });
    return eventoEncontrado;
}

export async function crearEventoService(data, manager = null) {
    try {
    const repo = (manager || AppDataSource).getRepository(evento);
    const ent = repo.create(data);
    await repo.save(ent);
    return true;
    } catch (error) {
        console.log(error);
     throw error;
    }
}

export async function obtenerTiposEventoService() {
    try {
    const repo = AppDataSource.getRepository(tipoEvento);
    const tipos = await repo.find();
    return tipos;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function actualizarEventoService(id, data, manager = null) {
    try {
    const repo = (manager || AppDataSource).getRepository(evento);
    const ent = await repo.findOneBy({ id });
    if (!ent) {
        throw new Error("Evento no encontrado");
    }
    repo.merge(ent, data);
    await repo.save(ent);
    return true;
    } catch (error) {
        console.log(error);
     throw error;
    }
}

export async function eliminarEventoService(id, manager = null) {
    try {
    const repo = (manager || AppDataSource).getRepository(evento);
    const ent = await repo.findOneBy({ id });
    if (!ent) {
        throw new Error("Evento no encontrado");
    }
    await repo.remove(ent);
    return true;
    } catch (error) {
        console.log(error);
     throw error;
    }
}