import axios from './root.service.js';
import { formatUserData, normalizeRutForBackend } from '@helpers/formatData.js';

export async function createUser(userData) {
    try {
        const response = await axios.post('/user/', userData);
        return response.data;
    } catch (error) {
        return error.response?.data || error;
    }
}

export async function getUsers() {
    try {
        const { data } = await axios.get('/user/');
        const formattedData = data.data.map(formatUserData);
        return formattedData;
    } catch (error) {
        return error.response.data;
    }
}

export async function updateUser(data, rut) {
    try {
        const normalizedRut = normalizeRutForBackend(rut);
        const response = await axios.patch(`/user/detail/?rut=${normalizedRut}`, data);
        return response.data.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function deleteUser(rut) {
    try {
        const normalizedRut = normalizeRutForBackend(rut);
        const response = await axios.delete(`/user/detail/?rut=${normalizedRut}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function changeUserStatus(userId, activo) {
    try {
        const response = await axios.patch(`/user/status/${userId}`, { activo });
        return response.data;
    } catch (error) {
        return error.response?.data || error;
    }
}