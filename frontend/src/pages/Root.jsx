import { Outlet, useLocation } from 'react-router-dom';
import Layout from '@components/Layout';
import { AuthProvider } from '@context/AuthContext';
import { useAuth } from '@hooks/auth/useAuth';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

function Root() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <AuthProvider>
      <AuthWrapper sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </AuthProvider>
  );
}

function AuthWrapper({ sidebarOpen, setSidebarOpen }) {
  const { loading } = useAuth();
  
  // Mostrar loading global mientras se inicializa la autenticación
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-lg font-medium">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return <PageRoot sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
}

function PageRoot({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  // Rutas que no necesitan sidebar (auth pages)
  const authRoutes = ['/auth', '/login'];
  const isAuthRoute = authRoutes.some(route => location.pathname.startsWith(route));

  if (isAuthRoute) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <Outlet />
      </div>
    );
  }

  // Layout principal con navbar y sidebar para rutas autenticadas
  return (
    <Layout 
      showSidebar={true} 
      sidebarCollapsed={!sidebarOpen}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      <Outlet />
    </Layout>
  );
}

AuthWrapper.propTypes = {
  sidebarOpen: PropTypes.bool.isRequired,
  setSidebarOpen: PropTypes.func.isRequired,
};

PageRoot.propTypes = {
  sidebarOpen: PropTypes.bool.isRequired,
  setSidebarOpen: PropTypes.func.isRequired,
};

export default Root;