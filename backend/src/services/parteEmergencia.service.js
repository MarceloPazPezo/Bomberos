"use strict";
import { AppDataSource } from "../config/configDb.js";
import ParteEmergencia from "../entities/parte_emergencia.entity.js";

// Usa el manager transaccional si viene, o el global por defecto.
const getRepo = (manager) =>
  (manager ?? AppDataSource.manager).getRepository(ParteEmergencia);

export const createParteEmergenciaService = async (data, manager = null) => {
  try {
    const repo = getRepo(manager);
    const entity = repo.create(data);
    const saved = await repo.save(entity);
    console.log("Parte de emergencia creada:", saved.id);
    return saved;
  } catch (error) {
    console.error("Error al crear parte de emergencia:", error);
    throw new Error(`Error al crear parte de emergencia: ${error.message}`);
  }
};

export const updateParteEmergenciaService = async (id, data, manager = null) => {
  try {
    const repo = getRepo(manager);
    const entity = await repo.findOne({ where: { id } });
    if (!entity) throw new Error("Parte de emergencia no encontrado");
    repo.merge(entity, data);
    const updated = await repo.save(entity);
    console.log("Parte de emergencia actualizado:", updated.id);
    return updated;
  } catch (error) {
    console.log("Error al actualizar parte de emergencia:", error);
    throw new Error(`Error al actualizar parte de emergencia: ${error.message}`);
  }
};
