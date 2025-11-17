import React from 'react';
import { AdminProvider, useAdmin } from '@context/AdminContext';
import AdminTabsContainer from '@components/admin/AdminTabsContainer';
import AdminModalsProvider from '@components/admin/AdminModalsProvider';
import { useAuth } from '@hooks/auth/useAuth';
import {
  MdSecurity,
  MdHelpOutline,
  MdPeople,
  MdVpnKey,
  MdBusiness,
  MdLocationOn,
  MdDirectionsCar,
  MdShield,
  MdInventory,
  MdRadioButtonChecked,
  MdSettings
} from 'react-icons/md';
import Tooltip from '@components/Tooltip.jsx';

/**
 * Componente interno que usa el contexto Admin
 */
const AdminContent = () => {
  const { activeTab, availableTabs, handleTabChange } = useAdmin();

  const iconMap = {
    MdPeople,
    MdSecurity,
    MdVpnKey,
    MdBusiness,
    MdLocationOn,
    MdDirectionsCar,
    MdShield,
    MdInventory,
    MdRadioButtonChecked,
    MdSettings
  };

  return (
    <div className="min-h-[80vh]">
      {/* Header principal con tabs integradas */}
      <div className="px-4 py-3">
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MdSecurity className="h-8 w-8 text-[#4EB9FA]" />
              <div>
                <h1 className="text-2xl font-bold text-[#2C3E50]">
                  Administración
                </h1>
              </div>
              <Tooltip
                id="admin-help"
                content="Sistema de administración modular para gestionar bomberos, roles, permisos, compañías y configuraciones del sistema. Cada sección tiene permisos granulares para mayor seguridad."
                place="right"
                variant="dark"
              >
                <MdHelpOutline className="h-4 w-4 text-gray-400 hover:text-[#4EB9FA] transition-colors cursor-help" />
              </Tooltip>
            </div>
          </div>
          
          {/* Pestañas */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {availableTabs.map((tab) => {
                const IconComponent = iconMap[tab.icon];
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      isActive
                        ? 'border-[#4EB9FA] text-[#4EB9FA]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    title={tab.description}
                  >
                    {IconComponent && <IconComponent size={18} />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="px-4 mt-2">
        <AdminTabsContainer />
      </div>
    </div>
  );
};

/**
 * Componente principal de administración refactorizado
 * - Estructura modular con contextos
 * - Gestión centralizada de modales
 * - Pestañas independientes con su propia lógica
 * - Mejor separación de responsabilidades
 */
const Admin = () => {
  const { hasPermiso } = useAuth();

  // Lista de permisos de administración
  const adminPermissions = [
    'bombero:obtener', 'bombero:crear', 'bombero:obtener_especifico', 'bombero:actualizar', 'bombero:eliminar', 'bombero:cambiar_estado', 'bombero:asignar_rol', 'bombero:admin',
    'rol:obtener', 'rol:admin',
    'permiso:obtener', 'permiso:admin',
    'compania:obtener', 'compania:obtener_especifico', 'compania:admin',
    'region:obtener', 'region:admin',
    'comuna:obtener', 'comuna:admin',
    'estadoCivil:obtener', 'estadoCivil:admin',
    'disponibilidad:obtener', 'disponibilidad:crear', 'disponibilidad:actualizar', 'disponibilidad:admin',
    'tipoEvento:obtener', 'tipoEvento:admin',
    'tipo_epp:obtener', 'tipo_epp:admin',
    'estado_epp:obtener', 'estado_epp:admin',
    'epp:obtener', 'epp:admin',
    'servicio:obtener', 'servicio:admin',
    'vinculo:obtener', 'vinculo:admin',
    'clave_radial:obtener', 'clave_radial:admin',
    'subtipo_incidente:obtener', 'subtipo_incidente:admin',
    'clasificacion_emergencia:obtener', 'clasificacion_emergencia:admin'
  ];

  // Verificar si el usuario tiene al menos un permiso de administración
  const hasAnyAdminPermission = adminPermissions.some(permission => hasPermiso(permission));

  if (!hasAnyAdminPermission) {
    return (
      <div className="p-6">
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-8 rounded-2xl text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <MdSecurity size={64} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Acceso Restringido</h3>
            <p className="text-gray-500 max-w-md">
              No tienes permisos para acceder a ninguna sección de administración.
              Contacta con tu administrador para obtener los permisos necesarios.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminProvider>
      <AdminModalsProvider>
        <AdminContent />
      </AdminModalsProvider>
    </AdminProvider>
  );
};

export default Admin;