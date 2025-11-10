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
    getCantidadDeIncidentesMeses,
    getClavesRadialesMasRepetidas,
    getIncidentesPorFranjaHoraria,
    getHeatmapDiaHora,
    getAsistenciaPromedio,
    getHeatmapDisponibilidad
} from '../../services/dashboard.service.js';

import DashboardTabs from './components/DashboardTabs';
import IncidentesTab from './components/IncidentesTab';
import EventosTab from './components/EventosTab';
import AsistenciaTab from './components/AsistenciaTab';
import { 
  getIncidentesPorDiaChartOptions, 
  processIncidentesPorDiaData,
  getIncidentesPorMesChartOptions,
  processIncidentesPorMesData,
  getClavesRadialesChartOptions,
  processClavesRadialesData,
  getFranjaHorariaChartOptions,
  processFranjaHorariaData
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

  // Estados para gráfico por mes
  const [añoDesde, setAñoDesde] = useState(null);
  const [añoHasta, setAñoHasta] = useState(null);
  const [chartDataMeses, setChartDataMeses] = useState(null);
  const [loadingMeses, setLoadingMeses] = useState(false);
  const [errorMeses, setErrorMeses] = useState(null);

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

  // Establecer fechas por defecto
  useEffect(() => {
    handleFiltroRapidoChange('mensual');
    handleFiltroKpiAsistenciaChange('mensual');
    
    // Establecer años por defecto (año actual)
    const currentYear = new Date().getFullYear();
    setAñoDesde(currentYear);
    setAñoHasta(currentYear);
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

  // Cargar datos cuando cambien las fechas (gráfico de días)
  useEffect(() => {
    if (fechaInicio && fechaFin && bombero?.companiaId) {
      cargarDatosDias();
    }
  }, [fechaInicio, fechaFin, bombero?.companiaId]);

  // Cargar datos unificados para Pareto (claves), histograma (franja horaria) y heatmaps
  useEffect(() => {
    if (fechaInicio && fechaFin && bombero?.companiaId) {
      cargarDatosClaves();
      cargarDatosHoraria();
      cargarDatosHeatmap();
    }
  }, [fechaInicio, fechaFin, bombero?.companiaId]);

  // Cargar datos cuando cambien los años
  useEffect(() => {
    if (añoDesde && añoHasta && bombero?.companiaId) {
      cargarDatosMeses();
    }
  }, [añoDesde, añoHasta, bombero?.companiaId]);

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

      console.log('Response dashboard días:', response);

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

  const cargarDatosMeses = async () => {
    try {
      setLoadingMeses(true);
      setErrorMeses(null);

      const response = await getCantidadDeIncidentesMeses(
        añoDesde,
        añoHasta,
        bombero.companiaId
      );

      console.log('Response dashboard meses:', response);

      if (response && response.data) {
        const processedData = processIncidentesPorMesData(response.data);
        if (processedData) {
          setChartDataMeses(processedData);
        } else {
          setErrorMeses('No se recibieron datos válidos del servidor');
        }
      } else {
        setErrorMeses('No se recibieron datos válidos del servidor');
      }
    } catch (err) {
      console.error('Error al cargar datos de meses:', err);
      setErrorMeses('Error al cargar los datos del gráfico');
    } finally {
      setLoadingMeses(false);
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

      console.log('Response dashboard claves:', response);

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

      console.log('Response dashboard horaria:', response);

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

      console.log('Response dashboard heatmap incidentes:', responseIncidentes);
      console.log('Response dashboard heatmap disponibilidad:', responseDisponibilidad);

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

  const chartOptionsDias = getIncidentesPorDiaChartOptions();
  const chartOptionsMeses = getIncidentesPorMesChartOptions();
  const chartOptionsClaves = getClavesRadialesChartOptions();
  const chartOptionsHoraria = getFranjaHorariaChartOptions();

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
            
            filtroRapido={filtroRapido}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            añoDesde={añoDesde}
            añoHasta={añoHasta}
            onFiltroRapidoChange={handleFiltroRapidoChange}
            onFechaInicioChange={handleFechaInicioChange}
            onFechaFinChange={handleFechaFinChange}
            onAñoDesdeChange={setAñoDesde}
            onAñoHastaChange={setAñoHasta}
            
            chartDataDias={chartDataDias}
            chartOptionsDias={chartOptionsDias}
            loadingDias={loadingDias}
            errorDias={errorDias}
            
            chartDataMeses={chartDataMeses}
            chartOptionsMeses={chartOptionsMeses}
            loadingMeses={loadingMeses}
            errorMeses={errorMeses}
            
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
          />
        );
      case 'eventos':
          return <EventosTab />;
      case 'asistencia':
        return <AsistenciaTab />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 w-full max-w-[2000px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MdBusiness size={32} className="text-[#4EB9FA]" />
        <h2 className="text-2xl font-semibold text-[#2C3E50]">Dashboard de Compañía</h2>
      </div>

      {/* Tabs de navegación */}
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenido del tab activo */}
      {renderTabContent()}
    </div>
  );
};export default CompaniaDashboard;