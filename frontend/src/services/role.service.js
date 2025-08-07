import axios from './root.service.js';

/**
 * Obtiene todos los roles del sistema
 * @returns {Promise} Promesa que resuelve con la lista de roles
 */
export const getRoles = async () => {
  try {
    // Añadir un timeout para evitar que la petición se quede colgada indefinidamente
    const response = await axios.get('/role/', { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error('Error al obtener roles:', error);
    // Mensaje de error más específico según el tipo de error
    let errorMessage = 'Error al conectar con el servidor';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'La conexión ha tardado demasiado tiempo. Intente nuevamente.';
    } else if (error.response) {
      // Error de respuesta del servidor
      errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // Error de solicitud sin respuesta
      errorMessage = 'No se recibió respuesta del servidor. Verifique su conexión.';
    }
    
    // Devolver un objeto de error estructurado en lugar de lanzar una excepción
    return {
      status: 'Error',
      message: errorMessage,
      details: error.response?.data || error.message
    };
  }
};

/**
 * Obtiene un rol específico por ID
 * @param {string} id - ID del rol
 * @returns {Promise} Promesa que resuelve con los datos del rol
 */
export const getRole = async (id) => {
  try {
    const response = await axios.get(`/role/detail/?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener rol:', error);
    throw error;
  }
};

/**
 * Crea un nuevo rol
 * @param {Object} roleData - Datos del rol a crear
 * @param {string} roleData.nombre - Nombre del rol
 * @param {string} roleData.descripcion - Descripción del rol
 * @param {Array} roleData.permisos - Array de nombres de permisos
 * @returns {Promise} Promesa que resuelve con el rol creado
 */
export const createRole = async (roleData) => {
  try {
    const response = await axios.post('/role/', roleData);
    return response.data;
  } catch (error) {
    console.error('Error al crear rol:', error);
    throw error;
  }
};

/**
 * Actualiza un rol existente
 * @param {string} id - ID del rol a actualizar
 * @param {Object} roleData - Datos del rol a actualizar
 * @param {string} roleData.nombre - Nombre del rol
 * @param {string} roleData.descripcion - Descripción del rol
 * @param {Array} roleData.permisos - Array de nombres de permisos
 * @returns {Promise} Promesa que resuelve con el rol actualizado
 */
export const updateRole = async (id, roleData) => {
  try {
    const response = await axios.patch(`/role/detail/?id=${id}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    throw error;
  }
};

/**
 * Elimina un rol
 * @param {string} id - ID del rol a eliminar
 * @returns {Promise} Promesa que resuelve con la confirmación de eliminación
 */
export const deleteRole = async (id) => {
  try {
    const response = await axios.delete(`/role/detail/?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    throw error;
  }
};