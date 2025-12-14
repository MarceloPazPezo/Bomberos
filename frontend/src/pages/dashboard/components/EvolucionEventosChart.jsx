import React from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import { MdWarning, MdBarChart } from "react-icons/md";

/**
 * Componente de gráfico de líneas para evolución de eventos y asistentes
 * Muestra dos líneas: cantidad de eventos y total de asistentes por fecha
 */
const EvolucionEventosChart = ({
  chartData = null,
  chartOptions = {},
  loading = false,
  error = null,
}) => {
  // Estado de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 text-sm">Cargando evolución...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-2 px-4">
          <MdWarning className="text-red-500 w-8 h-8" />
          <p className="text-red-700 font-semibold text-center text-sm">Error al cargar datos</p>
          <p className="text-red-600 text-xs text-center">{error}</p>
        </div>
      </div>
    );
  }

  // Sin datos
  if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-2">
          <MdBarChart className="text-gray-400 w-8 h-8" />
          <p className="text-gray-600 text-sm">No hay datos para mostrar</p>
          <p className="text-gray-500 text-xs">Ajusta el rango de fechas o el filtro de tipo</p>
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

EvolucionEventosChart.propTypes = {
  chartData: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        borderColor: PropTypes.string,
        backgroundColor: PropTypes.string,
      })
    ),
  }),
  chartOptions: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default EvolucionEventosChart;
