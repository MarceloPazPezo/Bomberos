import React, { useState, useEffect } from 'react';
import { MdPeople } from 'react-icons/md';
import { useAuth } from '@hooks/auth/useAuth';
import { getKpiAsistenciaVoluntario, getKpiResponsabilidadesVoluntario, getResumenActividadVoluntario, getHistorialVoluntario, getHeatmapDisponibilidadVoluntario } from '../../services/historial.service';
import { aplicarFiltroTiempo, dateToTimestamp } from './utils/dateUtils';
import AsistenciaVoluntarioKPI from './components/AsistenciaVoluntarioKPI';
import ResponsabilidadesKPI from './components/ResponsabilidadesKPI';
import ResumenActividadKPI from './components/ResumenActividadKPI';
import DetalleActividadBombero from './components/DetalleActividadBombero';
import HeatmapDisponibilidadVoluntario from './components/HeatmapDisponibilidadVoluntario';
import QuickFilters from './components/QuickFilters';
import CustomFilters from './components/CustomFilters';


const BomberoDashboard = () => {
  const { bombero } = useAuth();

  // Estados para filtros de fecha compartidos
  const [filtroRapido, setFiltroRapido] = useState('mensual');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  // Estados para KPI de asistencia
  const [kpiAsistencia, setKpiAsistencia] = useState({
    totalAsistencias: 0,
    asistenciaEventos: 0,
    asistenciaIncidentes: 0
  });
  const [loadingKpiAsistencia, setLoadingKpiAsistencia] = useState(false);

  // Estados para KPI de responsabilidades
  const [kpiResponsabilidades, setKpiResponsabilidades] = useState({
    incidentesACargo: 0,
    vecesChofer: 0
  });
  const [loadingKpiResponsabilidades, setLoadingKpiResponsabilidades] = useState(false);

  // Estados para KPI de resumen de actividad
  const [resumenActividad, setResumenActividad] = useState({
    horasDisponibles: 0,
    minutosDisponibles: 0,
    diasDisponibles: 0,
    totalSesiones: 0,
    promedioHorasSesion: 0,
    promedioMinutosSesion: 0
  });
  const [loadingResumenActividad, setLoadingResumenActividad] = useState(false);

  // Estados para historial de actividad
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Estados para heatmap de disponibilidad
  const [heatmapData, setHeatmapData] = useState([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);

  // Establecer fechas por defecto al montar
  useEffect(() => {
    handleFiltroRapidoChange('mensual');
  }, []);

  // Cargar datos cuando cambien las fechas
  useEffect(() => {
    if (fechaInicio && fechaFin && bombero?.id) {
      cargarKpiAsistencia();
      cargarKpiResponsabilidades();
      cargarResumenActividad();
      cargarHeatmapDisponibilidad();
    }
  }, [fechaInicio, fechaFin, bombero?.id]);

  // Cargar historial solo una vez al montar
  useEffect(() => {
    if (bombero?.id) {
      cargarHistorial();
    }
  }, [bombero?.id]);

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

  const cargarHistorial = async () => {
    try {
      setLoadingHistorial(true);
      const response = await getHistorialVoluntario(bombero.id);
      
      if (response && response.data) {
        setHistorial(response.data);
      }
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const cargarKpiAsistencia = async () => {
    try {
      setLoadingKpiAsistencia(true);

      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const response = await getKpiAsistenciaVoluntario(
        bombero.id,
        fechaInicioTimestamp,
        fechaFinTimestamp
      );

      console.log('Response KPI asistencia voluntario:', response);

      if (response && response.data) {
        setKpiAsistencia({
          totalAsistencias: parseInt(response.data.totalAsistencias) || 0,
          asistenciaEventos: parseInt(response.data.asistenciaEventos) || 0,
          asistenciaIncidentes: parseInt(response.data.asistenciaIncidentes) || 0
        });
      }
    } catch (err) {
      console.error('Error al cargar KPI de asistencia:', err);
    } finally {
      setLoadingKpiAsistencia(false);
    }
  };

  const cargarKpiResponsabilidades = async () => {
    try {
      setLoadingKpiResponsabilidades(true);

      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const response = await getKpiResponsabilidadesVoluntario(
        bombero.id,
        fechaInicioTimestamp,
        fechaFinTimestamp
      );

      console.log('Response KPI responsabilidades voluntario:', response);

      if (response && response.data) {
        setKpiResponsabilidades({
          incidentesACargo: parseInt(response.data.incidentesACargo) || 0,
          vecesChofer: parseInt(response.data.vecesChofer) || 0
        });
      }
    } catch (err) {
      console.error('Error al cargar KPI de responsabilidades:', err);
    } finally {
      setLoadingKpiResponsabilidades(false);
    }
  };

  const cargarResumenActividad = async () => {
    try {
      setLoadingResumenActividad(true);

      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const response = await getResumenActividadVoluntario(
        bombero.id,
        fechaInicioTimestamp,
        fechaFinTimestamp
      );

      console.log('Response resumen actividad voluntario:', response);

      if (response && response.data) {
        setResumenActividad({
          horasDisponibles: parseInt(response.data.horasDisponibles) || 0,
          minutosDisponibles: parseInt(response.data.minutosDisponibles) || 0,
          diasDisponibles: parseInt(response.data.diasDisponibles) || 0,
          totalSesiones: parseInt(response.data.totalSesiones) || 0,
          promedioHorasSesion: parseInt(response.data.promedioHorasSesion) || 0,
          promedioMinutosSesion: parseInt(response.data.promedioMinutosSesion) || 0
        });
      }
    } catch (err) {
      console.error('Error al cargar resumen de actividad:', err);
    } finally {
      setLoadingResumenActividad(false);
    }
  };

  const cargarHeatmapDisponibilidad = async () => {
    try {
      setLoadingHeatmap(true);

      const fechaInicioTimestamp = dateToTimestamp(fechaInicio);
      const fechaFinTimestamp = dateToTimestamp(fechaFin);

      const response = await getHeatmapDisponibilidadVoluntario(
        bombero.id,
        fechaInicioTimestamp,
        fechaFinTimestamp
      );

      console.log('Response heatmap disponibilidad voluntario:', response);

      if (response && response.data) {
        setHeatmapData(response.data);
      }
    } catch (err) {
      console.error('Error al cargar heatmap de disponibilidad:', err);
    } finally {
      setLoadingHeatmap(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 w-full max-w-[2000px] mx-auto">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <MdPeople size={24} className="text-[#4EB9FA] sm:w-8 sm:h-8" />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#2C3E50]">Dashboard de Bombero</h2>
      </div>

      {/* Filtros de fecha */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-base sm:text-lg font-semibold text-[#2C3E50] mb-4">
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
      </div>

      {/* KPIs */}
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* KPI de Asistencias */}
          <AsistenciaVoluntarioKPI
            totalAsistencias={kpiAsistencia.totalAsistencias}
            asistenciaEventos={kpiAsistencia.asistenciaEventos}
            asistenciaIncidentes={kpiAsistencia.asistenciaIncidentes}
            loading={loadingKpiAsistencia}
          />

          {/* KPI de Responsabilidades */}
          <ResponsabilidadesKPI
            incidentesACargo={kpiResponsabilidades.incidentesACargo}
            vecesChofer={kpiResponsabilidades.vecesChofer}
            loading={loadingKpiResponsabilidades}
          />

          {/* KPI de Resumen de Actividad */}
          <ResumenActividadKPI
            horasDisponibles={resumenActividad.horasDisponibles}
            minutosDisponibles={resumenActividad.minutosDisponibles}
            diasDisponibles={resumenActividad.diasDisponibles}
            totalSesiones={resumenActividad.totalSesiones}
            promedioHorasSesion={resumenActividad.promedioHorasSesion}
            promedioMinutosSesion={resumenActividad.promedioMinutosSesion}
            loading={loadingResumenActividad}
          />
        </div>
      </div>

      {/* Tabla de detalle de actividad */}
      <div className="mb-6">
        <DetalleActividadBombero
          historial={historial}
          loading={loadingHistorial}
        />
      </div>

      {/* Heatmap de disponibilidad */}
      <div className="mb-6">
        <HeatmapDisponibilidadVoluntario
          data={heatmapData}
          loading={loadingHeatmap}
        />
      </div>
    </div>
  );
};

export default BomberoDashboard;
