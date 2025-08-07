import axios from './root.service.js';
import cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { convertirMinusculas } from '@helpers/formatData.js';

export async function login(dataUser) {
    try {
        const response = await axios.post('/auth/login', {
            rut: dataUser.rut,
            password: dataUser.password
        });
        const { status, data } = response;
        if (status === 200) {
            const decoded = jwtDecode(data.data.token);
            // Unifica todos los permisos de todos los roles en un solo array (sin duplicados)
            const allPermissions = Array.isArray(decoded.roles)
                ? [...new Set(decoded.roles.flatMap(r => Array.isArray(r.permisos) ? r.permisos : []))]
                : [];
            const userData = {
                id: decoded.id,
                nombres: decoded.nombres || decoded.firstName,
                apellidos: decoded.apellidos || decoded.lastName,
                email: decoded.email,
                rut: decoded.rut,
                telefono: decoded.telefono,
                fechaNacimiento: decoded.fechaNacimiento,
                activo: decoded.activo,
                nombreCompleto: decoded.nombreCompleto || (() => {
                    const nombres = decoded.nombres || decoded.firstName;
                    const apellidos = decoded.apellidos || decoded.lastName;
                    const nombresStr = Array.isArray(nombres) ? nombres.join(' ') : nombres;
                    const apellidosStr = Array.isArray(apellidos) ? apellidos.join(' ') : apellidos;
                    return `${nombresStr} ${apellidosStr}`;
                })(),
                roles: decoded.roles,
                permissions: allPermissions
            };
            sessionStorage.setItem('usuario', JSON.stringify(userData));
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
        sessionStorage.removeItem('usuario');
        cookies.remove('jwt');
        cookies.remove('jwt-auth');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

export async function getUserPermissions(userId) {
    try {
        const response = await axios.get(`/auth/user/${userId}/permissions`);
        if (response.status === 200) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error('Error al obtener permisos del usuario:', error);
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