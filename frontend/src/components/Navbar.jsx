import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '@hooks/auth/useAuth';
import NotificationBell from '@components/NotificationBell';
import BomberoProfile from '@components/bomberos/BomberoProfile';
import DisponibilidadToggle from '@components/navbar/DisponibilidadToggle';
import { MdMenu, MdClose } from 'react-icons/md';


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { bombero, logout: authLogout, hasPermiso, hasRol } = useAuth();

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

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo o Nombre de la App */}
                    <div className="flex items-center space-x-4">
                        <NavLink to="/home" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">🚒</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Sistema Bomberos</span>
                        </NavLink>
                    </div>

                    {/* Sección derecha: Toggle Disponibilidad, Notificaciones y Perfil de Usuario */}
                    <div className="flex items-center space-x-4">
                        {/* Toggle de Disponibilidad (visible en desktop) */}
                        <div className="hidden md:block">
                            <DisponibilidadToggle />
                        </div>

                        {/* Notificaciones (ocultas en móvil) */}
                        <div className="hidden md:block">
                            <NotificationBell />
                        </div>

                        {/* Perfil de Usuario (visible en todas las pantallas) */}
                        <div className="hidden md:block">
                            <BomberoProfile />
                        </div>

                        {/* Botón de Hamburguesa (se muestra en pantallas pequeñas y tablets) */}
                        <div className="md:hidden flex items-center">
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
                <div className="md:hidden bg-white border-t border-gray-200">
                    {/* Toggle de Disponibilidad en móvil */}
                    <div className="px-4 py-2 border-b border-gray-200">
                        <DisponibilidadToggle />
                    </div>

                    {/* Notificaciones en móvil */}
                    <div className="px-4 py-2 border-b border-gray-200">
                        <NotificationBell />
                    </div>

                    {/* Opciones del perfil en móvil */}
                    <div className="px-2 pb-3 space-y-2">
                        {hasPermiso('bombero:obtener_perfil') && (
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    navigate('/perfil-completo');
                                }}
                                className="w-full text-left text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                            >
                                Ver perfil
                            </button>
                        )}
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