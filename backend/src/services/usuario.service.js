"use strict";
import Usuario from "../entities/usuario.entity.js";
import Rol from "../entities/rol.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { Brackets } from "typeorm";

export async function getUserService(query) {
  try {
    const { id, run, email, telefono } = query;

    if (
      id === undefined &&
      run === undefined &&
      email === undefined &&
      telefono === undefined
    ) {
      return [
        null,
        "Debes proporcionar al menos un criterio de búsqueda (id, run, email o telefono).",
      ];
    }

    const userRepository = AppDataSource.getRepository(Usuario);

    const queryBuilder = userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.roles", "role")
      .select([
        "user.id",
        "user.nombres",
        "user.apellidos",
        "user.run",
        "user.fechaNacimiento",
        "user.email",
        "user.telefono",
        "user.fechaIngreso",
        "user.direccion",
        "user.tipoSangre",
        "user.alergias",
        "user.medicamentos",
        "user.condiciones",
        "user.activo",
        "user.creadoPor",
        "user.fechaCreacion",
        "user.actualizadoPor",
        "user.fechaActualizacion",
        "role.id",
        "role.nombre",
      ]);

    queryBuilder.where(
      new Brackets((qb) => {
        let hasAppliedFirstCondition = false;

        if (id !== undefined) {
          qb.where("user.id = :id", { id: parseInt(id, 10) });
          hasAppliedFirstCondition = true;
        }

        if (run !== undefined) {
          if (hasAppliedFirstCondition) {
            qb.orWhere("user.run = :run", { run });
          } else {
            qb.where("user.run = :run", { run });
            hasAppliedFirstCondition = true;
          }
        }

        if (email !== undefined) {
          if (hasAppliedFirstCondition) {
            qb.orWhere("user.email = :email", { email });
          } else {
            qb.where("user.email = :email", { email });
            hasAppliedFirstCondition = true;
          }
        }

        if (telefono !== undefined) {
          if (hasAppliedFirstCondition) {
            qb.orWhere("user.telefono = :telefono", { telefono });
          } else {
            qb.where("user.telefono = :telefono", { telefono });
          }
        }
      }),
    );

    const userFound = await queryBuilder.getOne();

    if (!userFound) return [null, "Usuario no encontrado"];

    const userData = {
      id: userFound.id,
      nombres: userFound.nombres,
      apellidos: userFound.apellidos,
      run: userFound.run,
      fechaNacimiento: userFound.fechaNacimiento,
      email: userFound.email,
      telefono: userFound.telefono,
      fechaIngreso: userFound.fechaIngreso,
      direccion: userFound.direccion,
      tipoSangre: userFound.tipoSangre,
      alergias: userFound.alergias,
      medicamentos: userFound.medicamentos,
      condiciones: userFound.condiciones,
      activo: userFound.activo,
      creadoPor: userFound.creadoPor,
      fechaCreacion: userFound.fechaCreacion,
      actualizadoPor: userFound.actualizadoPor,
      fechaActualizacion: userFound.fechaActualizacion,
      roles: userFound.roles ? userFound.roles.map((r) => r.nombre) : [],
    };

    return [userData, null];
  } catch (error) {
    console.error("Error obtener el usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getUsersService(queryParams = {}) {
  try {
    const userRepository = AppDataSource.getRepository(Usuario);

    const queryBuilder = userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.roles", "role")
      .select([
        "user.id",
        "user.nombres",
        "user.apellidos",
        "user.run",
        "user.email",
        "user.telefono",
        "user.fechaNacimiento",
        "user.fechaIngreso",
        "user.direccion",
        "user.tipoSangre",
        "user.alergias",
        "user.medicamentos",
        "user.condiciones",
        "user.activo",
        "user.creadoPor",
        "user.fechaCreacion",
        "user.actualizadoPor",
        "user.fechaActualizacion",
        "role.id",
        "role.nombre",
      ])
      .orderBy("user.id", "ASC")
      .addOrderBy("role.id", "ASC");

    const { page = 1, limit = 10 } = queryParams;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    if (!users || users.length === 0) {
      return [null, "No se encontraron usuarios."];
    }

    const usersData = users.map((user) => ({
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      run: user.run,
      fechaNacimiento: user.fechaNacimiento,
      email: user.email,
      telefono: user.telefono,
      fechaIngreso: user.fechaIngreso,
      direccion: user.direccion,
      tipoSangre: user.tipoSangre,
      alergias: user.alergias,
      medicamentos: user.medicamentos,
      condiciones: user.condiciones,
      activo: user.activo,
      creadoPor: user.creadoPor,
      fechaCreacion: user.fechaCreacion,
      actualizadoPor: user.actualizadoPor,
      fechaActualizacion: user.fechaActualizacion,
      roles: user.roles ? user.roles.map((r) => r.nombre) : [],
    }));

    return [usersData, null, total];
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return [null, "Error interno del servidor al obtener usuarios."];
  }
}

export async function updateUserService(query, body, updatedBy = null) {
  try {
    const { id, run, email, telefono } = query;

    const userRepository = AppDataSource.getRepository(Usuario);

    const userFound = await userRepository.findOne({
      where: [
        { id: id },
        { run: run },
        { email: email },
        { telefono: telefono },
      ],
    });

    if (!userFound) return [null, "Usuario no encontrado"];
    const dataUserUpdate = {};

    // 2. Validar duplicados de email/teléfono (si se están cambiando)
    if (body.email && body.email !== userFound.email) {
      const existingByEmail = await userRepository.findOne({
        where: { email: body.email },
      });
      if (existingByEmail && existingByEmail.id !== userFound.id) {
        return [null, "Ya existe otro usuario con ese correo electrónico."];
      }
      dataUserUpdate.email = body.email;
    }

    if (body.telefono && body.telefono !== userFound.telefono) {
      const existingByTelefono = await userRepository.findOne({
        where: { telefono: body.telefono },
      });
      if (existingByTelefono && existingByTelefono.id !== userFound.id) {
        return [null, "Ya existe otro usuario con ese número de teléfono."];
      }
      dataUserUpdate.telefono = body.telefono;
    }

    // 3. Validar contraseña actual si se va a cambiar la contraseña
    if (body.newPassword && body.newPassword.trim() !== "") {
      if (!body.currentPassword || body.currentPassword.trim() === "") {
        return [
          null,
          "Se requiere la contraseña actual para establecer una nueva.",
        ];
      }
      const matchPassword = await comparePassword(
        body.currentPassword,
        userFound.passwordHash,
      );
      if (!matchPassword) {
        return [null, "La contraseña actual no coincide."];
      }
      dataUserUpdate.passwordHash = await encryptPassword(body.newPassword);
    }

    // 4. Actualizar otras propiedades directas del usuario
    if (body.nombres !== undefined) dataUserUpdate.nombres = body.nombres;
    if (body.apellidos !== undefined) dataUserUpdate.apellidos = body.apellidos;
    if (body.fechaNacimiento !== undefined)
      dataUserUpdate.fechaNacimiento = body.fechaNacimiento;
    if (body.fechaIngreso !== undefined)
      dataUserUpdate.fechaIngreso = body.fechaIngreso;
    if (body.direccion !== undefined)
      dataUserUpdate.direccion = body.direccion;
    if (body.tipoSangre !== undefined)
      dataUserUpdate.tipoSangre = body.tipoSangre;
    if (body.alergias !== undefined)
      dataUserUpdate.alergias = body.alergias;
    if (body.medicamentos !== undefined)
      dataUserUpdate.medicamentos = body.medicamentos;
    if (body.condiciones !== undefined)
      dataUserUpdate.condiciones = body.condiciones;
    if (body.activo !== undefined) dataUserUpdate.activo = body.activo;

    dataUserUpdate.fechaActualizacion = new Date();
    if (updatedBy) dataUserUpdate.actualizadoPor = updatedBy;

    await userRepository.update({ id: userFound.id }, dataUserUpdate);

    const userData = await userRepository.findOne({
      where: { id: userFound.id },
      relations: ["roles"],
    });

    if (!userData) {
      return [null, "Usuario no encontrado después de actualizar"];
    }

    const { passwordHash, ...userUpdated } = userData;

    // Formatear los roles para mantener consistencia con el login
    if (userUpdated.roles) {
      userUpdated.roles = userUpdated.roles.map((role) => ({
        id: role.id,
        name: role.nombre,
        nombre: role.nombre,
      }));
    }

    return [userUpdated, null];
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function changeUserStatusService(userId, activo) {
  try {
    const userRepository = AppDataSource.getRepository(Usuario);

    // Buscar el usuario por ID
    const userFound = await userRepository.findOne({
      where: { id: userId },
      relations: ["roles"],
    });

    if (!userFound) {
      return [null, "Usuario no encontrado"];
    }

    // Actualizar el estado
    userFound.activo = activo;
    const userUpdated = await userRepository.save(userFound);

    return [userUpdated, null];
  } catch (error) {
    console.error("Error al cambiar el estado del usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteUserService(query) {
  try {
    const { id, run, email } = query;

    const userRepository = AppDataSource.getRepository(Usuario);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { run: run }, { email: email }],
      relations: ["roles"],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (userFound.rol === "administrador") {
      return [null, "No se puede eliminar un usuario con rol de administrador"];
    }

    const userDeleted = await userRepository.remove(userFound);

    const { passwordHash, roles, ...dataUser } = userDeleted;

    return [dataUser, null];
  } catch (error) {
    console.error("Error al eliminar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createUserService(body, createdBy = null) {
  try {
    const userRepository = AppDataSource.getRepository(Usuario);
    const roleRepository = AppDataSource.getRepository(Rol);

    const existingUser = await userRepository.findOne({
      where: [
        { run: body.run },
        { email: body.email },
        { telefono: body.telefono },
      ],
    });

    if (existingUser) {
      return [null, "Ya existe un usuario con el mismo run o email o telefono"];
    }

    const userRole = await roleRepository.findOneBy({ nombre: "Usuario" });
    if (!userRole) {
      return [null, "Rol de usuario no encontrado"];
    }

    const newUser = userRepository.create({
      nombres: body.nombres,
      apellidos: body.apellidos,
      run: body.run,
      fechaNacimiento: body.fechaNacimiento,
      email: body.email,
      telefono: body.telefono,
      passwordHash: await encryptPassword(body.password),
      fechaIngreso: body.fechaIngreso,
      direccion: body.direccion,
      tipoSangre: body.tipoSangre,
      alergias: body.alergias,
      medicamentos: body.medicamentos,
      condiciones: body.condiciones,
      activo: body.activo !== undefined ? body.activo : true,
      creadoPor: createdBy,
      roles: [userRole],
    });

    const savedUser = await userRepository.save(newUser);

    const { passwordHash, ...userData } = savedUser;

    return [userData, null];
  } catch (error) {
    console.error("Error al crear un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}
