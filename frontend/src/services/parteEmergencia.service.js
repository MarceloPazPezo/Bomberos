import axios from './root.service.js';

export const crearParteEmergencia = async (parteEmergenciaData) => {
    try {
        if (import.meta.env?.DEV) console.log("Enviando datos al backend:", parteEmergenciaData);
        const response = await axios.post('/parteEmergencia', parteEmergenciaData);
        return response.data;
    } catch (error) {
        console.error('Error al crear parte de emergencia:', error);
        throw error.response?.data || error;
    }
};

export const obtenerParteEmergenciaPorId = async (id, params = {}) => {
    try {

        const response = await axios.get(`/parteEmergencia/${id}`, { params });
        if (import.meta.env?.DEV) console.log("Datos del parte:", response);
        return response.data;
    } catch (error) {
        console.error('Error al obtener parte de emergencia:', error);
        throw error.response?.data || error;
    }
};

export const actualizarParteEmergencia = async (id, data) => {
    try {
        if (import.meta.env?.DEV) console.log("Actualizando datos en el backend:", data);
        const response = await axios.put(`/parteEmergencia/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar parte de emergencia:', error);
        throw error.response?.data || error;
    }
};

export const obtenerParteEmergenciaDetallado = async (id) => {
    try {
        const response = await axios.get(`/parteEmergencia/${id}/detallado`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const obtenerUltimoEstadoIncidente = async (id) => {
    try {
        const response = await axios.get(`/parteEmergencia/${id}/estado`);
        if (import.meta.env?.DEV) console.log("Último estado recibido del backend:", response);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const generarReporteParteEmergenciaPdf = async (id, options = {}) => {
    try {
        const payload = {};
        if (options.pageSize) payload.pageSize = options.pageSize;
        if (options.expiresIn) payload.expiresIn = options.expiresIn;
        const response = await axios.post(`/parteEmergencia/${id}/reporte/pdf`, payload);
        if (import.meta.env?.DEV) console.log("Reporte PDF generado:", response);
        return response.data;
    } catch (error) {
        console.error('Error al generar reporte PDF:', error);
        throw error.response?.data || error;
    }
};