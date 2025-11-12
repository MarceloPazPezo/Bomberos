import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';

const IncidentesPorPeriodoChart = ({
  chartData,
  chartOptions,
  loading,
  error,
  agrupacion,
  onAgrupacionChange,
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header con título y controles */}
      <div className="mb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[#2C3E50] uppercase tracking-wide">
            Incidentes por Período
          </h3>
        </div>

        {/* Botones de agrupación */}
        <div className="flex gap-2">
          <button
            onClick={() => onAgrupacionChange('dias')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              agrupacion === 'dias'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Por Días de la Semana
          </button>
          <button
            onClick={() => onAgrupacionChange('meses')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              agrupacion === 'meses'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Por Meses del Año
          </button>
          <button
            onClick={() => onAgrupacionChange('años')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              agrupacion === 'años'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Por Años
          </button>
        </div>
      </div>

      {/* Contenido gráfico */}
      <div className="flex-1 min-h-0">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">Error al cargar datos</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">Cargando datos...</p>
            </div>
          </div>
        ) : chartData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">No hay datos disponibles para el período seleccionado</p>
          </div>
        )}
      </div>
    </div>
  );
};

IncidentesPorPeriodoChart.propTypes = {
  chartData: PropTypes.object,
  chartOptions: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
  agrupacion: PropTypes.oneOf(['dias', 'meses', 'años']).isRequired,
  onAgrupacionChange: PropTypes.func.isRequired,
};

export default IncidentesPorPeriodoChart;
