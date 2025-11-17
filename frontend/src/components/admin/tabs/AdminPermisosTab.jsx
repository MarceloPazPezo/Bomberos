import React, { useEffect } from 'react';
import { useAdmin } from '@context/AdminContext';
import usePermisos from '@hooks/permisos/usePermisos';

// Componentes
import PermisosView from '@components/admin/PermisosView';

// Iconos - ya no se usan en este componente

/**
 * Componente específico para la gestión de permisos
 * Contiene toda la lógica relacionada con la visualización de permisos del sistema
 */
const AdminPermisosTab = () => {
  const { hasPermiso, refreshTrigger } = useAdmin();

  // Hooks específicos para permisos
  const { refreshPermisosByCategory } = usePermisos();

  // Cargar permisos al montar el componente
  useEffect(() => {
    if (hasPermiso("admin:permiso")) {
      refreshPermisosByCategory();
    }
  }, [refreshTrigger, hasPermiso]);


  return (
    <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
      {/* Header de la sección */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Gestión de Permisos</h2>
        <p className="text-gray-600 text-sm mt-1">
          Visualiza y administra los permisos del sistema organizados por categorías
        </p>
      </div>

      {/* Vista de permisos */}
      <PermisosView />
    </div>
  );
};

export default AdminPermisosTab;