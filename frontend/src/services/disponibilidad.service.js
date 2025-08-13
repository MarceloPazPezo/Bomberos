import axios from './root.service.js';

/**
 * Obtiene todas las disponibilidades
 * @returns {Promise} Promesa que resuelve con la lista de disponibilidades
 */
export const getDisponibilidades = async () => {
  try {
    const response = await axios.get('/disponibilidad');
    return response.data;
  } catch (error) {
    console.error('Error al obtener disponibilidades:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtiene una disponibilidad específica por ID
 * @param {number} id - ID de la disponibilidad
 * @returns {Promise} Promesa que resuelve con los datos de la disponibilidad
 */
export const getDisponibilidad = async (id) => {
  try {
    const response = await axios.get(`/disponibilidad/detail/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    throw error.response?.data || error;
  }
};

/**
 * Crea una nueva disponibilidad
 * @param {Object} disponibilidadData - Datos de la disponibilidad
 * @returns {Promise} Promesa que resuelve con la disponibilidad creada
 */
export const createDisponibilidad = async (disponibilidadData) => {
  try {
    const response = await axios.post('/disponibilidad', disponibilidadData);
    return response.data;
  } catch (error) {
    console.error('Error al crear disponibilidad:', error);
    throw error.response?.data || error;
  }
};

/**
 * Actualiza una disponibilidad existente
 * @param {number} id - ID de la disponibilidad
 * @param {Object} disponibilidadData - Datos actualizados de la disponibilidad
 * @returns {Promise} Promesa que resuelve con la disponibilidad actualizada
 */
export const updateDisponibilidad = async (id, disponibilidadData) => {
  try {
    const response = await axios.patch(`/disponibilidad/detail/${id}`, disponibilidadData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar disponibilidad:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtiene la disponibilidad activa de un usuario
 * @param {number} usuario_id - ID del usuario
 * @returns {Promise} Promesa que resuelve con la disponibilidad activa
 */
export const getDisponibilidadActiva = async (usuario_id) => {
  try {
    const response = await axios.get(`/disponibilidad/activa/${usuario_id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener disponibilidad activa:', error);
    throw error.response?.data || error;
  }
};

/**
 * Cambia el estado de disponibilidad de un usuario
 * @param {Object} statusData - Datos del cambio de estado
 * @returns {Promise} Promesa que resuelve con la disponibilidad actualizada
 */
export const changeDisponibilidadStatus = async (statusData) => {
  try {
    const response = await axios.patch('/disponibilidad/status', statusData);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar estado de disponibilidad:', error);
    throw error.response?.data || error;
  }
};

/**
 * Elimina una disponibilidad
 * @param {number} id - ID de la disponibilidad
 * @returns {Promise} Promesa que resuelve con el resultado de la eliminación
 */
export const deleteDisponibilidad = async (id) => {
  try {
    const response = await axios.delete(`/disponibilidad/detail/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar disponibilidad:', error);
    throw error.response?.data || error;
  }
};