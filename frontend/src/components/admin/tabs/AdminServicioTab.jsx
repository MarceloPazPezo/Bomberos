import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useServicio } from '@hooks/servicio/useServicio.jsx';
import { MdAdd, MdLocalHospital, MdRefresh } from 'react-icons/md';
import { showConfirmAlert } from '@helpers/fireAlert.js';
import PrimeTableBasic from '@components/PrimeTableBasic.jsx';
import BomberosLoader from '@components/BomberosLoader.jsx';
import CreateServicioPopup from '@components/admin/popups/CreateServicioPopup.jsx';
import Tooltip from '@components/Tooltip';
import { toStartCase } from '@helpers/textFormatters.js';

/**
 * Pestaña de administración para servicios
 */
const AdminServicioTab = () => {
  const { hasPermiso, refreshTrigger } = useAdmin();
  
  const {
    servicios,
    loading,
    error,
    fetchServicios,
    createServicio,
    deleteServicio
  } = useServicio();

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (hasPermiso('servicio:admin')) {
      fetchServicios({}, true); // Forzar carga inicial - sin parámetros de paginación
    }
  }, [refreshTrigger, hasPermiso, fetchServicios]);

  // Handlers
  const handleRefresh = () => {
    fetchServicios({}, true); // Sin parámetros de paginación
  };

  const handleCreate = () => {
    setShowCreatePopup(true);
  };

  // Manejar eliminación
  const handleDelete = async (servicio) => {
    const confirmed = await showConfirmAlert(
      'Eliminar Servicio',
      `¿Estás seguro de que quieres eliminar el servicio "${toStartCase(servicio.nombre)}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );
    
    if (confirmed.isConfirmed) {
      await deleteServicio(servicio.id);
      // El hook ya maneja los mensajes de éxito/error con fireAlert y toastify
    }
  };

  // Configuración de columnas para PrimeTableBasic (memoizada)
  const columns = useMemo(() => [
    {
      field: 'id',
      header: 'ID',
      sortable: true,
      style: { width: '80px' },
      body: (rowData) => (
        <span className="text-sm font-mono text-gray-600">#{rowData.id}</span>
      )
    },
    {
      field: 'nombre',
      header: 'Nombre',
      sortable: true,
      body: (rowData) => (
        <span className="font-medium text-gray-900">{toStartCase(rowData.nombre)}</span>
      )
    },
    {
      field: 'incidentesCount',
      header: 'Utilizado',
      sortable: true,
      style: { width: '120px' },
      body: (rowData) => {
        const count = rowData.incidentesCount || 0;
        return (
          <div className="flex items-center gap-2" title={`${count} incidentes utilizan este servicio`}>
            <MdLocalHospital className="text-gray-400" size={16} />
            <span className="text-sm text-gray-600">{count}</span>
          </div>
        );
      }
    },
    {
      type: 'actions',
      header: 'Acciones',
      style: { width: '120px' }
    }
  ], []);

  if (loading && servicios.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <BomberosLoader size="md" message="Cargando servicios..." />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestión de Servicios</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra los servicios externos disponibles para los incidentes
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Estadísticas */}
            <span className="text-sm text-gray-600">
              Total: {servicios.length} servicios
            </span>

            {/* Botón refresh */}
            <Tooltip
              id="refresh-servicios-btn"
              content="Actualizar lista de servicios"
              place="top"
              variant="dark"
            >
              <button
                onClick={handleRefresh}
                disabled={loading}
                className={`p-2 rounded-lg shadow transition-all duration-200 border ${
                  loading 
                    ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed' 
                    : 'bg-[#4EB9FA] hover:bg-[#3A9BD9] text-white border-[#4EB9FA] hover:-translate-y-0.5 hover:scale-105'
                }`}
              >
                <MdRefresh 
                  size={18} 
                  className={loading ? 'animate-spin' : ''} 
                />
              </button>
            </Tooltip>

            {/* Botón crear servicio */}
            {hasPermiso('servicio:admin') && (
              <Tooltip
                id="create-servicio-btn"
                content={isCreating ? "Creando servicio..." : "Crear un nuevo servicio en el sistema"}
                place="top"
                variant="dark"
              >
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className={`font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border ${
                    isCreating 
                      ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed' 
                      : 'bg-[#2C3E50] hover:bg-[#34495E] text-white border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isCreating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <MdAdd size={18} />
                    )}
                    <span className="hidden sm:inline">
                      {isCreating ? 'Creando...' : 'Crear servicio'}
                    </span>
                  </span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Tabla de servicios con PrimeTableBasic */}
        <PrimeTableBasic
          data={servicios}
          columns={columns}
          loading={loading}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          emptyMessage="No hay servicios registrados"
          rowsPerPage={10}
          searchPlaceholder="Buscar servicios..."
          showSearch={true}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Popups */}
      <CreateServicioPopup
        show={showCreatePopup}
        setShow={setShowCreatePopup}
        onServicioCreated={() => {
          setIsCreating(false);
          // Forzar recarga para asegurar que la tabla se actualice
          fetchServicios({}, true);
        }}
        onCreatingChange={setIsCreating}
      />
    </>
  );
};

export default AdminServicioTab;
