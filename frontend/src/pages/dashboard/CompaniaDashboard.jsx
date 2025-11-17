import React, { useState, useEffect } from 'react';
import { MdBusiness } from 'react-icons/md';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useAuth } from '@hooks/auth/useAuth';
import { 
    getCantidadDeIncidentesDiasdelaSemana,
    getClavesRadialesMasRepetidas,
    getIncidentesPorFranjaHoraria,
    getHeatmapDiaHora,
    getAsistenciaPromedio,
    getHeatmapDisponibilidad,
    getPorcentajeParticipacionIncidentes,
    getRankingClasificaciones,
    getIncidentesPorPeriodo
} from '../../services/dashboard.service.js';

import DashboardTabs from './components/DashboardTabs';
import IncidentesTab from './components/IncidentesTab';
import EventosTab from './components/EventosTab';
import AsistenciaTab from './components/AsistenciaTab';
import HistorialTab from './components/HistorialTab';
import { 
  processIncidentesPorDiaData,
  getClavesRadialesChartOptions,
  processClavesRadialesData,
  getFranjaHorariaChartOptions,
  processFranjaHorariaData,
  getRankingClasificacionesChartOptions,
  processRankingClasificacionesData,
  getIncidentesPorPeriodoChartOptions,
  processIncidentesPorPeriodoData
} from './utils/chartConfig';
import { aplicarFiltroTiempo, dateToTimestamp } from './utils/dateUtils';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CompaniaDashboard = () => {
  const { bombero } = useAuth();
  
  // Estado para el tab activo
  const [activeTab, setActiveTab] = useState('incidentes');
  
  // Estados para gráfico por día de la semana
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [chartDataDias, setChartDataDias] = useState(null);
  const [loadingDias, setLoadingDias] = useState(false);
  const [errorDias, setErrorDias] = useState(null);
  const [filtroRapido, setFiltroRapido] = useState('mensual');

  // (Limpieza) se elimina gráfico por mes individual: reemplazado por unificado

  // Estados para gráfico de claves radiales (tiene sus propios filtros de fecha)
  // Unificado: usaremos fechaInicio/fechaFin globales
  const [chartDataClaves, setChartDataClaves] = useState(null);
  const [loadingClaves, setLoadingClaves] = useState(false);
  const [errorClaves, setErrorClaves] = useState(null);

  // Estados para gráfico de franja horaria (tiene sus propios filtros de fecha)
  // Unificado: usaremos fechaInicio/fechaFin globales
  const [chartDataHoraria, setChartDataHoraria] = useState(null);
  const [loadingHoraria, setLoadingHoraria] = useState(false);
  const [errorHoraria, setErrorHoraria] = useState(null);

  // Estados para heatmap día-hora (tiene sus propios filtros de fecha)
  // NOTA: Ahora compartido entre ambos heatmaps (incidentes y disponibilidad)
  // Unificado: usaremos fechaInicio/fechaFin globales
  const [chartDataHeatmap, setChartDataHeatmap] = useState(null);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [errorHeatmap, setErrorHeatmap] = useState(null);
  
  // Estados para heatmap de disponibilidad (comparte fechas con incidentes)
  const [chartDataHeatmapDisp, setChartDataHeatmapDisp] = useState(null);
  const [loadingHeatmapDisp, setLoadingHeatmapDisp] = useState(false);
  const [errorHeatmapDisp, setErrorHeatmapDisp] = useState(null);

  // Estados para KPI de asistencia promedio
  const [filtroKpiAsistencia, setFiltroKpiAsistencia] = useState('mensual');
  const [kpiAsistencia, setKpiAsistencia] = useState({
    promedio: 0,
    totalIncidentes: 0,
    totalVoluntarios: 0
  });
  const [loadingKpiAsistencia, setLoadingKpiAsistencia] = useState(false);

  // Estados para KPI de participación en incidentes
  const [filtroKpiParticipacion, setFiltroKpiParticipacion] = useState('mensual');
  const [kpiParticipacion, setKpiParticipacion] = useState({
    porcentaje: 0,
    asistenciaPromedio: 0,
    totalVoluntarios: 0
  });
  const [loadingKpiParticipacion, setLoadingKpiParticipacion] = useState(false);

  // Estados para Bump Chart de clasificaciones
  const [agrupacionRanking, setAgrupacionRanking] = useState('dias');
  const [chartDataRanking, setChartDataRanking] = useState(null);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [errorRanking, setErrorRanking] = useState(null);

  // Estados para gráfico unificado por período
  const [agrupacionIncidentes, setAgrupacionIncidentes] = useState('dias');
  const [chartDataPeriodo, setChartDataPeriodo] = useState(null);
  const [loadingPeriodo, setLoadingPeriodo] = useState(false);
  const [errorPeriodo, setErrorPeriodo] = useState(null);

  // Establecer fechas por defecto
  useEffect(() => {
    handleFiltroRapidoChange('mensual');
    handleFiltroKpiAsistenciaChange('mensual');
    handleFiltroKpiParticipacionChange('mensual');
  }, []);

  // Función para aplicar filtros rápidos
  const handleFiltroRapidoChange = (tipo) => {
    const { fechaInicio: inicio, fechaFin: fin } = aplicarFiltroTiempo(tipo);
    setFechaInicio(inicio);
    setFechaFin(fin);
    setFiltroRapido(tipo);
  };

  // Función para manejar cambio de fecha inicio
  const handleFechaInicioChange = (fecha) => {
    setFechaInicio(fecha);
    setFiltroRapido(null);
  };

  // Función para manejar cambio de fecha fin
  const handleFechaFinChange = (fecha) => {
    setFechaFin(fecha);
    setFiltroRapido(null);
  };

  // Eliminados filtros específicos; se reutiliza fechaInicio/fechaFin global

  // Función para cambiar filtro del KPI de asistencia
  const handleFiltroKpiAsistenciaChange = (tipo) => {
    setFiltroKpiAsistencia(tipo);
    if (bombero?.companiaId) {
      cargarKpiAsistencia(tipo);
    }
  };

  // Función para cambiar filtro del KPI de participación
  const handleFiltroKpiParticipacionChange = (tipo) => {
    setFiltroKpiParticipacion(tipo);
    if (bombero?.companiaId) {
      cargarKpiParticipacion(tipo);
    }
  };

  // Cargar datos cuando cambien las fechas (gráfico de días)
  useEffect(() => {
    if (fechaInicio && fechaFin && bombero?.companiaId) {
      cargarDatosDias();
      cargarIncidentesPorPeriodo(agrupacionIncidentes);
    }
  }, [fechaInicio, fechaFin, bombero?.companiaId]);

  // Recargar unificado al cambiar agrupación
  useEffect(() => {
    if (fechaInicio && fechaFin && bombero?.companiaId) {
      cargarIncidentesPorPeriodo(agrupacionIncidentes);
    }
  }, [agrupacionIncidentes]);

  // Cargar datos unificados para Pareto (claves), histograma (franja horaria) y heatmaps
  useEffect(() => {
    if (fechaInicio && fechaFin && bombero?.companiaId) {
      cargarDatosClaves();
      cargarDatosHoraria();
      cargarDatosHeatmap();
      cargarRankingClasificaciones(agrupacionRanking);
    }
  }, [fechaInicio, fechaFin, bombero?.companiaId]);

  // (Limpieza) eliminado useEffect de meses: reemplazado por unificado

  const cargarDatosDias = async () => {
    try {
      setLoadingDias(true);
      setErrorDias(null);

      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const response = await getCantidadDeIncidentesDiasdelaSemana(
        fechaInicioTimestamp,
        fechaFinTimestamp,
        bombero.companiaId
      );


      if (response && response.data) {
        const processedData = processIncidentesPorDiaData(response.data);
        if (processedData) {
          setChartDataDias(processedData);
        } else {
          setErrorDias('No se recibieron datos válidos del servidor');
        }
      } else {
        setErrorDias('No se recibieron datos válidos del servidor');
      }
    } catch (err) {
      console.error('Error al cargar datos de días:', err);
      setErrorDias('Error al cargar los datos del gráfico');
    } finally {
      setLoadingDias(false);
    }
  };

  // (Limpieza) se elimina función cargarDatosMeses

  const cargarIncidentesPorPeriodo = async (agr = 'dias') => {
    try {
      setLoadingPeriodo(true);
      setErrorPeriodo(null);

      const fi = dateToTimestamp(fechaInicio);
      const ff = dateToTimestamp(fechaFin);

      const response = await getIncidentesPorPeriodo(fi, ff, bombero.companiaId, agr);
      if (response && response.data) {
        const processed = processIncidentesPorPeriodoData(response.data);
        setChartDataPeriodo(processed);
      } else {
        setErrorPeriodo('No se recibieron datos válidos del servidor');
      }
    } catch (err) {
      console.error('Error al cargar incidentes por período:', err);
      setErrorPeriodo('Error al cargar los datos del gráfico');
    } finally {
      setLoadingPeriodo(false);
    }
  };

  const cargarDatosClaves = async () => {
    try {
      setLoadingClaves(true);
      setErrorClaves(null);

  const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
  const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const response = await getClavesRadialesMasRepetidas(
        fechaInicioTimestamp,
        fechaFinTimestamp,
        bombero.companiaId
      );


      if (response && response.data) {
        const processedData = processClavesRadialesData(response.data);
        if (processedData) {
          setChartDataClaves(processedData);
        } else {
          setErrorClaves('No se recibieron datos válidos del servidor');
        }
      } else {
        setErrorClaves('No se recibieron datos válidos del servidor');
      }
    } catch (err) {
      console.error('Error al cargar datos de claves radiales:', err);
      setErrorClaves('Error al cargar los datos del gráfico');
    } finally {
      setLoadingClaves(false);
    }
  };

  const cargarDatosHoraria = async () => {
    try {
      setLoadingHoraria(true);
      setErrorHoraria(null);

  const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
  const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const response = await getIncidentesPorFranjaHoraria(
        fechaInicioTimestamp,
        fechaFinTimestamp,
        bombero.companiaId
      );


      if (response && response.data) {
        const processedData = processFranjaHorariaData(response.data);
        if (processedData) {
          setChartDataHoraria(processedData);
        } else {
          setErrorHoraria('No se recibieron datos válidos del servidor');
        }
      } else {
        setErrorHoraria('No se recibieron datos válidos del servidor');
      }
    } catch (err) {
      console.error('Error al cargar datos de franja horaria:', err);
      setErrorHoraria('Error al cargar los datos del gráfico');
    } finally {
      setLoadingHoraria(false);
    }
  };

  const cargarDatosHeatmap = async () => {
    try {
      setLoadingHeatmap(true);
      setLoadingHeatmapDisp(true);
      setErrorHeatmap(null);
      setErrorHeatmapDisp(null);

  const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
  const fechaFinTimestamp = dateToTimestamp(fechaFin);

      // Cargar ambos heatmaps en paralelo
      const [responseIncidentes, responseDisponibilidad] = await Promise.all([
        getHeatmapDiaHora(
          fechaInicioTimestamp,
          fechaFinTimestamp,
          bombero.companiaId
        ),
        getHeatmapDisponibilidad(
          fechaInicioTimestamp,
          fechaFinTimestamp,
          bombero.companiaId
        )
      ]);


      if (responseIncidentes && responseIncidentes.data) {
        setChartDataHeatmap(responseIncidentes.data);
      } else {
        setErrorHeatmap('No se recibieron datos válidos del servidor');
      }

      if (responseDisponibilidad && responseDisponibilidad.data) {
        setChartDataHeatmapDisp(responseDisponibilidad.data);
      } else {
        setErrorHeatmapDisp('No se recibieron datos válidos del servidor');
      }
    } catch (err) {
      console.error('Error al cargar datos de heatmap:', err);
      setErrorHeatmap('Error al cargar los datos del mapa de calor');
      setErrorHeatmapDisp('Error al cargar los datos del mapa de calor');
    } finally {
      setLoadingHeatmap(false);
      setLoadingHeatmapDisp(false);
    }
  };

  const cargarKpiAsistencia = async (tipoFiltro) => {
    try {
      setLoadingKpiAsistencia(true);

      const { fechaInicio, fechaFin } = aplicarFiltroTiempo(tipoFiltro);
      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const response = await getAsistenciaPromedio(
        fechaInicioTimestamp,
        fechaFinTimestamp,
        bombero.companiaId
      );

      console.log('Response KPI asistencia:', response);

      if (response && response.data) {
        setKpiAsistencia({
          promedio: parseFloat(response.data.promedio_asistencia) || 0,
          totalIncidentes: response.data.total_incidentes || 0,
          totalVoluntarios: response.data.total_voluntarios || 0
        });
      }
    } catch (err) {
      console.error('Error al cargar KPI de asistencia:', err);
    } finally {
      setLoadingKpiAsistencia(false);
    }
  };

  const cargarKpiParticipacion = async (tipoFiltro) => {
    try {
      setLoadingKpiParticipacion(true);

      const { fechaInicio, fechaFin } = aplicarFiltroTiempo(tipoFiltro);
      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const response = await getPorcentajeParticipacionIncidentes(
        fechaInicioTimestamp,
        fechaFinTimestamp,
        bombero.companiaId
      );


      if (response && response.data) {
        setKpiParticipacion({
          porcentaje: parseFloat(response.data.porcentaje_participacion) || 0,
          asistenciaPromedio: parseFloat(response.data.asistencia_promedio) || 0,
          totalVoluntarios: response.data.total_voluntarios || 0
        });
      }
    } catch (err) {
      console.error('Error al cargar KPI de participación:', err);
    } finally {
      setLoadingKpiParticipacion(false);
    }
  };

  const cargarRankingClasificaciones = async (agrupacion = 'dias') => {
    if (!fechaInicio || !fechaFin) return;
    
    try {
      setLoadingRanking(true);
      setErrorRanking(null);

      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const response = await getRankingClasificaciones(
        fechaInicioTimestamp,
        fechaFinTimestamp,
        bombero.companiaId,
        agrupacion
      );


      if (response && response.data) {
        const dataProcessed = processRankingClasificacionesData(response.data);
        setChartDataRanking(dataProcessed);
      }
    } catch (err) {
      console.error('Error al cargar ranking clasificaciones:', err);
      setErrorRanking(err.message || 'Error al cargar datos');
    } finally {
      setLoadingRanking(false);
    }
  };

  const handleAgrupacionRankingChange = (nuevaAgrupacion) => {
    setAgrupacionRanking(nuevaAgrupacion);
    cargarRankingClasificaciones(nuevaAgrupacion);
  };

 
  // (Limpieza) opciones de meses eliminadas
  const chartOptionsClaves = getClavesRadialesChartOptions();
  const chartOptionsHoraria = getFranjaHorariaChartOptions();
  const chartOptionsRanking = getRankingClasificacionesChartOptions();
  const chartOptionsPeriodo = getIncidentesPorPeriodoChartOptions('Incidentes por Período');

  // Renderizar el contenido según el tab activo
  const renderTabContent = () => {
    switch (activeTab) {
      case 'incidentes':
        return (
          <IncidentesTab
            kpiAsistencia={kpiAsistencia}
            filtroKpiAsistencia={filtroKpiAsistencia}
            loadingKpiAsistencia={loadingKpiAsistencia}
            onFiltroKpiAsistenciaChange={handleFiltroKpiAsistenciaChange}
            
            kpiParticipacion={kpiParticipacion}
            filtroKpiParticipacion={filtroKpiParticipacion}
            loadingKpiParticipacion={loadingKpiParticipacion}
            onFiltroKpiParticipacionChange={handleFiltroKpiParticipacionChange}
            
            filtroRapido={filtroRapido}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            onFiltroRapidoChange={handleFiltroRapidoChange}
            onFechaInicioChange={handleFechaInicioChange}
            onFechaFinChange={handleFechaFinChange}
            
             

            // Unificado por período
            chartDataPeriodo={chartDataPeriodo}
            chartOptionsPeriodo={chartOptionsPeriodo}
            loadingPeriodo={loadingPeriodo}
            errorPeriodo={errorPeriodo}
            agrupacionPeriodo={agrupacionIncidentes}
            onAgrupacionPeriodoChange={setAgrupacionIncidentes}
            
            chartDataClaves={chartDataClaves}
            chartOptionsClaves={chartOptionsClaves}
            loadingClaves={loadingClaves}
            errorClaves={errorClaves}
            
            chartDataHoraria={chartDataHoraria}
            chartOptionsHoraria={chartOptionsHoraria}
            loadingHoraria={loadingHoraria}
            errorHoraria={errorHoraria}
            
            chartDataHeatmap={chartDataHeatmap}
            chartDataHeatmapDisp={chartDataHeatmapDisp}
            loadingHeatmap={loadingHeatmap}
            loadingHeatmapDisp={loadingHeatmapDisp}
            errorHeatmap={errorHeatmap}
            errorHeatmapDisp={errorHeatmapDisp}
            
            chartDataRanking={chartDataRanking}
            chartOptionsRanking={chartOptionsRanking}
            loadingRanking={loadingRanking}
            errorRanking={errorRanking}
            agrupacionRanking={agrupacionRanking}
            onAgrupacionRankingChange={handleAgrupacionRankingChange}
          />
        );
      case 'eventos':
          return <EventosTab />;
      case 'asistencia':
        return <AsistenciaTab idCompania={bombero.companiaId} />;
      case 'historial':
        return <HistorialTab idCompania={bombero.companiaId} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 w-full max-w-[2000px] mx-auto">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <MdBusiness size={24} className="text-[#4EB9FA] sm:w-8 sm:h-8" />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#2C3E50]">Dashboard de Compañía</h2>
      </div>

      {/* Tabs de navegación */}
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenido del tab activo */}
      {renderTabContent()}
    </div>
  );
};export default CompaniaDashboard;