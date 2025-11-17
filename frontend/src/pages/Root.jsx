import { Outlet, useLocation } from 'react-router-dom';
import Layout from '@components/Layout';
import { GlobalAvailabilityProvider } from '@context/GlobalAvailabilityContext';
import { NotificationProvider } from '@context/NotificationContext';
import { AuthProvider } from '@context/AuthContext';
import { FireAlertProvider } from '@components/FireAlertProvider';
import { useAuth } from '@hooks/auth/useAuth';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LoadingPage from '@components/LoadingPage';

function Root() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <AuthProvider>
      <GlobalAvailabilityProvider>
        <NotificationProvider>
          <FireAlertProvider>
          <AuthWrapper sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          </FireAlertProvider>
        </NotificationProvider>
      </GlobalAvailabilityProvider>
    </AuthProvider>
  );
}

function AuthWrapper({ sidebarOpen, setSidebarOpen }) {
  const { loading } = useAuth();
  
  // Mostrar loading global mientras se inicializa la autenticación
  if (loading) {
    return <LoadingPage message="Cargando aplicación..." />;
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