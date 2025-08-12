import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdSecurity, MdApi, MdDescription, MdCategory, MdRefresh, MdSearch, MdClear, MdViewList, MdViewModule } from 'react-icons/md';
import cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = cookies.get('jwt-auth');
      const response = await fetch(`${API_URL}/permiso`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener permisos');
      }

      const data = await response.json();
      setPermissions(data.data.permissions || []);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionsByCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = cookies.get('jwt-auth');
      const response = await fetch(`${API_URL}/permiso/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener permisos por categoría');
      }

      const data = await response.json();
      setPermissionsByCategory(data.data || {});
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar permisos por categoría');
    } finally {
      setLoading(false);
    }
  };

  const refreshPermissions = () => {
    fetchPermissions();
    fetchPermissionsByCategory();
  };

  useEffect(() => {
    refreshPermissions();
  }, []);

  return {
    permissions,
    permissionsByCategory,
    loading,
    error,
    refreshPermissions,
  };
};

const PermissionsView = () => {
  const { permissionsByCategory, loading, error, refreshPermissions } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'list' o 'cards'

  // Obtener todas las categorías disponibles
  const categories = Object.keys(permissionsByCategory);

  // Filtrar permisos basado en búsqueda y categoría
  const filteredPermissions = React.useMemo(() => {
    let filtered = { ...permissionsByCategory };

    // Filtrar por categoría seleccionada
    if (selectedCategory) {
      filtered = { [selectedCategory]: permissionsByCategory[selectedCategory] || [] };
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const newFiltered = {};
      
      Object.entries(filtered).forEach(([category, permissions]) => {
        const matchingPermissions = permissions.filter(permission =>
          permission.nombre?.toLowerCase().includes(searchLower) ||
          permission.descripcion?.toLowerCase().includes(searchLower) ||
          permission.ruta?.toLowerCase().includes(searchLower) ||
          permission.metodo?.toLowerCase().includes(searchLower)
        );
        
        if (matchingPermissions.length > 0) {
          newFiltered[category] = matchingPermissions;
        }
      });
      
      filtered = newFiltered;
    }

    return filtered;
  }, [permissionsByCategory, searchTerm, selectedCategory]);

  const getMethodColor = (method) => {
    const colors = {
      'GET': 'bg-green-100 text-green-800 border-green-200',
      'POST': 'bg-blue-100 text-blue-800 border-blue-200',
      'PATCH': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PUT': 'bg-orange-100 text-orange-800 border-orange-200',
      'DELETE': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[method] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  // Función para renderizar la vista de cards
  const renderCardsView = () => {
    return (
      <div className="space-y-6">
        {Object.entries(filteredPermissions).map(([category, permissions]) => (
          <div key={category} className="space-y-4">
            {/* Header de categoría */}
            <div className="flex items-center gap-3 mb-4">
              <MdCategory className="text-[#4EB9FA]" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
              <span className="bg-[#4EB9FA] text-white text-xs px-2 py-1 rounded-full">
                {permissions.length} permiso{permissions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Grid de cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  {/* Header del card */}
                  <div className="flex items-start gap-3 mb-3">
                    <MdSecurity className="text-[#4EB9FA] flex-shrink-0 mt-1" size={20} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm truncate" title={permission.nombre}>
                        {permission.nombre}
                      </h4>
                    </div>
                  </div>

                  {/* Descripción */}
                  {permission.descripcion && (
                    <div className="mb-3">
                      <p className="text-gray-600 text-xs line-clamp-2" title={permission.descripcion}>
                        {permission.descripcion}
                      </p>
                    </div>
                  )}

                  {/* Información de la API */}
                  {(permission.ruta || permission.metodo) && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MdApi className="text-gray-400" size={14} />
                        <span className="text-xs font-medium text-gray-700">Endpoint:</span>
                      </div>
                      
                      <div className="space-y-1">
                        {permission.metodo && (
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${getMethodColor(permission.metodo)}`}>
                            {permission.metodo}
                          </span>
                        )}
                        {permission.ruta && (
                          <div className="mt-1">
                            <code className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded border font-mono block truncate" title={permission.ruta}>
                              {permission.ruta}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Función para renderizar la vista de lista
  const renderListView = () => {
    return (
      <div className="space-y-6">
        {Object.entries(filteredPermissions).map(([category, permissions]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header de categoría */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
              <div className="flex items-center gap-3">
                <MdCategory className="text-[#4EB9FA]" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
                <span className="bg-[#4EB9FA] text-white text-xs px-2 py-1 rounded-full">
                  {permissions.length} permiso{permissions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Lista de permisos */}
            <div className="divide-y divide-gray-200">
              {permissions.map((permission) => (
                <div key={permission.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Información del permiso */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <MdSecurity className="text-[#4EB9FA] flex-shrink-0" size={20} />
                        <h4 className="font-semibold text-gray-800">{permission.nombre}</h4>
                      </div>
                      
                      {permission.descripcion && (
                        <div className="flex items-start gap-3">
                          <MdDescription className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                          <p className="text-gray-600 text-sm">{permission.descripcion}</p>
                        </div>
                      )}
                    </div>

                    {/* Información de la API */}
                    {(permission.ruta || permission.metodo) && (
                      <div className="lg:w-80 space-y-2">
                        <div className="flex items-center gap-2">
                          <MdApi className="text-gray-400" size={16} />
                          <span className="text-sm font-medium text-gray-700">Endpoint asociado:</span>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                          {permission.metodo && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded border ${getMethodColor(permission.metodo)}`}>
                              {permission.metodo}
                            </span>
                          )}
                          {permission.ruta && (
                            <code className="text-sm text-gray-700 bg-white px-2 py-1 rounded border font-mono">
                              {permission.ruta}
                            </code>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4EB9FA]"></div>
        <span className="ml-2 text-gray-600">Cargando permisos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <MdSecurity size={48} className="mx-auto mb-2" />
          <p>Error al cargar permisos: {error}</p>
        </div>
        <button
          onClick={refreshPermissions}
          className="bg-[#4EB9FA] hover:bg-[#3DA8E9] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <MdRefresh className="inline mr-2" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Búsqueda */}
          <div className="lg:w-80">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar permisos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4EB9FA] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por categoría */}
          <div className="lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4EB9FA] focus:border-transparent text-sm"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 lg:ml-auto">
            {/* Selector de vista */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#4EB9FA] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Vista de lista"
              >
                <MdViewList size={20} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-[#4EB9FA] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Vista de tarjetas"
              >
                <MdViewModule size={20} />
              </button>
            </div>
            
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Limpiar filtros"
            >
              <MdClear size={20} />
            </button>
            <button
              onClick={refreshPermissions}
              className="px-3 py-2 text-[#4EB9FA] hover:text-[#3DA8E9] border border-[#4EB9FA] rounded-lg hover:bg-[#4EB9FA]/10 transition-colors"
              title="Actualizar"
            >
              <MdRefresh size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido de permisos */}
      {Object.keys(filteredPermissions).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <MdSecurity size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No se encontraron permisos que coincidan con los filtros.</p>
        </div>
      ) : (
        viewMode === 'cards' ? renderCardsView() : renderListView()
      )}
    </div>
  );
};

export default PermissionsView;