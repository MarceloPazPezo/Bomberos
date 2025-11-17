import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { 
  getCantidadDeEventosPorGranularidad, 
  getCantidadDeEventosPorTipo, 
  getPromedioAsistenciaPorTipoEvento, 
  getEvolucionEventosYAsistentes,
  getTiposEvento,
  getPorcentajeParticipacion
} from '../../../services/dashboard.service';
import { 
  getEventosPorGranularidadChartOptions, 
  processEventosPorGranularidadData,
  getEventosPorTipoChartOptions,
  processEventosPorTipoData,
  getPromedioAsistenciaPorTipoChartOptions,
  processPromedioAsistenciaPorTipoData,
  getEvolucionEventosChartOptions,
  processEvolucionEventosData
} from '../utils/chartConfig';
import { dateToTimestamp } from '../utils/dateUtils';
import GranularidadSelector from './GranularidadSelector';
import EventosPorGranularidadChart from './EventosPorGranularidadChart';
import PromedioAsistenciaPorTipoChart from './PromedioAsistenciaPorTipoChart';
import EvolucionEventosChart from './EvolucionEventosChart';
import QuickFilters from './QuickFilters';
import CustomFilters from './CustomFilters';
import { MultiSelect } from 'primereact/multiselect';

const EventosTab = () => {
  // Estado para granularidad (semana, mes, año)
  const [granularidad, setGranularidad] = useState('mes');
  
  // Estado para filtro rápido
  const [filtroRapido, setFiltroRapido] = useState('mensual');
  
  // Estados para filtros de fecha (como objetos Date)
  const [fechaInicio, setFechaInicio] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6); // Últimos 6 meses por defecto
    return date;
  });
  
  const [fechaFin, setFechaFin] = useState(new Date());

  // Estado para tipos de evento disponibles
  const [tiposEvento, setTiposEvento] = useState([]);
  const [tipoEventoSeleccionado, setTipoEventoSeleccionado] = useState(null); // null = todos
  const [tiposEventoParticipacion, setTiposEventoParticipacion] = useState([]); // Array de IDs seleccionados

  // Estados para el gráfico
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Segundo gráfico: eventos por tipo
  const [tipoChartData, setTipoChartData] = useState(null);
  const [tipoLoading, setTipoLoading] = useState(false);
  const [tipoError, setTipoError] = useState(null);

  // Tercer gráfico: promedio de asistencia por tipo de evento
  const [asistenciaChartData, setAsistenciaChartData] = useState(null);
  const [asistenciaLoading, setAsistenciaLoading] = useState(false);
  const [asistenciaError, setAsistenciaError] = useState(null);

  // KPI: Porcentaje de participación
  const [participacionData, setParticipacionData] = useState(null);
  const [participacionLoading, setParticipacionLoading] = useState(false);
  const [participacionError, setParticipacionError] = useState(null);

  // Quinto gráfico: evolución de eventos y asistentes (con filtro particular)
  const [evolucionChartData, setEvolucionChartData] = useState(null);
  const [evolucionLoading, setEvolucionLoading] = useState(false);
  const [evolucionError, setEvolucionError] = useState(null);

  // Cargar tipos de evento al montar el componente
  useEffect(() => {
    cargarTiposEvento();
  }, []);

  // Cargar primer gráfico cuando cambien fechas o granularidad
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarGraficoGranularidad();
    }
  }, [fechaInicio, fechaFin, granularidad]);

  // Cargar gráficos 2 y 3 solo cuando cambien las fechas (NO granularidad)
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarGraficos23();
    }
  }, [fechaInicio, fechaFin]);

  // Cargar porcentaje de participación cuando cambien fechas o tipos seleccionados
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarPorcentajeParticipacion();
    }
  }, [fechaInicio, fechaFin, tiposEventoParticipacion]);

  // Cargar evolución cuando cambien fechas o tipo seleccionado
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarEvolucion();
    }
  }, [fechaInicio, fechaFin, tipoEventoSeleccionado]);

  const cargarTiposEvento = async () => {
    try {
      const resp = await getTiposEvento();
      
      if (resp && resp.status === 'Success' && resp.data) {
        setTiposEvento(resp.data);
      } else {
        console.warn('No se pudieron cargar tipos de evento:', resp);
        setTiposEvento([]);
      }
    } catch (err) {
      console.error('Error al cargar tipos de evento:', err);
      setTiposEvento([]);
    }
  };

  // Carga solo el gráfico 1 (por granularidad)
  const cargarGraficoGranularidad = async () => {
    try {
      setLoading(true);
      setError(null);

      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const respGran = await getCantidadDeEventosPorGranularidad(
        fechaInicioTimestamp, 
        fechaFinTimestamp, 
        granularidad
      );


      if (respGran && respGran.data) {
        const processedData = processEventosPorGranularidadData(respGran.data, granularidad);
        if (processedData) {
          setChartData(processedData);
        } else {
          setError('Datos inválidos en granularidad');
        }
      } else {
        setError('No se recibieron datos válidos del servidor (granularidad)');
      }
    } catch (err) {
      console.error('Error al cargar datos de eventos por granularidad:', err);
      setError('Error al cargar datos (granularidad)');
    } finally {
      setLoading(false);
    }
  };

  // Carga gráficos 2 y 3 (NO dependen de granularidad)
  const cargarGraficos23 = async () => {
    try {
      setTipoLoading(true);
      setTipoError(null);
      setAsistenciaLoading(true);
      setAsistenciaError(null);

      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      // Ejecutar llamadas en paralelo
      const [respTipo, respAsistencia] = await Promise.all([
        getCantidadDeEventosPorTipo(fechaInicioTimestamp, fechaFinTimestamp),
        getPromedioAsistenciaPorTipoEvento(fechaInicioTimestamp, fechaFinTimestamp),
      ]);


      if (respTipo && respTipo.data) {
        const processedTipo = processEventosPorTipoData(respTipo.data);
        if (processedTipo) setTipoChartData(processedTipo); 
        else setTipoError('Datos inválidos en tipos');
      } else {
        setTipoError('No se recibieron datos válidos del servidor (tipos)');
      }

      if (respAsistencia && respAsistencia.data) {
        const processedAsistencia = processPromedioAsistenciaPorTipoData(respAsistencia.data);
        if (processedAsistencia) {
          setAsistenciaChartData(processedAsistencia);
        } else {
          setAsistenciaError('Datos inválidos en promedio de asistencia');
        }
      } else {
        setAsistenciaError('No se recibieron datos válidos del servidor (asistencia)');
      }
    } catch (err) {
      console.error('Error al cargar datos de eventos:', err);
      setTipoError('Error al cargar datos (tipos)');
      setAsistenciaError('Error al cargar datos de asistencia');
    } finally {
      setTipoLoading(false);
      setAsistenciaLoading(false);
    }
  };

  const cargarPorcentajeParticipacion = async () => {
    try {
      setParticipacionLoading(true);
      setParticipacionError(null);

      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      // Si no hay tipos seleccionados, enviar null (todos)
      const idsEventos = tiposEventoParticipacion.length > 0 ? tiposEventoParticipacion : null;

      const resp = await getPorcentajeParticipacion(
        fechaInicioTimestamp,
        fechaFinTimestamp,
        idsEventos
      );

      console.log('Response porcentaje participación:', resp);

      if (resp && resp.status === 'Success' && resp.data) {
        setParticipacionData(resp.data);
      } else {
        setParticipacionError('No se recibieron datos válidos');
      }
    } catch (err) {
      console.error('Error al cargar porcentaje de participación:', err);
      setParticipacionError('Error al cargar datos');
    } finally {
      setParticipacionLoading(false);
    }
  };

  const cargarEvolucion = async () => {
    try {
      setEvolucionLoading(true);
      setEvolucionError(null);

      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const respEvolucion = await getEvolucionEventosYAsistentes(
        fechaInicioTimestamp, 
        fechaFinTimestamp, 
        tipoEventoSeleccionado
      );


      if (respEvolucion && respEvolucion.data) {
        const processedEvolucion = processEvolucionEventosData(respEvolucion.data);
        if (processedEvolucion) {
          setEvolucionChartData(processedEvolucion);
        } else {
          setEvolucionError('Datos inválidos en evolución');
        }
      } else {
        setEvolucionError('No se recibieron datos válidos del servidor (evolución)');
      }
    } catch (err) {
      console.error('Error al cargar evolución de eventos:', err);
      setEvolucionError('Error al cargar datos de evolución');
    } finally {
      setEvolucionLoading(false);
    }
  };

  const handleGranularidadChange = (nuevaGranularidad) => {
    setGranularidad(nuevaGranularidad);
  };

  const handleFiltroRapidoChange = (filtro) => {
    setFiltroRapido(filtro);
    const hoy = new Date();
    let nuevaFechaInicio = new Date();

    if (filtro === 'semanal') {
      nuevaFechaInicio.setDate(hoy.getDate() - 7);
    } else if (filtro === 'mensual') {
      nuevaFechaInicio.setMonth(hoy.getMonth() - 1);
    } else if (filtro === 'anual') {
      nuevaFechaInicio.setFullYear(hoy.getFullYear() - 1);
    }

    setFechaInicio(nuevaFechaInicio);
    setFechaFin(hoy);
  };

  const chartOptions = getEventosPorGranularidadChartOptions(granularidad);
  const tipoChartOptions = getEventosPorTipoChartOptions();
  const asistenciaChartOptions = getPromedioAsistenciaPorTipoChartOptions();
  const evolucionChartOptions = getEvolucionEventosChartOptions();

  return (
    <div className="space-y-6">
      {/* Panel de filtros principal - Mismo diseño que IncidentesTab */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-[#2C3E50] mb-4 uppercase tracking-wide">
          Filtros de Período
        </h3>
        <QuickFilters 
          filtroRapido={filtroRapido}
          onFilterChange={handleFiltroRapidoChange}
        />
        <CustomFilters
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onFechaInicioChange={setFechaInicio}
          onFechaFinChange={setFechaFin}
        />
      </div>

      {/* Fila 1: Eventos por periodo y Eventos por tipo */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        {/* Gráfico 1: Eventos por granularidad - CON selector propio */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-w-0">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Eventos por Periodo
            </h3>
           
             
              <GranularidadSelector 
                granularidad={granularidad}
                onChange={handleGranularidadChange}
              />
            
          </div>
          <div className="h-[350px]">
            <EventosPorGranularidadChart
              chartData={chartData}
              chartOptions={chartOptions}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        {/* Gráfico 2: Eventos por tipo */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Eventos por Tipo
          </h3>
          <div className="h-[450px]">
            {tipoLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4EB9FA] mx-auto mb-3"></div>
                  <p className="text-gray-500 text-sm">Cargando datos...</p>
                </div>
              </div>
            ) : tipoError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-red-500 text-4xl mb-3">⚠️</div>
                  <p className="text-red-600 font-semibold mb-2 text-sm">Error al cargar los datos</p>
                  <p className="text-gray-500 text-xs">{tipoError}</p>
                </div>
              </div>
            ) : !tipoChartData ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-400 text-4xl mb-3">📊</div>
                  <p className="text-gray-500 text-sm">No hay datos disponibles</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                <Bar data={tipoChartData} options={tipoChartOptions} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 2: Promedio de asistencia y Porcentaje de Participación */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        {/* Gráfico 3: Promedio de asistencia por tipo de evento */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Promedio de Asistencia
          </h3>
          <div className="h-[380px]">
            <PromedioAsistenciaPorTipoChart
              chartData={asistenciaChartData}
              chartOptions={asistenciaChartOptions}
              loading={asistenciaLoading}
              error={asistenciaError}
            />
          </div>
        </div>

        {/* KPI: Porcentaje de Participación */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Porcentaje de Participación en Eventos
          </h3>
          
          {/* Filtro multi-select de tipos de evento */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 participacion-multiselect">
            <label htmlFor="tiposEventoParticipacion" className="block text-xs font-medium text-gray-700 mb-2">
              Filtrar por Tipo(s) de Evento
            </label>
            <MultiSelect
              id="tiposEventoParticipacion"
              value={tiposEventoParticipacion}
              options={tiposEvento}
              onChange={(e) => setTiposEventoParticipacion(e.value)}
              optionLabel="nombre"
              optionValue="id"
              placeholder="Todos los tipos"
              className="w-full text-xs"
              display="chip"
              showSelectAll={true}
            />
            <p className="text-xs text-gray-500 mt-2">
              Puedes seleccionar uno o varios tipos de evento, o dejar vacío para ver todos
            </p>
          </div>

          {/* Contenido del KPI */}
          {/* Ajuste de tamaño: aumentamos la altura y hacemos el SVG responsive para evitar que se corte el gráfico */}
          <div className="h-72 md:h-64 flex items-center justify-center">
            {participacionLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Cargando porcentaje...</p>
              </div>
            ) : participacionError ? (
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-3">⚠️</div>
                <p className="text-red-600 font-semibold mb-2 text-sm">Error al cargar</p>
                <p className="text-gray-500 text-xs">{participacionError}</p>
              </div>
            ) : participacionData ? (
              <div className="text-center w-full">
                <div className="relative inline-block">
                  <svg className="w-40 h-40 sm:w-48 sm:h-48 transform -rotate-90 overflow-visible">
                    {/* Círculo de fondo */}
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#E5E7EB"
                      strokeWidth="16"
                      fill="none"
                    />
                    {/* Círculo de progreso */}
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#10B981"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${(participacionData.porcentaje / 100) * 502.4} 502.4`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div>
                      <div className="text-5xl font-bold text-gray-800">
                        {Number(participacionData.porcentaje || 0).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Participación</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600 text-xs">Voluntarios Activos</div>
                    <div className="text-2xl font-bold text-gray-800">{participacionData.voluntarios_participantes || 0}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600 text-xs">Total Voluntarios</div>
                    <div className="text-2xl font-bold text-gray-800">{participacionData.total_voluntarios || 0}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-gray-400 text-4xl mb-3">📊</div>
                <p className="text-gray-500 text-sm">No hay datos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico: Evolución temporal - Ancho completo */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Evolución Temporal de Asistencia
        </h3>

        {/* Filtro particular por tipo de evento */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <label htmlFor="tipoEvento" className="block text-xs font-medium text-gray-700 mb-2">
            Filtrar por Tipo de Evento (opcional)
          </label>
          <select
            id="tipoEvento"
            value={tipoEventoSeleccionado || ''}
            onChange={(e) => setTipoEventoSeleccionado(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full md:w-1/3 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Todos los tipos</option>
            {tiposEvento.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Este filtro es independiente y solo afecta a este gráfico.
          </p>
        </div>

        <div className="h-[350px]">
          <EvolucionEventosChart
            chartData={evolucionChartData}
            chartOptions={evolucionChartOptions}
            loading={evolucionLoading}
            error={evolucionError}
          />
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="text-blue-500 text-xl">ℹ️</div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1 text-sm">Estructura de filtros</h4>
            <p className="text-xs text-blue-800">
                <strong>🔍 Filtros de Período:</strong> El rango de fechas se aplica a TODOS los gráficos y KPIs.
                <br/><strong>📊 Gráfico 1:</strong> Selector de agrupación (semana/mes/año) independiente.
                <br/><strong>📊 KPI Participación:</strong> Filtro multi-selección de tipos de evento.
                <br/><strong>📊 Evolución Temporal:</strong> Filtro de tipo de evento único.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

EventosTab.propTypes = {
  companiaId: PropTypes.number,
};

export default EventosTab;
