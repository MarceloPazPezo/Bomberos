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
        // Enviamos todos los posibles estados para obtener todos los bomberos
        // Esto cumple con la validación del backend que requiere al menos un parámetro
        const { data } = await axios.get('/bombero/', {
            params: {
                // Usamos un rango de fechas muy amplio para obtener todos los registros
                creadoDesde: '2020-01-01',
                creadoHasta: '2030-12-31'
            }
        });
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

//obtener bomberos por compañia
export async function getBomberosPorCompania(idCompania) {
    try {
        const { data } = await axios.get(`/bombero/compania/${idCompania}`);
        const formattedData = data.data.map(formatBomberoData);
        console.log('Formatted Data:', formattedData); // Log para verificar los datos formateados
        return formattedData;
    } catch (error) {
        console.error('Error in getBomberosPorCompania:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}
//obtener bomberos con licencias
export async function getBomberosConLicencias(idCompania) {
    try {
        const { data } = await axios.get(`/bombero/licencias/${idCompania}`);
        const formattedData = data.data.map(formatBomberoData);
        console.log('Formatted Data:', data.data); // Log para verificar los datos formateados
        return formattedData;
    } catch (error) {
        console.error('Error in getBomberosConLicencias:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}