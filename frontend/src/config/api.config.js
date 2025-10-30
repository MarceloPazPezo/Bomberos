/**
 * Configuración centralizada de URLs del backend
 * Las URLs se pueden configurar mediante variables de entorno
 */

// URL base del backend (sin /api)
const BASE_URL = import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_API_URL?.replace('/api', '') ||
    'http://localhost:3000';

// URL completa de la API
const API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

// URL para sockets WebSocket
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BASE_URL;

export {
    BASE_URL,
    API_URL,
    SOCKET_URL,
};

