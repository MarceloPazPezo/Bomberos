import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; 
import Navbar from './Navbar'; 
import Sidebar from './Sidebar';

const Layout = ({ 
  children,
  showSidebar = false, 
  sidebarCollapsed = false,
  sidebarOpen,
  setSidebarOpen,
  maxWidth = '7xl',
  padding = 'px-4 sm:px-6 lg:px-8 py-8'
}) => {
  // Usar el estado pasado desde Root o el estado local como fallback
  const isSidebarOpen = sidebarOpen !== undefined ? sidebarOpen : !sidebarCollapsed;
  const setIsSidebarOpen = setSidebarOpen || (() => {});



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar fijo en la parte superior */}
      <Navbar />

      {/* Sidebar (si está habilitado) */}
      {showSidebar && (
        <>
          {/* Overlay para móvil */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <Sidebar 
            sidebarOpen={isSidebarOpen}
            setSidebarOpen={setIsSidebarOpen}
          />
        </>
      )}

      {/* Contenido principal */}
      <main className={`pt-16 transition-all duration-300 ${showSidebar && isSidebarOpen ? 'ml-56' : 'ml-0'}`}>
        <div className={`w-full ${padding}`}>
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;