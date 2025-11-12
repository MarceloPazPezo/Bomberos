"use strict";
import { AppDataSource } from "../config/configDb.js";
import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
import {obtenerHistorialCompaniaService, obtenerHistorialVoluntarioService, obtenerKpiAsistenciaVoluntarioService, obtenerKpiResponsabilidadesVoluntarioService, obtenerResumenActividadVoluntarioService, obtenerHeatmapDisponibilidadVoluntarioService} from "../services/historial.service.js";


export async function obtenerHistorialCompania(req, res) {
    try {
        const { idCompania } = req.params;
        const { fechaInicio, fechaFin } = req.query;
        
        if (!idCompania) {
            return handleErrorClient(res, 400, "ID de compañía es requerido");
        }
        
        const result = await obtenerHistorialCompaniaService(idCompania, fechaInicio, fechaFin);
        handleSuccess(res, 200, "Historial de compañía obtenido exitosamente", result);
    } catch (error) {
        console.error('Error al obtener el historial de la compañía:', error);
        handleErrorServer(res, 500, error.message);
    }
}


export async function obtenerHistorialVoluntario(req, res) {
    try {
        const { idBombero } = req.params;
        if (!idBombero) {
            return handleErrorClient(res, 400, "ID de bombero es requerido");
        }
        const result = await obtenerHistorialVoluntarioService(idBombero);
        handleSuccess(res, 200, "Historial del voluntario obtenido exitosamente", result);
    } catch (error) {
        console.error('Error al obtener el historial del voluntario:', error);
        handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerKpiAsistenciaVoluntario(req, res) {
    try {
        const { idBombero } = req.params;
        const { fechaInicio, fechaFin } = req.query;
        
        if (!idBombero) {
            return handleErrorClient(res, 400, "ID de bombero es requerido");
        }
        
        const result = await obtenerKpiAsistenciaVoluntarioService(idBombero, fechaInicio, fechaFin);
        handleSuccess(res, 200, "KPI de asistencia obtenido exitosamente", result);
    } catch (error) {
        console.error('Error al obtener el KPI de asistencia del voluntario:', error);
        handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerKpiResponsabilidadesVoluntario(req, res) {
    try {
        const { idBombero } = req.params;
        const { fechaInicio, fechaFin } = req.query;
        
        if (!idBombero) {
            return handleErrorClient(res, 400, "ID de bombero es requerido");
        }
        
        const result = await obtenerKpiResponsabilidadesVoluntarioService(idBombero, fechaInicio, fechaFin);
        handleSuccess(res, 200, "KPI de responsabilidades obtenido exitosamente", result);
    } catch (error) {
        console.error('Error al obtener el KPI de responsabilidades del voluntario:', error);
        handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerResumenActividadVoluntario(req, res) {
    try {
        const { idBombero } = req.params;
        const { fechaInicio, fechaFin } = req.query;
        
        if (!idBombero) {
            return handleErrorClient(res, 400, "ID de bombero es requerido");
        }
        
        const result = await obtenerResumenActividadVoluntarioService(idBombero, fechaInicio, fechaFin);
        handleSuccess(res, 200, "Resumen de actividad obtenido exitosamente", result);
    } catch (error) {
        console.error('Error al obtener el resumen de actividad del voluntario:', error);
        handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerHeatmapDisponibilidadVoluntario(req, res) {
    try {
        const { idBombero } = req.params;
        const { fechaInicio, fechaFin } = req.query;
        
        if (!idBombero) {
            return handleErrorClient(res, 400, "ID de bombero es requerido");
        }
        
        if (!fechaInicio || !fechaFin) {
            return handleErrorClient(res, 400, "Fechas de inicio y fin son requeridas");
        }
        
        const result = await obtenerHeatmapDisponibilidadVoluntarioService(idBombero, fechaInicio, fechaFin);
        handleSuccess(res, 200, "Heatmap de disponibilidad obtenido exitosamente", result);
    } catch (error) {
        console.error('Error al obtener el heatmap de disponibilidad del voluntario:', error);
        handleErrorServer(res, 500, error.message);
    }
}