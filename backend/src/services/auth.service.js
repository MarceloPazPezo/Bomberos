"use strict";
import Usuario from "../entities/usuario.entity.js";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";

export async function loginService(user) {
  try {
    const userRepository = AppDataSource.getRepository(Usuario);
    const { run, password } = user;
    const createErrorMessage = (dataInfo, message) => ({
      dataInfo,
      message,
    });

    const userFound = await userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.roles", "role")
      .leftJoinAndSelect("role.permisos", "permission")
      .select([
        "user.id",
        "user.nombres",
        "user.apellidos",
        "user.email",
        "user.run",
        "user.telefono",
        "user.fechaNacimiento",
        "user.fechaIngreso",
        "user.direccion",
        "user.tipoSangre",
        "user.alergias",
        "user.medicamentos",
        "user.condiciones",
        "user.activo",
        "user.fechaCreacion",
        "user.fechaActualizacion",
        "role.id",
        "role.nombre",
        "permission.nombre",
      ])
      .addSelect("user.passwordHash")
      .where("user.run = :run", { run: run })
      .getOne();

    if (!userFound) {
      return [null, createErrorMessage("run", "El run es incorrecto")];
    }

    if (!userFound.activo) {
      return [
        null,
        createErrorMessage(
          "estado",
          "La cuenta de usuario está inactiva. Por favor, contacta al administrador.",
        ),
      ];
    }

    const isMatch = await comparePassword(password, userFound.passwordHash);

    if (!isMatch) {
      return [
        null,
        createErrorMessage("password", "La contraseña es incorrecta"),
      ];
    }

    const payload = {
      id: userFound.id,
      nombres: userFound.nombres,
      apellidos: userFound.apellidos,
      email: userFound.email,
      run: userFound.run,
      telefono: userFound.telefono,
      fechaNacimiento: userFound.fechaNacimiento,
      fechaIngreso: userFound.fechaIngreso,
      direccion: userFound.direccion,
      tipoSangre: userFound.tipoSangre,
      alergias: userFound.alergias,
      medicamentos: userFound.medicamentos,
      condiciones: userFound.condiciones,
      activo: userFound.activo,
      fechaCreacion: userFound.fechaCreacion,
      fechaActualizacion: userFound.fechaActualizacion,
      roles: userFound.roles.map((r) => ({
        nombre: r.nombre,
        permisos: r.permisos ? r.permisos.map((p) => p.nombre) : [],
      })),
    };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    return [accessToken, null];
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return [null, "Error interno del servidor"];
  }
}
