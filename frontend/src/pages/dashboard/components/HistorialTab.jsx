import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import { getHistorialCompania } from '../../../services/historial.service';
import { dateToTimestamp, aplicarFiltroTiempo } from '../utils/dateUtils';
import QuickFilters from './QuickFilters';
import CustomFilters from './CustomFilters';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { MdLocalFireDepartment, MdEvent, MdCake, MdOpenInNew } from 'react-icons/md';

const HistorialTab = ({ idCompania }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados de filtros de fecha
  const [filtroRapido, setFiltroRapido] = useState('mensual');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  // Estados de filtros de tabla
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);

  useEffect(() => {
    const { fechaInicio: inicio, fechaFin: fin } = aplicarFiltroTiempo('mensual');
    setFechaInicio(inicio);
    setFechaFin(fin);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (fechaInicio && fechaFin && idCompania) {
      cargarHistorial();
    }
  }, [fechaInicio, fechaFin, idCompania]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);

      const fi = dateToTimestamp(fechaInicio);
      const ff = dateToTimestamp(fechaFin);

      const response = await getHistorialCompania(idCompania, fi, ff);
      
      if (response && response.data) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Error al cargar historial de compañía:', err);
      setError('Error al cargar el historial de la compañía');
    } finally {
      setLoading(false);
    }
  };

  // Normalizar datos: separar fecha y hora
  const dataNormalizada = useMemo(() => {
    return data.map(item => {
      let fecha = '';
      let hora = '';
      if (item.fecha) {
        const d = new Date(item.fecha);
        if (!isNaN(d)) {
          fecha = d.toLocaleDateString('es-CL');
          hora = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
        }
      }
      return {
        ...item,
        fechaFormateada: fecha,
        horaFormateada: hora,
        tituloMostrar: item.titulo || '-',
        subTipoMostrar: item.subTipo || '-',
        cantidadAsistentes: item['cantidad de asistentes'] ?? 0
      };
    });
  }, [data]);

  // Extraer tipos únicos
  const tiposDisponibles = useMemo(() => {
    const tipos = new Set();
    data.forEach(item => {
      if (item.tipo) tipos.add(item.tipo);
    });
    return Array.from(tipos).sort().map(t => ({ label: t, value: t }));
  }, [data]);

  // Filtrar datos por tipo
  const dataFiltrada = useMemo(() => {
    if (tiposSeleccionados.length === 0) {
      return dataNormalizada;
    }
    return dataNormalizada.filter(item => tiposSeleccionados.includes(item.tipo));
  }, [dataNormalizada, tiposSeleccionados]);

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

  const handleRedirection = (item) => {
    if (item.tipo === 'Incidente') {
        const id = item.id_origen || item.id;
        navigate(`/vista-parte/${id}`);
    } else if (item.tipo === 'Evento') {
        const id = item.id_origen || item.id;
        const d = item.fecha ? new Date(item.fecha) : new Date();
        navigate('/calendario', { 
            state: { 
                eventId: id, 
                date: d, 
                isRecurrent: false 
            } 
        });
    }
    // Si es Aniversario u otro tipo, por ahora no redirigimos o podríamos agregar lógica
  };

  // Template de filtro de tipos
  const tiposFilterTemplate = () => {
    return (
      <MultiSelect
        value={tiposSeleccionados}
        options={tiposDisponibles || []}
        onChange={(e) => setTiposSeleccionados(e.value)}
        placeholder="Todos"
        className="p-column-filter"
        showClear
        display="chip"
        maxSelectedLabels={2}
        style={{ minWidth: '14rem' }}
      />
    );
  };

  const tipoBodyTemplate = (rowData) => {
      const isClickable = rowData.tipo === 'Incidente' || rowData.tipo === 'Evento';

      return (
          <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{rowData.tipo}</span>
              {isClickable && (
                  <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRedirection(rowData);
                    }}
                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    title="Ver detalles"
                  >
                      <MdOpenInNew className="text-base" />
                  </button>
              )}
          </div>
      );
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

      {/* Tabla de historial */}
      <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-[#2C3E50] mb-4">
          Historial de la Compañía
        </h3>

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
            className="p-datatable-sm text-xs sm:text-sm min-w-[560px]"
            stripedRows
            showGridlines
            filterDisplay="row"
            scrollable
          >
          <Column 
            field="tipo" 
            header="Tipo" 
            sortable 
            filter
            filterElement={tiposFilterTemplate}
            showFilterMenu={false}
            body={tipoBodyTemplate}
            style={{ minWidth: '140px' }} 
          />
          <Column 
            field="fechaFormateada" 
            header="Fecha" 
            sortable 
            style={{ width: isMobile ? '110px' : '120px' }} 
          />
          <Column 
            field="horaFormateada" 
            header="Hora" 
            sortable 
            style={{ width: isMobile ? '90px' : '100px' }} 
          />
          <Column 
            field="tituloMostrar" 
            header="Título" 
            sortable 
            style={{ minWidth: isMobile ? '160px' : '200px' }} 
          />
          <Column 
            field="subTipoMostrar" 
            header="Clasificación" 
            sortable 
            style={{ minWidth: isMobile ? '130px' : '150px' }} 
          />
          <Column 
            field="cantidadAsistentes" 
            header="Asistentes" 
            sortable 
            body={(rowData) => rowData.cantidadAsistentes ?? 0}
            style={{ width: '120px', textAlign: 'center' }} 
          />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

HistorialTab.propTypes = {
  idCompania: PropTypes.number.isRequired,
};

export default HistorialTab;
