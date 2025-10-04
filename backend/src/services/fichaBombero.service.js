"use strict";
import FichaBombero from "../entities/fichaBombero.entity.js";
import Bombero from "../entities/bombero.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function createFichaBomberoService(body, createdBy = null) {
  try {
    const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);
    const bomberoRepository = AppDataSource.getRepository(Bombero);

    // Verificar que el bombero existe
    const bombero = await bomberoRepository.findOne({
      where: { id: body.idBombero }
    });

    if (!bombero) {
      return [null, "Bombero no encontrado"];
    }

    // Verificar que no existe ya una ficha para este bombero
    const existingFicha = await fichaBomberoRepository.findOne({
      where: { idBombero: body.idBombero }
    });

    if (existingFicha) {
      return [null, "Ya existe una ficha para este bombero"];
    }

    const fichaData = {
      nombre: body.nombre,
      licenciaClaseF: body.licenciaClaseF || false,
      telefono: body.telefono,
      fechaNacimiento: body.fechaNacimiento,
      fechaIngreso: body.fechaIngreso,
      donante: body.donante || false,
      fotoPerfilURL: body.fotoPerfilURL,
      fotoPerfilKEY: body.fotoPerfilKEY,
      idCompania: body.idCompania,
      idDireccion: body.idDireccion,
      idTipoSangre: body.idTipoSangre,
      idBombero: body.idBombero,
      creadoPor: createdBy
    };

    const newFicha = fichaBomberoRepository.create(fichaData);
    const savedFicha = await fichaBomberoRepository.save(newFicha);

    return [savedFicha, null];
  } catch (error) {
    console.error("Error al crear ficha de bombero:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getFichaBomberoService(query) {
  try {
    const { id, idBombero } = query;

    if (!id && !idBombero) {
      return [null, "Debes proporcionar id o idBombero"];
    }

    const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);
    
    const queryBuilder = fichaBomberoRepository
      .createQueryBuilder("ficha")
      .leftJoinAndSelect("ficha.bombero", "bombero")
      .leftJoinAndSelect("ficha.compania", "compania")
      .leftJoinAndSelect("ficha.direccion", "direccion")
      .leftJoinAndSelect("ficha.tipoSangre", "tipoSangre")
      .select([
        "ficha.id",
        "ficha.nombre",
        "ficha.licenciaClaseF",
        "ficha.telefono",
        "ficha.fechaNacimiento",
        "ficha.fechaIngreso",
        "ficha.donante",
        "ficha.fotoPerfilURL",
        "ficha.fotoPerfilKEY",
        "ficha.idCompania",
        "ficha.idDireccion",
        "ficha.idTipoSangre",
        "ficha.idBombero",
        "ficha.creadoEl",
        "ficha.creadoPor",
        "ficha.actualizadoEl",
        "ficha.actualizadoPor",
        "bombero.id",
        "bombero.nombres",
        "bombero.apellidos",
        "bombero.run",
        "bombero.email",
        "compania.id",
        "compania.nombre",
        "direccion.id",
        "direccion.calle",
        "direccion.numero",
        "tipoSangre.id",
        "tipoSangre.tipo"
      ]);

    if (id) {
      queryBuilder.where("ficha.id = :id", { id: parseInt(id, 10) });
    } else if (idBombero) {
      queryBuilder.where("ficha.idBombero = :idBombero", { idBombero: parseInt(idBombero, 10) });
    }

    const ficha = await queryBuilder.getOne();

    if (!ficha) {
      return [null, "Ficha de bombero no encontrada"];
    }

    return [ficha, null];
  } catch (error) {
    console.error("Error al obtener ficha de bombero:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateFichaBomberoService(id, body, updatedBy = null) {
  try {
    const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);

    // Verificar que la ficha existe
    const existingFicha = await fichaBomberoRepository.findOne({
      where: { id: parseInt(id, 10) }
    });

    if (!existingFicha) {
      return [null, "Ficha de bombero no encontrada"];
    }

    // Actualizar solo los campos proporcionados
    const updateData = {
      ...body,
      actualizadoPor: updatedBy
    };

    await fichaBomberoRepository.update(id, updateData);

    // Obtener la ficha actualizada
    const [updatedFicha] = await getFichaBomberoService({ id });

    return [updatedFicha, null];
  } catch (error) {
    console.error("Error al actualizar ficha de bombero:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteFichaBomberoService(id) {
  try {
    const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);

    // Verificar que la ficha existe
    const existingFicha = await fichaBomberoRepository.findOne({
      where: { id: parseInt(id, 10) }
    });

    if (!existingFicha) {
      return [null, "Ficha de bombero no encontrada"];
    }

    await fichaBomberoRepository.delete(id);

    return [true, null];
  } catch (error) {
    console.error("Error al eliminar ficha de bombero:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getFichasBomberoService(queryParams = {}) {
  try {
    const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);

    const queryBuilder = fichaBomberoRepository
      .createQueryBuilder("ficha")
      .leftJoinAndSelect("ficha.bombero", "bombero")
      .leftJoinAndSelect("ficha.compania", "compania")
      .leftJoinAndSelect("ficha.direccion", "direccion")
      .leftJoinAndSelect("ficha.tipoSangre", "tipoSangre")
      .select([
        "ficha.id",
        "ficha.nombre",
        "ficha.licenciaClaseF",
        "ficha.telefono",
        "ficha.fechaNacimiento",
        "ficha.fechaIngreso",
        "ficha.donante",
        "ficha.fotoPerfilURL",
        "ficha.fotoPerfilKEY",
        "ficha.idCompania",
        "ficha.idDireccion",
        "ficha.idTipoSangre",
        "ficha.idBombero",
        "ficha.creadoEl",
        "ficha.creadoPor",
        "ficha.actualizadoEl",
        "ficha.actualizadoPor",
        "bombero.id",
        "bombero.nombres",
        "bombero.apellidos",
        "bombero.run",
        "bombero.email",
        "compania.id",
        "compania.nombre",
        "direccion.id",
        "direccion.calle",
        "direccion.numero",
        "tipoSangre.id",
        "tipoSangre.tipo"
      ])
      .orderBy("ficha.id", "ASC");

    // Filtros opcionales
    const { page = 1, limit = 10, idCompania, licenciaClaseF } = queryParams;

    if (idCompania) {
      queryBuilder.andWhere("ficha.idCompania = :idCompania", { idCompania });
    }

    if (licenciaClaseF !== undefined) {
      queryBuilder.andWhere("ficha.licenciaClaseF = :licenciaClaseF", { licenciaClaseF: licenciaClaseF === 'true' });
    }

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [fichas, total] = await queryBuilder.getManyAndCount();

    if (!fichas || fichas.length === 0) {
      return [null, "No se encontraron fichas de bomberos"];
    }

    return [
      {
        fichas,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      null
    ];
  } catch (error) {
    console.error("Error al obtener fichas de bomberos:", error);
    return [null, "Error interno del servidor"];
  }
}
