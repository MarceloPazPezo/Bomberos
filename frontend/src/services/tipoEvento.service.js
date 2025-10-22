import axios from './root.service.js';

/**
 * Obtiene todos los tipos de evento del sistema
 * @returns {Promise} Promesa que resuelve con la lista de tipos de evento
 */
export const getTiposEvento = async () => {
  try {
    const response = await axios.get('/tipo-evento', { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de evento:', error);
    let errorMessage = 'Error al conectar con el servidor';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'La conexión ha tardado demasiado tiempo. Intente nuevamente.';
    } else if (error.response) {
      errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'No se recibió respuesta del servidor. Verifique su conexión.';
    }
    
    return {
      status: 'Error',
      message: errorMessage,
      details: error.response?.data || error.message
    };
  }
};

/**
 * Obtiene un tipo de evento específico por ID
 * @param {string} id - ID del tipo de evento
 * @returns {Promise} Promesa que resuelve con los datos del tipo de evento
 */
export const getTipoEvento = async (id) => {
  try {
    const response = await axios.get(`/tipo-evento/detalle/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipo de evento:', error);
    throw error;
  }
};

/**
 * Crea un nuevo tipo de evento
 * @param {Object} tipoEventoData - Datos del tipo de evento a crear
 * @param {string} tipoEventoData.nombre - Nombre del tipo de evento
 * @param {string} tipoEventoData.descripcion - Descripción del tipo de evento
 * @returns {Promise} Promesa que resuelve con el tipo de evento creado
 */
export const createTipoEvento = async (tipoEventoData) => {
  try {
    const response = await axios.post('/tipo-evento', tipoEventoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear tipo de evento:', error);
    throw error;
  }
};

/**
 * Actualiza un tipo de evento existente
 * @param {string} id - ID del tipo de evento a actualizar
 * @param {Object} tipoEventoData - Datos del tipo de evento a actualizar
 * @param {string} tipoEventoData.nombre - Nombre del tipo de evento
 * @param {string} tipoEventoData.descripcion - Descripción del tipo de evento
 * @returns {Promise} Promesa que resuelve con el tipo de evento actualizado
 */
export const updateTipoEvento = async (id, tipoEventoData) => {
  try {
    const response = await axios.patch(`/tipo-evento/detalle/${id}`, tipoEventoData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar tipo de evento:', error);
    throw error;
  }
};

/**
 * Elimina un tipo de evento del sistema
 * @param {string} id - ID del tipo de evento a eliminar
 * @returns {Promise} Promesa que resuelve con la confirmación de eliminación
 */
export const deleteTipoEvento = async (id) => {
  try {
    const response = await axios.delete(`/tipo-evento/detalle/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar tipo de evento:', error);
    throw error;
  }
};

