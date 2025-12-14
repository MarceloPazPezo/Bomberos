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
    const response = await root.get(`/compania/detalle/${id}`);
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
    const response = await root.patch(`/compania/detalle/${id}`, companiaData);
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
    const response = await root.delete(`/compania/detalle/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Crea una compañía con imagen
 * @param {Object} companiaData - Datos de la compañía
 * @param {File} logoImage - Imagen del logo (opcional)
 * @param {File} bannerImage - Imagen del banner (opcional)
 * @returns {Promise<Object>} Compañía creada
 */
export const createCompaniaWithImage = async (companiaData, logoImage = null, bannerImage = null) => {
  try {
    // Primero crear la compañía
    const companiaResult = await createCompania(companiaData);

    if (companiaResult?.data?.id) {
      const fileService = (await import('./file.service.js')).default;
      const updateData = {};

      // Subir logo si existe
      if (logoImage) {
        const logoUploadResult = await fileService.uploadCompanyImage(companiaResult.data.id, logoImage);
        if (logoUploadResult.success) {
          updateData.logoKEY = logoUploadResult.data.fileName;
        }
      }

      // Subir banner si existe
      if (bannerImage) {
        const bannerUploadResult = await fileService.uploadCompanyImage(companiaResult.data.id, bannerImage);
        if (bannerUploadResult.success) {
          updateData.bannerKEY = bannerUploadResult.data.fileName;
        }
      }

      // Actualizar con las claves de las imágenes
      if (Object.keys(updateData).length > 0) {
        const updateResult = await updateCompania(companiaResult.data.id, updateData);
        return updateResult;
      }
    }

    return companiaResult;
  } catch (error) {
    console.error('Error creating company with image:', error);
    throw error;
  }
};

/**
 * Actualiza una compañía con imagen
 * @param {number} id - ID de la compañía
 * @param {Object} companiaData - Datos a actualizar
 * @param {File} logoImage - Nueva imagen del logo (opcional)
 * @param {File} bannerImage - Nueva imagen del banner (opcional)
 * @returns {Promise<Object>} Compañía actualizada
 */
export const updateCompaniaWithImage = async (id, companiaData, logoImage = null, bannerImage = null) => {
  try {
    const fileService = (await import('./file.service.js')).default;

    // Subir logo si existe
    if (logoImage) {
      const logoUploadResult = await fileService.uploadCompanyImage(id, logoImage);

      if (logoUploadResult.success) {
        // Solo actualizar logoKEY, no logoURL (el backend debería generar URLs dinámicamente)
        companiaData.logoKEY = logoUploadResult.data.fileName;
      } else {
        throw new Error('Error al subir la imagen del logo: ' + logoUploadResult.message);
      }
    }

    // Subir banner si existe
    if (bannerImage) {
      const bannerUploadResult = await fileService.uploadCompanyImage(id, bannerImage);

      if (bannerUploadResult.success) {
        // Solo actualizar bannerKEY, no bannerURL (el backend debería generar URLs dinámicamente)
        companiaData.bannerKEY = bannerUploadResult.data.fileName;
      } else {
        throw new Error('Error al subir la imagen del banner: ' + bannerUploadResult.message);
      }
    }

    // Actualizar la compañía
    return await updateCompania(id, companiaData);
  } catch (error) {
    console.error('Error updating company with image:', error);
    throw error;
  }
};

/**
 * Función inteligente que decide qué método usar según los datos
 * @param {Object} companiaData - Datos de la compañía
 * @param {File} logoImage - Imagen del logo (opcional)
 * @param {File} bannerImage - Imagen del banner (opcional)
 * @returns {Promise<Object>} Resultado de la operación
 */
export const createCompaniaIntelligent = async (companiaData, logoImage = null, bannerImage = null) => {
  // Si hay imagen, usar el endpoint con imagen
  if (logoImage || bannerImage) {
    return await createCompaniaWithImage(companiaData, logoImage, bannerImage);
  }

  // Si no hay imagen, usar el endpoint normal
  return await createCompania(companiaData);
};

/**
 * Obtiene todas las compañías con sus coordenadas geográficas para mostrar en el mapa
 * @returns {Promise<Array>} Array de compañías con coordenadas
 */
export const getCompaniasConCoordenadas = async () => {
  try {
    const response = await root.get('/compania/coordenadas');
    return response.data;
  } catch (error) {
    throw error;
  }
};
