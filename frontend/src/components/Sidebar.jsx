
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@hooks/auth/useAuth';
import { MdMenu, MdClose, MdHome, MdAdminPanelSettings, MdCode, MdSecurity, MdPeople, MdLocationOn } from 'react-icons/md';
import { LuCalendarDays, LuClipboardCheck, LuClipboard } from "react-icons/lu";
import { FaUserCheck } from 'react-icons/fa';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { hasPermiso } = useAuth();

    // Clases de enlace, igual que en Navbar
    const getNavLinkClass = ({ isActive }) =>
        `block px-4 py-3 rounded-md font-semibold transition-colors duration-200 text-base ${isActive
            ? 'bg-[#4EB9FA]/60 text-[#2C3E50]'
            : 'text-[#2C3E50] hover:bg-[#4EB9FA]/30 hover:text-white'
        }`;

    const navLinks = [
        { to: "/home", label: "Inicio", icon: <MdHome size={20} className="mr-2" /> },
        { to: "/demo", label: "Demo", icon: <MdCode size={20} className="mr-2" /> },
        { to: "/partesdeemergencias", label: "Partes de Emergencias", icon: <LuClipboard size={30} className="mr-2" /> },
        { to: "/revisionpartes", label: "Revisar Partes de Emergencias", icon: <LuClipboardCheck size={40} className="mr-2" /> },
        { to: "/calendariooperativo", label: "Calendario Operativo vista admin", icon: <LuCalendarDays size={30} className="mr-2" /> },
        { to: "/calendariooperativobasic", label: "Calendario Operativo vista básica", icon: <LuCalendarDays size={30} className="mr-2" /> }
    ];

    // Estado local para controlar el retraso del botón hamburger
    const [showHamburger, setShowHamburger] = useState(false);

    useEffect(() => {
        let timeout;
        if (!sidebarOpen) {
            timeout = setTimeout(() => setShowHamburger(true), 150); // 350ms delay
        } else {
            setShowHamburger(false);
        }
        return () => clearTimeout(timeout);
    }, [sidebarOpen]);

    return (
        <>
            {/* Botón vertical para abrir sidebar cuando está cerrado */}
            {!sidebarOpen && showHamburger && (
                <button
                    className="fixed top-20 left-0 z-40 flex items-center justify-center w-8 h-16 bg-[#4EB9FA] text-[#2C3E50] shadow-lg hover:bg-[#2C3E50] hover:text-white transition-all duration-200 rounded-r-lg"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Abrir menú lateral"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    <MdMenu size={20} />
                </button>
            )}

            {/* Sidebar */}
            <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-56 bg-[#ECEDF2] shadow-2xl z-40 flex flex-col transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Botón de cerrar idéntico al de abrir, posicionado en el borde del sidebar */}
                {sidebarOpen && (
                    <button
                        className="fixed top-4 left-56 z-40 flex items-center justify-center w-8 h-16 bg-[#4EB9FA] text-[#2C3E50] shadow-lg hover:bg-[#2C3E50] hover:text-white transition-all duration-200 rounded-r-lg"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Cerrar menú lateral"
                        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                        <MdClose size={20} />
                    </button>
                )}
 
                <nav className="flex-1 flex flex-col gap-2 mt-6 px-4">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setSidebarOpen(false)}
                            className={getNavLinkClass}
                        >
                            <span className="flex items-center">{link.icon}{link.label}</span>
                        </NavLink>
                    ))}
                    {hasPermiso('disponibilidad:obtener') && (
                        <NavLink
                            to="/disponibilidad"
                            onClick={() => setSidebarOpen(false)}
                            className={getNavLinkClass}
                        >
                            <span className="flex items-center"><FaUserCheck size={20} className="mr-2" />Disponibilidad</span>
                        </NavLink>
                    )}
                    {hasPermiso('bombero:obtener') && (
                        <NavLink
                            to="/bomberos"
                            onClick={() => setSidebarOpen(false)}
                            className={getNavLinkClass}
                        >
                            <span className="flex items-center"><MdPeople size={20} className="mr-2" />Bomberos</span>
                        </NavLink>
                    )}
                    {hasPermiso('bombero:obtener') && (
                        <NavLink
                            to="/inventario-epp"
                            onClick={() => setSidebarOpen(false)}
                            className={getNavLinkClass}
                        >
                            <span className="flex items-center"><ShieldCheckIcon className="w-5 h-5 mr-2" />Inventario EPP</span>
                        </NavLink>
                    )}
                    {(hasPermiso('puntoGeografico:obtener') || hasPermiso('puntoGeografico:admin')) && (
                        <NavLink
                            to="/puntos-interes"
                            onClick={() => setSidebarOpen(false)}
                            className={getNavLinkClass}
                        >
                            <span className="flex items-center"><MdLocationOn size={20} className="mr-2" />Puntos de Interés</span>
                        </NavLink>
                    )}
                    {(hasPermiso('bombero:obtener') || hasPermiso('bombero:crear') || hasPermiso('bombero:obtener_especifico') || hasPermiso('bombero:actualizar') || hasPermiso('bombero:eliminar') || hasPermiso('bombero:cambiar_estado') || hasPermiso('bombero:asignar_rol') || hasPermiso('bombero:admin') ||
                      hasPermiso('rol:obtener') || hasPermiso('rol:admin') ||
                      hasPermiso('permiso:obtener') || hasPermiso('permiso:admin') ||
                      hasPermiso('compania:obtener') || hasPermiso('compania:obtener_especifico') || hasPermiso('compania:admin') ||
                      hasPermiso('region:obtener') || hasPermiso('region:admin') ||
                      hasPermiso('comuna:obtener') || hasPermiso('comuna:admin') ||
                      hasPermiso('disponibilidad:obtener') || hasPermiso('disponibilidad:crear') || hasPermiso('disponibilidad:actualizar') || hasPermiso('disponibilidad:admin')) && (
                        <NavLink
                            to="/admin"
                            onClick={() => setSidebarOpen(false)}
                            className={getNavLinkClass}
                        >
                            <span className="flex items-center"><MdAdminPanelSettings size={20} className="mr-2" />Administración</span>
                        </NavLink>
                    )}
                </nav>
            </aside>
        </>
    );
};

Sidebar.propTypes = {
    sidebarOpen: PropTypes.bool.isRequired,
    setSidebarOpen: PropTypes.func.isRequired,
};

export default Sidebar;