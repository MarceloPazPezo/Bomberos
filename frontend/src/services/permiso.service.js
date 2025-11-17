import axios from './root.service.js';

/**
 * Obtiene todos los permisos del sistema
 * @returns {Promise} Promesa que resuelve con la lista de permisos
 */
export const getPermisos = async () => {
  try {
    // Solicitar todos los permisos sin paginación (limit muy alto)
    const response = await axios.get('/permiso?limit=1000', { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    
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
 * Obtiene todos los permisos sin límite de paginación
 * @returns {Promise} Promesa que resuelve con la lista completa de permisos
 */
export const getAllPermisos = async () => {
  try {
    // Solicitar todos los permisos sin límite
    const response = await axios.get('/permiso?limit=9999', { timeout: 15000 });
    return response.data;
  } catch (error) {
    console.error('Error al obtener todos los permisos:', error);
    
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
 * Obtiene un permiso específico por ID
 * @param {string} id - ID del permiso
 * @returns {Promise} Promesa que resuelve con los datos del permiso
 */
export const getPermiso = async (id) => {
  try {
    const response = await axios.get(`/permiso/${id}`, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error('Error al obtener permiso:', error);
    
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
 * Actualiza un permiso específico por ID
 * @param {string} id - ID del permiso
 * @param {Object} permisoData - Datos del permiso a actualizar
 * @returns {Promise} Promesa que resuelve con los datos del permiso actualizado
 */
export const updatePermiso = async (id, permisoData) => {
  try {
    const response = await axios.put(`/permiso/${id}`, permisoData, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    
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