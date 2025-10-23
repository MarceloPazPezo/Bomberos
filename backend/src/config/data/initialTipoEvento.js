import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";
import TipoEvento  from "../../entities/tipoEvento.entity.js";

async function seedInitialTipoEvento() {
    const tipoEventoRepository = AppDataSource.getRepository(TipoEvento);
    const count = await tipoEventoRepository.count();

    if (count > 0) {
        logger.info("Los tipos de evento ya están inicializados");
        return;
    }

    const tipos = [
        { nombre: "Cumpleaños", descripcion: "Cumpleaños de un voluntario" },
        { nombre: "Aniversario", descripcion: "Aniversario de un evento" },
        { nombre: "Reunion", descripcion: "Reunión de directorio" },
    ];

    await tipoEventoRepository.save(tipos);
    logger.info("Tipos de evento inicializados");
}

export default seedInitialTipoEvento;