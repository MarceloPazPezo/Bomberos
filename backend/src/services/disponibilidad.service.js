"use strict";
import Disponibilidad from "../entities/disponibilidad.entity.js";
import Bombero from "../entities/bombero.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function createDisponibilidadService(body) {
  try {
    // Usar transacción para operación crítica
    return await AppDataSource.transaction(async (manager) => {
      const disponibilidadRepository = manager.getRepository(Disponibilidad);
      const bomberoRepository = manager.getRepository(Bombero);

      const { idBombero, fechaInicio, fechaTermino } = body;

      // 1. Verificar que el bombero existe
      const bombero = await bomberoRepository.findOne({
        where: { id: idBombero }
      });

      if (!bombero) {
        throw new Error("Bombero no encontrado");
      }

      // 2. Verificar que no existe una disponibilidad activa
      const disponibilidadActiva = await disponibilidadRepository
        .createQueryBuilder("disponibilidad")
        .where("disponibilidad.idBombero = :idBombero", { idBombero })
        .andWhere("(disponibilidad.fechaTermino IS NULL OR disponibilidad.fechaTermino > :now)", { now: new Date() })
        .getOne();

      if (disponibilidadActiva) {
        throw new Error("El bombero ya tiene una disponibilidad activa");
      }

      // 3. Crear nueva disponibilidad
      const newDisponibilidad = disponibilidadRepository.create({
        idBombero: bombero.id,
        fechaInicio: fechaInicio || new Date(),
        fechaTermino: fechaTermino || null,
      });

      const savedDisponibilidad = await disponibilidadRepository.save(newDisponibilidad);
      return [savedDisponibilidad, null];
    });
  } catch (error) {
    console.error("Error al crear disponibilidad:", error);
    return [null, error.message || "Error interno del servidor"];
  }
}

