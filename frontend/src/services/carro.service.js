import axios from './root.service.js';

export const getCarrosByCompania = async (companiaId) => {
  try {
    const response = await axios.get(`/carro/compania/${companiaId}`);
    console.log("Carros recibidos del backend:", response.data);
    return response.data.data;
    } catch (error) {
    console.error('Error al obtener carros por compañía:', error);
    throw error.response?.data || error;
  }
};