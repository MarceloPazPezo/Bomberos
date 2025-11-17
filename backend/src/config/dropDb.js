import { AppDataSource } from "./configDb.js";

async function dropAllTablesCompletely() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source ha sido inicializado para el reseteo.");
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log(
      "ADVERTENCIA MÁXIMA: ¡Esto intentará eliminar TODAS LAS TABLAS de la base de datos conectada!",
    );
    console.log(
      `Base de datos: ${AppDataSource.options.database}, Tipo: ${AppDataSource.options.type}`,
    );
    console.log("Presiona CTRL+C en los próximos 5 segundos para cancelar...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("Iniciando borrado completo de tablas...");

    const dbType = AppDataSource.options.type;

    if (dbType === "postgres") {
      const tables = await queryRunner.query(`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
      `);
      for (const table of tables) {
        console.log(`Eliminando tabla (PostgreSQL): public.${table.tablename}`);
        await queryRunner.query(
          `DROP TABLE IF EXISTS "public"."${table.tablename}" CASCADE`,
        );
      }
    }

    console.log(
      "Todas las tablas existentes (o las soportadas) han sido eliminadas.",
    );
    console.log(
      "Sincronizando la base de datos para recrear el esquema desde las entidades...",
    );
    await AppDataSource.synchronize(true);

    console.log("¡Base de datos reseteada y sincronizada exitosamente!");
  } catch (error) {
    console.error(
      "Error durante el reseteo completo de la base de datos:",
      error,
    );
    process.exit(1);
  } finally {
    const queryRunner = AppDataSource.manager.queryRunner;
    if (queryRunner && queryRunner.isReleased === false) {
      await queryRunner.release();
      console.log("QueryRunner liberado.");
    }
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Data Source desconectado.");
    }
  }
}

dropAllTablesCompletely();
