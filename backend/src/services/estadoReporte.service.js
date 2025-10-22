import { AppDataSource } from "../config/configDb.js";
import estadoReporte from "../entities/estadoReporte.entity.js";

export async function obtenerEstadosReporteService() {
    const estadoReporteRepository = AppDataSource.getRepository(estadoReporte);
    const estadosReporte = await estadoReporteRepository.find();
    return estadosReporte;
}
