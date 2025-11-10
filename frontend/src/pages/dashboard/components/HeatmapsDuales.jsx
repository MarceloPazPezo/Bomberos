import React, { useState } from 'react';
import PropTypes from 'prop-types';
import HeatmapSincronizado from './HeatmapSincronizado';

const HeatmapsDuales = ({ 
  dataIncidentes, 
  dataDisponibilidad,
  loadingIncidentes,
  loadingDisponibilidad,
  errorIncidentes,
  errorDisponibilidad
}) => {
  const [hoveredKey, setHoveredKey] = useState(null);

  const handleHoverCell = (cellInfo) => {
    if (cellInfo === null) {
      setHoveredKey(null);
    } else {
      const { dow, hora } = cellInfo;
      setHoveredKey(`${dow}-${hora}`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Título general */}
      <div className="text-center mb-2">
        <h2 className="text-lg font-bold text-gray-800">
          Análisis Comparativo: Incidentes vs Disponibilidad
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Hover sincronizado entre ambos mapas de calor • Patrón semanal por hora
        </p>
      </div>

      {/* Grid de 2 columnas para los heatmaps */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Heatmap de Incidentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <HeatmapSincronizado
            chartData={dataIncidentes}
            loading={loadingIncidentes}
            error={errorIncidentes}
            title="Incidentes por Día×Hora"
            subtitle="Cantidad de incidentes aprobados por ventana horaria"
            colorScheme="red"
            hoveredKey={hoveredKey}
            onHoverCell={handleHoverCell}
            dataLabel="Incidentes"
          />
        </div>

        {/* Heatmap de Disponibilidad */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <HeatmapSincronizado
            chartData={dataDisponibilidad}
            loading={loadingDisponibilidad}
            error={errorDisponibilidad}
            title="Disponibilidad por Día×Hora"
            subtitle="Promedio de voluntarios disponibles por ventana horaria"
            colorScheme="blue"
            hoveredKey={hoveredKey}
            onHoverCell={handleHoverCell}
            dataLabel="Disponibles"
          />
        </div>
      </div>
    </div>
  );
};

HeatmapsDuales.propTypes = {
  dataIncidentes: PropTypes.arrayOf(
    PropTypes.shape({
      dia: PropTypes.string.isRequired,
      hora: PropTypes.number.isRequired,
      cantidad: PropTypes.number.isRequired,
    })
  ),
  dataDisponibilidad: PropTypes.arrayOf(
    PropTypes.shape({
      dia: PropTypes.string.isRequired,
      hora: PropTypes.number.isRequired,
      cantidad: PropTypes.number.isRequired,
    })
  ),
  loadingIncidentes: PropTypes.bool,
  loadingDisponibilidad: PropTypes.bool,
  errorIncidentes: PropTypes.string,
  errorDisponibilidad: PropTypes.string,
};

export default HeatmapsDuales;
