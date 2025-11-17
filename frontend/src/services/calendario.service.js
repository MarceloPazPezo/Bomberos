import axios from './root.service.js';

export const getEventos = async () => {
  try {
    const response = await axios.get('/calendario/eventos');
    console.log(response.data.data);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const createEvento = async (data) => {
  try {
    const response = await axios.post('/calendario/eventos', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTiposEvento = async () => {
  try {
    const response = await axios.get('/calendario/tipos-evento');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateEvento = async (id, data) => {
  try {
    const response = await axios.put(`/calendario/eventos/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEvento = async (id) => {
  try {
    const response = await axios.delete(`/calendario/eventos/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEventosRecurrentes = async () => {
  try {
    const response = await axios.get('/calendario/eventos-recurrentes');
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registrarAsistenciaEvento = async (idEvento, data) => {
  try {
    const response = await axios.post(`/calendario/eventos/registrar-asistencia/${idEvento}`, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const obtenerAsistenciaEvento = async (idEvento) => {
  try {
    const response = await axios.get(`/calendario/eventos/asistencia/${idEvento}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
