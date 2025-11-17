import axios from './root.service.js';

export async function getPuntosGeograficos(filtros = {}) {
    try {
        const params = new URLSearchParams();
        if (filtros.idTipoPunto) params.append('idTipoPunto', filtros.idTipoPunto);
        if (filtros.idCompania) params.append('idCompania', filtros.idCompania);

        const { data } = await axios.get(`/puntos-geograficos/?${params.toString()}`);
        return data.data || [];
    } catch (error) {
        console.error('Error al obtener puntos geográficos:', error);
        return error.response?.data || null;
    }
}

export async function getPuntoGeografico(id) {
    try {
        const { data } = await axios.get(`/puntos-geograficos/${id}`);
        return data.data;
    } catch (error) {
        console.error('Error al obtener punto geográfico:', error);
        return error.response?.data || null;
    }
}

export async function createPuntoGeografico(puntoData) {
    try {
        const { data } = await axios.post('/puntos-geograficos/', puntoData);
        return data;
    } catch (error) {
        console.error('Error al crear punto geográfico:', error);
        return error.response?.data || null;
    }
}

export async function updatePuntoGeografico(id, puntoData) {
    try {
        const { data } = await axios.put(`/puntos-geograficos/${id}`, puntoData);
        return data;
    } catch (error) {
        console.error('Error al actualizar punto geográfico:', error);
        return error.response?.data || null;
    }
}

export async function deletePuntoGeografico(id) {
    try {
        const { data } = await axios.delete(`/puntos-geograficos/${id}`);
        return data;
    } catch (error) {
        console.error('Error al eliminar punto geográfico:', error);
        return error.response?.data || null;
    }
}

export async function getPuntosCercanos(lat, lng, radio = 5000) {
    try {
        const { data } = await axios.get(`/puntos-geograficos/cercanos?lat=${lat}&lng=${lng}&radio=${radio}`);
        return data.data || [];
    } catch (error) {
        console.error('Error al buscar puntos cercanos:', error);
        return error.response?.data || null;
    }
}

