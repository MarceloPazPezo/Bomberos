import React, { useEffect, useState } from 'react';
import { useAdmin } from '@context/AdminContext';
import { fetchRegiones, fetchComunas, createRegion, updateRegion, deleteRegion, createComuna, updateComuna, deleteComuna } from '@services/region.service';
import { useAdminModals } from '@components/admin/AdminModalsProvider';
import { showConfirmAlert } from '@helpers/fireAlert.js';
import { toast } from 'react-toastify';

// Componentes
import Tooltip from '@components/Tooltip';
import ModalPortal from '@components/ModalPortal';
import CreateRegionPopup from '@components/admin/popups/CreateRegionPopup';
import CreateComunaPopup from '@components/admin/popups/CreateComunaPopup';
import EditRegionPopup from '@components/admin/popups/EditRegionPopup';
import EditComunaPopup from '@components/admin/popups/EditComunaPopup';

// Iconos
import { 
  MdAdd, 
  MdRefresh, 
  MdLocationOn, 
  MdSearch, 
  MdClear,
  MdPublic,
  MdLocationCity,
  MdClose,
  MdEdit,
  MdDelete
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
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('regiones');
  const [showCreateRegion, setShowCreateRegion] = useState(false);
  const [showCreateComuna, setShowCreateComuna] = useState(false);
  const [showEditRegion, setShowEditRegion] = useState(false);
  const [showEditComuna, setShowEditComuna] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedComuna, setSelectedComuna] = useState(null);
  const [showRegionDetail, setShowRegionDetail] = useState(false);
  const [regionDetail, setRegionDetail] = useState(null);
  const [regionFilter, setRegionFilter] = useState('');

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
      const load = async () => {
        setLoading(true);
        try {
          console.debug('[Direcciones] solicitando regiones...');
          const regionesResp = await fetchRegiones({ page: 1, limit: 200 });
          console.debug('[Direcciones] regiones recibidas:', regionesResp);
          setRegiones(regionesResp?.regiones || []);
          console.debug('[Direcciones] solicitando comunas...');
          const comunasResp = await fetchComunas({ page: 1, limit: 500 });
          console.debug('[Direcciones] comunas recibidas:', comunasResp);
          setComunas(comunasResp?.comunas || comunasResp || []);
        } catch (e) {
          console.error('Error cargando regiones/comunas', e);
        } finally {
          setLoading(false);
        }
      };
      load();
  }, [hasPermiso]);

  // Obtener datos filtrados según la subpestaña activa
  const getFilteredData = () => {
    const data = activeSubTab === 'regiones' ? regiones : comunas;
    return data.filter(item => {
      // Filtro por búsqueda de texto
      const matchesSearch = item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por región (solo para comunas)
      if (activeSubTab === 'comunas' && selectedRegionFilter) {
        const regionId = parseInt(selectedRegionFilter);
        const matchesRegion = item.region?.id === regionId || item.idRegion === regionId;
        return matchesSearch && matchesRegion;
      }
      
      return matchesSearch;
    });
  };

  // Handlers
  const handleCreate = () => {
    if (activeSubTab === 'regiones') {
      setShowCreateRegion(true);
      return;
    }
    if (activeSubTab === 'comunas') {
      setShowCreateComuna(true);
      return;
    }
    const modalType = 'createComuna';
    openModal(modalType);
  };

  const handleRegionCreated = async (newRegion) => {
    // Recargar la lista de regiones
    try {
      const regionesResp = await fetchRegiones({ page: 1, limit: 200 });
      setRegiones(regionesResp?.regiones || []);
    } catch (error) {
      console.error('Error recargando regiones:', error);
    }
  };

  const handleComunaCreated = async (newComuna) => {
    // Recargar la lista de comunas
    try {
      const comunasResp = await fetchComunas({ page: 1, limit: 500 });
      setComunas(comunasResp?.comunas || comunasResp || []);
    } catch (error) {
      console.error('Error recargando comunas:', error);
    }
  };

  const handleEditRegion = (region) => {
    setSelectedRegion(region);
    setShowEditRegion(true);
  };

  const handleEditComuna = (comuna) => {
    setSelectedComuna(comuna);
    setShowEditComuna(true);
  };

  const handleRegionUpdated = async () => {
    try {
      const regionesResp = await fetchRegiones({ page: 1, limit: 200 });
      setRegiones(regionesResp?.regiones || []);
    } catch (error) {
      console.error('Error recargando regiones:', error);
    }
  };

  const handleComunaUpdated = async () => {
    try {
      const comunasResp = await fetchComunas({ page: 1, limit: 500 });
      setComunas(comunasResp?.comunas || comunasResp || []);
    } catch (error) {
      console.error('Error recargando comunas:', error);
    }
  };

  const handleDeleteRegion = async (region) => {
    // Validar si tiene comunas asociadas
    if (Array.isArray(region.comunas) && region.comunas.length > 0) {
      toast.error(`No se puede eliminar la región "${region.nombre}" porque tiene ${region.comunas.length} comuna(s) asociada(s). Elimine primero las comunas.`);
      return;
    }

    const result = await showConfirmAlert(
      '¿Eliminar Región?',
      `¿Estás seguro de que quieres eliminar la región "${region.nombre}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      try {
        await deleteRegion(region.id);
        toast.success(`Región "${region.nombre}" eliminada exitosamente`);
        // Recargar la lista
        const regionesResp = await fetchRegiones({ page: 1, limit: 200 });
        setRegiones(regionesResp?.regiones || []);
      } catch (error) {
        console.error('Error al eliminar región:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar la región';
        toast.error(errorMessage);
      }
    }
  };

  const handleDeleteComuna = async (comuna) => {
    const result = await showConfirmAlert(
      '¿Eliminar Comuna?',
      `¿Estás seguro de que quieres eliminar la comuna "${comuna.nombre}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      try {
        await deleteComuna(comuna.id);
        toast.success(`Comuna "${comuna.nombre}" eliminada exitosamente`);
        
        // Recargar la lista de comunas
        const comunasResp = await fetchComunas({ page: 1, limit: 500 });
        setComunas(comunasResp?.comunas || comunasResp || []);
        
        // Actualizar las regiones para reflejar que la comuna ya no existe
        setRegiones(prevRegiones => 
          prevRegiones.map(region => {
            // Si la región tiene comunas asociadas, filtrar la comuna eliminada
            if (Array.isArray(region.comunas)) {
              return {
                ...region,
                comunas: region.comunas.filter(c => c.id !== comuna.id)
              };
            }
            return region;
          })
        );
      } catch (error) {
        console.error('Error al eliminar comuna:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar la comuna';
        toast.error(errorMessage);
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'regiones') {
        console.debug('[Direcciones] refresh regiones...', { searchTerm });
        const regionesResp = await fetchRegiones({ search: searchTerm || undefined, page: 1, limit: 200 });
        console.debug('[Direcciones] refresh regiones response:', regionesResp);
        setRegiones(regionesResp?.regiones || []);
      } else {
        console.debug('[Direcciones] refresh comunas...', { searchTerm });
        const comunasResp = await fetchComunas({ search: searchTerm || undefined, page: 1, limit: 500 });
        console.debug('[Direcciones] refresh comunas response:', comunasResp);
        setComunas(comunasResp?.comunas || comunasResp || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleSubTabChange = (subTab) => {
    setActiveSubTab(subTab);
    setSearchTerm(''); // Limpiar búsqueda al cambiar de subtab
    setSelectedRegionFilter(''); // Limpiar filtro de región al cambiar de subtab
  };

  const clearRegionFilter = () => {
    setSelectedRegionFilter('');
  };

  const filteredData = getFilteredData();

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-4">
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

            {/* Filtro por región (solo para comunas) */}
            {activeSubTab === 'comunas' && regiones.length > 0 && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdPublic className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedRegionFilter}
                  onChange={(e) => setSelectedRegionFilter(e.target.value)}
                  className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none cursor-pointer"
                >
                  <option value="">Todas las regiones</option>
                  {regiones.map((region) => (
                    <option key={region.id} value={region.id.toString()}>
                      {region.nombre}
                    </option>
                  ))}
                </select>
                {selectedRegionFilter && (
                  <button
                    onClick={clearRegionFilter}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <MdClear className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {/* Estadísticas */}
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Total: {activeSubTab === 'regiones' ? regiones.length : comunas.length} {activeSubTab}
              {(searchTerm || selectedRegionFilter) && ` | Filtradas: ${filteredData.length}`}
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
            {((activeSubTab === 'regiones' && hasPermiso('region:admin')) || 
              (activeSubTab === 'comunas' && hasPermiso('comuna:admin'))) && (
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

        {/* Tabs de filtro con estilo border-bottom */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleSubTabChange('regiones')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeSubTab === 'regiones'
                  ? 'border-[#4EB9FA] text-[#4EB9FA]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MdPublic size={18} />
              <span>Regiones</span>
            </button>
            <button
              onClick={() => handleSubTabChange('comunas')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeSubTab === 'comunas'
                  ? 'border-[#4EB9FA] text-[#4EB9FA]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MdLocationCity size={18} />
              <span>Comunas</span>
            </button>
          </nav>
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
                      {activeSubTab === 'comunas' ? (
                        <>
                          {item.region && (
                        <p className="text-sm text-gray-500 mt-1">Región: {item.region.nombre}</p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 mt-1">Comunas asignadas: {Array.isArray(item.comunas) ? item.comunas.length : 0}</p>
                          {Array.isArray(item.comunas) && item.comunas.length > 0 && (
                            <ul className="mt-2 grid grid-cols-2 gap-1">
                              {item.comunas.slice(0, 10).map((c) => (
                                <li key={c.id} className="text-xs text-gray-700 flex items-center gap-2">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4EB9FA]"></span>
                                  {c.nombre}
                                </li>
                              ))}
                              {item.comunas.length > 10 && (
                                <li className="text-xs text-gray-500">+{item.comunas.length - 10} más…</li>
                              )}
                            </ul>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {activeSubTab === 'regiones' && (
                        <>
                          <Tooltip
                            id={`view-region-${item.id}`}
                            content="Ver detalle de región"
                            place="top"
                            variant="dark"
                          >
                            <button
                              className="px-3 py-1.5 text-sm rounded-lg border border-[#4EB9FA] text-[#4EB9FA] hover:bg-[#4EB9FA]/10 transition-colors"
                              onClick={() => { setRegionDetail(item); setShowRegionDetail(true); }}
                            >
                              Ver detalle
                            </button>
                          </Tooltip>
                          {hasPermiso('region:admin') && (
                            <>
                              <Tooltip
                                id={`edit-region-${item.id}`}
                                content="Editar región"
                                place="top"
                                variant="dark"
                              >
                                <button
                                  className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors"
                                  onClick={() => handleEditRegion(item)}
                                  title="Editar región"
                                >
                                  <MdEdit size={18} />
                                </button>
                              </Tooltip>
                              <Tooltip
                                id={`delete-region-${item.id}`}
                                content="Eliminar región"
                                place="top"
                                variant="dark"
                              >
                                <button
                                  className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-colors"
                                  onClick={() => handleDeleteRegion(item)}
                                  title="Eliminar región"
                                >
                                  <MdDelete size={18} />
                                </button>
                              </Tooltip>
                            </>
                          )}
                        </>
                      )}
                      {activeSubTab === 'comunas' && hasPermiso('comuna:admin') && (
                        <>
                          <Tooltip
                            id={`edit-comuna-${item.id}`}
                            content="Editar comuna"
                            place="top"
                            variant="dark"
                          >
                            <button
                              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors"
                              onClick={() => handleEditComuna(item)}
                              title="Editar comuna"
                            >
                              <MdEdit size={18} />
                            </button>
                          </Tooltip>
                          <Tooltip
                            id={`delete-comuna-${item.id}`}
                            content="Eliminar comuna"
                            place="top"
                            variant="dark"
                          >
                            <button
                              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-colors"
                              onClick={() => handleDeleteComuna(item)}
                              title="Eliminar comuna"
                            >
                              <MdDelete size={18} />
                            </button>
                          </Tooltip>
                        </>
                      )}
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

      {/* Modal Crear Región */}
      <CreateRegionPopup
        show={showCreateRegion}
        setShow={setShowCreateRegion}
        onRegionCreated={handleRegionCreated}
      />

      {/* Modal Crear Comuna */}
      <CreateComunaPopup
        show={showCreateComuna}
        setShow={setShowCreateComuna}
        onComunaCreated={handleComunaCreated}
      />

      {/* Modal Editar Región */}
      <EditRegionPopup
        show={showEditRegion}
        setShow={(show) => {
          setShowEditRegion(show);
          if (!show) setSelectedRegion(null);
        }}
        data={selectedRegion}
        onRegionUpdated={handleRegionUpdated}
      />

      {/* Modal Editar Comuna */}
      <EditComunaPopup
        show={showEditComuna}
        setShow={(show) => {
          setShowEditComuna(show);
          if (!show) setSelectedComuna(null);
        }}
        data={selectedComuna}
        onComunaUpdated={handleComunaUpdated}
      />

      {/* Modal Detalle Región */}
      {showRegionDetail && regionDetail && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Header con gradiente similar a CreateBomberoPopup */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <MdPublic className="w-6 h-6 text-[#3A9BD9]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {regionDetail.nombre}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {Array.isArray(regionDetail.comunas) ? regionDetail.comunas.length : 0} comunas asociadas
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRegionDetail(false);
                  setRegionFilter('');
                }}
                className="p-3 text-white hover:bg-red-500 hover:bg-opacity-80 rounded-lg transition-colors"
              >
                <MdClose className="w-6 h-6 text-red-300 hover:text-white" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[65vh] bg-gray-50/50">
              {/* Buscador */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    placeholder="Buscar comuna..."
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4EB9FA] focus:border-[#4EB9FA] text-sm bg-white"
                  />
                  {regionFilter && (
                    <button
                      onClick={() => setRegionFilter('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <MdClear className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de comunas mejorada */}
              {Array.isArray(regionDetail.comunas) && regionDetail.comunas.length > 0 ? (
                <div className="space-y-2">
                  {regionDetail.comunas
                    .filter(c => c.nombre.toLowerCase().includes(regionFilter.toLowerCase()))
                    .map((c, idx) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-[#4EB9FA] hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] flex items-center justify-center text-white font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{c.nombre}</p>
                        </div>
                        <MdLocationCity className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  {regionFilter && regionDetail.comunas.filter(c => c.nombre.toLowerCase().includes(regionFilter.toLowerCase())).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MdSearch className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No se encontraron comunas que coincidan con "{regionFilter}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MdLocationCity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg font-medium">Sin comunas asociadas</p>
                  <p className="text-gray-400 text-sm mt-1">Esta región no tiene comunas asignadas</p>
                </div>
              )}
            </div>

            {/* Footer con botón de cerrar mejorado */}
            <div className="flex justify-end px-6 py-4 bg-white border-t border-gray-200 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setShowRegionDetail(false);
                  setRegionFilter('');
                }}
                className="flex items-center space-x-2 px-4 py-2.5 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 font-medium"
              >
                <MdClose className="w-4 h-4 text-red-500" />
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

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