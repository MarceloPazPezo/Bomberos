import axios from './root.service.js';
import cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { convertirMinusculas } from '@helpers/formatData.js';

export async function login(dataBombero) {
    try {
        const response = await axios.post('/auth/login', {
            run: dataBombero.run,
            password: dataBombero.password
        });
        const { status, data } = response;
        if (status === 200) {
            const decoded = jwtDecode(data.data.token);
            // Unifica todos los permisos de todos los roles en un solo array (sin duplicados)
            const allPermisos = Array.isArray(decoded.roles)
                ? [...new Set(decoded.roles.flatMap(r => Array.isArray(r.permisos) ? r.permisos : []))]
                : [];
            const bomberoData = {
                id: decoded.id,
                nombres: decoded.nombres,
                apellidos: decoded.apellidos,
                email: decoded.email,
                run: decoded.run,
                activo: decoded.activo,
                companiaId: decoded.companiaId,
                roles: decoded.roles,
                rolId: decoded.roles && decoded.roles.length > 0 ? decoded.roles[0].id : null,
                permisos: allPermisos
            };
            sessionStorage.setItem('bombero', JSON.stringify(bomberoData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
            cookies.set('jwt-auth', data.data.token, {path:'/'});
            return response.data;
        }
    } catch (error) {
        return error.response.data;
    }
}



export async function logout() {
    try {
        await axios.post('/auth/logout');
        sessionStorage.removeItem('bombero');
        cookies.remove('jwt');
        cookies.remove('jwt-auth');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

export async function getBomberoPermisos(idBombero) {
    try {
        const response = await axios.get(`/auth/bombero/${idBombero}/permisos`);
        if (response.status === 200) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error('Error al obtener permisos del bombero:', error);
        return [];
    }
}

export async function refreshToken() {
    try {
        const response = await axios.post('/auth/refresh');
        if (response.status === 200) {
            const { token } = response.data.data;
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            cookies.set('jwt-auth', token, { path: '/' });
            return token;
        }
        return null;
    } catch (error) {
        console.error('Error al renovar token:', error);
        return null;
    }
}

export async function validateToken() {
    try {
        const response = await axios.get('/auth/validate');
        return response.status === 200;
    } catch (error) {
        console.error('Error al validar token:', error);
        return false;
    }
}