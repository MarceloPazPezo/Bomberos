import axios from './root.service.js';


export const getEstadosReportes = async () => {
    try {
        const response = await axios.get('/estadosParte/');
        console.log("Datos recibidos del backend:", response);
        return response.data; 
    }
    catch (error) {
        console.error('Error al listar partes de emergencia:', error);
        throw error.response?.data || error;
    }
};