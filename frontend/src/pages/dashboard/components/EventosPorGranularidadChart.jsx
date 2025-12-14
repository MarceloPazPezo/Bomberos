import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import { MdWarning, MdBarChart } from "react-icons/md";

// Uso de parámetros por defecto en lugar de defaultProps (evita warning futuro)
const EventosPorGranularidadChart = ({
  chartData = null,
  chartOptions,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4EB9FA] mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MdWarning className="text-red-500 w-10 h-10 mb-3 mx-auto" />
          <p className="text-red-600 font-semibold mb-2 text-sm">Error al cargar los datos</p>
          <p className="text-gray-500 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MdBarChart className="text-gray-400 w-10 h-10 mb-3 mx-auto" />
          <p className="text-gray-500 text-sm">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

EventosPorGranularidadChart.propTypes = {
  chartData: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        backgroundColor: PropTypes.string,
        borderColor: PropTypes.string,
      })
    ).isRequired,
  }),
  chartOptions: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

// defaultProps eliminado: usamos valores por defecto en la firma del componente

export default EventosPorGranularidadChart;
