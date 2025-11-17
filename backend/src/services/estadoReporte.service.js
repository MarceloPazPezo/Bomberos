import { AppDataSource } from "../config/configDb.js";
import estadoReporte from "../entities/estadoReporte.entity.js";

export async function obtenerEstadosReporteService() {
    const estadoReporteRepository = AppDataSource.getRepository(estadoReporte);
    const estadosReporte = await estadoReporteRepository.find();
    return estadosReporte;
}

export async function obtenerIdEstadoBorradorService() {
    const estadoReporteRepository = AppDataSource.getRepository(estadoReporte);
    const estadoBorrador = await estadoReporteRepository.findOne({
        where: { nombre: "Borrador" }
    });
    return estadoBorrador ? estadoBorrador.id : null;
}
