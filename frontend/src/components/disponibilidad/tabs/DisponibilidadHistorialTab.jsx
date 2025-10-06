import React, { useState, useEffect, useMemo } from 'react';
import { useDisponibilidad } from '@context/DisponibilidadContext';
import { 
  FaUserCheck, 
  FaUserTimes, 
  FaClock, 
  FaFilter,
  FaTimes
} from 'react-icons/fa';
import LoadingPage from '@components/LoadingPage';
import DateTimePicker from '@components/DateTimePicker';
import PrimeTableBasic from '@components/PrimeTableBasic';
import dateHelper from '@helpers/dateHelper';

/**
 * Componente para ver el historial de disponibilidades
 * Incluye filtros avanzados y paginación con PrimeTableBasic
 */
const DisponibilidadHistorialTab = () => {
  const {
    // Datos
    miHistorial,
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

  // Estado para forzar actualización de duraciones en tiempo real
  const [refreshTime, setRefreshTime] = useState(Date.now());

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

  // Función para formatear la información del bombero en el formato RUN NombreCompleto
  const formatearBomberoInfo = (disponibilidad) => {
    if (disponibilidad.bombero) {
      const { nombres, apellidos, run } = disponibilidad.bombero;
      const nombreCompleto = `${nombres} ${apellidos}`;
      if (run) {
        return (
          <span>
            <span className="font-bold">{run}</span> {nombreCompleto}
          </span>
        );
      }
      return nombreCompleto;
    }
    
    // Fallback si no hay información del bombero
    const nombreFallback = getBomberoInfo(disponibilidad.idBombero, disponibilidad);
    return nombreFallback;
  };

  // Función para calcular la duración del turno
  const calcularDuracionTurno = (fechaInicio, fechaTermino, estaDisponible) => {
    try {
      const inicio = dateHelper.toSantiago(fechaInicio);
      let fin;
      let esEstimada = false;
      
      if (fechaTermino) {
        fin = dateHelper.toSantiago(fechaTermino);
        // Si está disponible pero tiene fecha de término, es una duración estimada
        if (estaDisponible) {
          esEstimada = true;
        }
      } else {
        // Si no hay fecha de término, usar hora actual
        fin = dateHelper.now();
      }
      
      const diff = fin.diff(inicio, ['hours', 'minutes']);
      
      let duracion;
      if (diff.hours >= 1) {
        duracion = `${Math.floor(diff.hours)}h ${Math.floor(diff.minutes)}m`;
      } else {
        duracion = `${Math.floor(diff.minutes)}m`;
      }
      
      // Agregar "estimada" si corresponde
      if (esEstimada) {
        return `Se estima ${duracion}`;
      }
      
      return duracion;
    } catch (error) {
      return 'Duración inválida';
    }
  };

  // Función para filtrar disponibilidades según los filtros activos
  const filtrarDisponibilidades = () => {
    if (!Array.isArray(miHistorial)) return [];

    return miHistorial.filter(disponibilidad => {
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

      return true;
    });
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      estado: 'todos'
    });
    setPaginaActual(1); // Resetear a la primera página
  };

  // Configuración de columnas para PrimeTableBasic
  const columns = useMemo(() => [
    {
      field: 'idBombero',
      header: 'Bombero',
      body: (rowData) => (
        <div className="text-sm font-medium text-gray-900">
          {formatearBomberoInfo(rowData)}
        </div>
      ),
      sortable: true
    },
    {
      field: 'estado',
      header: 'Estado',
      body: (rowData) => (
        <div className="flex items-center gap-2">
          {estaDisponible(rowData) ? (
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
      ),
      sortable: true
    },
    {
      field: 'fechaInicio',
      header: 'Fecha Inicio',
      body: (rowData) => (
        <div className="text-sm text-gray-900">
          {formatFecha(rowData.fechaInicio)}
        </div>
      ),
      sortable: true
    },
    {
      field: 'fechaTermino',
      header: 'Fecha Término',
      body: (rowData) => (
        <div className="text-sm text-gray-900">
          {rowData.fechaTermino ? formatFecha(rowData.fechaTermino) : '-'}
        </div>
      ),
      sortable: true
    },
    {
      field: 'duracion',
      header: 'Duración',
      body: (rowData) => (
        <div className="flex items-center gap-2">
          <FaClock className="text-blue-600" />
          <span className="text-sm text-gray-900 font-medium">
            {calcularDuracionTurno(rowData.fechaInicio, rowData.fechaTermino, estaDisponible(rowData))}
          </span>
        </div>
      ),
      sortable: false
    }
  ], [refreshTime, formatearBomberoInfo, estaDisponible, formatFecha, calcularDuracionTurno]);

  // Efecto para actualizar duraciones en tiempo real cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime(Date.now());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

  // Preparar datos para la tabla (aplicar filtros)
  const tableData = useMemo(() => {
    const registrosFiltrados = filtrarDisponibilidades()
      .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
    
    return registrosFiltrados.map(disponibilidad => ({
      ...disponibilidad,
      estado: estaDisponible(disponibilidad) ? 'disponible' : 'finalizado'
    }));
  }, [miHistorial, filtros, refreshTime, filtrarDisponibilidades, estaDisponible]);

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
        </div>
      </div>

      {/* Tabla de Historial con PrimeTableBasic */}
      <PrimeTableBasic
        data={tableData}
        columns={columns}
        loading={loading}
        showAddButton={false}
        showSearch={false}
        pagination={true}
        rowsPerPage={8}
        emptyMessage="No se encontraron registros de disponibilidad"
        className="shadow-md"
      />
    </div>
  );
};

export default DisponibilidadHistorialTab;