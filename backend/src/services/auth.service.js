"use strict";
import Bombero from "../entities/bombero.entity.js";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";

export async function loginService(bombero) {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);
    const { run, password } = bombero;
    const createErrorMessage = (dataInfo, message) => ({
      dataInfo,
      message,
    });

    const bomberoFound = await bomberoRepository
      .createQueryBuilder("bombero")
      .leftJoinAndSelect("bombero.roles", "rol")
      .leftJoinAndSelect("rol.permisos", "permiso")
      .select([
        "bombero.id",
        "bombero.nombres",
        "bombero.apellidos",
        "bombero.email",
        "bombero.run",
        "bombero.creadoEl",
        "bombero.creadoPor",
        "bombero.actualizadoEl",
        "bombero.actualizadoPor",
        "bombero.activo",
        "rol.id",
        "rol.nombre",
        "permiso.nombre",
      ])
      .addSelect("bombero.password")
      .where("bombero.run = :run", { run: run })
      .getOne();

    if (!bomberoFound) {
      return [null, createErrorMessage("run", "El run es incorrecto")];
    }

    if (!bomberoFound.activo) {
      return [
        null,
        createErrorMessage(
          "estado",
          "La cuenta de bombero está inactiva. Por favor, contacta al administrador.",
        ),
      ];
    }

    const isMatch = await comparePassword(password, bomberoFound.password);

    if (!isMatch) {
      return [
        null,
        createErrorMessage("password", "La contraseña es incorrecta"),
      ];
    }

    const payload = {
      id: bomberoFound.id,
      nombres: bomberoFound.nombres,
      apellidos: bomberoFound.apellidos,
      email: bomberoFound.email,
      run: bomberoFound.run,
      activo: bomberoFound.activo,
      creadoEl: bomberoFound.creadoEl,
      creadoPor: bomberoFound.creadoPor,
      actualizadoEl: bomberoFound.actualizadoEl,
      actualizadoPor: bomberoFound.actualizadoPor,
      roles: bomberoFound.roles.map((r) => ({
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
