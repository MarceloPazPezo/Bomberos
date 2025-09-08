import axios from './root.service.js';

/**
 * Obtiene el perfil del bombero autenticado
 * @returns {Promise} Respuesta con los datos del perfil
 */
export async function getMyProfile() {
  try {
    const response = await axios.get('/perfil/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    throw error;
  }
}

/**
 * Actualiza el perfil del bombero autenticado
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise} Respuesta con los datos actualizados
 */
export async function updateMyProfile(profileData) {
  try {
    const response = await axios.patch('/perfil/', profileData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error;
  }
}

/**
 * Cambia la contraseña del bombero autenticado
 * @param {Object} passwordData - Datos de la contraseña (currentPassword, newPassword)
 * @returns {Promise} Respuesta del servidor
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.patch('/perfil/cambiar-contrasena', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    throw error;
  }
};