import axios from './root.service.js';

export const crearParteEmergencia = async (parteEmergenciaData) => {
    try {
        console.log("Enviando datos al backend:", parteEmergenciaData);
        const response = await axios.post('/parteEmergencia', parteEmergenciaData);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error al crear parte de emergencia:', error);
        throw error.response?.data || error;
    }
};