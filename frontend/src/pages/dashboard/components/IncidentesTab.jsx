import React from 'react';
import PropTypes from 'prop-types';
import QuickFilters from './QuickFilters';
import CustomFilters from './CustomFilters';
import IncidentesPorDiaChart from './IncidentesPorDiaChart';
import IncidentesPorPeriodoChart from './IncidentesPorPeriodoChart';
import ClavesRadialesChart from './ClavesRadialesChart';
import FranjaHorariaChart from './FranjaHorariaChart';
import HeatmapsDuales from './HeatmapsDuales';
import AsistenciaPromedioKPI from './AsistenciaPromedioKPI';
import ParticipacionIncidentesKPI from './ParticipacionIncidentesKPI';
import RankingClasificacionesChart from './RankingClasificacionesChart';

const IncidentesTab = ({
  // Estados KPI
  kpiAsistencia,
  filtroKpiAsistencia,
  loadingKpiAsistencia,
  onFiltroKpiAsistenciaChange,
  
  // Estados KPI Participación
  kpiParticipacion,
  filtroKpiParticipacion,
  loadingKpiParticipacion,
  onFiltroKpiParticipacionChange,
  
  // Filtros
  filtroRapido,
  fechaInicio,
  fechaFin,
  onFiltroRapidoChange,
  onFechaInicioChange,
  onFechaFinChange,
  
  // Datos de gráficos
  chartDataDias,
  chartOptionsDias,
  loadingDias,
  errorDias,
  
  // Unificado por período
  chartDataPeriodo,
  chartOptionsPeriodo,
  loadingPeriodo,
  errorPeriodo,
  agrupacionPeriodo,
  onAgrupacionPeriodoChange,
  
  chartDataClaves,
  chartOptionsClaves,
  loadingClaves,
  errorClaves,
  
  chartDataHoraria,
  chartOptionsHoraria,
  loadingHoraria,
  errorHoraria,
  
  // Heatmaps
  chartDataHeatmap,
  chartDataHeatmapDisp,
  loadingHeatmap,
  loadingHeatmapDisp,
  errorHeatmap,
  errorHeatmapDisp,
  
  // Bump Chart - Ranking Clasificaciones
  chartDataRanking,
  chartOptionsRanking,
  loadingRanking,
  errorRanking,
  agrupacionRanking,
  onAgrupacionRankingChange,
}) => {
  return (
    <div>
      {/* KPIs lado a lado */}
        <div className="mb-4 sm:mb-6 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* KPI de Asistencia Promedio */}
        <div>
          <AsistenciaPromedioKPI
            promedio={kpiAsistencia.promedio}
            totalIncidentes={kpiAsistencia.totalIncidentes}
            totalVoluntarios={kpiAsistencia.totalVoluntarios}
            filtroActivo={filtroKpiAsistencia}
            onFiltroChange={onFiltroKpiAsistenciaChange}
            loading={loadingKpiAsistencia}
          />
        </div>
        
        {/* KPI de Participación en Incidentes */}
        <div>
          <ParticipacionIncidentesKPI
            porcentaje={kpiParticipacion.porcentaje}
            asistenciaPromedio={kpiParticipacion.asistenciaPromedio}
            totalVoluntarios={kpiParticipacion.totalVoluntarios}
            filtroActivo={filtroKpiParticipacion}
            onFiltroChange={onFiltroKpiParticipacionChange}
            loading={loadingKpiParticipacion}
          />
        </div>
      </div>

      {/* Panel de filtros principal */}
      <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
        <h3 className="text-xs sm:text-sm font-semibold text-[#2C3E50] mb-3 sm:mb-4 uppercase tracking-wide">
          Filtros de Período
        </h3>
        <QuickFilters 
          filtroRapido={filtroRapido}
          onFilterChange={onFiltroRapidoChange}
        />
        <CustomFilters
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onFechaInicioChange={onFechaInicioChange}
          onFechaFinChange={onFechaFinChange}
        />
      </div>

      {/* Fila 1: Días de la semana y Unificado por período */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200 min-w-0">
          <div className="h-[300px] sm:h-[350px] md:h-[400px]">
            <IncidentesPorPeriodoChart
              chartData={chartDataPeriodo}
              chartOptions={chartOptionsPeriodo}
              loading={loadingPeriodo}
              error={errorPeriodo}
              agrupacion={agrupacionPeriodo}
              onAgrupacionChange={onAgrupacionPeriodoChange}
            />
          </div>
        </div>
      </div>

      {/* Fila 2: Franja horaria vs Claves radiales (Pareto) */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200 min-w-0">
          <div className="h-[280px] sm:h-[330px] md:h-[380px]">
            <FranjaHorariaChart
              chartData={chartDataHoraria}
              chartOptions={chartOptionsHoraria}
              loading={loadingHoraria}
              error={errorHoraria}
            />
          </div>
        </div>
          <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200 min-w-0">
            <div className="h-[350px] sm:h-[400px] md:h-[450px]">
            <ClavesRadialesChart
              chartData={chartDataClaves}
              chartOptions={chartOptionsClaves}
              loading={loadingClaves}
              error={errorClaves}
            />
          </div>
        </div>
      </div>

      {/* Mapas de calor duales */}
      <div className="mt-4 sm:mt-6 bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="h-[350px] sm:h-[375px] md:h-[400px]">
          <HeatmapsDuales
            dataIncidentes={chartDataHeatmap}
            dataDisponibilidad={chartDataHeatmapDisp}
            loadingIncidentes={loadingHeatmap}
            loadingDisponibilidad={loadingHeatmapDisp}
            errorIncidentes={errorHeatmap}
            errorDisponibilidad={errorHeatmapDisp}
          />
        </div>
      </div>

      {/* Gráfico de Líneas - Evolución de Clasificaciones de Emergencia */}
      <div className="mt-4 sm:mt-6 bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="h-[350px] sm:h-[400px] md:h-[450px]">
          <RankingClasificacionesChart
            chartData={chartDataRanking}
            chartOptions={chartOptionsRanking}
            loading={loadingRanking}
            error={errorRanking}
            agrupacion={agrupacionRanking}
            onAgrupacionChange={onAgrupacionRankingChange}
          />
        </div>
      </div>
    </div>
  );
};

IncidentesTab.propTypes = {
  kpiAsistencia: PropTypes.shape({
    promedio: PropTypes.number,
    totalIncidentes: PropTypes.number,
    totalVoluntarios: PropTypes.number,
  }).isRequired,
  filtroKpiAsistencia: PropTypes.string.isRequired,
  loadingKpiAsistencia: PropTypes.bool,
  onFiltroKpiAsistenciaChange: PropTypes.func.isRequired,
  
  kpiParticipacion: PropTypes.shape({
    porcentaje: PropTypes.number,
    voluntariosParticipantes: PropTypes.number,
    totalVoluntarios: PropTypes.number,
  }).isRequired,
  filtroKpiParticipacion: PropTypes.string.isRequired,
  loadingKpiParticipacion: PropTypes.bool,
  onFiltroKpiParticipacionChange: PropTypes.func.isRequired,
  
  filtroRapido: PropTypes.string,
  fechaInicio: PropTypes.instanceOf(Date),
  fechaFin: PropTypes.instanceOf(Date),
  onFiltroRapidoChange: PropTypes.func.isRequired,
  onFechaInicioChange: PropTypes.func.isRequired,
  onFechaFinChange: PropTypes.func.isRequired,
  
  chartDataDias: PropTypes.object,
  chartOptionsDias: PropTypes.object,
  loadingDias: PropTypes.bool,
  errorDias: PropTypes.string,
  
  chartDataMeses: PropTypes.object,
  chartOptionsMeses: PropTypes.object,
  loadingMeses: PropTypes.bool,
  errorMeses: PropTypes.string,
  chartDataPeriodo: PropTypes.object,
  chartOptionsPeriodo: PropTypes.object,
  loadingPeriodo: PropTypes.bool,
  errorPeriodo: PropTypes.string,
  agrupacionPeriodo: PropTypes.oneOf(['dias', 'meses', 'años']).isRequired,
  onAgrupacionPeriodoChange: PropTypes.func.isRequired,
  
  chartDataClaves: PropTypes.object,
  chartOptionsClaves: PropTypes.object,
  loadingClaves: PropTypes.bool,
  errorClaves: PropTypes.string,
  
  chartDataHoraria: PropTypes.object,
  chartOptionsHoraria: PropTypes.object,
  loadingHoraria: PropTypes.bool,
  errorHoraria: PropTypes.string,
  
  chartDataHeatmap: PropTypes.array,
  chartDataHeatmapDisp: PropTypes.array,
  loadingHeatmap: PropTypes.bool,
  loadingHeatmapDisp: PropTypes.bool,
  errorHeatmap: PropTypes.string,
  errorHeatmapDisp: PropTypes.string,
  
  chartDataRanking: PropTypes.object,
  chartOptionsRanking: PropTypes.object,
  loadingRanking: PropTypes.bool,
  errorRanking: PropTypes.string,
  agrupacionRanking: PropTypes.oneOf(['dias', 'meses', 'años']).isRequired,
  onAgrupacionRankingChange: PropTypes.func.isRequired,
};

export default IncidentesTab;
