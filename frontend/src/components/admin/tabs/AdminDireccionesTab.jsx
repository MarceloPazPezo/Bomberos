import React, { useEffect, useState } from 'react';
import { useAdmin } from '@context/AdminContext';
import { fetchRegiones, fetchComunas, createRegion, updateRegion, deleteRegion } from '@services/region.service';
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
  MdLocationCity,
  MdClose,
  MdSave
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
  const [showCreateRegion, setShowCreateRegion] = useState(false);
  const [regionNombre, setRegionNombre] = useState('');
  const [saving, setSaving] = useState(false);
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
    return data.filter(item =>
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handlers
  const handleCreate = () => {
    if (activeSubTab === 'regiones') {
      setRegionNombre('');
      setShowCreateRegion(true);
      return;
    }
    const modalType = 'createComuna';
    openModal(modalType);
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
                      {/* Botones de acción aquí */}
                      {activeSubTab === 'regiones' && (
                        <button
                          className="px-3 py-1.5 text-sm rounded-lg border border-[#4EB9FA] text-[#4EB9FA] hover:bg-[#4EB9FA]/10"
                          onClick={() => { setRegionDetail(item); setShowRegionDetail(true); }}
                          title="Ver detalle de región"
                        >
                          Ver detalle
                        </button>
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

      {/* Modal Crear Región (ligero) */}
      {showCreateRegion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>!saving && setShowCreateRegion(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Crear región</h3>
              <button className="p-2 rounded hover:bg-gray-100" onClick={()=>!saving && setShowCreateRegion(false)}>
                <MdClose />
              </button>
            </div>
            <label className="block text-sm text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={regionNombre}
              onChange={(e)=>setRegionNombre(e.target.value)}
              placeholder="Ej: Región del Biobío"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded-lg border" onClick={()=>!saving && setShowCreateRegion(false)} disabled={saving}>Cancelar</button>
              <button
                className="px-4 py-2 rounded-lg bg-[#2C3E50] hover:bg-[#34495E] text-white flex items-center gap-2 disabled:opacity-60"
                disabled={saving || !regionNombre.trim()}
                onClick={async()=>{
                  setSaving(true);
                  try {
                    await createRegion({ nombre: regionNombre.trim() });
                    const regionesResp = await fetchRegiones({ page: 1, limit: 200 });
                    setRegiones(regionesResp?.regiones || []);
                    setShowCreateRegion(false);
                  } catch (e) {
                    console.error('Error creando región', e);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <MdSave /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Región */}
      {showRegionDetail && regionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setShowRegionDetail(false)} />
          <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 leading-tight">{regionDetail.nombre}</h3>
                  <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200 text-xs font-medium">
                      {Array.isArray(regionDetail.comunas) ? regionDetail.comunas.length : 0} comunas
                    </span>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 border border-transparent" onClick={()=>setShowRegionDetail(false)}>
                  <MdClose />
                </button>
              </div>
              <div className="mt-4">
                <input
                  value={regionFilter}
                  onChange={(e)=>setRegionFilter(e.target.value)}
                  placeholder="Buscar comuna..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="p-5 max-h-[65vh] overflow-auto bg-white">
              {Array.isArray(regionDetail.comunas) && regionDetail.comunas.length > 0 ? (
                <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-200">
                  {regionDetail.comunas
                    .filter(c => c.nombre.toLowerCase().includes(regionFilter.toLowerCase()))
                    .map((c, idx) => (
                      <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4EB9FA]" />
                          <span className="text-sm text-gray-800 truncate">{idx + 1}. {c.nombre}</span>
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">Sin comunas asociadas</div>
              )}
            </div>
          </div>
        </div>
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