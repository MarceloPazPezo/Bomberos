"use strict";
import Disponibilidad from "../entities/disponibilidad.entity.js";
import Bombero from "../entities/bombero.entity.js";
import FichaBombero from "../entities/fichaBombero.entity.js";
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
       // fechaInicio: fechaInicio || new Date(),
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
      .leftJoin(
        FichaBombero,
        "fichaBombero",
        "fichaBombero.idBombero = bombero.id"
      )
      .addSelect("fichaBombero.licenciaClaseF", "licenciaClaseF");

    if (query.idBombero) {
      queryBuilder.andWhere("disponibilidad.idBombero = :idBombero", { idBombero: query.idBombero });
    }

    // Ordenar por fecha de inicio más reciente
    queryBuilder.orderBy("disponibilidad.fechaInicio", "DESC");

    const disponibilidades = await queryBuilder.getMany();

    // Obtener las fichas de los bomberos para agregar licenciaClaseF
    const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);
    const bomberosIds = [...new Set(disponibilidades.map(d => d.idBombero))];
    
    let fichasMap = {};
    if (bomberosIds.length > 0) {
      const fichas = await fichaBomberoRepository
        .createQueryBuilder("ficha")
        .where("ficha.idBombero IN (:...ids)", { ids: bomberosIds })
        .select(["ficha.idBombero", "ficha.licenciaClaseF"])
        .getMany();
      
      fichas.forEach(ficha => {
        fichasMap[ficha.idBombero] = ficha.licenciaClaseF || false;
      });
    }

    // Agregar licenciaClaseF a cada disponibilidad
    const disponibilidadesConLicencia = disponibilidades.map(disp => {
      const licenciaClaseF = fichasMap[disp.idBombero] || false;
      return {
        ...disp,
        bombero: {
          ...disp.bombero,
          licenciaClaseF
        },
        licenciaClaseF // También en el nivel superior para fácil acceso
      };
    });

    return [disponibilidadesConLicencia, null];
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
      .where("disponibilidad.idBombero = :idBombero", { idBombero })
      .andWhere("(disponibilidad.fechaTermino IS NULL OR disponibilidad.fechaTermino > :now)", { now: new Date() })
      .orderBy("disponibilidad.fechaInicio", "DESC")
      .getOne();

    if (disponibilidadActiva) {
      // Obtener la ficha del bombero para obtener licenciaClaseF
      const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);
      const ficha = await fichaBomberoRepository.findOne({
        where: { idBombero: idBombero },
        select: ["licenciaClaseF"]
      });
      
      const licenciaClaseF = ficha?.licenciaClaseF || false;
      disponibilidadActiva.bombero = {
        ...disponibilidadActiva.bombero,
        licenciaClaseF
      };
      disponibilidadActiva.licenciaClaseF = licenciaClaseF;
    }

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