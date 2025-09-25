import axios from './root.service.js';

export const getServicios = async () => {
  try {
    const response = await axios.get('/servicios/');
    console.log("este es el servicio", response);
    return response.data.data;
    } catch (error) { 
        console.error('Error al obtener servicios:', error);
        throw error.response?.data || error;
    }
}