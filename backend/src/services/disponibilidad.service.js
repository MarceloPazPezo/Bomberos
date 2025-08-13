"use strict";
import Disponibilidad from "../entities/disponibilidad.entity.js";
import Usuario from "../entities/usuario.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function createDisponibilidadService(body) {
  try {
    const disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const { usuario_id, estado, fecha_inicio, fecha_termino, rol_servicio } = body;

    // Verificar que el usuario existe
    const usuario = await usuarioRepository.findOne({
      where: { id: usuario_id }
    });

    if (!usuario) {
      return [null, "Usuario no encontrado"];
    }

    const newDisponibilidad = disponibilidadRepository.create({
      usuario_id,
      estado: estado || 'disponible',
      fecha_inicio: fecha_inicio || new Date(),
      fecha_termino: fecha_termino || null,
      rol_servicio: rol_servicio || null
    });

    const savedDisponibilidad = await disponibilidadRepository.save(newDisponibilidad);

    return [savedDisponibilidad, null];
  } catch (error) {
    console.error("Error al crear disponibilidad:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getDisponibilidadesService(query = {}) {
  try {
    const disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);

    const queryBuilder = disponibilidadRepository
      .createQueryBuilder("disponibilidad")
      .leftJoinAndSelect("disponibilidad.usuario", "usuario")
      .select([
        "disponibilidad.id",
        "disponibilidad.usuario_id",
        "disponibilidad.estado",
        "disponibilidad.fecha_inicio",
        "disponibilidad.fecha_termino",
        "disponibilidad.rol_servicio",
        "usuario.id",
        "usuario.nombres",
        "usuario.apellidos",
        "usuario.run"
      ]);

    // Filtros opcionales
    if (query.estado) {
      queryBuilder.andWhere("disponibilidad.estado = :estado", { estado: query.estado });
    }

    if (query.usuario_id) {
      queryBuilder.andWhere("disponibilidad.usuario_id = :usuario_id", { usuario_id: query.usuario_id });
    }

    // Ordenar por fecha de inicio más reciente
    queryBuilder.orderBy("disponibilidad.fecha_inicio", "DESC");

    const disponibilidades = await queryBuilder.getMany();

    return [disponibilidades, null];
  } catch (error) {
    console.error("Error al obtener disponibilidades:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getDisponibilidadService(query) {
  try {
    const { id, usuario_id } = query;
    const disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);

    const queryBuilder = disponibilidadRepository
      .createQueryBuilder("disponibilidad")
      .leftJoinAndSelect("disponibilidad.usuario", "usuario")
      .select([
        "disponibilidad.id",
        "disponibilidad.usuario_id",
        "disponibilidad.estado",
        "disponibilidad.fecha_inicio",
        "disponibilidad.fecha_termino",
        "disponibilidad.rol_servicio",
        "usuario.id",
        "usuario.nombres",
        "usuario.apellidos",
        "usuario.run"
      ]);

    if (id) {
      queryBuilder.where("disponibilidad.id = :id", { id });
    } else if (usuario_id) {
      queryBuilder.where("disponibilidad.usuario_id = :usuario_id", { usuario_id });
    } else {
      return [null, "Debe proporcionar un ID o usuario_id"];
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
    const { id } = query;
    const disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);

    const disponibilidad = await disponibilidadRepository.findOne({
      where: { id }
    });

    if (!disponibilidad) {
      return [null, "Disponibilidad no encontrada"];
    }

    // Actualizar campos permitidos
    if (body.estado !== undefined) {
      disponibilidad.estado = body.estado;
    }
    
    if (body.fecha_inicio !== undefined) {
      disponibilidad.fecha_inicio = body.fecha_inicio;
    }
    
    if (body.fecha_termino !== undefined) {
      disponibilidad.fecha_termino = body.fecha_termino;
    }
    
    if (body.rol_servicio !== undefined) {
      disponibilidad.rol_servicio = body.rol_servicio;
    }

    const updatedDisponibilidad = await disponibilidadRepository.save(disponibilidad);

    return [updatedDisponibilidad, null];
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
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

export async function getDisponibilidadActivaService(usuario_id) {
  try {
    const disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);

    const disponibilidadActiva = await disponibilidadRepository
      .createQueryBuilder("disponibilidad")
      .leftJoinAndSelect("disponibilidad.usuario", "usuario")
      .select([
        "disponibilidad.id",
        "disponibilidad.usuario_id",
        "disponibilidad.estado",
        "disponibilidad.fecha_inicio",
        "disponibilidad.fecha_termino",
        "disponibilidad.rol_servicio",
        "usuario.id",
        "usuario.nombres",
        "usuario.apellidos",
        "usuario.run"
      ])
      .where("disponibilidad.usuario_id = :usuario_id", { usuario_id })
      .andWhere("(disponibilidad.fecha_termino IS NULL OR disponibilidad.fecha_termino > :now)", { now: new Date() })
      .orderBy("disponibilidad.fecha_inicio", "DESC")
      .getOne();

    return [disponibilidadActiva, null];
  } catch (error) {
    console.error("Error al obtener disponibilidad activa:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function changeDisponibilidadStatusService(query, body) {
  try {
    const { usuario_id, estado, rol_servicio, fecha_inicio, fecha_termino } = body;
    const disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    // Verificar que el usuario existe
    const usuario = await usuarioRepository.findOne({
      where: { id: usuario_id }
    });

    if (!usuario) {
      return [null, "Usuario no encontrado"];
    }

    // Validar estados permitidos
    const estadosPermitidos = ['disponible', 'no_disponible', 'en_servicio', 'cerrar_estado'];
    if (!estadosPermitidos.includes(estado)) {
      return [null, "Estado no válido. Estados permitidos: " + estadosPermitidos.join(', ')];
    }

    // Buscar disponibilidad activa del usuario (sin fecha_termino o con fecha_termino futura)
    const disponibilidadActiva = await disponibilidadRepository
      .createQueryBuilder("disponibilidad")
      .where("disponibilidad.usuario_id = :usuario_id", { usuario_id })
      .andWhere("(disponibilidad.fecha_termino IS NULL OR disponibilidad.fecha_termino > :now)", { now: new Date() })
      .orderBy("disponibilidad.fecha_inicio", "DESC")
      .getOne();

    // Lógica especial para cerrar estado (cuando se envía 'cerrar_estado')
    if (estado === 'cerrar_estado') {
      if (disponibilidadActiva) {
        disponibilidadActiva.fecha_termino = new Date();
        const savedDisponibilidad = await disponibilidadRepository.save(disponibilidadActiva);
        return [savedDisponibilidad, null];
      } else {
        return [null, null]; // No hay estado activo que cerrar
      }
    }

    // Si el nuevo estado es disponible, en_servicio o no_disponible, crear nuevo registro
    if (estado === 'disponible' || estado === 'en_servicio' || estado === 'no_disponible') {
      // Cerrar cualquier disponibilidad activa anterior
      if (disponibilidadActiva) {
        disponibilidadActiva.fecha_termino = new Date();
        await disponibilidadRepository.save(disponibilidadActiva);
      }

      // Crear nuevo registro
      const newDisponibilidad = disponibilidadRepository.create({
        usuario_id,
        estado,
        fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : new Date(),
        fecha_termino: fecha_termino ? new Date(fecha_termino) : null,
        rol_servicio: rol_servicio || null
      });

      const savedDisponibilidad = await disponibilidadRepository.save(newDisponibilidad);
      return [savedDisponibilidad, null];
    }

    return [null, "Estado no válido para la operación"];
  } catch (error) {
    console.error("Error al cambiar estado de disponibilidad:", error);
    return [null, "Error interno del servidor"];
  }
}