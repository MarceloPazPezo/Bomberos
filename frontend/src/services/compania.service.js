import root from './root.service.js';

/**
 * Obtiene todas las compañías
 * @param {Object} params - Parámetros de búsqueda y paginación
 * @returns {Promise<Object>} Respuesta con compañías y paginación
 */
export const getCompanias = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Agregar parámetros de búsqueda
    if (params.nombre) queryParams.append('nombre', params.nombre);
    if (params.email) queryParams.append('email', params.email);
    if (params.telefono) queryParams.append('telefono', params.telefono);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await root.get(`/compania?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene una compañía por ID
 * @param {number} id - ID de la compañía
 * @returns {Promise<Object>} Datos de la compañía
 */
export const getCompaniaById = async (id) => {
  try {
    const response = await root.get(`/compania/detail/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene la compañía asociada a un bombero
 * @param {number} idBombero - ID del bombero
 * @returns {Promise<Object>} Datos de la compañía
 */
export const getCompaniaBombero = async (idBombero) => {
  try {
    const response = await root.get(`/compania/bombero/${idBombero}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene la primera compañía disponible (para el home)
 * @returns {Promise<Object>} Datos de la primera compañía
 */
export const getPrimeraCompania = async () => {
  try {
    const response = await root.get('/compania?page=1&limit=1');
    if (response.data?.data?.companias && response.data.data.companias.length > 0) {
      return {
        ...response.data,
        data: response.data.data.companias[0]
      };
    }
    throw new Error('No se encontraron compañías');
  } catch (error) {
    throw error;
  }
};

/**
 * Crea una nueva compañía
 * @param {Object} companiaData - Datos de la compañía
 * @returns {Promise<Object>} Compañía creada
 */
export const createCompania = async (companiaData) => {
  try {
    const response = await root.post('/compania', companiaData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza una compañía
 * @param {number} id - ID de la compañía
 * @param {Object} companiaData - Datos a actualizar
 * @returns {Promise<Object>} Compañía actualizada
 */
export const updateCompania = async (id, companiaData) => {
  try {
    const response = await root.patch(`/compania/detail/${id}`, companiaData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina una compañía
 * @param {number} id - ID de la compañía
 * @returns {Promise<Object>} Respuesta de eliminación
 */
export const deleteCompania = async (id) => {
  try {
    const response = await root.delete(`/compania/detail/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
