import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import { useAuth } from '@hooks/auth/useAuth';
import NotificationBell from './NotificationBell';
import UserProfile from './UserProfile';
import { MdMenu, MdClose } from 'react-icons/md';


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout: authLogout, hasPermission, hasRole } = useAuth();

    // Cierra el menú si se cambia de ruta (ej. usando los botones del navegador)
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await authLogout();
            navigate('/auth');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    // Función para definir las clases del NavLink. Simplifica el código y es la forma moderna de hacerlo.
    const getNavLinkClass = ({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`;

    const getMobileNavLinkClass = ({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`;

    const navLinks = (
        <>
            {hasRole('administrador') && (
                <NavLink to="/users" className={getNavLinkClass}>Usuarios</NavLink>
            )}
        </>
    );

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo o Nombre de la App */}
                    <div className="flex items-center space-x-4">
                        <NavLink to="/home" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">P</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">PERN App</span>
                        </NavLink>
                    </div>

                    {/* Menú de Navegación Central (se oculta en pantallas pequeñas) */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-1">
                        {navLinks}
                    </div>

                    {/* Sección derecha: Notificaciones y Perfil de Usuario */}
                    <div className="flex items-center space-x-4">
                        {/* Notificaciones (ocultas en móvil) */}
                        <div className="hidden md:block">
                            <NotificationBell />
                        </div>

                        {/* Perfil de Usuario (oculto en móvil) */}
                        <div className="hidden lg:block">
                            <UserProfile />
                        </div>

                        {/* Botón de Hamburguesa (se muestra en pantallas pequeñas) */}
                        <div className="lg:hidden flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                            >
                                {isMenuOpen ? <MdClose className="h-6 w-6" /> : <MdMenu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menú Desplegable Móvil */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-200">
                    {/* Información del usuario en móvil */}
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">
                                    {(() => {
                                        // Función para obtener las iniciales
                                        const getFullName = () => {
                                            if (user?.nombres && user?.apellidos) {
                                                const nombres = Array.isArray(user.nombres) ? user.nombres.join(' ') : user.nombres;
                                                const apellidos = Array.isArray(user.apellidos) ? user.apellidos.join(' ') : user.apellidos;
                                                return `${nombres} ${apellidos}`;
                                            }
                                            if (user?.name && user.name !== 'undefined undefined') {
                                                return user.name;
                                            }
                                            if (user?.email) {
                                                return user.email;
                                            }
                                            return 'Usuario';
                                        };
                                        const fullName = getFullName();
                                        return fullName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
                                    })()} 
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {(() => {
                                        // Función para obtener el nombre completo
                                        if (user?.nombres && user?.apellidos) {
                                            const nombres = Array.isArray(user.nombres) ? user.nombres.join(' ') : user.nombres;
                                            const apellidos = Array.isArray(user.apellidos) ? user.apellidos.join(' ') : user.apellidos;
                                            return `${nombres} ${apellidos}`;
                                        }
                                        if (user?.name && user.name !== 'undefined undefined') {
                                            return user.name;
                                        }
                                        if (user?.email) {
                                            return user.email;
                                        }
                                        return 'Usuario';
                                    })()} 
                                </p>
                                <p className="text-sm text-gray-500">
                                    {user?.email || 'usuario@example.com'}
                                </p>
                                {/* Roles del usuario */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {user?.roles?.length > 0 ? user.roles.map((role, index) => (
                                        <span 
                                            key={index}
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                index === 0 ? 'bg-blue-100 text-blue-800' :
                                                index === 1 ? 'bg-green-100 text-green-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}
                                        >
                                            {role.nombre || role}
                                        </span>
                                    )) : (
                                        <span className="text-xs text-gray-400">Sin roles asignados</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enlaces de navegación */}
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {hasRole('administrador') && (
                            <NavLink to="/users" className={getMobileNavLinkClass}>Usuarios</NavLink>
                        )}
                    </div>

                    {/* Notificaciones en móvil */}
                    <div className="px-4 py-2 border-t border-gray-200 md:hidden">
                        <NotificationBell />
                    </div>

                    {/* Opciones del perfil en móvil */}
                    <div className="px-2 pb-3 space-y-1 border-t border-gray-200">
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                navigate('/profile');
                            }}
                            className="w-full text-left text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                        >
                            Ver perfil
                        </button>
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                // TODO: Implementar configuración de perfil
                            }}
                            className="w-full text-left text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                        >
                            Configurar perfil
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left text-red-600 hover:bg-red-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;