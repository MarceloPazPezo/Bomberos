import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { MdSecurity, MdApi, MdDescription, MdCategory, MdRefresh, MdSearch, MdClear, MdExpandMore, MdExpandLess } from 'react-icons/md';
import BomberosLoader from '@components/BomberosLoader';
import Tooltip from '@components/Tooltip';
import usePermisos from '@hooks/permisos/usePermisos';
import Select from 'react-select';

const PermisosView = () => {
  const { permisos, permisosByCategory, loading, error, initialized, refreshPermisos } = usePermisos();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());

  // Cargar permisos cuando se monta el componente (solo si no están inicializados)
  useEffect(() => {
    if (!initialized && !loading) {
      console.log('PermisosView: Cargando permisos por primera vez...');
      refreshPermisos(true);
    }
  }, []); // Sin dependencias para evitar bucles

  // Obtener todas las categorías disponibles
  const categories = Object.keys(permisosByCategory || {});

  // Preparar opciones para el select de categorías
  const categoryOptions = useMemo(() => [
    { value: '', label: 'Todas las categorías' },
    ...categories.map(category => ({
      value: category,
      label: category
    }))
  ], [categories]);

  // Valor seleccionado para el select
  const selectedCategoryOption = useMemo(() => {
    return categoryOptions.find(opt => opt.value === selectedCategory) || categoryOptions[0];
  }, [selectedCategory, categoryOptions]);

  // Estilos para el Select (igual que en crear parte)
  const selectStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#4EB9FA' : '#D1D5DB',
      borderWidth: '2px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(78, 185, 250, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#4EB9FA',
      },
      minHeight: '44px',
      borderRadius: '10px',
      fontSize: '0.9rem',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 25,
      borderRadius: '10px',
      overflow: 'hidden',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '260px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#4EB9FA'
        : state.isFocused
          ? '#E0F2FE'
          : 'white',
      color: state.isSelected ? '#FFFFFF' : '#1F2937',
      fontSize: '0.9rem',
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '0.9rem',
      color: '#9CA3AF',
    }),
    input: (base) => ({
      ...base,
      fontSize: '0.9rem',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '0.9rem',
      color: '#1F2937',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }), []);

  const selectMenuPortalTarget = typeof window !== 'undefined' ? document.body : null;

  // Inicializar categorías colapsadas cuando cambien las categorías
  useEffect(() => {
    if (categories.length > 0 && collapsedCategories.size === 0) {
      setCollapsedCategories(new Set(categories));
    }
  }, [categories.length]);

  // Filtrar permisos basado en búsqueda y categoría
  const filteredPermisos = useMemo(() => {
    // Asegurar que permisosByCategory sea un objeto válido
    const validPermisosByCategory = permisosByCategory && typeof permisosByCategory === 'object' ? permisosByCategory : {};
    let filtered = { ...validPermisosByCategory };

    // Filtrar por categoría seleccionada
    if (selectedCategory) {
      filtered = { [selectedCategory]: validPermisosByCategory[selectedCategory] || [] };
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const newFiltered = {};
      
      Object.entries(filtered).forEach(([category, permisos]) => {
        // Validar que permisos sea un array
        if (Array.isArray(permisos)) {
          const matchingPermisos = permisos.filter(permiso =>
            permiso.nombre?.toLowerCase().includes(searchLower) ||
            permiso.descripcion?.toLowerCase().includes(searchLower) ||
            permiso.ruta?.toLowerCase().includes(searchLower) ||
            permiso.metodo?.toLowerCase().includes(searchLower)
          );
          
          if (matchingPermisos.length > 0) {
            newFiltered[category] = matchingPermisos;
          }
        }
      });
      
      filtered = newFiltered;
    }

    return filtered;
  }, [permisosByCategory, searchTerm, selectedCategory]);

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

  // Función para alternar el colapso de una categoría
  const toggleCategoryCollapse = (category) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  // Función para colapsar/expandir todas las categorías
  const toggleAllCategories = () => {
    const allCategories = Object.keys(filteredPermisos);
    if (collapsedCategories.size === allCategories.length) {
      // Si todas están colapsadas, expandir todas
      setCollapsedCategories(new Set());
    } else {
      // Si alguna está expandida, colapsar todas
      setCollapsedCategories(new Set(allCategories));
    }
  };

  // Función para renderizar la vista de lista
  const renderListView = () => {
    return (
      <div className="space-y-6">
        {Object.entries(filteredPermisos).map(([category, permisos]) => {
          const isCollapsed = collapsedCategories.has(category);
          
          return (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header de categoría */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MdCategory className="text-[#4EB9FA]" size={24} />
                    <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
                    <span className="bg-[#4EB9FA] text-white text-xs px-2 py-1 rounded-full">
                      {permisos.length} permiso{permisos.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Botón para colapsar/expandir */}
                  <Tooltip
                    id={`category-toggle-${category}`}
                    content={isCollapsed ? 'Expandir categoría' : 'Contraer categoría'}
                    place="left"
                  >
                    <button
                      onClick={() => toggleCategoryCollapse(category)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {isCollapsed ? (
                        <MdExpandMore className="text-gray-600" size={20} />
                      ) : (
                        <MdExpandLess className="text-gray-600" size={20} />
                      )}
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Lista de permisos (solo se muestra si no está colapsada) */}
              {!isCollapsed && (
                <div className="divide-y divide-gray-200">
                  {permisos.map((permiso) => (
                    <div key={permiso.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Información del permiso */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <MdSecurity className="text-[#4EB9FA] flex-shrink-0" size={20} />
                            <h4 className="font-semibold text-gray-800">{permiso.nombre}</h4>
                          </div>
                          
                          {permiso.descripcion && (
                            <div className="flex items-start gap-3">
                              <MdDescription className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                              <p className="text-gray-600 text-sm">{permiso.descripcion}</p>
                            </div>
                          )}
                        </div>

                        {/* Información de la API */}
                        {(permiso.ruta || permiso.metodo) && (
                          <div className="lg:w-80 space-y-2">
                            <div className="flex items-center gap-2">
                              <MdApi className="text-gray-400" size={16} />
                              <span className="text-sm font-medium text-gray-700">Endpoint asociado:</span>
                            </div>
                            
                            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                              {permiso.metodo && (
                                <span className={`px-2 py-1 text-xs font-semibold rounded border ${getMethodColor(permiso.metodo)}`}>
                                  {permiso.metodo}
                                </span>
                              )}
                              {permiso.ruta && (
                                <code className="text-sm text-gray-700 bg-white px-2 py-1 rounded border font-mono">
                                  {permiso.ruta}
                                </code>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <BomberosLoader size="md" message="Cargando permisos..." />
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
          onClick={refreshPermisos}
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
            <Select
              inputId="categoria-filter"
              isSearchable
              isClearable={false}
              value={selectedCategoryOption}
              options={categoryOptions}
              onChange={(option) => setSelectedCategory(option?.value || '')}
              placeholder="Seleccionar categoría..."
              styles={selectStyles}
              classNamePrefix="categoria-select"
              menuPortalTarget={selectMenuPortalTarget}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 lg:ml-auto">
            {Object.keys(filteredPermisos).length > 1 && (
              <Tooltip
                id="toggle-all-categories"
                content={collapsedCategories.size === Object.keys(filteredPermisos).length ? "Expandir todas" : "Contraer todas"}
                place="bottom"
              >
                <button
                  onClick={toggleAllCategories}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {collapsedCategories.size === Object.keys(filteredPermisos).length ? (
                    <MdExpandMore size={20} />
                  ) : (
                    <MdExpandLess size={20} />
                  )}
                </button>
              </Tooltip>
            )}
            <Tooltip
              id="clear-filters"
              content="Limpiar filtros"
              place="bottom"
            >
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MdClear size={20} />
              </button>
            </Tooltip>
            <Tooltip
              id="refresh-permisos"
              content="Actualizar"
              place="bottom"
            >
              <button
                onClick={refreshPermisos}
                className="px-3 py-2 text-[#4EB9FA] hover:text-[#3DA8E9] border border-[#4EB9FA] rounded-lg hover:bg-[#4EB9FA]/10 transition-colors"
              >
                <MdRefresh size={20} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Estadísticas de permisos */}
        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
          <span className="flex items-center space-x-2">
            <MdSecurity className="h-4 w-4 text-[#4EB9FA]" />
            <span>Total: <strong>{permisos.length}</strong> permisos</span>
          </span>
          <span className="flex items-center space-x-2">
            <MdCategory className="h-4 w-4 text-[#4EB9FA]" />
            <span>Categorías: <strong>{categories.length}</strong></span>
          </span>
          {Object.keys(filteredPermisos).length !== categories.length && (
            <span className="flex items-center space-x-2">
              <MdSearch className="h-4 w-4 text-green-600" />
              <span>Filtrados: <strong>{Object.values(filteredPermisos).reduce((acc, permisos) => acc + permisos.length, 0)}</strong></span>
            </span>
          )}
        </div>
      </div>

      {/* Contenido de permisos */}
      {Object.keys(filteredPermisos).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <MdSecurity size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No se encontraron permisos que coincidan con los filtros.</p>
        </div>
      ) : (
        renderListView()
      )}
    </div>
  );
};

export default PermisosView;