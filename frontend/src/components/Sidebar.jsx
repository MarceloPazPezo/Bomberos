
import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@hooks/auth/useAuth';
import { MdMenu, MdClose, MdHome, MdAdminPanelSettings } from 'react-icons/md';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { hasPermission } = useAuth();

    // Clases de enlace, igual que en Navbar
    const getNavLinkClass = ({ isActive }) =>
        `block px-4 py-3 rounded-md font-semibold transition-colors duration-200 text-base ${isActive
            ? 'bg-[#4EB9FA]/60 text-[#2C3E50]'
            : 'text-[#2C3E50] hover:bg-[#4EB9FA]/30 hover:text-white'
        }`;

    const navLinks = [
        { to: "/home", label: "Inicio", icon: <MdHome size={20} className="mr-2" /> },
    ];

    // Estado local para controlar el retraso del botón hamburger
    const [showHamburger, setShowHamburger] = React.useState(false);

    React.useEffect(() => {
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
                    {hasPermission('user:read_all') && (
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