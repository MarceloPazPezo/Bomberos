import { useAuth } from '@hooks/auth/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ 
    children, 
    allowedRoles, 
    requiredPermisos = [], 
    requireAll = false,
    fallbackPath = "/home",
    loadingComponent = null 
}) => {
    const { isAuthenticated, bombero, bomberoPermisos, loading } = useAuth();
    const [hasAccess, setHasAccess] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAccess = () => {
            if (!isAuthenticated) {
                setHasAccess(false);
                setIsChecking(false);
                return;
            }

            // Verificar roles si se especifican
            if (allowedRoles && allowedRoles.length > 0) {
                const hasRole = allowedRoles.includes(bombero?.rol);
                if (!hasRole) {
                    setHasAccess(false);
                    setIsChecking(false);
                    return;
                }
            }

            // Verificar permisos si se especifican
            if (requiredPermisos && requiredPermisos.length > 0) {
                const bomberoPerms = bomberoPermisos || [];
                
                if (requireAll) {
                    // Requiere TODOS los permisos
                    const hasAllPermisos = requiredPermisos.every(permiso => 
                        bomberoPerms.includes(permiso)
                    );
                    setHasAccess(hasAllPermisos);
                } else {
                    // Requiere AL MENOS UNO de los permisos
                    const hasAnyPermiso = requiredPermisos.some(permiso => 
                        bomberoPerms.includes(permiso)
                    );
                    setHasAccess(hasAnyPermiso);
                }
            } else {
                // Si no hay permisos específicos requeridos, permitir acceso
                setHasAccess(true);
            }

            setIsChecking(false);
        };

        if (!loading) {
            checkAccess();
        }
    }, [isAuthenticated, bombero, bomberoPermisos, allowedRoles, requiredPermisos, requireAll, loading]);

    // Mostrar loading mientras se verifica autenticación
    if (loading || isChecking) {
        return loadingComponent || (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-[#4EB9FA] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#2C3E50] text-sm">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    // Redirigir si no está autenticado
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    // Redirigir si no tiene acceso
    if (!hasAccess) {
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
