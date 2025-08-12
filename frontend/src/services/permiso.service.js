import axios from './root.service.js';

/**
 * Obtiene todos los permisos del sistema
 * @returns {Promise} Promesa que resuelve con la lista de permisos
 */
export const getPermissions = async () => {
  try {
    const response = await axios.get('/permiso', { timeout: 10000 });
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
 * Obtiene los permisos agrupados por categoría
 * @returns {Promise} Promesa que resuelve con los permisos agrupados por categoría
 */
export const getPermissionsByCategory = async () => {
  try {
    const response = await axios.get('/permiso/categories', { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error('Error al obtener permisos por categoría:', error);
    
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
export const getPermission = async (id) => {
  try {
    const response = await axios.get(`/permiso/detail/?id=${id}`, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error('Error al obtener permiso:', error);
    throw error;
  }
};