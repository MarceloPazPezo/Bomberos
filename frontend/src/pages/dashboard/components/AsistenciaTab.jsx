import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import { getRankingAsistencia } from '../../../services/asistencia.service';
import { dateToTimestamp, aplicarFiltroTiempo } from '../utils/dateUtils';
import QuickFilters from './QuickFilters';
import CustomFilters from './CustomFilters';
import AnalizadorBombero from './AnalizadorBombero';
import '../../../styles/asistenciaTab.css';

const AsistenciaTab = ({ idCompania }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados de filtros de fecha
  const [filtroRapido, setFiltroRapido] = useState('mensual');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  // Estados de filtros de clasificaciones y tipos
  const [clasificacionesSeleccionadas, setClasificacionesSeleccionadas] = useState([]);
  const [tiposEventoSeleccionados, setTiposEventoSeleccionados] = useState([]);
  const [filters, setFilters] = useState({
    incidentes_calculados: { value: null, matchMode: 'custom' },
    eventos_calculados: { value: null, matchMode: 'custom' }
  });

  // Estado para cumplimiento mínimo
  const [cumplimientoMinimo, setCumplimientoMinimo] = useState(null);

  useEffect(() => {
    const { fechaInicio: inicio, fechaFin: fin } = aplicarFiltroTiempo('mensual');
    setFechaInicio(inicio);
    setFechaFin(fin);
  }, []);

  // Detectar tamaño de pantalla para ajustar columnas (evitar columnas congeladas en móvil)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (fechaInicio && fechaFin && idCompania) {
      cargarRanking();
    }
  }, [fechaInicio, fechaFin, idCompania]);

  const cargarRanking = async () => {
    try {
      setLoading(true);
      setError(null);

      const fi = dateToTimestamp(fechaInicio);
      const ff = dateToTimestamp(fechaFin);

      const response = await getRankingAsistencia(fi, ff, idCompania);
      
      if (response && response.data) {
        // Procesar datos
        const processed = response.data.map(item => {
          // nombres y apellidos vienen como strings separados por comas desde PostgreSQL
          const nombresArray = item.nombres ? item.nombres.split(',') : [];
          const apellidosArray = item.apellidos ? item.apellidos.split(',') : [];
          
          return {
            ...item,
            nombreCompleto: `${nombresArray.join(' ')} ${apellidosArray.join(' ')}`.trim(),
            incidentes_por_clasificacion: item.incidentes_por_clasificacion || {},
            eventos_por_tipo: item.eventos_por_tipo || {}
          };
        });

        setData(processed);
      }
    } catch (err) {
      console.error('Error al cargar ranking asistencia:', err);
      setError('Error al cargar los datos de asistencia');
    } finally {
      setLoading(false);
    }
  };

  // Extraer opciones únicas de clasificaciones y tipos de evento de los datos
  const clasificacionesDisponibles = useMemo(() => {
    const clasifs = new Set();
    data.forEach(item => {
      if (item.incidentes_por_clasificacion) {
        Object.keys(item.incidentes_por_clasificacion).forEach(c => clasifs.add(c));
      }
    });
    return Array.from(clasifs).sort().map(c => ({ label: c, value: c }));
  }, [data]);

  const tiposEventoDisponibles = useMemo(() => {
    const tipos = new Set();
    data.forEach(item => {
      if (item.eventos_por_tipo) {
        Object.keys(item.eventos_por_tipo).forEach(t => tipos.add(t));
      }
    });
    return Array.from(tipos).sort().map(t => ({ label: t, value: t }));
  }, [data]);

  // Calcular datos filtrados con totales recalculados
  const dataFiltrada = useMemo(() => {
    return data.map(item => {
      // Calcular incidentes según clasificaciones seleccionadas
      let incidentesFiltrados = 0;
      if (clasificacionesSeleccionadas.length === 0) {
        // Si no hay filtro, usar el total original
        incidentesFiltrados = item.total_incidentes;
      } else {
        // Sumar solo las clasificaciones seleccionadas
        clasificacionesSeleccionadas.forEach(clasif => {
          if (item.incidentes_por_clasificacion && item.incidentes_por_clasificacion[clasif]) {
            incidentesFiltrados += item.incidentes_por_clasificacion[clasif];
          }
        });
      }

      // Calcular eventos según tipos seleccionados
      let eventosFiltrados = 0;
      if (tiposEventoSeleccionados.length === 0) {
        // Si no hay filtro, usar el total original
        eventosFiltrados = item.total_eventos;
      } else {
        // Sumar solo los tipos seleccionados
        tiposEventoSeleccionados.forEach(tipo => {
          if (item.eventos_por_tipo && item.eventos_por_tipo[tipo]) {
            eventosFiltrados += item.eventos_por_tipo[tipo];
          }
        });
      }

      return {
        ...item,
        incidentes_calculados: incidentesFiltrados,
        eventos_calculados: eventosFiltrados,
        total_calculado: incidentesFiltrados + eventosFiltrados
      };
    });
  }, [data, clasificacionesSeleccionadas, tiposEventoSeleccionados]);

  const handleFiltroRapidoChange = (tipo) => {
    const { fechaInicio: inicio, fechaFin: fin } = aplicarFiltroTiempo(tipo);
    setFechaInicio(inicio);
    setFechaFin(fin);
    setFiltroRapido(tipo);
  };

  const handleFechaInicioChange = (fecha) => {
    setFechaInicio(fecha);
    setFiltroRapido(null);
  };

  const handleFechaFinChange = (fecha) => {
    setFechaFin(fecha);
    setFiltroRapido(null);
  };

  // Renderizar filtro de clasificaciones
  const clasificacionesFilterTemplate = () => {
    return (
      <MultiSelect
        value={clasificacionesSeleccionadas}
        options={clasificacionesDisponibles || []}
        onChange={(e) => setClasificacionesSeleccionadas(e.value)}
        placeholder="Todas"
        className="p-column-filter"
        showClear
        display="chip"
        maxSelectedLabels={1}
        style={{ minWidth: '14rem' }}
      />
    );
  };

  // Renderizar filtro de tipos de evento
  const tiposEventoFilterTemplate = () => {
    return (
      <MultiSelect
        value={tiposEventoSeleccionados}
        options={tiposEventoDisponibles || []}
        onChange={(e) => setTiposEventoSeleccionados(e.value)}
        placeholder="Todos"
        className="p-column-filter"
        showClear
        display="chip"
        maxSelectedLabels={1}
        style={{ minWidth: '14rem' }}
      />
    );
  };

  // Función para determinar el estilo de la fila según cumplimiento mínimo
  const rowClassName = (rowData) => {
    if (cumplimientoMinimo === null || cumplimientoMinimo === '' || cumplimientoMinimo <= 0) {
      return '';
    }
    
    const total = rowData.total_calculado;
    if (total >= cumplimientoMinimo) {
      return 'cumple-minimo';
    } else {
      return 'no-cumple-minimo';
    }
  };

  return (
    <div>
      {/* Filtros de período */}
        <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <h3 className="text-xs sm:text-sm font-semibold text-[#2C3E50] mb-3 sm:mb-4 uppercase tracking-wide">
          Filtros de Período
        </h3>
        <QuickFilters 
          filtroRapido={filtroRapido}
          onFilterChange={handleFiltroRapidoChange}
        />
        <CustomFilters
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onFechaInicioChange={handleFechaInicioChange}
          onFechaFinChange={handleFechaFinChange}
        />
      </div>



      {/* Tabla de ranking */}
      <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-[#2C3E50]">
            Ranking de Asistencia de Voluntarios
          </h3>
          
          {/* Input de cumplimiento mínimo */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <label htmlFor="cumplimientoMinimo" className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
              Cumplimiento Mínimo:
            </label>
            <input
              id="cumplimientoMinimo"
              type="number"
              min="0"
              value={cumplimientoMinimo ?? ''}
              onChange={(e) => setCumplimientoMinimo(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Sin límite"
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {cumplimientoMinimo !== null && cumplimientoMinimo > 0 && (
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span>
                  ≥ {cumplimientoMinimo}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-red-100 border border-red-300 rounded"></span>
                  &lt; {cumplimientoMinimo}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <DataTable 
            value={dataFiltrada} 
            loading={loading}
            paginator 
            rows={5}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            emptyMessage="No hay datos disponibles para el período seleccionado"
            className="p-datatable-sm text-xs sm:text-sm min-w-[640px]"
            stripedRows
            showGridlines
            filterDisplay="row"
            scrollable
            rowClassName={rowClassName}
          >
          {/* Columnas estáticas */}
          <Column 
            field="nombreCompleto" 
            header="Voluntario" 
            sortable 
            {...(!isMobile ? { frozen: true } : {})}
            style={{ minWidth: isMobile ? '160px' : '200px' }} 
          />
          <Column 
            field="incidentes_calculados" 
            header="Incidentes" 
            sortable 
            filter
            filterElement={clasificacionesFilterTemplate}
            showFilterMenu={false}
            style={{ width: isMobile ? '140px' : '180px', textAlign: 'center' }} 
          />
          <Column 
            field="eventos_calculados" 
            header="Eventos" 
            sortable 
            filter
            filterElement={tiposEventoFilterTemplate}
            showFilterMenu={false}
            style={{ width: isMobile ? '140px' : '180px', textAlign: 'center' }} 
          />
          <Column 
            field="total_calculado" 
            header="Total" 
            sortable 
            headerStyle={{ 
              backgroundColor: '#4CAF50',
              color: 'white',
              fontWeight: 'bold'
            }}
            bodyStyle={{ 
              backgroundColor: '#E8F5E9',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
            style={{ width: isMobile ? '100px' : '120px' }}
          />
          </DataTable>
        </div>
      </div>
      {/* Analizador de Bombero */}
      <AnalizadorBombero fechaInicio={fechaInicio} fechaFin={fechaFin} />
    </div>
  );
};

AsistenciaTab.propTypes = {
  idCompania: PropTypes.number.isRequired,
};

export default AsistenciaTab;
