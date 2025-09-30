import axios from './root.service.js';

export const crearParteEmergencia = async (parteEmergenciaData) => {
    try {
        console.log("Enviando datos al backend:", parteEmergenciaData);
        const response = await axios.post('/parteEmergencia', parteEmergenciaData);
        return response.data;
    } catch (error) {
        console.error('Error al crear parte de emergencia:', error);
        throw error.response?.data || error;
    }
};

export const obtenerParteEmergenciaPorId = async (id) => {
    try {
        console.log("Obteniendo datos del backend para ID:", id);
        const response = await axios.get(`/parteEmergencia/${id}`);
        console.log("Datos recibidos del backend:", response);
        return response.data;
    } catch (error) {
        console.error('Error al obtener parte de emergencia:', error);
        throw error.response?.data || error;
    }
};

export const actualizarParteEmergencia = async (id, data) => {
    try {
        console.log("Actualizando datos en el backend:", data);
        const response = await axios.put(`/parteEmergencia/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar parte de emergencia:', error);
        throw error.response?.data || error;
    }
};