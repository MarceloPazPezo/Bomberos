"use strict";
import User from "../entities/user.entity.js";
import Role from "../entities/role.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { Brackets } from "typeorm";

export async function getUserService(query) {
  try {
    const { rut, id, email, telefono } = query;

    if (
      id === undefined &&
      rut === undefined &&
      email === undefined &&
      telefono === undefined
    ) {
      return [
        null,
        "Debes proporcionar al menos un criterio de búsqueda (id, rut, email o telefono).",
      ];
    }

    const userRepository = AppDataSource.getRepository(User);

    const queryBuilder = userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.roles", "role")
      .select([
        "user.id",
        "user.nombres",
        "user.apellidos",
        "user.rut",
        "user.email",
        "user.telefono",
        "user.activo",
        "user.fechaNacimiento",
        "user.createdAt",
        "user.updatedAt",
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

        if (rut !== undefined) {
          if (hasAppliedFirstCondition) {
            qb.orWhere("user.rut = :rut", { rut });
          } else {
            qb.where("user.rut = :rut", { rut });
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
            // hasAppliedFirstCondition = true; // No es crucial para la última
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
      fechaNacimiento: userFound.fechaNacimiento,
      rut: userFound.rut,
      email: userFound.email,
      telefono: userFound.telefono,
      activo: userFound.activo,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
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
    const userRepository = AppDataSource.getRepository(User);

    const queryBuilder = userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.roles", "role")
      .select([
        "user.id",
        "user.nombres",
        "user.apellidos",
        "user.rut",
        "user.email",
        "user.telefono",
        "user.fechaNacimiento",
        "user.activo",
        "user.createdAt",
        "user.updatedAt",
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
      rut: user.rut,
      email: user.email,
      telefono: user.telefono,
      fechaNacimiento: user.fechaNacimiento,
      activo: user.activo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles ? user.roles.map((r) => r.nombre) : [],
    }));

    return [usersData, null, total];
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return [null, "Error interno del servidor al obtener usuarios."];
  }
}

export async function updateUserService(query, body) {
  try {
    const { id, rut, email, telefono } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [
        { id: id },
        { rut: rut },
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
        userFound.hashedPassword,
      );
      if (!matchPassword) {
        return [null, "La contraseña actual no coincide."];
      }
      dataUserUpdate.hashedPassword = await encryptPassword(body.newPassword);
    }

    // 4. Actualizar otras propiedades directas del usuario
    if (body.nombres !== undefined) dataUserUpdate.nombres = body.nombres;
    if (body.apellidos !== undefined) dataUserUpdate.apellidos = body.apellidos;
    if (body.fechaNacimiento !== undefined)
      dataUserUpdate.fechaNacimiento = body.fechaNacimiento;
    if (body.activo !== undefined) dataUserUpdate.activo = body.activo;

    dataUserUpdate.updatedAt = new Date();

    await userRepository.update({ id: userFound.id }, dataUserUpdate);

    const userData = await userRepository.findOne({
      where: { id: userFound.id },
      relations: ["roles"],
    });

    if (!userData) {
      return [null, "Usuario no encontrado después de actualizar"];
    }

    const { hashedPassword, ...userUpdated } = userData;

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
    const userRepository = AppDataSource.getRepository(User);

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
    const { id, rut, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { rut: rut }, { email: email }],
      relations: ["roles"],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (userFound.rol === "administrador") {
      return [null, "No se puede eliminar un usuario con rol de administrador"];
    }

    const userDeleted = await userRepository.remove(userFound);

    const { hashedPassword, roles, ...dataUser } = userDeleted;

    return [dataUser, null];
  } catch (error) {
    console.error("Error al eliminar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createUserService(body) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    const existingUser = await userRepository.findOne({
      where: [
        { rut: body.rut },
        { email: body.email },
        { telefono: body.telefono },
      ],
    });

    if (existingUser) {
      return [null, "Ya existe un usuario con el mismo rut o email o telefono"];
    }

    const userRole = await roleRepository.findOneBy({ nombre: "Usuario" });
    if (!userRole) {
      return [null, "Rol de usuario no encontrado"];
    }

    const newUser = userRepository.create({
      nombres: body.nombres,
      apellidos: body.apellidos,
      rut: body.rut,
      fechaNacimiento: body.fechaNacimiento,
      email: body.email,
      telefono: body.telefono,
      roles: [userRole],
      hashedPassword: await encryptPassword(body.password),
      activo: true,
    });

    const savedUser = await userRepository.save(newUser);

    const { hashedPassword, ...userData } = savedUser;

    return [userData, null];
  } catch (error) {
    console.error("Error al crear un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}
