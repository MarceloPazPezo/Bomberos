import axios from './root.service.js';
import { formatBomberoData, normalizeRutForBackend } from '@helpers/formatData.js';

export async function createBombero(bomberoData) {
    try {
        const response = await axios.post('/bombero/', bomberoData);
        return response.data;
    } catch (error) {
        return error.response?.data || error;
    }
}

export async function getBomberos() {
    try {
        const { data } = await axios.get('/bombero/');
        const formattedData = data.data.map(formatBomberoData);
        return formattedData;
    } catch (error) {
        console.error('Error in getBomberos:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}

export async function updateBombero(bomberoData, run) {
    try {
        const normalizedRut = normalizeRutForBackend(run);
        const response = await axios.patch(`/bombero/detail/?run=${normalizedRut}`, bomberoData);
        return response.data.data;
    } catch (error) {
        console.error('Error in updateBombero:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}

export async function deleteBombero(run) {
    try {
        const normalizedRut = normalizeRutForBackend(run);
        const response = await axios.delete(`/bombero/detail/?run=${normalizedRut}`);
        return response.data;
    } catch (error) {
        console.error('Error in deleteBombero:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}

export async function changeBomberoEstado(idBombero, activo) {
    try {
        const response = await axios.patch(`/bombero/estado/${idBombero}`, { activo });
        return response.data;
    } catch (error) {
        return error.response?.data || error;
    }
}