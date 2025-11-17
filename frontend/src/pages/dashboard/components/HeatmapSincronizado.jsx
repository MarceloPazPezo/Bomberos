import React from 'react';
import PropTypes from 'prop-types';

const HeatmapSincronizado = ({ 
  chartData, 
  loading, 
  error, 
  title, 
  subtitle, 
  colorScheme = 'red',
  hoveredKey,
  onHoverCell,
  dataLabel = 'Valor'
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '350px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Cargando mapa de calor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height: '350px' }}>
        <div className="text-center">
          <p className="text-red-500 text-sm font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: '350px' }}>
        <div className="text-center">
          <p className="text-gray-500 text-sm">No hay datos disponibles para el período seleccionado</p>
        </div>
      </div>
    );
  }

  // Obtener valores únicos de días y horas
  const dias = [...new Set(chartData.map(d => d.dia))];
  const horas = Array.from({ length: 24 }, (_, i) => i);

  // Calcular el máximo para la escala de color
  const maxValue = Math.max(...chartData.map(d => d.cantidad));
  
  // Esquemas de color
  const colorSchemes = {
    red: {
      empty: 'rgb(245, 247, 250)',
      levels: [
        'rgb(254, 226, 226)', // Muy bajo
        'rgb(254, 202, 202)', // Bajo
        'rgb(252, 165, 165)', // Medio
        'rgb(248, 113, 113)', // Alto
        'rgb(239, 68, 68)',   // Muy alto
      ]
    },
    blue: {
      empty: 'rgb(245, 247, 250)',
      levels: [
        'rgb(219, 234, 254)', // Muy bajo
        'rgb(191, 219, 254)', // Bajo
        'rgb(147, 197, 253)', // Medio
        'rgb(96, 165, 250)',  // Alto
        'rgb(59, 130, 246)',  // Muy alto
      ]
    },
    green: {
      empty: 'rgb(245, 247, 250)',
      levels: [
        'rgb(220, 252, 231)', // Muy bajo
        'rgb(187, 247, 208)', // Bajo
        'rgb(134, 239, 172)', // Medio
        'rgb(74, 222, 128)',  // Alto
        'rgb(34, 197, 94)',   // Muy alto
      ]
    }
  };

  const currentScheme = colorSchemes[colorScheme] || colorSchemes.red;
  
  // Función para obtener el color basado en la intensidad
  const getColor = (cantidad) => {
    if (cantidad === 0) return currentScheme.empty;
    
    const intensity = cantidad / maxValue;
    
    if (intensity < 0.2) return currentScheme.levels[0];
    if (intensity < 0.4) return currentScheme.levels[1];
    if (intensity < 0.6) return currentScheme.levels[2];
    if (intensity < 0.8) return currentScheme.levels[3];
    return currentScheme.levels[4];
  };

  // Obtener cantidad para un día y hora específicos
  const getCantidad = (dia, hora) => {
    const item = chartData.find(d => d.dia === dia && d.hora === hora);
    return item ? item.cantidad : 0;
  };

  // Obtener dow de un día (consistente con backend: 1=Lunes, 7=Domingo)
  const getDow = (dia) => {
    const dowMap = {
      'lunes': 1,
      'martes': 2,
      'miércoles': 3,
      'jueves': 4,
      'viernes': 5,
      'sábado': 6,
      'domingo': 7
    };
    return dowMap[dia.toLowerCase()];
  };

  return (
    <div className="p-3">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {title}
        </h3>
        <p className="text-xs text-gray-600">
          {subtitle}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Grid container */}
          <div className="grid grid-cols-[100px_repeat(24,minmax(26px,1fr))] gap-0.5">
            {/* Header con horas */}
            <div className="font-semibold text-[10px] text-gray-700 flex items-center justify-end pr-2">
              Día / Hora
            </div>
            {horas.map(hora => (
              <div
                key={`header-${hora}`}
                className="font-semibold text-[10px] text-gray-700 text-center flex items-center justify-center"
              >
                {hora}h
              </div>
            ))}

            {/* Filas de días */}
            {dias.map(dia => (
              <React.Fragment key={dia}>
                {/* Label del día */}
                <div className="font-semibold text-xs text-gray-800 flex items-center justify-end pr-2 py-0.5">
                  {dia}
                </div>
                
                {/* Celdas de horas */}
                {horas.map(hora => {
                  const cantidad = getCantidad(dia, hora);
                  const color = getColor(cantidad);
                  const dow = getDow(dia);
                  const cellKey = `${dow}-${hora}`;
                  const isHovered = hoveredKey === cellKey;
                  
                  return (
                    <div
                      key={`${dia}-${hora}`}
                      className={`group relative flex items-center justify-center rounded cursor-pointer transition-all duration-200 ${
                        isHovered ? 'ring-2 ring-offset-1 ring-blue-500 z-10 scale-110' : 'hover:ring-2 hover:ring-gray-400 hover:z-10'
                      }`}
                      style={{
                        backgroundColor: color,
                        minHeight: '28px',
                      }}
                      onMouseEnter={() => onHoverCell({ dow, hora })}
                      onMouseLeave={() => onHoverCell(null)}
                    >
                      {/* Mostrar número si hay datos */}
                      {cantidad > 0 && (
                        <span className="text-[10px] font-medium text-gray-800">
                          {cantidad}
                        </span>
                      )}
                      
                      {/* Tooltip */}
                      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg ${
                        isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <div className="font-semibold">{dia} - {hora}:00</div>
                        <div className="mt-1">{dataLabel}: {cantidad}</div>
                        {/* Flecha del tooltip */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Leyenda de colores */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-xs font-medium text-gray-700">Intensidad:</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600">Baja</span>
              <div className="flex gap-1">
                {currentScheme.levels.map((color, idx) => (
                  <div key={idx} className="w-6 h-4 rounded" style={{ backgroundColor: color }}></div>
                ))}
              </div>
              <span className="text-[10px] text-gray-600">Alta</span>
            </div>
            <span className="text-[10px] text-gray-500">
              (Máx: {maxValue})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

HeatmapSincronizado.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      dia: PropTypes.string.isRequired,
      hora: PropTypes.number.isRequired,
      cantidad: PropTypes.number.isRequired,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  colorScheme: PropTypes.oneOf(['red', 'blue', 'green']),
  hoveredKey: PropTypes.string,
  onHoverCell: PropTypes.func.isRequired,
  dataLabel: PropTypes.string,
};

export default HeatmapSincronizado;
