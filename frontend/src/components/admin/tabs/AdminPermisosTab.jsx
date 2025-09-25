import React, { useEffect } from 'react';
import { useAdmin } from '@context/AdminContext';
import usePermisos from '@hooks/permisos/usePermisos';

// Componentes
import PermisosView from '@components/admin/PermisosView';
import Tooltip from '@components/Tooltip';

// Iconos
import { MdRefresh, MdVpnKey } from 'react-icons/md';

/**
 * Componente específico para la gestión de permisos
 * Contiene toda la lógica relacionada con la visualización de permisos del sistema
 */
const AdminPermisosTab = () => {
  const { hasPermiso, refreshTrigger } = useAdmin();

  // Hooks específicos para permisos
  const { 
    permisos, 
    permisosByCategory,
    refreshPermisosByCategory,
    loading: permisosLoading 
  } = usePermisos();

  // Cargar permisos al montar el componente
  useEffect(() => {
    if (hasPermiso("admin:permiso")) {
      refreshPermisosByCategory();
    }
  }, [refreshTrigger, hasPermiso]);

  // Handler para refrescar permisos
  const handleRefreshPermisos = () => {
    refreshPermisosByCategory();
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
      {/* Header de la sección */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Gestión de Permisos</h2>
          <p className="text-gray-600 text-sm mt-1">
            Visualiza y administra los permisos del sistema organizados por categorías
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Estadísticas */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MdVpnKey className="h-4 w-4" />
              <span>Total: {permisos.length} permisos</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Categorías: {Object.keys(permisosByCategory).length}</span>
            </div>
          </div>

          {/* Botón refrescar */}
          <Tooltip
            id="refresh-permisos-btn"
            content="Recargar la lista de permisos desde el servidor"
            place="top"
            variant="dark"
          >
            <button
              onClick={handleRefreshPermisos}
              className={`px-3 py-2 border rounded-lg transition-colors ${
                permisosLoading 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-[#4EB9FA] hover:text-[#3DA8E9] border-[#4EB9FA] hover:bg-[#4EB9FA]/10'
              }`}
              disabled={permisosLoading}
            >
              <MdRefresh size={20} className={permisosLoading ? 'animate-spin' : ''} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Vista de permisos */}
      <PermisosView
        permisos={permisos}
        permisosByCategory={permisosByCategory}
        loading={permisosLoading}
        onRefresh={handleRefreshPermisos}
      />
    </div>
  );
};

export default AdminPermisosTab;