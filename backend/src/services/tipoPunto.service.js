"use strict";
import { AppDataSource } from "../config/configDb.js";
import TipoPuntoSchema from "../entities/tipoPunto.entity.js";

const tipoPuntoRepository = AppDataSource.getRepository(TipoPuntoSchema);

/**
 * Crear un nuevo tipo de punto
 */
export async function createTipoPuntoService(data) {
    try {
        const nuevoTipo = tipoPuntoRepository.create(data);
        const tipoGuardado = await tipoPuntoRepository.save(nuevoTipo);
        return [tipoGuardado, null];
    } catch (error) {
        console.error("Error al crear tipo de punto:", error);
        return [null, error.message];
    }
}

/**
 * Obtener todos los tipos de punto activos
 */
export async function getTiposPuntoService(incluirInactivos = false) {
    try {
        let queryBuilder = tipoPuntoRepository
            .createQueryBuilder("tipo")
            .orderBy("tipo.nombre", "ASC");

        if (!incluirInactivos) {
            queryBuilder = queryBuilder.where("tipo.activo = :activo", { activo: true });
        }

        const tipos = await queryBuilder.getMany();
        return [tipos, null];
    } catch (error) {
        console.error("Error al obtener tipos de punto:", error);
        return [null, error.message];
    }
}

/**
 * Obtener tipo de punto por ID
 */
export async function getTipoPuntoByIdService(id) {
    try {
        const tipo = await tipoPuntoRepository.findOne({
            where: { id },
        });

        if (!tipo) {
            return [null, "Tipo de punto no encontrado"];
        }

        return [tipo, null];
    } catch (error) {
        console.error("Error al obtener tipo de punto:", error);
        return [null, error.message];
    }
}

/**
 * Actualizar tipo de punto
 */
export async function updateTipoPuntoService(id, data) {
    try {
        const tipo = await tipoPuntoRepository.findOne({ where: { id } });

        if (!tipo) {
            return [null, "Tipo de punto no encontrado"];
        }

        tipoPuntoRepository.merge(tipo, data);
        const tipoActualizado = await tipoPuntoRepository.save(tipo);

        return [tipoActualizado, null];
    } catch (error) {
        console.error("Error al actualizar tipo de punto:", error);
        return [null, error.message];
    }
}

/**
 * Eliminar tipo de punto (cambiar a inactivo)
 */
export async function deleteTipoPuntoService(id) {
    try {
        const tipo = await tipoPuntoRepository.findOne({ where: { id } });

        if (!tipo) {
            return [null, "Tipo de punto no encontrado"];
        }

        tipo.activo = false;
        await tipoPuntoRepository.save(tipo);

        return [{ message: "Tipo de punto eliminado correctamente" }, null];
    } catch (error) {
        console.error("Error al eliminar tipo de punto:", error);
        return [null, error.message];
    }
}

