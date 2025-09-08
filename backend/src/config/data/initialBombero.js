"use strict";
import Bombero from "../../entities/bombero.entity.js";
import Rol from "../../entities/rol.entity.js";
import { AppDataSource } from "../configDb.js";
import { encryptPassword } from "../../helpers/bcrypt.helper.js";
import logger from "../logger.js";

async function crearBomberos() {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);
    const rolRepository = AppDataSource.getRepository(Rol);

    const count = await bomberoRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Bomberos ya existen, omitiendo creación.");
      return;
    }

    const adminRol = await rolRepository.findOneBy({
      nombre: "Administrador",
    });
    const supervisorRol = await rolRepository.findOneBy({
      nombre: "Supervisor",
    });
    const bomberoRol = await rolRepository.findOneBy({ nombre: "Bombero" });

    if (!adminRol || !supervisorRol || !bomberoRol) {
      logger.error(
        "Error: No se encontraron todos los roles necesarios (Administrador, Supervisor, Bombero). Asegúrate de que createRoles se ejecutó correctamente.",
      );
      return;
    }

    const bomberosData = [
      {
        nombres: ["Admin", "Principal"],
        apellidos: ["Del Sistema"],
        run: "1234567-4",
        email: "admin@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [adminRol, bomberoRol],
      },
      {
        nombres: ["Juan", "Andrés"],
        apellidos: ["Pérez", "Gómez"],
        run: "12345678-5",
        email: "editor.juan@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [supervisorRol, bomberoRol],
      },
      {
        nombres: ["Ana", "Lucia"],
        apellidos: ["López", "Diaz"],
        run: "18765432-7",
        email: "ana.lopez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: false,
        roles: [bomberoRol],
      },
    ];

    const bomberos = bomberosData.map((bomberoData) => bomberoRepository.create(bomberoData));
    await bomberoRepository.save(bomberos);
    logger.info("[SERVER] Bomberos creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearBomberos" });
    throw error;
  }
}

export { crearBomberos };
