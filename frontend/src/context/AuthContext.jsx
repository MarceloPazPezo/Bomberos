import { createContext, useEffect, useState, useCallback } from 'react';
import { io } from "socket.io-client";
import { useNavigate, useLocation } from 'react-router-dom';
import { getBomberoPermisos, validateToken } from '@services/auth.service';
import cookies from 'js-cookie';
import axios from '@services/root.service';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [bombero, setBombero] = useState(null);
    const [bomberoPermisos, setBomberoPermisos] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);

    // Función para extraer permisos de los roles
    const extractPermisosFromRoles = useCallback((bomberoData) => {
        if (!bomberoData?.roles || !Array.isArray(bomberoData.roles)) {
            return [];
        }
        
        const allPermisos = new Set();
        bomberoData.roles.forEach((role) => {
            if (role.permisos && Array.isArray(role.permisos)) {
                role.permisos.forEach(permiso => {
                    allPermisos.add(permiso);
                });
            }
        });
        
        return Array.from(allPermisos);
    }, []);

    // Función para cargar datos del bombero desde sessionStorage
    const loadBomberoFromStorage = useCallback(() => {
        try {
            const storedBombero = sessionStorage.getItem('bombero');

            if (storedBombero) {
                const bomberoData = JSON.parse(storedBombero);
                setBombero(bomberoData);
                setIsAuthenticated(true);
                
                // Extraer permisos de los roles o usar permisos directos
                const permisos = bomberoData.permisos || extractPermisosFromRoles(bomberoData);
                setBomberoPermisos(permisos);
                return bomberoData;
            }
            return null;
        } catch (error) {
            console.error('Error al cargar bombero desde storage:', error);
            return null;
        }
    }, [extractPermisosFromRoles]);

    // Función para cargar permisos del bombero (mantener para compatibilidad)
    const loadBomberoPermisos = useCallback(async (idBombero) => {
        try {
            // Si el bombero ya tiene permisos, no necesitamos cargarlos del backend
            if (bombero?.permisos) {
                setBomberoPermisos(bombero.permisos);
                return;
            }
            
            setLoading(true);
            const permisos = await getBomberoPermisos(idBombero);
            setBomberoPermisos(permisos || []);
        } catch (error) {
            console.error('Error al cargar permisos del bombero:', error);
            setBomberoPermisos([]);
        } finally {
            setLoading(false);
        }
    }, [bombero]);

    // Función para actualizar el bombero
    const updateBombero = useCallback((bomberoData) => {
        setBombero(bomberoData);
        sessionStorage.setItem('bombero', JSON.stringify(bomberoData));

        // Extraer permisos de los roles o usar permisos directos
        const permisos = bomberoData.permisos || extractPermisosFromRoles(bomberoData);
        setBomberoPermisos(permisos);
    }, [extractPermisosFromRoles]);

    // Función para hacer login
    const login = useCallback((bomberoData, token) => {
        sessionStorage.setItem('bombero', JSON.stringify(bomberoData));
        if (token) {
            sessionStorage.setItem('token', token);
        }
        setBombero(bomberoData);
        setIsAuthenticated(true);
        setSessionExpired(false);

        // Extraer permisos de los roles o usar permisos directos
        const permisos = bomberoData.permisos || extractPermisosFromRoles(bomberoData);
        setBomberoPermisos(permisos);
    }, [extractPermisosFromRoles]);

    // Función para hacer logout (ahora asíncrona para asegurar limpieza antes de navegar)
    const logout = useCallback(async () => {
        try {
            const bombero = JSON.parse(sessionStorage.getItem("bombero"));
            if (bombero && bombero.id) {
                // Crear una conexión temporal solo para emitir el logout
                const tempSocket = io("http://localhost:3000", { withCredentials: true });
                await new Promise((resolve) => {
                    tempSocket.emit("userLogout", bombero.id);
                    setTimeout(() => {
                        tempSocket.disconnect();
                        resolve();
                    }, 400);
                });
            }
        } catch {}
        sessionStorage.removeItem('bombero');
        sessionStorage.removeItem('token');
        setBombero(null);
        setBomberoPermisos([]);
        setIsAuthenticated(false);
        setSessionExpired(false);
        setLoading(false);
        // Navegar solo después de limpiar todo
        navigate('/auth');
    }, [navigate]);

    // Función para verificar si el bombero tiene un permiso específico
    const hasPermiso = useCallback((permiso) => {
        return bomberoPermisos.includes(permiso);
    }, [bomberoPermisos]);

    // Función para verificar si el bombero tiene alguno de los permisos
    const hasAnyPermisos = useCallback((permisos) => {
        return permisos.some(permiso => bomberoPermisos.includes(permiso));
    }, [bomberoPermisos]);

    // Función para verificar si el bombero tiene todos los permisos
    const hasAllPermisos = useCallback((permisos) => {
        return permisos.every(permiso => bomberoPermisos.includes(permiso));
    }, [bomberoPermisos]);

    // Función para verificar si el bombero tiene un rol específico
    const hasRol = useCallback((rol) => {
        if (bombero?.roles && Array.isArray(bombero.roles)) {
            return bombero.roles.some(r => r.name === rol || r === rol);
        }
        return bombero?.rol === rol; // Compatibilidad con estructura anterior
    }, [bombero]);

    // Función para verificar si el bombero tiene alguno de los roles
    const hasAnyRol = useCallback((roles) => {
        if (bombero?.roles && Array.isArray(bombero.roles)) {
            return roles.some(rol => 
                bombero.roles.some(r => r.name === rol || r === rol)
            );
        }
        return roles.includes(bombero?.rol);
    }, [bombero]);

    // Función para manejar errores de autenticación (token expirado, etc.)
    const handleAuthError = useCallback(() => {
        setSessionExpired(true);
        logout();
    }, [logout]);

    // Efecto para inicializar la autenticación (solo una vez al montar)
    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);
            
            // Verificar si hay un token en las cookies
            const token = cookies.get('jwt-auth');
            
            // Cargar datos del bombero desde sessionStorage
            const storedBombero = sessionStorage.getItem('bombero');
            let bomberoData = null;

            if (storedBombero) {
                try {
                    bomberoData = JSON.parse(storedBombero);
                } catch (error) {
                    console.error('Error al cargar bombero desde storage:', error);
                    // Si hay error al parsear, limpiar storage
                    sessionStorage.removeItem('bombero');
                    sessionStorage.removeItem('token');
                }
            }

            if (token && bomberoData) {
                // Configurar el header de autorización
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Establecer el estado del bombero
                setBombero(bomberoData);
                setIsAuthenticated(true);
                
                // Extraer permisos de los roles o usar permisos directos
                const permisos = bomberoData.permisos || extractPermisosFromRoles(bomberoData);
                setBomberoPermisos(permisos);
                setLoading(false);
                
                // Validar token en segundo plano (sin bloquear la UI)
                validateToken().then(isValid => {
                    if (!isValid) {
                        // Token inválido, limpiar todo
                        cookies.remove('jwt-auth');
                        cookies.remove('jwt');
                        sessionStorage.removeItem('bombero');
                        sessionStorage.removeItem('token');
                        setBombero(null);
                        setBomberoPermisos([]);
                        setIsAuthenticated(false);
                        
                        if (location.pathname !== '/auth') {
                            navigate('/auth');
                        }
                    }
                }).catch(error => {
                    console.error('Error al validar token:', error);
                    // En caso de error, limpiar todo
                    cookies.remove('jwt-auth');
                    cookies.remove('jwt');
                    sessionStorage.removeItem('bombero');
                    sessionStorage.removeItem('token');
                    setBombero(null);
                    setBomberoPermisos([]);
                    setIsAuthenticated(false);
                    
                    if (location.pathname !== '/auth') {
                        navigate('/auth');
                    }
                });
            } else {
                // No hay token o datos de bombero válidos
                if (bomberoData && !token) {
                    // Limpiar datos huérfanos
                    sessionStorage.removeItem('bombero');
                    sessionStorage.removeItem('token');
                }

                setBombero(null);
                setBomberoPermisos([]);
                setIsAuthenticated(false);
                setLoading(false);
            }
        };

        initializeAuth();
    }, []); // Solo ejecutar una vez al montar el componente

    // Efecto para redirigir usuarios no autenticados
    useEffect(() => {
        // Solo redirigir si no estamos cargando, no estamos autenticados, 
        // y no estamos ya en la página de auth
        if (!loading && !isAuthenticated && location.pathname !== '/auth') {
            // Agregar un pequeño delay para evitar conflictos con el login
            const timer = setTimeout(() => {
                navigate('/auth');
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, loading, navigate, location.pathname]);

    const contextValue = {
        // Estado
        bombero,
        bomberoPermisos,
        isAuthenticated,
        loading,
        sessionExpired,
        
        // Funciones de autenticación
        login,
        logout,
        updateBombero,

        // Funciones de verificación de permisos
        hasPermiso,
        hasAnyPermisos,
        hasAllPermisos,
        hasRol,
        hasAnyRol,
        
        // Manejo de errores
        handleAuthError,
        
        // Funciones de utilidad
        loadBomberoPermisos
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}