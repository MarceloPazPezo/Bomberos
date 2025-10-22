"use strict";
import Bombero from "../../entities/bombero.entity.js";
import FichaBombero from "../../entities/fichaBombero.entity.js";
import Rol from "../../entities/rol.entity.js";
import { AppDataSource } from "../configDb.js";
import { encryptPassword } from "../../helpers/bcrypt.helper.js";
import logger from "../configLogger.js";
import { In } from "typeorm";

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
        rolesIds: [adminRol.id, bomberoRol.id],
        ficha: {
          nombre: "Admin Principal Del Sistema",
          telefono: "+56912345678",
          licenciaClaseF: true,
          donante: true,
          fechaNacimiento: "1985-03-15",
          fechaIngreso: "2020-01-15",
          idCompania: 1,
          // fotoPerfilKEY: "admin_profile_test.jpg" // Removido para evitar errores de imagen
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
        rolesIds: [supervisorRol.id, bomberoRol.id],
        ficha: {
          nombre: "Juan Andrés Pérez Gómez",
          telefono: "+56923456789",
          licenciaClaseF: true,
          donante: false,
          fechaNacimiento: "1988-07-22",
          fechaIngreso: "2021-03-10",
          idCompania: 1,
          fotoPerfilKEY: "juan_perez_profile.jpg" // Agregar KEY de imagen para testing
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
        rolesIds: [bomberoRol.id],
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
      {
        nombres: ["Carlos", "Eduardo"],
        apellidos: ["Silva", "Mendoza"],
        run: "11223344-5",
        email: "carlos.silva@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id],
        ficha: {
          nombre: "Carlos Eduardo Silva Mendoza",
          telefono: "+56945678901",
          licenciaClaseF: true,
          donante: true,
          fechaNacimiento: "1983-09-14",
          fechaIngreso: "2018-04-20",
          idCompania: 1
        }
      },
      {
        nombres: ["Patricia", "Isabel"],
        apellidos: ["Vargas", "Herrera"],
        run: "22334455-6",
        email: "patricia.vargas@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [supervisorRol.id, bomberoRol.id],
        ficha: {
          nombre: "Patricia Isabel Vargas Herrera",
          telefono: "+56956789012",
          licenciaClaseF: true,
          donante: false,
          fechaNacimiento: "1986-11-28",
          fechaIngreso: "2019-08-15",
          idCompania: 1
        }
      },
      {
        nombres: ["Roberto", "Antonio"],
        apellidos: ["Castro", "Jiménez"],
        run: "33445566-7",
        email: "roberto.castro@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id],
        ficha: {
          nombre: "Roberto Antonio Castro Jiménez",
          telefono: "+56967890123",
          licenciaClaseF: false,
          donante: true,
          fechaNacimiento: "1991-02-17",
          fechaIngreso: "2020-12-10",
          idCompania: 1
        }
      },
      {
        nombres: ["Sandra", "Beatriz"],
        apellidos: ["Morales", "Rojas"],
        run: "44556677-8",
        email: "sandra.morales@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: false,
        rolesIds: [bomberoRol.id],
        ficha: {
          nombre: "Sandra Beatriz Morales Rojas",
          telefono: "+56978901234",
          licenciaClaseF: true,
          donante: true,
          fechaNacimiento: "1989-06-03",
          fechaIngreso: "2021-03-25",
          idCompania: 1
        }
      },
      {
        nombres: ["Miguel", "Ángel"],
        apellidos: ["Torres", "García"],
        run: "55667788-9",
        email: "miguel.torres@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id],
        ficha: {
          nombre: "Miguel Ángel Torres García",
          telefono: "+56989012345",
          licenciaClaseF: true,
          donante: false,
          fechaNacimiento: "1984-12-11",
          fechaIngreso: "2017-11-08",
          idCompania: 1
        }
      },

      // Bomberos con ficha (Segunda Compañía - ID: 2)
      {
        nombres: ["María", "Fernanda"],
        apellidos: ["González", "Morales"],
        run: "92334455-6",
        email: "maria.gonzalez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [supervisorRol.id, bomberoRol.id],
        ficha: {
          nombre: "María Fernanda González Morales",
          telefono: "+56945678902",
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
        run: "93445566-7",
        email: "pedro.martinez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id],
        ficha: {
          nombre: "Pedro Alejandro Martínez Vega",
          telefono: "+56956789013",
          licenciaClaseF: false,
          donante: false,
          fechaNacimiento: "1990-12-03",
          fechaIngreso: "2021-11-08",
          idCompania: 2
        }
      },
      {
        nombres: ["Fernando", "Luis"],
        apellidos: ["Herrera", "Navarro"],
        run: "66778899-0",
        email: "fernando.herrera@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id],
        ficha: {
          nombre: "Fernando Luis Herrera Navarro",
          telefono: "+56990123456",
          licenciaClaseF: true,
          donante: true,
          fechaNacimiento: "1987-04-18",
          fechaIngreso: "2019-01-30",
          idCompania: 2
        }
      },
      {
        nombres: ["Valentina", "Alejandra"],
        apellidos: ["Espinoza", "Cortés"],
        run: "77889900-1",
        email: "valentina.espinoza@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [supervisorRol.id, bomberoRol.id],
        ficha: {
          nombre: "Valentina Alejandra Espinoza Cortés",
          telefono: "+56901234567",
          licenciaClaseF: true,
          donante: false,
          fechaNacimiento: "1985-10-22",
          fechaIngreso: "2018-07-14",
          idCompania: 2
        }
      },

      // Bomberos con ficha (Tercera Compañía - ID: 3)
      {
        nombres: ["Diego", "Sebastián"],
        apellidos: ["Ramírez", "Torres"],
        run: "65667788-9",
        email: "diego.ramirez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [supervisorRol.id, bomberoRol.id],
        ficha: {
          nombre: "Diego Sebastián Ramírez Torres",
          telefono: "+56967890124",
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
        run: "76778899-0",
        email: "valentina.jimenez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id],
        ficha: {
          nombre: "Valentina Camila Jiménez Ruiz",
          telefono: "+56978901235",
          licenciaClaseF: false,
          donante: true,
          fechaNacimiento: "1993-02-18",
          fechaIngreso: "2022-01-30",
          idCompania: 3
        }
      },
      {
        nombres: ["Andrés", "Felipe"],
        apellidos: ["Mendoza", "Vega"],
        run: "88990011-2",
        email: "andres.mendoza@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id],
        ficha: {
          nombre: "Andrés Felipe Mendoza Vega",
          telefono: "+56912345680",
          licenciaClaseF: true,
          donante: false,
          fechaNacimiento: "1988-07-09",
          fechaIngreso: "2020-09-15",
          idCompania: 3
        }
      },
      {
        nombres: ["Camila", "Andrea"],
        apellidos: ["Pérez", "Soto"],
        run: "99001122-3",
        email: "camila.perez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [supervisorRol.id, bomberoRol.id],
        ficha: {
          nombre: "Camila Andrea Pérez Soto",
          telefono: "+56923456790",
          licenciaClaseF: true,
          donante: true,
          fechaNacimiento: "1984-12-05",
          fechaIngreso: "2017-06-20",
          idCompania: 3
        }
      },

      // Bomberos con ficha (Cuarta Compañía - ID: 4)
      {
        nombres: ["Natalia", "Paola"],
        apellidos: ["Vargas", "Rojas"],
        run: "78990011-2",
        email: "natalia.vargas@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [supervisorRol.id, bomberoRol.id],
        ficha: {
          nombre: "Natalia Paola Vargas Rojas",
          telefono: "+56989012346",
          licenciaClaseF: true,
          donante: false,
          fechaNacimiento: "1989-10-14",
          fechaIngreso: "2021-07-22",
          idCompania: 4
        }
      },
      {
        nombres: ["Ricardo", "Manuel"],
        apellidos: ["González", "López"],
        run: "91223344-5",
        email: "ricardo.gonzalez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id],
        ficha: {
          nombre: "Ricardo Manuel González López",
          telefono: "+56901234568",
          licenciaClaseF: false,
          donante: true,
          fechaNacimiento: "1990-03-12",
          fechaIngreso: "2021-05-18",
          idCompania: 4
        }
      },
      {
        nombres: ["Isabel", "Cristina"],
        apellidos: ["Morales", "Díaz"],
        run: "82334455-6",
        email: "isabel.morales@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [supervisorRol.id, bomberoRol.id],
        ficha: {
          nombre: "Isabel Cristina Morales Díaz",
          telefono: "+56912345679",
          licenciaClaseF: true,
          donante: false,
          fechaNacimiento: "1987-09-25",
          fechaIngreso: "2018-11-30",
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
        rolesIds: [supervisorRol.id, bomberoRol.id],
        ficha: {
          nombre: "Gabriela Alejandra Paredes Navarro",
          telefono: "+56990123457",
          licenciaClaseF: true,
          donante: true,
          fechaNacimiento: "1984-06-30",
          fechaIngreso: "2019-12-05",
          idCompania: 5
        }
      },
      {
        nombres: ["Francisco", "Javier"],
        apellidos: ["Torres", "Mendoza"],
        run: "73445566-7",
        email: "francisco.torres@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id],
        ficha: {
          nombre: "Francisco Javier Torres Mendoza",
          telefono: "+56923456791",
          licenciaClaseF: true,
          donante: true,
          fechaNacimiento: "1986-01-15",
          fechaIngreso: "2020-02-28",
          idCompania: 5
        }
      },
      {
        nombres: ["Alejandra", "María"],
        apellidos: ["Vega", "Castro"],
        run: "64556677-8",
        email: "alejandra.vega@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id],
        ficha: {
          nombre: "Alejandra María Vega Castro",
          telefono: "+56934567891",
          licenciaClaseF: false,
          donante: false,
          fechaNacimiento: "1992-08-07",
          fechaIngreso: "2022-03-10",
          idCompania: 5
        }
      },

      // Bomberos SIN ficha (para probar la funcionalidad híbrida)
      {
        nombres: ["Carlos", "Eduardo"],
        apellidos: ["Rodríguez", "Silva"],
        run: "81223344-5",
        email: "carlos.rodriguez@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id]
      },
      {
        nombres: ["Sofia", "Isabella"],
        apellidos: ["Herrera", "Castro"],
        run: "54556677-8",
        email: "sofia.herrera@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id]
      },
      {
        nombres: ["Andrés", "Felipe"],
        apellidos: ["Mendoza", "Aguilar"],
        run: "87889900-1",
        email: "andres.mendoza.aguilar@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: false,
        rolesIds: [bomberoRol.id]
      },
      {
        nombres: ["Roberto", "Miguel"],
        apellidos: ["Espinoza", "Contreras"],
        run: "89001122-3",
        email: "roberto.espinoza@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id]
      },
      {
        nombres: ["Francisco", "Javier"],
        apellidos: ["Cortés", "Muñoz"],
        run: "10223344-5",
        email: "francisco.cortes@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id]
      },
      {
        nombres: ["Daniela", "Constanza"],
        apellidos: ["Moreno", "Guerrero"],
        run: "20334455-6",
        email: "daniela.moreno@example.com",
        password: await encryptPassword("user1234"),
        creadoPor: null,
        activo: true,
        rolesIds: [bomberoRol.id]
      },
    ];

    // Crear bomberos
    const bomberos = bomberosData.map((bomberoData) => {
      const { ficha, rolesIds, ...bomberoInfo } = bomberoData;
      return bomberoRepository.create(bomberoInfo);
    });
    await bomberoRepository.save(bomberos);
    logger.info("[SERVER] Bomberos creados exitosamente");

    // Crear relaciones de roles
    for (let i = 0; i < bomberosData.length; i++) {
      const bomberoData = bomberosData[i];
      const bombero = bomberos[i];
      
      if (bomberoData.rolesIds && bomberoData.rolesIds.length > 0) {
        const rolesToAssign = await rolRepository.findBy({ id: In(bomberoData.rolesIds) });
        bombero.roles = rolesToAssign;
        await bomberoRepository.save(bombero);
      }
    }
    logger.info("[SERVER] Relaciones de roles creadas exitosamente");

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
      // Validar que las compañías existan antes de crear las fichas
      const companiaRepository = AppDataSource.getRepository("Compania");
      const companiasExistentes = await companiaRepository.find();
      const companiasIds = companiasExistentes.map(c => c.id);
      
      // Verificar que todas las fichas tengan compañías válidas
      const fichasValidas = fichasData.filter(ficha => {
        if (!companiasIds.includes(ficha.idCompania)) {
          logger.warn(`[SERVER] Advertencia: La compañía con ID ${ficha.idCompania} no existe. Omitiendo ficha para bombero ${ficha.idBombero}`);
          return false;
        }
        return true;
      });

      if (fichasValidas.length > 0) {
        const fichas = fichasValidas.map((fichaData) => fichaRepository.create(fichaData));
        await fichaRepository.save(fichas);
        logger.info(`[SERVER] ${fichas.length} fichas de bomberos creadas exitosamente`);
      } else {
        logger.warn("[SERVER] No se pudieron crear fichas de bomberos debido a compañías inexistentes");
      }
    }
  } catch (error) {
    logger.errorWithContext(error, { function: "crearBomberos" });
    throw error;
  }
}

export { crearBomberos };
