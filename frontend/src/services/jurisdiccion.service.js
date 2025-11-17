import api from './root.service';

export async function getJurisdicciones(params = {}) {
    try {
        const response = await api.get('/jurisdicciones', { params });
        return Array.isArray(response.data?.data) ? response.data.data : [];
    } catch (error) {
        console.error('Error obteniendo jurisdicciones:', error);
        throw error;
    }
}

export async function createJurisdiccion(payload) {
    try {
        const response = await api.post('/jurisdicciones', payload);
        return response.data?.data;
    } catch (error) {
        console.error('Error creando jurisdicción:', error);
        throw error;
    }
}

export async function updateJurisdiccion(id, payload) {
    try {
        const response = await api.put(`/jurisdicciones/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error('Error actualizando jurisdicción:', error);
        throw error;
    }
}


