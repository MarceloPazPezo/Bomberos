import React, { lazy, Suspense } from 'react';
import { useAdmin } from '@context/AdminContext';

// Componente de carga para lazy loading de pestañas
const TabLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4EB9FA]"></div>
  </div>
);

// Lazy loading para componentes de pestañas (se cargan solo cuando se necesitan)
const AdminBomberosTab = lazy(() => import('./tabs/AdminBomberosTab'));
const AdminRolesTab = lazy(() => import('./tabs/AdminRolesTab'));
const AdminPermisosTab = lazy(() => import('./tabs/AdminPermisosTab'));
const AdminCompaniasTab = lazy(() => import('./tabs/AdminCompaniasTab'));
const AdminDireccionesTab = lazy(() => import('./tabs/AdminDireccionesTab'));
const AdminCarroTab = lazy(() => import('./tabs/AdminCarroTab'));
const AdminTipoEppTab = lazy(() => import('./tabs/AdminTipoEppTab'));
const AdminInventarioEppTab = lazy(() => import('./tabs/AdminInventarioEppTab'));
const AdminIncidenteTab = lazy(() => import('./tabs/AdminIncidenteTab'));
const AdminExtraTabs = lazy(() => import('./tabs/AdminExtraTabs'));

/**
 * Contenedor principal que maneja la navegación entre pestañas
 * y renderiza el componente correspondiente
 */
const AdminTabsContainer = () => {
  const { activeTab } = useAdmin();
  
  if (import.meta.env.DEV) {
    console.log('[DEBUG] AdminTabsContainer - activeTab:', activeTab);
  }

  // Renderizar el componente de pestaña activa con lazy loading
  const renderActiveTab = () => {
    if (import.meta.env.DEV) {
      console.log('[DEBUG] renderActiveTab - activeTab:', activeTab);
    }
    switch (activeTab) {
      case 'bomberos':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminBomberosTab />
          </Suspense>
        );
      case 'roles':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminRolesTab />
          </Suspense>
        );
      case 'permisos':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminPermisosTab />
          </Suspense>
        );
      case 'companias':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminCompaniasTab />
          </Suspense>
        );
      case 'direcciones':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminDireccionesTab />
          </Suspense>
        );
      case 'carros':
        if (import.meta.env.DEV) {
          console.log('[DEBUG] Rendering AdminCarroTab');
        }
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminCarroTab />
          </Suspense>
        );
      case 'tiposEpp':
        if (import.meta.env.DEV) {
          console.log('[DEBUG] Rendering AdminTipoEppTab');
        }
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminTipoEppTab />
          </Suspense>
        );
      case 'inventarioEpp':
        if (import.meta.env.DEV) {
          console.log('[DEBUG] Rendering AdminInventarioEppTab');
        }
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminInventarioEppTab />
          </Suspense>
        );
      case 'incidentes':
        if (import.meta.env.DEV) {
          console.log('[DEBUG] Rendering AdminIncidenteTab');
        }
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminIncidenteTab />
          </Suspense>
        );
      case 'extraTabs':
        if (import.meta.env.DEV) {
          console.log('[DEBUG] Rendering AdminExtraTabs');
        }
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminExtraTabs />
          </Suspense>
        );
      default:
        if (import.meta.env.DEV) {
          console.log('[DEBUG] Default case - activeTab not found:', activeTab);
        }
        return (
          <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-8 rounded-2xl text-center">
            <p className="text-gray-500">Pestaña no encontrada o sin permisos</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4">
      {/* Contenido de la pestaña activa */}
      {renderActiveTab()}
    </div>
  );
};

export default AdminTabsContainer;