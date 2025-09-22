import React from 'react';
import { useDisponibilidad } from '@context/DisponibilidadContext';
import { 
  FaUserCheck, 
  FaUserTimes, 
  FaClock, 
  FaFilter,
  FaTimes,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from 'react-icons/fa';
import LoadingPage from '@components/LoadingPage';
import DateTimePicker from '@components/DateTimePicker';
import dateHelper from '@helpers/dateHelper';

/**
 * Componente para ver el historial de disponibilidades
 * Incluye filtros avanzados y paginación
 */
const DisponibilidadHistorialTab = () => {
  const {
    // Datos
    disponibilidades,
    loading,
    error,
    
    // Estados de filtros
    filtros,
    setFiltros,
    paginaActual,
    setPaginaActual,
    registrosPorPagina,
    
    // Funciones
    getBomberoInfo
  } = useDisponibilidad();

  // Función para formatear fechas
  const formatFecha = (fecha) => {
    try {
      return dateHelper.format(dateHelper.toSantiago(fecha), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para verificar si una disponibilidad está activa
  const estaDisponible = (disponibilidad) => {
    return !disponibilidad.fechaTermino || new Date(disponibilidad.fechaTermino) > new Date();
  };

  // Función para filtrar disponibilidades según los filtros activos
  const filtrarDisponibilidades = () => {
    if (!Array.isArray(disponibilidades)) return [];

    return disponibilidades.filter(disponibilidad => {
      // Filtro por bombero
      if (filtros.bombero && disponibilidad.idBombero.toString() !== filtros.bombero) {
        return false;
      }

      // Filtro por estado
      if (filtros.estado === 'disponible' && !estaDisponible(disponibilidad)) {
        return false;
      }
      if (filtros.estado === 'finalizado' && estaDisponible(disponibilidad)) {
        return false;
      }

      // Filtro por fecha desde
      if (filtros.fechaDesde) {
        try {
          const fechaInicio = new Date(disponibilidad.fechaInicio);
          const fechaDesde = new Date(filtros.fechaDesde);
          if (fechaInicio < fechaDesde) {
            return false;
          }
        } catch (error) {
          return false;
        }
      }

      // Filtro por fecha hasta
      if (filtros.fechaHasta) {
        try {
          const fechaInicio = new Date(disponibilidad.fechaInicio);
          const fechaHasta = new Date(filtros.fechaHasta);
          fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
          if (fechaInicio > fechaHasta) {
            return false;
          }
        } catch (error) {
          return false;
        }
      }

      // Filtro por búsqueda de texto
      if (filtros.busqueda) {
        const textoBusqueda = filtros.busqueda.toLowerCase();
        const nombreBombero = getBomberoInfo(disponibilidad.idBombero, disponibilidad).toLowerCase();
        
        // Buscar en nombre del bombero
        if (nombreBombero.includes(textoBusqueda)) {
          return true;
        }

        // Si tiene información del bombero en la disponibilidad, buscar en RUN
        if (disponibilidad.bombero?.run) {
          const run = disponibilidad.bombero.run.toString().toLowerCase();
          if (run.includes(textoBusqueda)) {
            return true;
          }
        }

        return false;
      }

      return true;
    });
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      bombero: '',
      fechaDesde: '',
      fechaHasta: '',
      estado: 'todos',
      busqueda: ''
    });
    setPaginaActual(1); // Resetear a la primera página
  };

  // Funciones de paginación
  const obtenerRegistrosPaginados = (registrosFiltrados) => {
    const indiceInicio = (paginaActual - 1) * registrosPorPagina;
    const indiceFin = indiceInicio + registrosPorPagina;
    return registrosFiltrados.slice(indiceInicio, indiceFin);
  };

  const calcularTotalPaginas = (totalRegistros) => {
    return Math.ceil(totalRegistros / registrosPorPagina);
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    // Scroll suave hacia arriba cuando se cambia de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generarNumerosPaginas = (paginaActual, totalPaginas) => {
    const paginas = [];
    const maxPaginasVisibles = 5;

    if (totalPaginas <= maxPaginasVisibles) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica más compleja para muchas páginas
      if (paginaActual <= 3) {
        // Al inicio
        paginas.push(1, 2, 3, 4, '...', totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        // Al final
        paginas.push(1, '...', totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas);
      } else {
        // En el medio
        paginas.push(1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas);
      }
    }

    return paginas;
  };

  // Obtener lista única de bomberos para el filtro
  const getBomberosParaFiltro = () => {
    const bomberosUnicos = new Map();

    disponibilidades.forEach(disponibilidad => {
      const bomberoId = disponibilidad.idBombero;
      
      if (!bomberosUnicos.has(bomberoId)) {
        let bomberoInfo;
        
        // Intentar obtener información del bombero
        if (disponibilidad.bombero) {
          bomberoInfo = {
            id: bomberoId,
            nombre: `${disponibilidad.bombero.nombres} ${disponibilidad.bombero.apellidos}`,
            run: disponibilidad.bombero.run
          };
        } else {
          // Fallback usando la función getBomberoInfo
          bomberoInfo = {
            id: bomberoId,
            nombre: getBomberoInfo(bomberoId, disponibilidad),
            run: null
          };
        }
        
        bomberosUnicos.set(bomberoId, bomberoInfo);
      }
    });

    return Array.from(bomberosUnicos.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  };

  // Efecto para resetear página cuando cambien los filtros
  React.useEffect(() => {
    setPaginaActual(1);
  }, [filtros, setPaginaActual]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Panel de Filtros compacto */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaFilter className="h-4 w-4" />
            Filtros
          </h2>
          <button
            onClick={limpiarFiltros}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="h-3 w-3" />
            Limpiar
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {/* Filtro por Bombero - Más ancho */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Bombero
            </label>
            <select
              value={filtros.bombero}
              onChange={(e) => setFiltros(prev => ({ ...prev, bombero: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Todos</option>
              {getBomberosParaFiltro().map(bombero => (
                <option key={bombero.id} value={bombero.id}>
                  {bombero.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado - Ancho justo */}
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="disponible">Disponible</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          {/* Filtro Fecha Desde - Usando DateTimePicker */}
          <div className="w-40">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Desde
            </label>
            <DateTimePicker
              value={filtros.fechaDesde ? new Date(filtros.fechaDesde) : null}
              onChange={(date) => {
                const fechaStr = date ? dateHelper.format(dateHelper.fromJSDate(date), 'yyyy-MM-dd') : '';
                setFiltros(prev => ({ ...prev, fechaDesde: fechaStr }));
              }}
              placeholder="Fecha desde"
              maxDate={new Date()}
              className="w-full text-sm"
            />
          </div>

          {/* Filtro Fecha Hasta - Usando DateTimePicker */}
          <div className="w-40">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <DateTimePicker
              value={filtros.fechaHasta ? new Date(filtros.fechaHasta) : null}
              onChange={(date) => {
                const fechaStr = date ? dateHelper.format(dateHelper.fromJSDate(date), 'yyyy-MM-dd') : '';
                setFiltros(prev => ({ ...prev, fechaHasta: fechaStr }));
              }}
              placeholder="Fecha hasta"
              minDate={filtros.fechaDesde ? new Date(filtros.fechaDesde) : null}
              maxDate={new Date()}
              className="w-full text-sm"
            />
          </div>

          {/* Búsqueda por Texto - Ancho medio */}
          <div className="w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Búsqueda
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nombre o RUN..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                className="w-full p-2 pl-7 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <FaSearch className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Historial Filtrada */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Historial de Disponibilidades
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {filtrarDisponibilidades().length} registros
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bombero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Término
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                const registrosFiltrados = filtrarDisponibilidades()
                  .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
                const registrosPaginados = obtenerRegistrosPaginados(registrosFiltrados);

                return registrosPaginados.map((disponibilidad) => (
                  <tr key={disponibilidad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getBomberoInfo(disponibilidad.idBombero, disponibilidad)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {estaDisponible(disponibilidad) ? (
                          <>
                            <FaUserCheck className="text-green-600" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              DISPONIBLE
                            </span>
                          </>
                        ) : (
                          <>
                            <FaUserTimes className="text-gray-600" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              FINALIZADO
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFecha(disponibilidad.fechaInicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {disponibilidad.fechaTermino ? formatFecha(disponibilidad.fechaTermino) : 'En curso'}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>

          {filtrarDisponibilidades().length === 0 && (
            <div className="text-center py-12">
              <FaClock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No se encontraron registros
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay registros que coincidan con los filtros aplicados.
              </p>
            </div>
          )}
        </div>

        {/* Componente de Paginación */}
        {(() => {
          const registrosFiltrados = filtrarDisponibilidades();
          const totalPaginas = calcularTotalPaginas(registrosFiltrados.length);

          if (totalPaginas <= 1) return null; // No mostrar paginación si hay 1 página o menos

          const numerosPaginas = generarNumerosPaginas(paginaActual, totalPaginas);
          const indiceInicio = (paginaActual - 1) * registrosPorPagina + 1;
          const indiceFin = Math.min(paginaActual * registrosPorPagina, registrosFiltrados.length);

          return (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                {/* Paginación móvil */}
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>

                {/* Paginación desktop */}
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">{indiceInicio}</span>
                      {' '}a{' '}
                      <span className="font-medium">{indiceFin}</span>
                      {' '}de{' '}
                      <span className="font-medium">{registrosFiltrados.length}</span>
                      {' '}resultados
                    </p>
                  </div>

                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      {/* Botón primera página */}
                      <button
                        onClick={() => cambiarPagina(1)}
                        disabled={paginaActual === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Primera página"
                      >
                        <FaAngleDoubleLeft className="h-3 w-3" />
                      </button>

                      {/* Botón página anterior */}
                      <button
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Página anterior"
                      >
                        <FaChevronLeft className="h-3 w-3" />
                      </button>

                      {/* Números de página */}
                      {numerosPaginas.map((numero, index) => (
                        numero === '...' ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={numero}
                            onClick={() => cambiarPagina(numero)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${numero === paginaActual
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            {numero}
                          </button>
                        )
                      ))}

                      {/* Botón página siguiente */}
                      <button
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Página siguiente"
                      >
                        <FaChevronRight className="h-3 w-3" />
                      </button>

                      {/* Botón última página */}
                      <button
                        onClick={() => cambiarPagina(totalPaginas)}
                        disabled={paginaActual === totalPaginas}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Última página"
                      >
                        <FaAngleDoubleRight className="h-3 w-3" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default DisponibilidadHistorialTab;