import axios from './root.service.js';
import { formatUserData, normalizeRutForBackend } from '@helpers/formatData.js';

export async function createUser(userData) {
    try {
        const response = await axios.post('/usuario/', userData);
        return response.data;
    } catch (error) {
        return error.response?.data || error;
    }
}

export async function getUsers() {
    try {
        const { data } = await axios.get('/usuario/');
        const formattedData = data.data.map(formatUserData);
        return formattedData;
    } catch (error) {
        console.error('Error in getUsers:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}

export async function updateUser(data, run) {
    try {
        const normalizedRut = normalizeRutForBackend(run);
        const response = await axios.patch(`/usuario/detail/?run=${normalizedRut}`, data);
        return response.data.data;
    } catch (error) {
        console.error('Error in updateUser:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}

export async function deleteUser(run) {
    try {
        const normalizedRut = normalizeRutForBackend(run);
        const response = await axios.delete(`/usuario/detail/?run=${normalizedRut}`);
        return response.data;
    } catch (error) {
        console.error('Error in deleteUser:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}

export async function changeUserStatus(userId, activo) {
    try {
        const response = await axios.patch(`/usuario/status/${userId}`, { activo });
        return response.data;
    } catch (error) {
        return error.response?.data || error;
    }
}