import React, { useEffect, useState } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useAdminModals } from '@components/admin/AdminModalsProvider';

// Componentes
import Tooltip from '@components/Tooltip';

// Iconos
import { 
  MdAdd, 
  MdRefresh, 
  MdLocationOn, 
  MdSearch, 
  MdClear,
  MdPublic,
  MdLocationCity
} from 'react-icons/md';

/**
 * Componente específico para la gestión de direcciones
 * Contiene toda la lógica relacionada con la administración de regiones y comunas
 */
const AdminDireccionesTab = () => {
  const { hasPermiso } = useAdmin();
  const { openModal, closeModal } = useAdminModals();

  // Estado local
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('regiones');

  // TODO: Implementar hooks useRegiones y useComunas cuando estén disponibles
  // const { 
  //   regiones, 
  //   fetchRegiones, 
  //   loading: regionesLoading,
  //   handleCreateRegion,
  //   handleUpdateRegion,
  //   handleDeleteRegion 
  // } = useRegiones();
  
  // const { 
  //   comunas, 
  //   fetchComunas, 
  //   loading: comunasLoading,
  //   handleCreateComuna,
  //   handleUpdateComuna,
  //   handleDeleteComuna 
  // } = useComunas();

  // Cargar datos al montar el componente
  useEffect(() => {
      // fetchRegiones(true);
      // fetchComunas(true);
      console.log('Cargando regiones y comunas...');
  }, [hasPermiso]);

  // Obtener datos filtrados según la subpestaña activa
  const getFilteredData = () => {
    const data = activeSubTab === 'regiones' ? regiones : comunas;
    return data.filter(item =>
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handlers
  const handleCreate = () => {
    const modalType = activeSubTab === 'regiones' ? 'createRegion' : 'createComuna';
    openModal(modalType);
  };

  const handleRefresh = () => {
    // if (activeSubTab === 'regiones') {
    //   fetchRegiones();
    // } else {
    //   fetchComunas();
    // }
    console.log(`Refrescando ${activeSubTab}...`);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleSubTabChange = (subTab) => {
    setActiveSubTab(subTab);
    setSearchTerm(''); // Limpiar búsqueda al cambiar de subtab
  };

  const filteredData = getFilteredData();

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestión de Direcciones</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra las regiones y comunas del sistema
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
                placeholder={`Buscar ${activeSubTab} por nombre o código...`}
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
              Total: {activeSubTab === 'regiones' ? regiones.length : comunas.length} {activeSubTab}
              {searchTerm && ` | Filtradas: ${filteredData.length}`}
            </span>

            {/* Botón refrescar */}
            <Tooltip
              id="refresh-direcciones-btn"
              content={`Recargar la lista de ${activeSubTab} desde el servidor`}
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

            {/* Botón crear */}
            {((activeSubTab === 'regiones' && hasPermiso(REGION_PERMISSIONS.CREAR)) || 
              (activeSubTab === 'comunas' && hasPermiso(COMUNA_PERMISSIONS.CREAR))) && (
              <Tooltip
                id="create-direccion-btn"
                content={`Crear ${activeSubTab === 'regiones' ? 'una nueva región' : 'una nueva comuna'} en el sistema`}
                place="top"
                variant="dark"
              >
                <button
                  onClick={handleCreate}
                  className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    <MdAdd size={18} />
                    <span className="hidden sm:inline">
                      Crear {activeSubTab === 'regiones' ? 'región' : 'comuna'}
                    </span>
                  </span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Subtabs para regiones y comunas */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleSubTabChange('regiones')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeSubTab === 'regiones'
                ? 'bg-[#4EB9FA] text-white shadow-lg'
                : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-[#4EB9FA]/10'
            }`}
          >
            <MdPublic size={18} />
            <span>Regiones</span>
          </button>
          <button
            onClick={() => handleSubTabChange('comunas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeSubTab === 'comunas'
                ? 'bg-[#4EB9FA] text-white shadow-lg'
                : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-[#4EB9FA]/10'
            }`}
          >
            <MdLocationCity size={18} />
            <span>Comunas</span>
          </button>
        </div>

        {/* Contenido principal */}
        <div className="space-y-4">
          {/* Estado de carga */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4EB9FA]"></div>
                <span className="text-gray-600">Cargando {activeSubTab}...</span>
              </div>
            </div>
          )}

          {/* Lista vacía o en desarrollo */}
          {!loading && (
            (activeSubTab === 'regiones' && regiones.length === 0) ||
            (activeSubTab === 'comunas' && comunas.length === 0)
          ) && (
            <div className="text-center py-12">
              {activeSubTab === 'regiones' ? (
                <MdPublic size={64} className="mx-auto text-gray-400 mb-4" />
              ) : (
                <MdLocationCity size={64} className="mx-auto text-gray-400 mb-4" />
              )}
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Gestión de {activeSubTab === 'regiones' ? 'Regiones' : 'Comunas'}
              </h3>
              <p className="text-gray-500 mb-4">
                Esta sección permitirá administrar las {activeSubTab} del sistema.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-blue-800 text-sm">
                  <strong>Próximamente:</strong><br />
                  {activeSubTab === 'regiones' ? (
                    <>
                      • Crear y editar regiones<br />
                      • Gestionar códigos de región<br />
                      • Administrar relaciones con comunas<br />
                      • Configurar límites geográficos
                    </>
                  ) : (
                    <>
                      • Crear y editar comunas<br />
                      • Asignar comunas a regiones<br />
                      • Gestionar códigos postales<br />
                      • Administrar información demográfica
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Lista de datos filtrados */}
          {!loading && filteredData.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">Código: {item.codigo}</p>
                      {activeSubTab === 'comunas' && item.region && (
                        <p className="text-sm text-gray-500 mt-1">Región: {item.region.nombre}</p>
                      )}
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
          {!loading && searchTerm && filteredData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No se encontraron {activeSubTab} que coincidan con "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales - TODO: Implementar cuando estén disponibles */}
      {/* 
      <CreateRegionPopup
        show={isModalOpen('createRegion')}
        setShow={(show) => show ? openModal('createRegion') : closeModal('createRegion')}
        onRegionCreated={handleRegionCreated}
      />

      <CreateComunaPopup
        show={isModalOpen('createComuna')}
        setShow={(show) => show ? openModal('createComuna') : closeModal('createComuna')}
        onComunaCreated={handleComunaCreated}
      />
      */}
    </>
  );
};

export default AdminDireccionesTab;