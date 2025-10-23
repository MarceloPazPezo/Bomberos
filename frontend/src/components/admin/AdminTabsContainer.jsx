import React, { lazy, Suspense } from 'react';
import { useAdmin } from '@context/AdminContext';
import {
  MdPeople,
  MdSecurity,
  MdVpnKey,
  MdBusiness,
  MdLocationOn,
  MdPerson,
  MdLocalHospital,
  MdDirectionsCar,
  MdEvent
} from 'react-icons/md';

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
const AdminEstadoCivilTab = lazy(() => import('./tabs/AdminEstadoCivilTab'));
const AdminServicioTab = lazy(() => import('./tabs/AdminServicioTab'));
const AdminCarroTab = lazy(() => import('./tabs/AdminCarroTab'));
const AdminTiposEventoTab = lazy(() => import('./tabs/AdminTiposEventoTab'));

// Mapeo de iconos
const iconMap = {
  MdPeople,
  MdSecurity,
  MdVpnKey,
  MdBusiness,
  MdLocationOn,
  MdPerson,
  MdLocalHospital,
  MdDirectionsCar,
  MdEvent
};

/**
 * Contenedor principal que maneja la navegación entre pestañas
 * y renderiza el componente correspondiente
 */
const AdminTabsContainer = () => {
  const { activeTab, availableTabs, handleTabChange } = useAdmin();
  
  console.log('[DEBUG] AdminTabsContainer - activeTab:', activeTab);
  console.log('[DEBUG] AdminTabsContainer - availableTabs:', availableTabs);

  // Renderizar el componente de pestaña activa con lazy loading
  const renderActiveTab = () => {
    console.log('[DEBUG] renderActiveTab - activeTab:', activeTab);
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
      case 'estadoCivil':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminEstadoCivilTab />
          </Suspense>
        );
      case 'servicios':
        console.log('[DEBUG] Rendering AdminServicioTab');
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminServicioTab />
          </Suspense>
        );
      case 'carros':
        console.log('[DEBUG] Rendering AdminCarroTab');
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminCarroTab />
          </Suspense>
        );
      case 'tiposEvento':
        console.log('[DEBUG] Rendering AdminTiposEventoTab');
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <AdminTiposEventoTab />
          </Suspense>
        );
      default:
        console.log('[DEBUG] Default case - activeTab not found:', activeTab);
        return (
          <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-8 rounded-2xl text-center">
            <p className="text-gray-500">Pestaña no encontrada o sin permisos</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Navegación de pestañas */}
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          {availableTabs.map((tab) => {
            const IconComponent = iconMap[tab.icon];
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#4EB9FA] text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-[#4EB9FA]/10'
                }`}
                title={tab.description}
              >
                {IconComponent && <IconComponent size={18} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      {renderActiveTab()}
    </div>
  );
};

export default AdminTabsContainer;