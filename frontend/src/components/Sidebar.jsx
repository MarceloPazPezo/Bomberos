import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@hooks/auth/useAuth';
import { MdMenu, MdClose, MdHome, MdAdminPanelSettings, MdCode, MdPeople, MdLocationOn, MdDashboard, MdQueryStats } from 'react-icons/md';
import { LuCalendarDays, LuClipboardCheck, LuClipboard } from 'react-icons/lu';
import { FaUserCheck } from 'react-icons/fa';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { hasPermiso } = useAuth();

    const getNavLinkClass = ({ isActive }) =>
        `block px-3 py-2 rounded-lg font-medium transition-colors duration-200 text-sm ${
            isActive
                ? 'bg-[#4EB9FA]/60 text-[#2C3E50]'
                : 'text-[#2C3E50] hover:bg-[#4EB9FA]/30 hover:text-[#2C3E50]'
        }`;

    const mainMenuLinks = [
        { to: '/home', label: 'Inicio', icon: <MdHome size={20} className="mr-2" /> },
        { to: '/dashboard', label: 'Dashboard', icon: <MdQueryStats size={20} className="mr-2" /> },
        { to: '/demo', label: 'Demo', icon: <MdCode size={20} className="mr-2" /> }
    ];

    const generalLinks = [
        { to: '/partesdeemergencias', label: 'Partes de Emergencias', icon: <LuClipboard size={20} className="mr-2" /> },
        { to: '/calendariooperativobasic', label: 'Calendario Operativo vista básica', icon: <LuCalendarDays size={20} className="mr-2" /> }
    ];

    const [showHamburger, setShowHamburger] = useState(false);
    useEffect(() => {
        let timeout;
        if (!sidebarOpen) {
            timeout = setTimeout(() => setShowHamburger(true), 150);
        } else {
            setShowHamburger(false);
        }
        return () => clearTimeout(timeout);
    }, [sidebarOpen]);

    return (
        <>
            {!sidebarOpen && showHamburger && (
                <button
                    className="fixed top-24 left-0 z-40 flex items-center justify-center w-10 h-14 bg-[#4EB9FA] text-[#2C3E50] shadow-lg hover:bg-[#2C3E50] hover:text-white transition-all duration-200 rounded-r-xl"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Abrir menú lateral"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    <MdMenu size={24} />
                </button>
            )}

            <aside
                className={`fixed top-16 left-2 h-[calc(100vh-4rem)] w-64 bg-white text-[#2C3E50] shadow-2xl z-40 flex flex-col transition-transform duration-300 border border-[#dfe3ea] ${
                    sidebarOpen ? 'translate-x-0 opacity-100 visible' : '-translate-x-full opacity-0 invisible'
                } overflow-hidden`}
            >
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 pt-4 pb-3 border-b border-[#dfe3ea] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MdDashboard size={24} className="text-[#4EB9FA]" />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold tracking-wide text-[#2C3E50]">Panel de Control</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Cerrar menú lateral"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#4EB9FA]/60 text-[#2C3E50] hover:bg-[#4EB9FA]/80 hover:text-slate-800"
                    >
                        <MdClose size={16} />
                    </button>
                </div>

                <nav className={`flex-1 flex flex-col gap-1 px-4 pb-4 ${
                    sidebarOpen
                        ? 'overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#2C80C8] scrollbar-track-transparent scrollbar-thumb-rounded-lg'
                        : 'overflow-hidden pr-0'
                }`}>
                    <p className="mt-3 mb-1 px-1 text-[11px] uppercase tracking-wider text-slate-500">Main Menu</p>
                    {mainMenuLinks.map((link) => (
                        <NavLink key={link.to} to={link.to} onClick={() => setSidebarOpen(false)} className={getNavLinkClass}>
                            <span className="flex items-center">{link.icon}{link.label}</span>
                        </NavLink>
                    ))}

                    <div className="my-3 border-t border-[#dfe3ea]" />
                    <p className="mb-1 px-1 text-[11px] uppercase tracking-wider text-slate-500">General</p>

                    {hasPermiso('disponibilidad:obtener') && (
                        <NavLink to="/disponibilidad" onClick={() => setSidebarOpen(false)} className={getNavLinkClass}>
                            <span className="flex items-center"><FaUserCheck size={20} className="mr-2" />Disponibilidad</span>
                        </NavLink>
                    )}

                    {generalLinks.map((link) => (
                        <NavLink key={link.to} to={link.to} onClick={() => setSidebarOpen(false)} className={getNavLinkClass}>
                            <span className="flex items-center">{link.icon}{link.label}</span>
                        </NavLink>
                    ))}

                    <div className="my-3 border-t border-[#dfe3ea]" />
                    <p className="mb-1 px-1 text-[11px] uppercase tracking-wider text-slate-500">Administración</p>

                    {hasPermiso('bombero:obtener') && (
                        <NavLink to="/bomberos" onClick={() => setSidebarOpen(false)} className={getNavLinkClass}>
                            <span className="flex items-center"><MdPeople size={20} className="mr-2" />Bomberos</span>
                        </NavLink>
                    )}

                    {hasPermiso('bombero:obtener') && (
                        <NavLink to="/inventario-epp" onClick={() => setSidebarOpen(false)} className={getNavLinkClass}>
                            <span className="flex items-center"><ShieldCheckIcon className="w-5 h-5 mr-2" />Inventario EPP</span>
                        </NavLink>
                    )}

                    {hasPermiso('bombero:obtener') && (
                        <NavLink to="/puntos-interes" onClick={() => setSidebarOpen(false)} className={getNavLinkClass}>
                            <span className="flex items-center"><MdLocationOn size={20} className="mr-2" />Puntos de Interés</span>
                        </NavLink>
                    )}

                    <NavLink to="/revisionpartes" onClick={() => setSidebarOpen(false)} className={getNavLinkClass}>
                        <span className="flex items-center"><LuClipboardCheck size={20} className="mr-2" />Revisar Partes de Emergencias</span>
                    </NavLink>

                    <NavLink to="/calendariooperativo" onClick={() => setSidebarOpen(false)} className={getNavLinkClass}>
                        <span className="flex items-center"><LuCalendarDays size={20} className="mr-2" />Calendario Operativo vista admin</span>
                    </NavLink>

                    {(hasPermiso('bombero:obtener') ||
                        hasPermiso('bombero:crear') ||
                        hasPermiso('bombero:obtener_especifico') ||
                        hasPermiso('bombero:actualizar') ||
                        hasPermiso('bombero:eliminar') ||
                        hasPermiso('bombero:cambiar_estado') ||
                        hasPermiso('bombero:asignar_rol') ||
                        hasPermiso('bombero:admin') ||
                        hasPermiso('rol:obtener') ||
                        hasPermiso('rol:admin') ||
                        hasPermiso('permiso:obtener') ||
                        hasPermiso('permiso:admin') ||
                        hasPermiso('compania:obtener') ||
                        hasPermiso('compania:obtener_especifico') ||
                        hasPermiso('compania:admin') ||
                        hasPermiso('region:obtener') ||
                        hasPermiso('region:admin') ||
                        hasPermiso('comuna:obtener') ||
                        hasPermiso('comuna:admin') ||
                        hasPermiso('disponibilidad:obtener') ||
                        hasPermiso('disponibilidad:crear') ||
                        hasPermiso('disponibilidad:actualizar') ||
                        hasPermiso('disponibilidad:admin')) && (
                        <NavLink to="/admin" onClick={() => setSidebarOpen(false)} className={getNavLinkClass}>
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