"use strict";
import Bombero from "../../entities/bombero.entity.js";
import FichaBombero from "../../entities/fichaBombero.entity.js";
import Rol from "../../entities/rol.entity.js";
import { AppDataSource } from "../configDb.js";
import { encryptPassword } from "../../helpers/bcrypt.helper.js";
import logger from "../configLogger.js";

async function crearBomberos() {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);
    const fichaRepository = AppDataSource.getRepository(FichaBombero);
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
      // Bomberos con ficha (Primera Compañía - ID: 1)
      {
        nombres: ["Admin", "Principal"],
        apellidos: ["Del Sistema"],
        run: "1234567-4",
        email: "admin@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [adminRol, bomberoRol],
        ficha: {
          nombre: "Admin Principal Del Sistema",
          telefono: "+56912345678",
          licenciaClaseF: true,
          donante: true,
          fechaNacimiento: "1985-03-15",
          fechaIngreso: "2020-01-15",
          idCompania: 1
        }
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
        ficha: {
          nombre: "Juan Andrés Pérez Gómez",
          telefono: "+56923456789",
          licenciaClaseF: true,
          donante: false,
          fechaNacimiento: "1988-07-22",
          fechaIngreso: "2021-03-10",
          idCompania: 1
        }
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
        ficha: {
          nombre: "Ana Lucia López Diaz",
          telefono: "+56934567890",
          licenciaClaseF: false,
          donante: true,
          fechaNacimiento: "1992-11-08",
          fechaIngreso: "2022-06-20",
          idCompania: 1
        }
      },

      // Bomberos con ficha (Segunda Compañía - ID: 2)
      {
        nombres: ["María", "Fernanda"],
        apellidos: ["González", "Morales"],
        run: "22334455-6",
        email: "maria.gonzalez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [supervisorRol, bomberoRol],
        ficha: {
          nombre: "María Fernanda González Morales",
          telefono: "+56945678901",
          licenciaClaseF: true,
          donante: true,
          fechaNacimiento: "1987-05-12",
          fechaIngreso: "2019-09-15",
          idCompania: 2
        }
      },
      {
        nombres: ["Pedro", "Alejandro"],
        apellidos: ["Martínez", "Vega"],
        run: "33445566-7",
        email: "pedro.martinez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [bomberoRol],
        ficha: {
          nombre: "Pedro Alejandro Martínez Vega",
          telefono: "+56956789012",
          licenciaClaseF: false,
          donante: false,
          fechaNacimiento: "1990-12-03",
          fechaIngreso: "2021-11-08",
          idCompania: 2
        }
      },

      // Bomberos con ficha (Tercera Compañía - ID: 3)
      {
        nombres: ["Diego", "Sebastián"],
        apellidos: ["Ramírez", "Torres"],
        run: "55667788-9",
        email: "diego.ramirez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [supervisorRol, bomberoRol],
        ficha: {
          nombre: "Diego Sebastián Ramírez Torres",
          telefono: "+56967890123",
          licenciaClaseF: true,
          donante: true,
          fechaNacimiento: "1986-08-25",
          fechaIngreso: "2020-04-12",
          idCompania: 3
        }
      },
      {
        nombres: ["Valentina", "Camila"],
        apellidos: ["Jiménez", "Ruiz"],
        run: "66778899-0",
        email: "valentina.jimenez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [bomberoRol],
        ficha: {
          nombre: "Valentina Camila Jiménez Ruiz",
          telefono: "+56978901234",
          licenciaClaseF: false,
          donante: true,
          fechaNacimiento: "1993-02-18",
          fechaIngreso: "2022-01-30",
          idCompania: 3
        }
      },

      // Bomberos con ficha (Cuarta Compañía - ID: 4)
      {
        nombres: ["Natalia", "Paola"],
        apellidos: ["Vargas", "Rojas"],
        run: "88990011-2",
        email: "natalia.vargas@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [supervisorRol, bomberoRol],
        ficha: {
          nombre: "Natalia Paola Vargas Rojas",
          telefono: "+56989012345",
          licenciaClaseF: true,
          donante: false,
          fechaNacimiento: "1989-10-14",
          fechaIngreso: "2021-07-22",
          idCompania: 4
        }
      },

      // Bomberos con ficha (Quinta Compañía - ID: 5)
      {
        nombres: ["Gabriela", "Alejandra"],
        apellidos: ["Paredes", "Navarro"],
        run: "00112233-4",
        email: "gabriela.paredes@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [supervisorRol, bomberoRol],
        ficha: {
          nombre: "Gabriela Alejandra Paredes Navarro",
          telefono: "+56990123456",
          licenciaClaseF: true,
          donante: true,
          fechaNacimiento: "1984-06-30",
          fechaIngreso: "2019-12-05",
          idCompania: 5
        }
      },

      // Bomberos SIN ficha (para probar la funcionalidad híbrida)
      {
        nombres: ["Carlos", "Eduardo"],
        apellidos: ["Rodríguez", "Silva"],
        run: "11223344-5",
        email: "carlos.rodriguez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [bomberoRol]
      },
      {
        nombres: ["Sofia", "Isabella"],
        apellidos: ["Herrera", "Castro"],
        run: "44556677-8",
        email: "sofia.herrera@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [bomberoRol]
      },
      {
        nombres: ["Andrés", "Felipe"],
        apellidos: ["Mendoza", "Aguilar"],
        run: "77889900-1",
        email: "andres.mendoza@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: false,
        roles: [bomberoRol]
      },
      {
        nombres: ["Roberto", "Miguel"],
        apellidos: ["Espinoza", "Contreras"],
        run: "99001122-3",
        email: "roberto.espinoza@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [bomberoRol]
      },
      {
        nombres: ["Francisco", "Javier"],
        apellidos: ["Cortés", "Muñoz"],
        run: "10223344-5",
        email: "francisco.cortes@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [bomberoRol]
      },
      {
        nombres: ["Daniela", "Constanza"],
        apellidos: ["Moreno", "Guerrero"],
        run: "20334455-6",
        email: "daniela.moreno@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        roles: [bomberoRol]
      },
    ];

    // Crear bomberos
    const bomberos = bomberosData.map((bomberoData) => {
      const { ficha, ...bomberoInfo } = bomberoData;
      return bomberoRepository.create(bomberoInfo);
    });
    await bomberoRepository.save(bomberos);
    logger.info("[SERVER] Bomberos creados exitosamente");

    // Crear fichas para bomberos que las tienen
    const fichasData = [];
    bomberosData.forEach((bomberoData, index) => {
      if (bomberoData.ficha) {
        fichasData.push({
          ...bomberoData.ficha,
          idBombero: bomberos[index].id
        });
      }
    });

    if (fichasData.length > 0) {
      const fichas = fichasData.map((fichaData) => fichaRepository.create(fichaData));
      await fichaRepository.save(fichas);
      logger.info(`[SERVER] ${fichas.length} fichas de bomberos creadas exitosamente`);
    }
  } catch (error) {
    logger.errorWithContext(error, { function: "crearBomberos" });
    throw error;
  }
}

export { crearBomberos };
