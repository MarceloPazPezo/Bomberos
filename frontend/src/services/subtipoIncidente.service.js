import axios from './root.service.js';

export const getClasificacionesEmergencia = async () => {
  try {
    const response = await axios.get('/subtipoIncidente/clasificaciones'); 
    return response.data.data;
    } catch (error) { 
        console.error('Error al obtener clasificaciones de emergencia:', error);
        throw error.response?.data || error;
    }
}

export const getSubtiposIncidente = async (idClasificacion) => {
    try {
      const response = await axios.get('/subtipoIncidente/subtipos/' + idClasificacion);
      console.log(response.data.data);
        return response.data.data;
    } catch (error) {
        console.error('Error al obtener subtipos de incidente:', error);
        throw error.response?.data || error;
    }
};
export const getTiposDano = async () => {
    try {
      const response = await axios.get('/subtipoIncidente/tiposDano');
        return response.data.data;
    } catch (error) {
        console.error('Error al obtener tipos de daño:', error);
        throw error.response?.data || error;
    }
};

export const getFasesIncidente = async () => {
    try {
      const response = await axios.get('/subtipoIncidente/fasesIncidente');
        return response.data.data;
    } catch (error) {
        console.error('Error al obtener fases de incidente:', error);
        throw error.response?.data || error;
    }
};
