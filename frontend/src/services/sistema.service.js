import axios from './root.service.js';

export const getSystemConfigs = async (category = null) => {
  try {
    const params = category ? { category } : {};
    const response = await axios.get('/sistema', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSystemConfig = async (key) => {
  try {
    const response = await axios.get('/sistema', { params: { key } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSystemConfig = async (key, value) => {
  try {
    const response = await axios.put(`/sistema/${key}`, { value });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createSystemConfig = async (configData) => {
  try {
    const response = await axios.post('/sistema', configData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};