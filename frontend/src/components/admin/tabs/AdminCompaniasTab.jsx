import React, { useEffect, useState } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useAdminModals } from '@components/admin/AdminModalsProvider';

// Componentes
import Tooltip from '@components/Tooltip';

// Iconos
import { MdAdd, MdRefresh, MdBusiness, MdSearch, MdClear } from 'react-icons/md';

/**
 * Componente específico para la gestión de compañías
 * Contiene toda la lógica relacionada con la administración de compañías de bomberos
 */
const AdminCompaniasTab = () => {
  const { hasPermiso } = useAdmin();
  const { openModal, closeModal } = useAdminModals();

  // Estado local
  const [companias, setCompanias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Implementar hook useCompanias cuando esté disponible
  // const { 
  //   companias, 
  //   fetchCompanias, 
  //   loading, 
  //   error,
  //   handleCreateCompania,
  //   handleUpdateCompania,
  //   handleDeleteCompania 
  // } = useCompanias();

  // Cargar compañías al montar el componente
  useEffect(() => {
      // fetchCompanias(true);
      console.log('Cargando compañías...');
  }, [hasPermiso]);

  // Filtrar compañías basado en el término de búsqueda
  const filteredCompanias = companias.filter(compania =>
    compania.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compania.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compania.telefono?.includes(searchTerm)
  );

  // Handlers
  const handleCreate = () => {
    openModal('createCompania');
  };

  const handleRefresh = () => {
    // fetchCompanias();
    console.log('Refrescando compañías...');
  };

  const clearSearch = () => {
    setSearchTerm('');
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
              Total: {companias.length} compañías
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
                  loading 
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                    : 'text-[#4EB9FA] hover:text-[#3DA8E9] border-[#4EB9FA] hover:bg-[#4EB9FA]/10'
                }`}
                disabled={loading}
              >
                <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </Tooltip>

            {/* Botón crear compañía */}
            {hasPermiso(COMPANIA_PERMISSIONS.CREAR) && (
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
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4EB9FA]"></div>
                <span className="text-gray-600">Cargando compañías...</span>
              </div>
            </div>
          )}

          {/* Lista vacía o en desarrollo */}
          {!loading && companias.length === 0 && (
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
          {!loading && filteredCompanias.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanias.map((compania) => (
                <div
                  key={compania.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{compania.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">{compania.direccion}</p>
                      <p className="text-sm text-gray-500 mt-1">{compania.telefono}</p>
                    </div>
                    <div className="flex gap-1">
                      {/* Botones de acción aquí */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sin resultados de búsqueda */}
          {!loading && searchTerm && filteredCompanias.length === 0 && companias.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No se encontraron compañías que coincidan con "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales - TODO: Implementar cuando estén disponibles */}
      {/* 
      <CreateCompaniaPopup
        show={isModalOpen('createCompania')}
        setShow={(show) => show ? openModal('createCompania') : closeModal('createCompania')}
        onCompaniaCreated={handleCompaniaCreated}
      />
      */}
    </>
  );
};

export default AdminCompaniasTab;