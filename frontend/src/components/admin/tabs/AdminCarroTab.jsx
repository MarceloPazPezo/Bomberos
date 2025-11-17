import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useCarro } from '@hooks/carro/useCarro.jsx';
import { MdAdd, MdDirectionsCar, MdRefresh, MdEdit } from 'react-icons/md';
import { showConfirmAlert } from '@helpers/fireAlert.js';
import PrimeTableBasic from '@components/PrimeTableBasic.jsx';
import BomberosLoader from '@components/BomberosLoader.jsx';
import CreateCarroPopup from '@components/admin/popups/CreateCarroPopup.jsx';
import UpdateCarroPopup from '@components/admin/popups/UpdateCarroPopup.jsx';
import Tooltip from '@components/Tooltip';
import { toStartCase } from '@helpers/textFormatters.js';
import { carroDeletedToast } from '@helpers/toastHelper.jsx';

/**
 * Pestaña de administración para carros
 */
const AdminCarroTab = () => {
  const { hasPermiso, refreshTrigger } = useAdmin();
  
  const {
    carros,
    loading,
    error,
    fetchCarros,
    createCarro,
    updateCarro,
    deleteCarro
  } = useCarro();

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedCarro, setSelectedCarro] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (hasPermiso('carro:admin')) {
      fetchCarros({}, true); // Forzar carga inicial - sin parámetros de paginación
    }
  }, [refreshTrigger, hasPermiso, fetchCarros]);

  // Handlers
  const handleRefresh = () => {
    fetchCarros({}, true); // Sin parámetros de paginación
  };

  const handleCreate = () => {
    setShowCreatePopup(true);
  };

  // La función handleCreateSuccess ya no es necesaria
  // El popup maneja la creación internamente

  const handleEdit = (carro) => {
    setSelectedCarro(carro);
    setShowUpdatePopup(true);
  };

  const handleUpdateSuccess = async (carroData) => {
    setIsUpdating(true);
    try {
      const result = await updateCarro(selectedCarro.id, carroData);
      if (result.success) {
        setShowUpdatePopup(false);
        setSelectedCarro(null);
      }
    } catch (error) {
      console.error('Error al actualizar carro:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (carro) => {
    const result = await showConfirmAlert(
      'Eliminar Carro',
      `¿Estás seguro de que quieres eliminar el carro con patente "${carro.patente}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteCarro(carro.id);
        if (deleteResult.success) {
          carroDeletedToast(carro.patente);
        }
      } catch (error) {
        console.error('Error al eliminar carro:', error);
      }
    }
  };

  // Configuración de columnas para la tabla
  const columns = useMemo(() => [
    {
      field: 'id',
      header: 'ID',
      sortable: true,
      style: { width: '80px' }
    },
    {
      field: 'patente',
      header: 'Patente',
      sortable: true,
      style: { width: '120px' }
    },
    {
      field: 'capacidadPasajeros',
      header: 'Capacidad',
      sortable: true,
      style: { width: '100px' },
      body: (rowData) => rowData.capacidadPasajeros || 'N/A'
    },
    {
      field: 'companiaNombre',
      header: 'Compañía',
      sortable: true,
      style: { width: '150px' }
    },
    {
      field: 'incidentesCount',
      header: 'Incidentes',
      sortable: true,
      style: { width: '100px' }
    },
    {
      type: 'actions',
      header: 'Acciones',
      style: { width: '150px' },
      body: (rowData) => (
        <div className="flex gap-2 justify-center">
          {hasPermiso('carro:admin') && (
            <>
              <Tooltip
                id={`edit-carro-${rowData.id}`}
                content="Editar carro"
                place="top"
                variant="dark"
              >
                <button
                  onClick={() => handleEdit(rowData)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  aria-label="Editar carro"
                >
                  <MdEdit size={18} />
                </button>
              </Tooltip>
              <Tooltip
                id={`delete-carro-${rowData.id}`}
                content="Eliminar carro"
                place="top"
                variant="dark"
              >
                <button
                  onClick={() => handleDelete(rowData)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  aria-label="Eliminar carro"
                >
                  <MdDirectionsCar size={18} />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      )
    }
  ], [hasPermiso, handleEdit, handleDelete]);

  if (loading && carros.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <BomberosLoader size="md" message="Cargando carros..." />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestión de Carros</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra los carros disponibles para los incidentes
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Estadísticas */}
            <span className="text-sm text-gray-600">
              Total: {carros.length} carros
            </span>

            {/* Botón refresh */}
            <Tooltip
              id="refresh-carros-btn"
              content="Actualizar lista de carros"
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

            {/* Botón crear carro */}
            {hasPermiso('carro:admin') && (
              <Tooltip
                id="create-carro-btn"
                content={isCreating ? "Creando carro..." : "Crear un nuevo carro en el sistema"}
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
                      {isCreating ? 'Creando...' : 'Crear carro'}
                    </span>
                  </span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Tabla de carros con PrimeTableBasic */}
        <PrimeTableBasic
          data={carros}
          columns={columns}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          emptyMessage="No hay carros registrados"
          rowsPerPage={10}
          searchPlaceholder="Buscar carros..."
          showSearch={true}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Popup de creación */}
      <CreateCarroPopup
        show={showCreatePopup}
        setShow={setShowCreatePopup}
        onCarroCreated={() => fetchCarros({}, true)}
        onCreatingChange={setIsCreating}
      />

      {/* Popup de actualización */}
      <UpdateCarroPopup
        show={showUpdatePopup}
        setShow={setShowUpdatePopup}
        onCarroUpdated={handleUpdateSuccess}
        onUpdatingChange={setIsUpdating}
        carroData={selectedCarro}
      />
    </>
  );
};

export default AdminCarroTab;
