import { createContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserPermissions, validateToken } from '@services/auth.service';
import cookies from 'js-cookie';
import axios from '@services/root.service';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [user, setUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);

    // Función para cargar datos del usuario desde sessionStorage
    const loadUserFromStorage = useCallback(() => {
        try {
            const storedUser = sessionStorage.getItem('usuario');
            
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
                // Los permisos ya vienen en el userData desde el JWT
                setUserPermissions(userData.permissions || []);
                return userData;
            }
            return null;
        } catch (error) {
            console.error('Error al cargar usuario desde storage:', error);
            return null;
        }
    }, []);

    // Función para cargar permisos del usuario (mantener para compatibilidad)
    const loadUserPermissions = useCallback(async (userId) => {
        try {
            // Si el usuario ya tiene permisos, no necesitamos cargarlos del backend
            if (user?.permissions) {
                setUserPermissions(user.permissions);
                return;
            }
            
            setLoading(true);
            const permissions = await getUserPermissions(userId);
            setUserPermissions(permissions || []);
        } catch (error) {
            console.error('Error al cargar permisos del usuario:', error);
            setUserPermissions([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Función para actualizar el usuario
    const updateUser = useCallback((userData) => {
        setUser(userData);
        sessionStorage.setItem('usuario', JSON.stringify(userData));
        
        // Actualizar permisos directamente desde userData
        setUserPermissions(userData.permissions || []);
    }, []);

    // Función para hacer login
    const login = useCallback((userData, token) => {
        sessionStorage.setItem('usuario', JSON.stringify(userData));
        if (token) {
            sessionStorage.setItem('token', token);
        }
        setUser(userData);
        setIsAuthenticated(true);
        setSessionExpired(false);
        
        // Los permisos ya vienen en userData desde el JWT
        setUserPermissions(userData.permissions || []);
    }, []);

    // Función para hacer logout
    const logout = useCallback(() => {
        sessionStorage.removeItem('usuario');
        sessionStorage.removeItem('token');
        setUser(null);
        setUserPermissions([]);
        setIsAuthenticated(false);
        setSessionExpired(false);
        setLoading(false);
        navigate('/auth');
    }, [navigate]);

    // Función para verificar si el usuario tiene un permiso específico
    const hasPermission = useCallback((permission) => {
        return userPermissions.includes(permission);
    }, [userPermissions]);

    // Función para verificar si el usuario tiene alguno de los permisos
    const hasAnyPermission = useCallback((permissions) => {
        return permissions.some(permission => userPermissions.includes(permission));
    }, [userPermissions]);

    // Función para verificar si el usuario tiene todos los permisos
    const hasAllPermissions = useCallback((permissions) => {
        return permissions.every(permission => userPermissions.includes(permission));
    }, [userPermissions]);

    // Función para verificar si el usuario tiene un rol específico
    const hasRole = useCallback((role) => {
        if (user?.roles && Array.isArray(user.roles)) {
            return user.roles.some(r => r.name === role || r === role);
        }
        return user?.rol === role; // Compatibilidad con estructura anterior
    }, [user]);

    // Función para verificar si el usuario tiene alguno de los roles
    const hasAnyRole = useCallback((roles) => {
        if (user?.roles && Array.isArray(user.roles)) {
            return roles.some(role => 
                user.roles.some(r => r.name === role || r === role)
            );
        }
        return roles.includes(user?.rol); // Compatibilidad con estructura anterior
    }, [user]);

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
            
            // Cargar datos del usuario desde sessionStorage
            const storedUser = sessionStorage.getItem('usuario');
            let userData = null;
            
            if (storedUser) {
                try {
                    userData = JSON.parse(storedUser);
                } catch (error) {
                    console.error('Error al cargar usuario desde storage:', error);
                    // Si hay error al parsear, limpiar storage
                    sessionStorage.removeItem('usuario');
                    sessionStorage.removeItem('token');
                }
            }
            
            if (token && userData) {
                // Configurar el header de autorización
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Establecer el estado del usuario
                setUser(userData);
                setIsAuthenticated(true);
                setUserPermissions(userData.permissions || []);
                setLoading(false);
                
                // Validar token en segundo plano (sin bloquear la UI)
                validateToken().then(isValid => {
                    if (!isValid) {
                        // Token inválido, limpiar todo
                        cookies.remove('jwt-auth');
                        cookies.remove('jwt');
                        sessionStorage.removeItem('usuario');
                        sessionStorage.removeItem('token');
                        setUser(null);
                        setUserPermissions([]);
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
                    sessionStorage.removeItem('usuario');
                    sessionStorage.removeItem('token');
                    setUser(null);
                    setUserPermissions([]);
                    setIsAuthenticated(false);
                    
                    if (location.pathname !== '/auth') {
                        navigate('/auth');
                    }
                });
            } else {
                // No hay token o datos de usuario válidos
                if (userData && !token) {
                    // Limpiar datos huérfanos
                    sessionStorage.removeItem('usuario');
                    sessionStorage.removeItem('token');
                }
                
                setUser(null);
                setUserPermissions([]);
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
        user,
        userPermissions,
        isAuthenticated,
        loading,
        sessionExpired,
        
        // Funciones de autenticación
        login,
        logout,
        updateUser,
        
        // Funciones de verificación de permisos
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        
        // Manejo de errores
        handleAuthError,
        
        // Funciones de utilidad
        loadUserPermissions
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}