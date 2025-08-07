import { Outlet, useLocation } from 'react-router-dom';
import Layout from '@components/Layout';
import { AuthProvider } from '@context/AuthContext';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

function Root() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <AuthProvider>
      <PageRoot sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </AuthProvider>
  );
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

PageRoot.propTypes = {
  sidebarOpen: PropTypes.bool.isRequired,
  setSidebarOpen: PropTypes.func.isRequired,
};

export default Root;