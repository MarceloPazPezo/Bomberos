import React from 'react';
import { DisponibilidadProvider } from '@context/DisponibilidadContext';
import DisponibilidadTabNavigation from '@components/disponibilidad/DisponibilidadTabNavigation';
import DisponibilidadTabContent from '@components/disponibilidad/DisponibilidadTabContent';
import { useAuth } from '@hooks/auth/useAuth';
import { MdSecurity, MdHelpOutline } from 'react-icons/md';
import { FaUserCheck } from 'react-icons/fa';
import Tooltip from '@components/Tooltip.jsx';

/**
 * Página principal de disponibilidad refactorizada (Versión 2)
 * - Estructura modular con contextos
 * - Gestión centralizada con FireAlert
 * - Pestañas independientes con su propia lógica
 * - Mejor separación de responsabilidades
 * - Integración completa de sockets para tiempo real
 */
const DisponibilidadPage = () => {
  const { hasPermiso } = useAuth();

  // Lista de permisos de disponibilidad
  const disponibilidadPermissions = [
    'disponibilidad:crear',
    'disponibilidad:obtener',
    'disponibilidad:actualizar',
    'disponibilidad:eliminar'
  ];

  // Verificar si el usuario tiene al menos un permiso de disponibilidad
  const hasAnyDisponibilidadPermission = disponibilidadPermissions.some(permission => hasPermiso(permission));

  if (!hasAnyDisponibilidadPermission) {
    return (
      <div className="p-6">
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-8 rounded-2xl text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <MdSecurity size={64} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Acceso Restringido</h3>
            <p className="text-gray-500 max-w-md">
              No tienes permisos para acceder al sistema de disponibilidades.
              Contacta con tu administrador para obtener los permisos necesarios.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DisponibilidadProvider>
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header principal con tabs integrados */}
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl rounded-2xl mb-4 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaUserCheck className="h-8 w-8 text-[#4EB9FA]" />
              <div>
                <h1 className="text-2xl font-bold text-[#2C3E50]">Control de Disponibilidad</h1>
              </div>
              <Tooltip
                id="disponibilidad-v2-help"
                content="Versión mejorada del sistema de disponibilidades con arquitectura modular, notificaciones avanzadas con FireAlert, y actualización en tiempo real mediante sockets. Incluye pestañas separadas para marcar disponibilidad y ver historial."
                place="bottom"
                variant="dark"
              >
                <MdHelpOutline className="h-5 w-5 text-gray-400 hover:text-[#4EB9FA] transition-colors cursor-help" />
              </Tooltip>
            </div>
            
            {/* Navegación de tabs integrada */}
            <DisponibilidadTabNavigation />
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <DisponibilidadTabContent />
      </div>
    </DisponibilidadProvider>
  );
};

export default DisponibilidadPage;