import React, { useEffect, useState, useMemo } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useAdminModals } from '@components/admin/AdminModalsProvider';
import { useCompania } from '@hooks/compania/useCompania';
import { showConfirmAlert } from '@helpers/fireAlert.js';
import { toast } from 'react-toastify';

// Importar modales
import CreateCompaniaPopup from '@components/admin/popups/CreateCompaniaPopup';
import UpdateCompaniaPopup from '@components/admin/popups/UpdateCompaniaPopup';
import ViewCompaniaPopup from '@components/admin/popups/ViewCompaniaPopup';

// Componentes
import Tooltip from '@components/Tooltip';
import CompaniaLogo from '@components/companias/CompaniaLogo';

// Iconos
import { MdAdd, MdRefresh, MdBusiness, MdSearch, MdClear, MdEdit, MdDelete, MdVisibility, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

/**
 * Componente específico para la gestión de compañías
 * Contiene toda la lógica relacionada con la administración de compañías de bomberos
 */
const AdminCompaniasTab = () => {
  const { hasPermiso } = useAdmin();
  const { openModal, closeModal } = useAdminModals();

  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCompania, setSelectedCompania] = useState(null);

  // Memoizar permisos para evitar múltiples evaluaciones
  const permissions = useMemo(() => ({
    canView: hasPermiso('compania:obtener'),
    canAdmin: hasPermiso('compania:admin')
  }), [hasPermiso]);

  // Hook para gestión de compañías
  const { 
    companias: companiasData, 
    fetchCompanias, 
    loading: companiasLoading, 
    error: companiasError,
    createCompania,
    updateCompania,
    deleteCompania 
  } = useCompania();

  // Cargar compañías al montar el componente
  useEffect(() => {
    if (permissions.canView || permissions.canAdmin) {
      fetchCompanias();
    }
  }, [permissions.canView, permissions.canAdmin, fetchCompanias]);

  // Filtrar compañías basado en el término de búsqueda
  const filteredCompanias = companiasData.filter(compania =>
    compania.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compania.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compania.telefono?.includes(searchTerm)
  );

  // Handlers
  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleRefresh = () => {
    fetchCompanias();
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Handlers para acciones de compañías
  const handleEditCompania = (compania) => {
    setSelectedCompania(compania);
    setShowUpdateModal(true);
  };

  const handleDeleteCompania = async (compania) => {
    const result = await showConfirmAlert(
      '¿Eliminar Compañía?',
      `¿Estás seguro de que quieres eliminar la compañía "${compania.nombre}"?`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteCompania(compania.id);
        
        if (deleteResult.success) {
          // Mostrar notificación de éxito
          toast.success(`¡Compañía "${compania.nombre}" eliminada exitosamente!`, {
            position: "bottom-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          fetchCompanias(); // Refrescar la lista
        }
      } catch (error) {
        console.error('Error al eliminar compañía:', error);
      }
    }
  };

  const handleViewCompania = (compania) => {
    setSelectedCompania(compania);
    setShowViewModal(true);
  };

  // Handlers para modales
  const handleCompaniaCreated = () => {
    fetchCompanias(); // Refrescar la lista
    setShowCreateModal(false);
  };

  const handleCompaniaUpdated = () => {
    fetchCompanias(); // Refrescar la lista
    setShowUpdateModal(false);
    setSelectedCompania(null);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowUpdateModal(false);
    setShowViewModal(false);
    setSelectedCompania(null);
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestión de Compañías</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra las compañías de bomberos del sistema
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Buscador */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar compañías por nombre, dirección o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <MdClear className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Estadísticas */}
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Total: {companiasData.length} compañías
              {searchTerm && ` | Filtradas: ${filteredCompanias.length}`}
            </span>

            {/* Botón refrescar */}
            <Tooltip
              id="refresh-companias-btn"
              content="Recargar la lista de compañías desde el servidor"
              place="top"
              variant="dark"
            >
              <button
                onClick={handleRefresh}
                className={`px-3 py-2 border rounded-lg transition-colors ${
                  companiasLoading 
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                    : 'text-[#4EB9FA] hover:text-[#3DA8E9] border-[#4EB9FA] hover:bg-[#4EB9FA]/10'
                }`}
                disabled={companiasLoading}
              >
                <MdRefresh size={20} className={companiasLoading ? 'animate-spin' : ''} />
              </button>
            </Tooltip>

            {/* Botón crear compañía */}
            {permissions.canAdmin && (
              <Tooltip
                id="create-compania-btn"
                content="Crear una nueva compañía en el sistema"
                place="top"
                variant="dark"
              >
                <button
                  onClick={handleCreate}
                  className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    <MdAdd size={18} />
                    <span className="hidden sm:inline">Crear compañía</span>
                  </span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-4">
          {/* Estado de carga */}
          {companiasLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4EB9FA]"></div>
                <span className="text-gray-600">Cargando compañías...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {companiasError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                <strong>Error:</strong> {companiasError}
              </p>
            </div>
          )}

          {/* Lista vacía */}
          {!companiasLoading && !companiasError && companiasData.length === 0 && (
            <div className="text-center py-12">
              <MdBusiness size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Gestión de Compañías
              </h3>
              <p className="text-gray-500 mb-4">
                Esta sección permitirá administrar las compañías de bomberos del sistema.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-blue-800 text-sm">
                  <strong>Próximamente:</strong><br />
                  • Crear y editar compañías<br />
                  • Gestionar información de contacto<br />
                  • Asignar bomberos a compañías<br />
                  • Administrar equipamiento y recursos
                </p>
              </div>
            </div>
          )}

          {/* Lista de compañías filtradas */}
          {!companiasLoading && !companiasError && filteredCompanias.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanias.map((compania) => (
                <div
                  key={compania.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#4EB9FA]/30 transition-all duration-300 group"
                >
                  {/* Layout: 1/3 imagen, 2/3 información */}
                  <div className="flex h-48">
                    {/* Logo/Imagen - 1/3 del ancho */}
                    <div className="w-1/3 flex items-center justify-center">
                      <CompaniaLogo
                        compania={compania}
                        nombre={compania.nombre}
                        size="card"
                        isRound={false}
                        className="shadow-lg"
                        alt={`Logo ${compania.nombre}`}
                      />
                    </div>
                    
                    {/* Información - 2/3 del ancho */}
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      {/* Header con nombre y fundación */}
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-2 truncate group-hover:text-[#4EB9FA] transition-colors">
                          {compania.nombre}
                        </h4>
                        {compania.fechaFundacion && (
                          <p className="text-sm text-gray-500 mb-3">
                            Fundada en {new Date(compania.fechaFundacion).getFullYear()}
                          </p>
                        )}
                      </div>
                      
                      {/* Información de contacto compacta */}
                      <div className="space-y-1 mb-3">
                        {compania.email && (
                          <div className="flex items-center gap-2 text-xs">
                            <MdEmail className="h-3 w-3 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-600 truncate">{compania.email}</span>
                          </div>
                        )}
                        {compania.telefono && (
                          <div className="flex items-center gap-2 text-xs">
                            <MdPhone className="h-3 w-3 text-green-600 flex-shrink-0" />
                            <span className="text-gray-600">{compania.telefono}</span>
                          </div>
                        )}
                        {compania.direccion && (
                          <div className="flex items-center gap-2 text-xs">
                            <MdLocationOn className="h-3 w-3 text-orange-600 flex-shrink-0" />
                            <span className="text-gray-600 truncate">
                              {compania.direccion.calle} {compania.direccion.numero}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Descripción si existe */}
                      {compania.descripcion && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {compania.descripcion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Botones de acción en la parte inferior */}
                  <div className="flex gap-2 p-4 bg-gray-50 border-t border-gray-100">
                    <Tooltip
                      id={`view-compania-${compania.id}`}
                      content="Ver detalles de la compañía"
                      place="top"
                    >
                      <button
                        onClick={() => handleViewCompania(compania)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <MdVisibility className="h-4 w-4" />
                        Ver
                      </button>
                    </Tooltip>
                    
                    {permissions.canAdmin && (
                      <>
                        <Tooltip
                          id={`edit-compania-${compania.id}`}
                          content="Editar compañía"
                          place="top"
                        >
                          <button
                            onClick={() => handleEditCompania(compania)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <MdEdit className="h-4 w-4" />
                            Editar
                          </button>
                        </Tooltip>
                        
                        <Tooltip
                          id={`delete-compania-${compania.id}`}
                          content="Eliminar compañía"
                          place="top"
                        >
                          <button
                            onClick={() => handleDeleteCompania(compania)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <MdDelete className="h-4 w-4" />
                            Eliminar
                          </button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sin resultados de búsqueda */}
          {!companiasLoading && searchTerm && filteredCompanias.length === 0 && companiasData.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No se encontraron compañías que coincidan con "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <CreateCompaniaPopup
        show={showCreateModal}
        setShow={setShowCreateModal}
        onCompaniaCreated={handleCompaniaCreated}
      />
      
      <UpdateCompaniaPopup
        show={showUpdateModal}
        setShow={setShowUpdateModal}
        companiaData={selectedCompania}
        onCompaniaUpdated={handleCompaniaUpdated}
      />
      
      <ViewCompaniaPopup
        show={showViewModal}
        setShow={setShowViewModal}
        companiaData={selectedCompania}
        onEdit={handleEditCompania}
        onDelete={handleDeleteCompania}
        canEdit={permissions.canAdmin}
        canDelete={permissions.canAdmin}
      />
    </>
  );
};

export default AdminCompaniasTab;