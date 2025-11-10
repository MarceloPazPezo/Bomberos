import React from 'react';
import PropTypes from 'prop-types';

const HeatmapDiaHora = ({ chartData, loading, error }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '500px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando mapa de calor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height: '500px' }}>
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: '500px' }}>
        <div className="text-center">
          <p className="text-gray-500">No hay datos disponibles para el período seleccionado</p>
        </div>
      </div>
    );
  }

  // Obtener valores únicos de días y horas
  const dias = [...new Set(chartData.map(d => d.dia))];
  const horas = Array.from({ length: 24 }, (_, i) => i);

  // Calcular el máximo para la escala de color
  const maxValue = Math.max(...chartData.map(d => d.cantidad));
  
  // Función para obtener el color basado en la intensidad
  const getColor = (cantidad) => {
    if (cantidad === 0) return 'rgb(245, 247, 250)'; // Gris muy claro
    
    const intensity = cantidad / maxValue;
    
    // Escala de color rojo (de claro a oscuro)
    if (intensity < 0.2) return 'rgb(254, 226, 226)'; // Muy bajo
    if (intensity < 0.4) return 'rgb(254, 202, 202)'; // Bajo
    if (intensity < 0.6) return 'rgb(252, 165, 165)'; // Medio
    if (intensity < 0.8) return 'rgb(248, 113, 113)'; // Alto
    return 'rgb(239, 68, 68)'; // Muy alto
  };

  // Obtener cantidad para un día y hora específicos
  const getCantidad = (dia, hora) => {
    const item = chartData.find(d => d.dia === dia && d.hora === hora);
    return item ? item.cantidad : 0;
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Mapa de Calor: Día de la Semana × Hora del Día
        </h3>
        <p className="text-sm text-gray-600">
          Patrón de incidentes por día de la semana y hora del día (ventanas pico)
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Grid container */}
          <div className="grid grid-cols-[120px_repeat(24,minmax(32px,1fr))] gap-1">
            {/* Header con horas */}
            <div className="font-semibold text-xs text-gray-700 flex items-center justify-end pr-2">
              Día / Hora
            </div>
            {horas.map(hora => (
              <div
                key={`header-${hora}`}
                className="font-semibold text-xs text-gray-700 text-center flex items-center justify-center"
              >
                {hora}h
              </div>
            ))}

            {/* Filas de días */}
            {dias.map(dia => (
              <React.Fragment key={dia}>
                {/* Label del día */}
                <div className="font-semibold text-sm text-gray-800 flex items-center justify-end pr-2 py-1">
                  {dia}
                </div>
                
                {/* Celdas de horas */}
                {horas.map(hora => {
                  const cantidad = getCantidad(dia, hora);
                  const color = getColor(cantidad);
                  
                  return (
                    <div
                      key={`${dia}-${hora}`}
                      className="group relative flex items-center justify-center rounded cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-red-400 hover:z-10"
                      style={{
                        backgroundColor: color,
                        minHeight: '40px',
                      }}
                    >
                      {/* Mostrar número si hay incidentes */}
                      {cantidad > 0 && (
                        <span className="text-xs font-medium text-gray-800">
                          {cantidad}
                        </span>
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                        <div className="font-semibold">{dia} - {hora}:00</div>
                        <div className="mt-1">Incidentes: {cantidad}</div>
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
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className="text-sm font-medium text-gray-700">Intensidad:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Baja</span>
              <div className="flex gap-1">
                <div className="w-8 h-6 rounded" style={{ backgroundColor: 'rgb(254, 226, 226)' }}></div>
                <div className="w-8 h-6 rounded" style={{ backgroundColor: 'rgb(254, 202, 202)' }}></div>
                <div className="w-8 h-6 rounded" style={{ backgroundColor: 'rgb(252, 165, 165)' }}></div>
                <div className="w-8 h-6 rounded" style={{ backgroundColor: 'rgb(248, 113, 113)' }}></div>
                <div className="w-8 h-6 rounded" style={{ backgroundColor: 'rgb(239, 68, 68)' }}></div>
              </div>
              <span className="text-xs text-gray-600">Alta</span>
            </div>
            <span className="text-xs text-gray-500">
              (Máximo: {maxValue} incidentes)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

HeatmapDiaHora.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      dia: PropTypes.string.isRequired,
      hora: PropTypes.number.isRequired,
      cantidad: PropTypes.number.isRequired,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default HeatmapDiaHora;
