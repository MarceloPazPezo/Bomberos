import React from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import { MdWarning, MdTrendingUp } from "react-icons/md";

const TendenciaMensualAsistenciaChart = ({
  chartData = null,
  chartOptions,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando tendencia mensual...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <MdWarning className="text-red-500 w-12 h-12 mb-4 mx-auto" />
            <p className="text-red-600 font-semibold mb-2">Error al cargar los datos</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MdTrendingUp className="text-gray-400 w-10 h-10 mb-3 mx-auto" />
          <p className="text-gray-500 text-sm">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

TendenciaMensualAsistenciaChart.propTypes = {
  chartData: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        borderColor: PropTypes.string,
        backgroundColor: PropTypes.string,
      })
    ).isRequired,
  }),
  chartOptions: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default TendenciaMensualAsistenciaChart;
