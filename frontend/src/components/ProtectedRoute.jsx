import { useAuth } from '@hooks/auth/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import LoadingPage from '@components/LoadingPage';

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

    // Calcular permisos disponibles sin returns tempranos que afecten el orden de hooks
    const calculateAccess = useCallback(() => {
        if (!isAuthenticated || loading) {
            return false;
        }

        // Verificar roles si se especifican
        if (allowedRoles && allowedRoles.length > 0) {
            const hasRole = allowedRoles.includes(bombero?.rol);
            if (!hasRole) {
                return false;
            }
        }

        // Verificar permisos si se especifican
        if (requiredPermisos && requiredPermisos.length > 0) {
            const bomberoPerms = bomberoPermisos || [];

            if (requireAll) {
                // Requiere TODOS los permisos
                return requiredPermisos.every(permiso =>
                    bomberoPerms.includes(permiso)
                );
            } else {
                // Requiere AL MENOS UNO de los permisos
                return requiredPermisos.some(permiso =>
                    bomberoPerms.includes(permiso)
                );
            }
        }

        // Si no hay permisos específicos requeridos, permitir acceso
        return true;
    }, [isAuthenticated, bombero, bomberoPermisos, allowedRoles, requiredPermisos, requireAll, loading]);

    useEffect(() => {
        const access = calculateAccess();
        setHasAccess(access);
        setIsChecking(false);
    }, [calculateAccess]);

    // Mostrar loading mientras se verifica autenticación
    if (loading || isChecking) {
        return loadingComponent || <LoadingPage message="Verificando permisos..." />;
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
