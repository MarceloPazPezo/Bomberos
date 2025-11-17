/**
 * Configuración centralizada de URLs del backend
 * Las URLs se pueden configurar mediante variables de entorno
 */

// En desarrollo, usar rutas relativas para que pasen por el proxy de Vite
// En producción, usar las URLs configuradas o las del entorno
const isDev = import.meta.env.DEV;

// URL base del backend (sin /api)
const BASE_URL = import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_API_URL?.replace('/api', '') ||
    (isDev ? '' : 'http://localhost:3000');

// URL completa de la API
// En desarrollo usar '/api' para que pase por el proxy de Vite
// En producción usar la URL completa configurada
const API_URL = import.meta.env.VITE_API_URL ||
    (isDev ? '/api' : `${BASE_URL}/api`);

// URL para sockets WebSocket
// En desarrollo usar el origen actual o la URL configurada
// En producción usar la URL configurada o la base
const getSocketUrl = () => {
    if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
    }
    if (isDev && typeof window !== 'undefined') {
        return window.location.origin;
    }
    return BASE_URL;
};

const SOCKET_URL = getSocketUrl();

export {
    BASE_URL,
    API_URL,
    SOCKET_URL,
};

