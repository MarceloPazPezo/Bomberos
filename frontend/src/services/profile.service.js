import axios from './root.service.js';

/**
 * Obtiene el perfil del usuario autenticado
 * @returns {Promise} Respuesta con los datos del perfil
 */
export async function getMyProfile() {
  try {
    const response = await axios.get('/profile/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    throw error;
  }
}

/**
 * Actualiza el perfil del usuario autenticado
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise} Respuesta con los datos actualizados
 */
export async function updateMyProfile(profileData) {
  try {
    const response = await axios.patch('/profile/', profileData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error;
  }
}

/**
 * Cambia la contraseña del usuario autenticado
 * @param {Object} passwordData - Datos de la contraseña (currentPassword, newPassword)
 * @returns {Promise} Respuesta del servidor
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await axios.patch('/api/profile/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};