export async function getDisponibilidadesService(query = {}) {
  try {
    const disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);

    const queryBuilder = disponibilidadRepository
      .createQueryBuilder("disponibilidad")
      .leftJoinAndSelect("disponibilidad.bombero", "bombero")
      .select([
        "disponibilidad.id",
        "disponibilidad.idBombero",
        "disponibilidad.fechaInicio",
        "disponibilidad.fechaTermino",
        "bombero.id",
        "bombero.nombres",
        "bombero.apellidos",
        "bombero.run"
      ]);

    if (query.idBombero) {
      queryBuilder.andWhere("disponibilidad.idBombero = :idBombero", { idBombero: query.idBombero });
    }

    // Ordenar por fecha de inicio más reciente
    queryBuilder.orderBy("disponibilidad.fechaInicio", "DESC");

    const disponibilidades = await queryBuilder.getMany();

    return [disponibilidades, null];
  } catch (error) {
    console.error("Error al obtener disponibilidades:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getDisponibilidadService(query) {
  try {
    const { id, idBombero } = query;
    const disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);

    const queryBuilder = disponibilidadRepository
      .createQueryBuilder("disponibilidad")
      .leftJoinAndSelect("disponibilidad.bombero", "bombero")
      .select([
        "disponibilidad.id",
        "disponibilidad.idBombero",
        "disponibilidad.fechaInicio",
        "disponibilidad.fechaTermino",
        "bombero.id",
        "bombero.nombres",
        "bombero.apellidos",
        "bombero.run"
      ]);

    if (id) {
      queryBuilder.where("disponibilidad.id = :id", { id });
    } else if (idBombero) {
      queryBuilder.where("disponibilidad.idBombero = :idBombero", { idBombero });
    } else {
      return [null, "Debe proporcionar un ID o idBombero"];
    }

    const disponibilidad = await queryBuilder.getOne();

    if (!disponibilidad) {
      return [null, "Disponibilidad no encontrada"];
    }

    return [disponibilidad, null];
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateDisponibilidadService(query, body) {
  try {
    // Transacción para validaciones complejas de fechas y consistencia
    return await AppDataSource.transaction(async (manager) => {
      const disponibilidadRepository = manager.getRepository(Disponibilidad);
      const { id } = query;

      // 1. Buscar la disponibilidad a actualizar
      const disponibilidad = await disponibilidadRepository.findOne({
        where: { id }
      });

      if (!disponibilidad) {
        throw new Error("Disponibilidad no encontrada");
      }

      // 2. Preparar las nuevas fechas para validación
      const nuevaFechaInicio = body.fechaInicio ? new Date(body.fechaInicio) : disponibilidad.fechaInicio;
      const nuevaFechaTermino = body.fechaTermino !== undefined 
        ? (body.fechaTermino ? new Date(body.fechaTermino) : null)
        : disponibilidad.fechaTermino;

      // 3. Validar lógica de negocio: fechaTermino debe ser posterior a fechaInicio
      if (nuevaFechaTermino && nuevaFechaInicio && nuevaFechaTermino <= nuevaFechaInicio) {
        throw new Error("La fecha de término debe ser posterior a la fecha de inicio");
      }

      // 4. Validar que no se solape con otras disponibilidades del mismo bombero
      if (body.fechaInicio || body.fechaTermino !== undefined) {
        const disponibilidadesSolapadas = await disponibilidadRepository
          .createQueryBuilder("d")
          .where("d.idBombero = :idBombero", { idBombero: disponibilidad.idBombero })
          .andWhere("d.id != :currentId", { currentId: id })
          .andWhere(`
            (
              (:nuevaInicio >= d.fechaInicio AND (:nuevaTermino IS NULL OR :nuevaInicio < d.fechaTermino OR d.fechaTermino IS NULL))
              OR
              (:nuevaTermino IS NOT NULL AND d.fechaInicio >= :nuevaInicio AND d.fechaInicio < :nuevaTermino)
              OR
              (d.fechaTermino IS NULL AND :nuevaTermino IS NULL)
            )
          `, {
            nuevaInicio: nuevaFechaInicio,
            nuevaTermino: nuevaFechaTermino
          })
          .getMany();

        if (disponibilidadesSolapadas.length > 0) {
          throw new Error("Las fechas se solapan con otra disponibilidad existente del bombero");
        }
      }

      // 5. Aplicar los cambios si todas las validaciones pasan
      if (body.fechaInicio !== undefined) {
        disponibilidad.fechaInicio = nuevaFechaInicio;
      }
      
      if (body.fechaTermino !== undefined) {
        disponibilidad.fechaTermino = nuevaFechaTermino;
      }

      // 6. Guardar los cambios
      const updatedDisponibilidad = await disponibilidadRepository.save(disponibilidad);

      return [updatedDisponibilidad, null];
    });
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    return [null, error.message || "Error interno del servidor"];
  }
}

export async function deleteDisponibilidadService(query) {
  try {
    const { id } = query;
    const disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);

    const disponibilidad = await disponibilidadRepository.findOne({
      where: { id }
    });

    if (!disponibilidad) {
      return [null, "Disponibilidad no encontrada"];
    }

    await disponibilidadRepository.remove(disponibilidad);

    return [{ message: "Disponibilidad eliminada correctamente" }, null];
  } catch (error) {
    console.error("Error al eliminar disponibilidad:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getDisponibilidadActivaService(idBombero) {
  try {
    const disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);

    // Buscar disponibilidad activa (sin fecha de término o con fecha de término futura)
    const disponibilidadActiva = await disponibilidadRepository
      .createQueryBuilder("disponibilidad")
      .leftJoinAndSelect("disponibilidad.bombero", "bombero")
      .select([
        "disponibilidad.id",
        "disponibilidad.idBombero",
        "disponibilidad.fechaInicio",
        "disponibilidad.fechaTermino",
        "bombero.id",
        "bombero.nombres",
        "bombero.apellidos",
        "bombero.run"
      ])
      .where("disponibilidad.idBombero = :idBombero", { idBombero })
      .andWhere("(disponibilidad.fechaTermino IS NULL OR disponibilidad.fechaTermino > :now)", { now: new Date() })
      .orderBy("disponibilidad.fechaInicio", "DESC")
      .getOne();

    return [disponibilidadActiva, null];
  } catch (error) {
    console.error("Error al obtener disponibilidad activa:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function cerrarDisponibilidadService(query, body) {
  try {
    // Transacción crítica: cerrar una y crear otra automáticamente
    return await AppDataSource.transaction(async (manager) => {
      const disponibilidadRepository = manager.getRepository(Disponibilidad);
      const bomberoRepository = manager.getRepository(Bombero);

      const { idBombero } = body;

      // 1. Verificar que el bombero existe
      const bombero = await bomberoRepository.findOne({
        where: { id: idBombero }
      });

      if (!bombero) {
        throw new Error("Bombero no encontrado");
      }

      // 2. Buscar disponibilidad activa del bombero
      const disponibilidadActiva = await disponibilidadRepository
        .createQueryBuilder("disponibilidad")
        .where("disponibilidad.idBombero = :idBombero", { idBombero })
        .andWhere("(disponibilidad.fechaTermino IS NULL OR disponibilidad.fechaTermino > :now)", { now: new Date() })
        .orderBy("disponibilidad.fechaInicio", "DESC")
        .getOne();

      if (!disponibilidadActiva) {
        throw new Error("No hay disponibilidad activa para cerrar");
      }

      // 3. Cerrar la disponibilidad (OPERACIÓN CRÍTICA)
      disponibilidadActiva.fechaTermino = new Date();
      const savedDisponibilidad = await disponibilidadRepository.save(disponibilidadActiva);
      
      // 4. Si todo va bien, ambas operaciones se confirman juntas
      // Si algo falla aquí, la operación 3 también se revierte automáticamente
      
      return [savedDisponibilidad, null];
    });
  } catch (error) {
    console.error("Error al cerrar disponibilidad:", error);
    return [null, error.message || "Error interno del servidor"];
  }
}