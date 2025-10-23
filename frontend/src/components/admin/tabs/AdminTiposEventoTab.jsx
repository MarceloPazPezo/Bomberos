import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useTiposEvento } from '@hooks/tiposEvento/useTiposEvento.jsx';
import { MdAdd, MdEvent, MdRefresh, MdEdit, MdDelete } from 'react-icons/md';
import { showConfirmAlert } from '@helpers/fireAlert.js';
import BomberosLoader from '@components/BomberosLoader.jsx';
import PrimeTableBasic from '@components/PrimeTableBasic.jsx';
import CreateTipoEventoPopup from '@components/tiposEvento/CreateTipoEventoPopup.jsx';
import UpdateTipoEventoPopup from '@components/tiposEvento/UpdateTipoEventoPopup.jsx';
import Tooltip from '@components/Tooltip';
import { toStartCase } from '@helpers/textFormatters.js';
import { tipoEventoDeletedToast } from '@helpers/toastHelper.jsx';

/**
 * Pestaña de administración para tipos de evento
 */
const AdminTiposEventoTab = () => {
  const { hasPermiso, refreshTrigger } = useAdmin();
  
  const {
    tiposEvento,
    loading,
    error,
    fetchTiposEvento,
    handleCreateTipoEvento,
    handleUpdateTipoEvento,
    handleDeleteTipoEvento
  } = useTiposEvento();

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedTipoEvento, setSelectedTipoEvento] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (hasPermiso('tipoEvento:obtener')) {
      fetchTiposEvento(true); // Forzar carga inicial
    }
  }, [refreshTrigger, hasPermiso, fetchTiposEvento]);

  // Handlers
  const handleRefresh = () => {
    fetchTiposEvento(true);
  };

  const handleCreate = () => {
    setShowCreatePopup(true);
  };

  const handleEdit = (tipoEvento) => {
    setSelectedTipoEvento(tipoEvento);
    setShowUpdatePopup(true);
  };

  const handleUpdateSuccess = async (tipoEventoData) => {
    try {
      setIsUpdating(true);
      const result = await handleUpdateTipoEvento(selectedTipoEvento.id, tipoEventoData);
      if (result.success) {
        setShowUpdatePopup(false);
        setSelectedTipoEvento(null);
        fetchTiposEvento(true); // Refrescar lista
      } else {
        console.error('Error updating tipo evento:', result.error);
      }
      return result; // <- devolver siempre el resultado para el popup
    } catch (error) {
      console.error('Error updating tipo evento:', error);
      return { success: false, error: error?.message || 'Error al actualizar tipo de evento' };
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (tipoEvento) => {
    const confirmed = await showConfirmAlert(
      '¿Eliminar tipo de evento?',
      `¿Estás seguro de que deseas eliminar el tipo de evento "${tipoEvento.nombre}"?`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (confirmed.isConfirmed) {
      try {
        const result = await handleDeleteTipoEvento(tipoEvento.id);
        if (result.success) {
          tipoEventoDeletedToast(tipoEvento.nombre);
        } else {
          console.error('Error deleting tipo evento:', result.error);
        }
      } catch (error) {
        console.error('Error deleting tipo evento:', error);
      }
    }
  };

  const handleCreateSuccess = async (tipoEventoData) => {
    try {
      setIsCreating(true);
      const result = await handleCreateTipoEvento(tipoEventoData);
      if (result.success) {
        setShowCreatePopup(false);
        fetchTiposEvento(true); // Refrescar lista
      } else {
        console.error('Error creating tipo evento:', result.error);
      }
      return result; // Devolver el resultado
    } catch (error) {
      console.error('Error creating tipo evento:', error);
      return { success: false, error: error.message };
    } finally {
      setIsCreating(false);
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
      field: 'nombre',
      header: 'Nombre',
      sortable: true,
      style: { width: '200px' },
      body: (rowData) => (
        <div className="font-medium text-gray-900">
          {toStartCase(rowData.nombre)}
        </div>
      )
    },
    {
      field: 'descripcion',
      header: 'Descripción',
      sortable: true,
      style: { width: '300px' },
      body: (rowData) => (
        <div className="text-gray-600 text-sm">
          {rowData.descripcion || 'Sin descripción'}
        </div>
      )
    },
    {
      type: 'actions',
      header: 'Acciones',
      style: { width: '150px' },
      body: (rowData) => (
        <div className="flex gap-2 justify-center">
          {hasPermiso('tipoEvento:admin') && (
            <>
              <Tooltip
                id={`edit-tipo-evento-${rowData.id}`}
                content="Editar tipo de evento"
                place="top"
                variant="dark"
              >
                <button
                  onClick={() => handleEdit(rowData)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  aria-label="Editar tipo de evento"
                >
                  <MdEdit size={18} />
                </button>
              </Tooltip>
              <Tooltip
                id={`delete-tipo-evento-${rowData.id}`}
                content="Eliminar tipo de evento"
                place="top"
                variant="dark"
              >
                <button
                  onClick={() => handleDelete(rowData)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  aria-label="Eliminar tipo de evento"
                >
                  <MdDelete size={18} />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      )
    }
  ], [hasPermiso, handleEdit, handleDelete]);

  if (loading && tiposEvento.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <BomberosLoader size="md" message="Cargando tipos de evento..." />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestión de Tipos de Evento</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra los tipos de evento del sistema
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Estadísticas */}
            <span className="text-sm text-gray-600">
              Total: {tiposEvento.length} tipos de evento
            </span>

            {/* Botón refresh */}
            <Tooltip
              id="refresh-tipos-evento-btn"
              content="Actualizar lista de tipos de evento"
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

            {/* Botón crear tipo de evento */}
            {hasPermiso('tipoEvento:admin') && (
              <Tooltip
                id="create-tipo-evento-btn"
                content={isCreating ? "Creando tipo de evento..." : "Crear un nuevo tipo de evento en el sistema"}
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
                      {isCreating ? 'Creando...' : 'Crear tipo de evento'}
                    </span>
                  </span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Tabla de tipos de evento con PrimeTableBasic */}
        <PrimeTableBasic
          data={tiposEvento}
          columns={columns}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          emptyMessage="No hay tipos de evento registrados"
          rowsPerPage={10}
          searchPlaceholder="Buscar tipos de evento..."
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
      <CreateTipoEventoPopup
        show={showCreatePopup}
        setShow={setShowCreatePopup}
        onTipoEventoCreated={handleCreateSuccess}
        onCreatingChange={setIsCreating}
      />

      {/* Popup de actualización */}
      <UpdateTipoEventoPopup
        show={showUpdatePopup}
        setShow={setShowUpdatePopup}
        onTipoEventoUpdated={handleUpdateSuccess}
        onUpdatingChange={setIsUpdating}
        editingTipoEvento={selectedTipoEvento}
      />
    </>
  );
};

export default AdminTiposEventoTab;