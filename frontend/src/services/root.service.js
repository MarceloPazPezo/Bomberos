import axios from 'axios';
import cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const instance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Interceptor para agregar automáticamente el token JWT a todas las peticiones
instance.interceptors.request.use(
    (config) => {
        // Obtener el token desde las cookies
        const token = cookies.get('jwt-auth');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores de autenticación
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Si el token ha expirado o es inválido
        if (error.response?.status === 401) {
            // Limpiar cookies y sessionStorage
            cookies.remove('jwt-auth');
            cookies.remove('jwt');
            sessionStorage.removeItem('usuario');
            sessionStorage.removeItem('token');
            
            // Redirigir al login si no estamos ya ahí
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
        }
        
        return Promise.reject(error);
    }
);

export default instance;