import rootService from './root.service.js';

const API_BASE = '/estado-civil';

export const estadoCivilService = {
  // Obtener todos los estados civiles con paginación
  async getAll(params = {}) {
    try {
      const response = await rootService.get(API_BASE, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estados civiles:', error);
      
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


  // Crear un nuevo estado civil
  async create(data) {
    try {
      const response = await rootService.post(API_BASE, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear estado civil:', error);
      throw error;
    }
  },

  // Actualizar un estado civil
  async update(id, data) {
    try {
      const response = await rootService.put(`${API_BASE}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estado civil:', error);
      throw error;
    }
  },

  // Eliminar un estado civil
  async delete(id) {
    try {
      const response = await rootService.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar estado civil:', error);
      throw error;
    }
  },

};

export default estadoCivilService;
