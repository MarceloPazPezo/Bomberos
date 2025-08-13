import axios from './root.service.js';

/**
 * Obtiene el perfil del usuario autenticado
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
 * Actualiza el perfil del usuario autenticado
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
 * Cambia la contraseña del usuario autenticado
 * @param {Object} passwordData - Datos de la contraseña (currentPassword, newPassword)
 * @returns {Promise} Respuesta del servidor
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.patch('/perfil/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    throw error;
  }
};

export const getContactosEmergencia = async (id) => {
  try {
    const response = await axios.get('/contactoEmergencia/' + id);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los contactos de emergencia:', error);
    throw error;
  }
};

export const addContactoEmergencia = async (contactoData) => {
  try {
    const response = await axios.post('/contactoEmergencia/', contactoData);
    return response.data;
  } catch (error) {
    console.error('Error al agregar contacto de emergencia:', error);
    throw error;
  }
};

export const updateContactoEmergencia = async (id, contactoData) => {
  try {
    const response = await axios.patch('/contactoEmergencia/'+ id, contactoData);
    return response.data;
  }
  catch (error) {
    console.error('Error al actualizar contacto de emergencia:', error);
    throw error;
  }
}
export const deleteContactoEmergencia = async (id) => {
  try {
    const response = await axios.delete('/contactoEmergencia/' + id);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar contacto de emergencia:', error);
    throw error;
  }
}
