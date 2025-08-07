import { useAuth } from '@hooks/auth/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ 
    children, 
    allowedRoles, 
    requiredPermissions = [], 
    requireAll = false,
    fallbackPath = "/home",
    loadingComponent = null 
}) => {
    const { isAuthenticated, user, userPermissions, loading } = useAuth();
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
                const hasRole = allowedRoles.includes(user?.rol);
                if (!hasRole) {
                    setHasAccess(false);
                    setIsChecking(false);
                    return;
                }
            }

            // Verificar permisos si se especifican
            if (requiredPermissions && requiredPermissions.length > 0) {
                const userPerms = userPermissions || [];
                
                if (requireAll) {
                    // Requiere TODOS los permisos
                    const hasAllPermissions = requiredPermissions.every(permission => 
                        userPerms.includes(permission)
                    );
                    setHasAccess(hasAllPermissions);
                } else {
                    // Requiere AL MENOS UNO de los permisos
                    const hasAnyPermission = requiredPermissions.some(permission => 
                        userPerms.includes(permission)
                    );
                    setHasAccess(hasAnyPermission);
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
    }, [isAuthenticated, user, userPermissions, allowedRoles, requiredPermissions, requireAll, loading]);

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
