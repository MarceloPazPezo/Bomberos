import axios from './root.service.js';

export const getRegiones = async () => {
  try {
    const response = await axios.get('/direccion/regiones');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener regiones:', error);
    throw error.response?.data || error;
  }
};
export const getComunas = async (idRegion) => {
  try {
    const response = await axios.get('/direccion/comuna/' + idRegion);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener comunas:', error);
    throw error.response?.data || error;
  }
};