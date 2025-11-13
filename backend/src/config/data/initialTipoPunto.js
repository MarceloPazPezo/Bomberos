"use strict";
import { AppDataSource } from "../configDb.js";
import logger from "../configLogger.js";

/**
 * Crea tipos de punto predeterminados para el sistema
 */
export async function crearTiposPunto() {
    try {
        const tipoPuntoRepository = AppDataSource.getRepository("TipoPunto");
        const count = await tipoPuntoRepository.count();

        if (count > 0) {
            logger.info("[SERVER] Tipos de punto ya existen, omitiendo creación.");
            return;
        }

        const tiposPuntoData = [
            {
                nombre: "Hidrante",
                icono: "MdFireExtinguisher",
                color: "#2196F3",
                descripcion: "Hidrante de agua para el combate de incendios",
                activo: true,
            },
            {
                nombre: "Cuartel",
                icono: "MdLocalFireDepartment",
                color: "#D32F2F",
                descripcion: "Cuartel de bomberos",
                activo: true,
            },
            {
                nombre: "Centro de Salud",
                icono: "FaHospital",
                color: "#E53935",
                descripcion: "Hospital, clínica o centro médico de emergencia",
                activo: true,
            },
            {
                nombre: "Reserva de Agua",
                icono: "FaWater",
                color: "#0288D1",
                descripcion: "Embalse, estanque o reserva de agua para emergencias",
                activo: true,
            },
            {
                nombre: "Industria Peligrosa",
                icono: "MdWarning",
                color: "#FF9800",
                descripcion: "Instalación industrial con materiales peligrosos o riesgo de incendio",
                activo: true,
            },
            {
                nombre: "Zona de Riesgo",
                icono: "MdDangerous",
                color: "#F44336",
                descripcion: "Área con alto riesgo de incendio o accidente",
                activo: true,
            },
            {
                nombre: "Depósito de Combustible",
                icono: "MdStorage",
                color: "#E65100",
                descripcion: "Depósito, almacén de combustibles o gasolinera",
                activo: true,
            },
            {
                nombre: "Edificio de Altura",
                icono: "FaBuilding",
                color: "#757575",
                descripcion: "Edificio de más de 4 pisos que requiere atención especial",
                activo: true,
            },
            {
                nombre: "Establecimiento Público",
                icono: "MdBusiness",
                color: "#795548",
                descripcion: "Establecimiento con alta concurrencia (escuela, hospital, centro comercial, etc.)",
                activo: true,
            },
            {
                nombre: "Establecimiento Educacional",
                icono: "FaSchool",
                color: "#9C27B0",
                descripcion: "Escuela, colegio o centro educativo",
                activo: true,
            },
            {
                nombre: "Centro Comercial",
                icono: "FaShoppingCart",
                color: "#6D4C41",
                descripcion: "Mall o centro comercial con alta concurrencia",
                activo: true,
            },
            {
                nombre: "Instalación Eléctrica",
                icono: "MdElectricBolt",
                color: "#FFD600",
                descripcion: "Subestación eléctrica, transformador o punto crítico de energía",
                activo: true,
            },
            {
                nombre: "Punto de Encuentro",
                icono: "MdPlace",
                color: "#4CAF50",
                descripcion: "Lugar seguro de reunión en caso de emergencia",
                activo: true,
            },
            {
                nombre: "Forestal",
                icono: "FaTree",
                color: "#388E3C",
                descripcion: "Zona forestal con riesgo de incendio",
                activo: true,
            },
            {
                nombre: "Ubicación Bombero",
                icono: "MdPerson",
                color: "#10B981",
                descripcion: "Ubicación de residencia de un bombero",
                activo: true,
            },
        ];

        const tiposPunto = tiposPuntoData.map((tipoPunto) =>
            tipoPuntoRepository.create(tipoPunto)
        );

        await tipoPuntoRepository.save(tiposPunto);
        logger.info(`[SERVER] ${tiposPunto.length} tipos de punto creados exitosamente`);
    } catch (error) {
        logger.errorWithContext(error, { function: "crearTiposPunto" });
        throw error;
    }
}

