import React from 'react';
import PropTypes from 'prop-types';
import QuickFilters from './QuickFilters';
import CustomFilters from './CustomFilters';
import IncidentesPorDiaChart from './IncidentesPorDiaChart';
import YearFilter from './YearFilter';
import IncidentesPorMesChart from './IncidentesPorMesChart';
import ClavesRadialesChart from './ClavesRadialesChart';
import FranjaHorariaChart from './FranjaHorariaChart';
import HeatmapsDuales from './HeatmapsDuales';
import AsistenciaPromedioKPI from './AsistenciaPromedioKPI';

const IncidentesTab = ({
  // Estados KPI
  kpiAsistencia,
  filtroKpiAsistencia,
  loadingKpiAsistencia,
  onFiltroKpiAsistenciaChange,
  
  // Filtros
  filtroRapido,
  fechaInicio,
  fechaFin,
  añoDesde,
  añoHasta,
  onFiltroRapidoChange,
  onFechaInicioChange,
  onFechaFinChange,
  onAñoDesdeChange,
  onAñoHastaChange,
  
  // Datos de gráficos
  chartDataDias,
  chartOptionsDias,
  loadingDias,
  errorDias,
  
  chartDataMeses,
  chartOptionsMeses,
  loadingMeses,
  errorMeses,
  
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
}) => {
  return (
    <div>
      {/* KPI de Asistencia Promedio */}
      <div className="mb-6">
        <div className="max-w-sm">
          <AsistenciaPromedioKPI
            promedio={kpiAsistencia.promedio}
            totalIncidentes={kpiAsistencia.totalIncidentes}
            totalVoluntarios={kpiAsistencia.totalVoluntarios}
            filtroActivo={filtroKpiAsistencia}
            onFiltroChange={onFiltroKpiAsistenciaChange}
            loading={loadingKpiAsistencia}
          />
        </div>
      </div>

      {/* Panel de filtros principal */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-sm font-semibold text-[#2C3E50] mb-4 uppercase tracking-wide">
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

      {/* Fila 1: Días de la semana vs Meses */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 min-w-0">
          <div className="h-[400px]">
            <IncidentesPorDiaChart
              chartData={chartDataDias}
              chartOptions={chartOptionsDias}
              loading={loadingDias}
              error={errorDias}
            />
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 min-w-0">
          {/* Filtros de año */}
          <div className="mb-2 shrink-0">
            <h3 className="text-xs font-semibold text-[#2C3E50] mb-1 uppercase tracking-wide">
              INCIDENTES POR MES
            </h3>
            <div className="w-fit transform scale-90 origin-top-left -mb-4">
              <YearFilter
                añoDesde={añoDesde}
                añoHasta={añoHasta}
                onAñoDesdeChange={onAñoDesdeChange}
                onAñoHastaChange={onAñoHastaChange}
              />
            </div>
          </div>
          <div className="h-80">
            <IncidentesPorMesChart
              chartData={chartDataMeses}
              chartOptions={chartOptionsMeses}
              loading={loadingMeses}
              error={errorMeses}
            />
          </div>
        </div>
      </div>

      {/* Fila 2: Franja horaria vs Claves radiales (Pareto) */}
      <div className="mt-6 grid grid-cols-1 2xl:grid-cols-2 gap-6">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 min-w-0">
          <div className="h-[380px]">
            <FranjaHorariaChart
              chartData={chartDataHoraria}
              chartOptions={chartOptionsHoraria}
              loading={loadingHoraria}
              error={errorHoraria}
            />
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 min-w-0">
          <div className="h-[450px]">
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
      <div className="mt-6 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="h-[400px]">
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
  
  filtroRapido: PropTypes.string,
  fechaInicio: PropTypes.instanceOf(Date),
  fechaFin: PropTypes.instanceOf(Date),
  añoDesde: PropTypes.number,
  añoHasta: PropTypes.number,
  onFiltroRapidoChange: PropTypes.func.isRequired,
  onFechaInicioChange: PropTypes.func.isRequired,
  onFechaFinChange: PropTypes.func.isRequired,
  onAñoDesdeChange: PropTypes.func.isRequired,
  onAñoHastaChange: PropTypes.func.isRequired,
  
  chartDataDias: PropTypes.object,
  chartOptionsDias: PropTypes.object,
  loadingDias: PropTypes.bool,
  errorDias: PropTypes.string,
  
  chartDataMeses: PropTypes.object,
  chartOptionsMeses: PropTypes.object,
  loadingMeses: PropTypes.bool,
  errorMeses: PropTypes.string,
  
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
};

export default IncidentesTab;
