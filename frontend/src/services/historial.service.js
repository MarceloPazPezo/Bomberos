import axios from './root.service.js';


export async function getHistorialCompania(idCompania) {
  try {
    const response = await axios.get(`/historial/compania/${idCompania}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el historial de la compañía:', error);
    throw error;
  }
}

export async function getHistorialVoluntario(idBombero) {
  try {
    const response = await axios.get(`/historial/voluntario/${idBombero}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el historial del voluntario:', error);
    throw error;
  }
}