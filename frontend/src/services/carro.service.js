import axios from './root.service.js';

export const getCarrosByCompania = async (companiaId) => {
  try {
    const response = await axios.get(`/carro/compania/${companiaId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener carros por compañía:', error);
    throw error.response?.data || error;
  }
};
import rootService from './root.service.js';

const API_BASE = '/carro';

export const carroService = {
  // Obtener todos los carros
  async getAll(params = {}) {
    try {
      const response = await rootService.get(API_BASE, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener carros:', error);

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
  },

  // Crear un nuevo carro
  async create(data) {
    try {
      const response = await rootService.post(API_BASE, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear carro:', error);
      throw error;
    }
  },

  // Actualizar un carro
  async update(id, data) {
    try {
      const response = await rootService.put(`${API_BASE}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar carro:', error);
      throw error;
    }
  },

  // Eliminar un carro
  async delete(id) {
    try {
      const response = await rootService.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar carro:', error);
      throw error;
    }
  },

  // Obtener carros por compañía
  async getCarrosByCompania(idCompania) {
    try {
      const response = await rootService.get(`${API_BASE}/compania/${idCompania}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener carros por compañía:', error);
      throw error;
    }
  },

};


export default carroService;
