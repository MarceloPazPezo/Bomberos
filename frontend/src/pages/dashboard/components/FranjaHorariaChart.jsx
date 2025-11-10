import React from 'react';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';

const FranjaHorariaChart = ({ chartData, chartOptions, loading, error }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '350px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height: '350px' }}>
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center" style={{ height: '350px' }}>
        <div className="text-center">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  // Verificar si hay datos para mostrar
  const hasData = chartData.datasets[0].data.some(value => value > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center" style={{ height: '350px' }}>
        <div className="text-center">
          <p className="text-gray-500">No hay incidentes en el período seleccionado</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '350px' }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

FranjaHorariaChart.propTypes = {
  chartData: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.number),
        backgroundColor: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(PropTypes.string)
        ]),
        borderColor: PropTypes.string,
        borderWidth: PropTypes.number,
        borderRadius: PropTypes.number,
      })
    ),
  }),
  chartOptions: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default FranjaHorariaChart;
