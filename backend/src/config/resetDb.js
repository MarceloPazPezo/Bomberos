// src/scripts/reset-db.js
import { AppDataSource } from "./configDb.js";

async function resetDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source ha sido inicializado para el reseteo.");
    }

    console.log(
      "ADVERTENCIA: ¡Esto eliminará TODAS las tablas y datos y los recreará!",
    );
    console.log("Presiona CTRL+C en los próximos 3 segundos para cancelar...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log(
      "Sincronizando la base de datos (borrando y recreando tablas)...",
    );
    await AppDataSource.synchronize(true);
    console.log("¡Base de datos reseteada y sincronizada exitosamente!");
  } catch (error) {
    console.error("Error durante el reseteo de la base de datos:", error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Data Source desconectado.");
    }
  }
}

resetDatabase();
