import React, { useState, useMemo } from 'react';
import { 
  MdSearch, 
  MdFilterList, 
  MdRefresh,
  MdPerson
} from 'react-icons/md';
import BomberosCard from './BomberosCard';
import BomberosLoader from '@components/BomberosLoader';

/**
 * Componente para mostrar bomberos en una grilla adaptativa con filtros
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.bomberos - Lista de bomberos
 * @param {Object} props.compania - Información de la compañía
 * @param {Object} props.estadisticas - Estadísticas de bomberos
 * @param {boolean} props.loading - Estado de carga
 * @param {boolean} props.refreshing - Estado de refresco
 * @param {Function} props.onRefresh - Función para refrescar
 * @param {Function} props.onViewDetails - Función para ver detalles
 * @param {Array} props.rolesUnicos - Lista de roles únicos
 * @param {boolean} props.showCompanyInfo - Mostrar información de compañía en las cards
 * @returns {JSX.Element} Componente de grilla de bomberos
 */
const BomberosGrid = ({
  bomberos = [],
  compania,
  estadisticas,
  loading = false,
  refreshing = false,
  onViewDetails,
  rolesUnicos = [],
  showCompanyInfo = false
}) => {
  // Estados locales
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({
    soloActivos: undefined,
    rol: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);


  // Filtrar bomberos basado en búsqueda y filtros
  const bomberosFiltrados = useMemo(() => {
    let resultado = [...bomberos];

    // Filtro de búsqueda - busca en nombres, apellidos, run, correo y teléfono
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(bombero => {
        // Buscar en nombres
        const nombres = bombero.nombres?.join(' ').toLowerCase() || '';
        const apellidos = bombero.apellidos?.join(' ').toLowerCase() || '';
        const nombreCompleto = `${nombres} ${apellidos}`.trim();
        
        // Buscar en run
        const run = bombero.run || '';
        
        // Buscar en correo
        const email = bombero.email?.toLowerCase() || '';
        
        // Buscar en teléfono (de la ficha)
        const telefono = bombero.ficha?.telefono || '';
        
        return (
          nombreCompleto.includes(busquedaLower) ||
          nombres.includes(busquedaLower) ||
          apellidos.includes(busquedaLower) ||
          run.includes(busquedaLower) ||
          email.includes(busquedaLower) ||
          telefono.includes(busquedaLower)
        );
      });
    }

    // Filtros adicionales
    if (filtros.soloActivos !== undefined) {
      resultado = resultado.filter(bombero => bombero.activo === filtros.soloActivos);
    }

    if (filtros.rol) {
      resultado = resultado.filter(bombero => 
        bombero.roles.some(rol => rol.nombre === filtros.rol)
      );
    }

    return resultado;
  }, [bomberos, busqueda, filtros]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltros({
      soloActivos: undefined,
      rol: ''
    });
  };

  // Determinar columnas basado en el tamaño de pantalla - máximo 2 por fila
  const getGridCols = () => {
    const count = bomberosFiltrados.length;
    if (count === 0) return 'grid-cols-1';
    if (count === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
    // Para 3+ bomberos: usar todo el ancho disponible con máximo 2 columnas
    return 'grid-cols-1 md:grid-cols-2';
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <BomberosLoader size="lg" message="Cargando bomberos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, RUN, correo o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Controles */}
          <div className="flex items-center space-x-2">
            {/* Botón de filtros */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                mostrarFiltros 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MdFilterList className="w-4 h-4" />
              <span>Filtros</span>
            </button>

          </div>
        </div>

        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estado activo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filtros.soloActivos === undefined ? '' : filtros.soloActivos}
                  onChange={(e) => setFiltros(prev => ({
                    ...prev,
                    soloActivos: e.target.value === '' ? undefined : e.target.value === 'true'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="true">Habilitados</option>
                  <option value="false">Deshabilitados</option>
                </select>
              </div>


              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={filtros.rol}
                  onChange={(e) => setFiltros(prev => ({ ...prev, rol: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los roles</option>
                  {rolesUnicos.map(rol => (
                    <option key={rol} value={rol}>{rol}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botón limpiar filtros */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {bomberosFiltrados.length} de {bomberos.length} bomberos
          </p>
        </div>

        {/* Grilla de bomberos */}
        {bomberosFiltrados.length > 0 ? (
          <div className={`grid ${getGridCols()} gap-6 ${bomberosFiltrados.length >= 3 ? 'w-full' : ''}`}>
            {bomberosFiltrados.map((bombero) => (
              <BomberosCard
                key={bombero.id}
                bombero={bombero}
                onViewDetails={onViewDetails}
                showActions={true}
                showCompanyInfo={showCompanyInfo}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MdPerson className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron bomberos
            </h3>
            <p className="text-gray-600">
              {busqueda || Object.values(filtros).some(f => f !== undefined && f !== '')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay bomberos registrados en esta compañía'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BomberosGrid;
