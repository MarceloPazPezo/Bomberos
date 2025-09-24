import React from 'react';
import { AdminProvider } from '@context/AdminContext';
import AdminTabsContainer from '@components/admin/AdminTabsContainer';
import AdminModalsProvider from '@components/admin/AdminModalsProvider';
import { useAuth } from '@hooks/auth/useAuth';
import { MdSecurity, MdHelpOutline } from 'react-icons/md';
import Tooltip from '@components/Tooltip.jsx';

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
    'disponibilidad:obtener', 'disponibilidad:crear', 'disponibilidad:actualizar', 'disponibilidad:admin'
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
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Header principal */}
          <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl rounded-2xl mb-4 p-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#2C3E50]">Administración</h1>
              <Tooltip
                id="admin2-help"
                content="Sistema de administración modular para gestionar bomberos, roles, permisos, compañías y configuraciones del sistema. Cada sección tiene permisos granulares para mayor seguridad."
                place="bottom"
                variant="dark"
              >
                <MdHelpOutline className="h-5 w-5 text-gray-400 hover:text-[#4EB9FA] transition-colors cursor-help" />
              </Tooltip>
            </div>
          </div>

          {/* Contenedor de pestañas */}
          <AdminTabsContainer />
        </div>
      </AdminModalsProvider>
    </AdminProvider>
  );
};

export default Admin;