"use strict";
import TipoEvento from "../entities/tipoEvento.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function getTipoEventoService(query) {
  try {
    const { id, nombre } = query;

    const tipoEventoRepository = AppDataSource.getRepository(TipoEvento);

    const tipoEventoFound = await tipoEventoRepository.findOne({
      where: [{ id: id }, { nombre: nombre }],
    });

    if (!tipoEventoFound) return [null, "Tipo de evento no encontrado"];

    const tipoEventoData = {
      id: tipoEventoFound.id,
      nombre: tipoEventoFound.nombre,
      descripcion: tipoEventoFound.descripcion,
    };
    return [tipoEventoData, null];
  } catch (error) {
    console.error("Error al obtener el tipo de evento:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getTiposEventoService(queryParams = {}) {
  try {
    const tipoEventoRepository = AppDataSource.getRepository(TipoEvento);

    const queryBuilder = tipoEventoRepository
      .createQueryBuilder("tipoEvento")
      .select([
        "tipoEvento.id",
        "tipoEvento.nombre",
        "tipoEvento.descripcion",
      ])
      .orderBy("tipoEvento.id", "ASC");

    // Solo aplicar paginación si se especifican parámetros
    if (queryParams.page || queryParams.limit) {
      const { page = 1, limit = 10 } = queryParams;
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
    }

    const [tiposEvento, total] = await queryBuilder.getManyAndCount();

    if (!tiposEvento || tiposEvento.length === 0) {
      return [null, "No se encontraron tipos de evento."];
    }

    const tiposEventoSummarized = tiposEvento.map((tipoEvento) => ({
      id: tipoEvento.id,
      nombre: tipoEvento.nombre,
      descripcion: tipoEvento.descripcion,
    }));

    return [tiposEventoSummarized, null, total];
  } catch (error) {
    console.error("Error al obtener los tipos de evento:", error);
    return [null, "Error interno del servidor al obtener tipos de evento."];
  }
}

export async function updateTipoEventoService(query, body) {
  try {
    const { id, nombre } = query;

    const tipoEventoRepository = AppDataSource.getRepository(TipoEvento);

    const tipoEventoFound = await tipoEventoRepository.findOne({
      where: [{ id: id }, { nombre: nombre }],
    });

    if (!tipoEventoFound) return [null, "Tipo de evento no encontrado"];

    const existingTipoEvento = await tipoEventoRepository.findOne({
      where: [{ nombre: body.nombre }],
    });

    if (existingTipoEvento && existingTipoEvento.id !== tipoEventoFound.id) {
      return [null, "Ya existe un tipo de evento con el mismo nombre"];
    }

    // Actualizar el tipo de evento
    tipoEventoFound.nombre = body.nombre || tipoEventoFound.nombre;
    tipoEventoFound.descripcion = body.descripcion !== undefined ? body.descripcion : tipoEventoFound.descripcion;

    const savedTipoEvento = await tipoEventoRepository.save(tipoEventoFound);

    // Formatear la respuesta de manera consistente
    const tipoEventoData = {
      id: savedTipoEvento.id,
      nombre: savedTipoEvento.nombre,
      descripcion: savedTipoEvento.descripcion,
    };

    return [tipoEventoData, null];
  } catch (error) {
    console.error("Error al modificar un tipo de evento:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteTipoEventoService(query) {
  try {
    const { id, nombre } = query;

    const tipoEventoRepository = AppDataSource.getRepository(TipoEvento);

    const tipoEventoFound = await tipoEventoRepository.findOne({
      where: [{ id: id }, { nombre: nombre }],
    });

    if (!tipoEventoFound) {
      return [null, "Tipo de evento no encontrado"];
    }

    // Verificar si el tipo de evento está siendo usado por algún evento
    const eventosCount = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM "evento" WHERE "idTipoEvento" = $1`,
      [tipoEventoFound.id]
    );

    const count = parseInt(eventosCount[0].count);
    
    if (count > 0) {
      return [null, `No se puede eliminar el tipo de evento "${tipoEventoFound.nombre}" porque está asociado a ${count} evento(s)`];
    }

    // Eliminar el tipo de evento usando SQL directo
    await AppDataSource.query(
      `DELETE FROM "tipoEvento" WHERE id = $1`,
      [tipoEventoFound.id]
    );

    return [{ id: tipoEventoFound.id, nombre: tipoEventoFound.nombre }, null];
  } catch (error) {
    console.error("Error al eliminar un tipo de evento:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createTipoEventoService(tipoEventoData) {
  try {
    // Validar que tipoEventoData existe y tiene las propiedades necesarias
    if (!tipoEventoData) {
      return [null, "Datos del tipo de evento no proporcionados"];
    }
    
    if (!tipoEventoData.nombre) {
      return [null, "El nombre del tipo de evento es requerido"];
    }

    const tipoEventoRepository = AppDataSource.getRepository(TipoEvento);

    const existingTipoEvento = await tipoEventoRepository.findOne({
      where: [{ nombre: tipoEventoData.nombre }],
    });

    if (existingTipoEvento) {
      return [null, "Ya existe un tipo de evento con el mismo nombre"];
    }

    const newTipoEvento = tipoEventoRepository.create({
      nombre: tipoEventoData.nombre,
      descripcion: tipoEventoData.descripcion,
    });

    const savedTipoEvento = await tipoEventoRepository.save(newTipoEvento);

    const tipoEventoResponseData = {
      id: savedTipoEvento.id,
      nombre: savedTipoEvento.nombre,
      descripcion: savedTipoEvento.descripcion,
    };

    return [tipoEventoResponseData, null];
  } catch (error) {
    console.error("Error al crear tipo de evento:", error);
    return [null, "Error interno del servidor"];
  }
}

