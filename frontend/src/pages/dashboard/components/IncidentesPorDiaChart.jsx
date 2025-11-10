import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';

const IncidentesPorDiaChart = ({ chartData, chartOptions, loading, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-[#4EB9FA] mb-3"></i>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-gray-500">
          Seleccione un rango de fechas para visualizar los datos
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

IncidentesPorDiaChart.propTypes = {
  chartData: PropTypes.object,
  chartOptions: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default IncidentesPorDiaChart;
