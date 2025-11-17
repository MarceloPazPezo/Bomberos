import axios from './root.service.js';

export async function getTiposPunto() {
    try {
        const { data } = await axios.get('/tipos-punto/');
        return data.data || [];
    } catch (error) {
        console.error('Error al obtener tipos de punto:', error);
        return error.response?.data || null;
    }
}

export async function getTipoPunto(id) {
    try {
        const { data } = await axios.get(`/tipos-punto/${id}`);
        return data.data;
    } catch (error) {
        console.error('Error al obtener tipo de punto:', error);
        return error.response?.data || null;
    }
}

export async function createTipoPunto(tipoPuntoData) {
    try {
        const { data } = await axios.post('/tipos-punto/', tipoPuntoData);
        return data;
    } catch (error) {
        console.error('Error al crear tipo de punto:', error);
        return error.response?.data || null;
    }
}

export async function updateTipoPunto(id, tipoPuntoData) {
    try {
        const { data } = await axios.put(`/tipos-punto/${id}`, tipoPuntoData);
        return data;
    } catch (error) {
        console.error('Error al actualizar tipo de punto:', error);
        return error.response?.data || null;
    }
}

export async function deleteTipoPunto(id) {
    try {
        const { data } = await axios.delete(`/tipos-punto/${id}`);
        return data;
    } catch (error) {
        console.error('Error al eliminar tipo de punto:', error);
        return error.response?.data || null;
    }
}



