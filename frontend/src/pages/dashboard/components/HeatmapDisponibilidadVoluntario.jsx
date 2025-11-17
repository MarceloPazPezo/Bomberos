import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const HeatmapDisponibilidadVoluntario = ({ data, loading }) => {
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const horas = Array.from({ length: 24 }, (_, i) => i);

  // Crear matriz de datos
  const matrizDatos = useMemo(() => {
    const matriz = Array(7).fill(null).map(() => Array(24).fill(0));
    
    if (data && data.length > 0) {
      data.forEach(item => {
        const dia = parseInt(item.dia_semana);
        const hora = parseInt(item.hora);
        const cantidad = parseInt(item.cantidad);
        
        if (dia >= 0 && dia < 7 && hora >= 0 && hora < 24) {
          matriz[dia][hora] = cantidad;
        }
      });
    }
    
    return matriz;
  }, [data]);

  // Encontrar el valor máximo para normalizar colores
  const maxValor = useMemo(() => {
    let max = 0;
    matrizDatos.forEach(dia => {
      dia.forEach(cantidad => {
        if (cantidad > max) max = cantidad;
      });
    });
    return max || 1; // Evitar división por 0
  }, [matrizDatos]);

  // Función para obtener el color basado en la intensidad
  const obtenerColor = (valor) => {
    if (valor === 0) return 'bg-gray-100';
    
    const intensidad = valor / maxValor;
    
    if (intensidad >= 0.8) return 'bg-green-600';
    if (intensidad >= 0.6) return 'bg-green-500';
    if (intensidad >= 0.4) return 'bg-green-400';
    if (intensidad >= 0.2) return 'bg-green-300';
    return 'bg-green-200';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-base sm:text-lg font-semibold text-[#2C3E50] mb-4">
          Mapa de Calor - Mi Disponibilidad
        </h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-base sm:text-lg font-semibold text-[#2C3E50] mb-4">
        Mapa de Calor - Día × Hora de Disponibilidad
      </h3>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Tabla del heatmap */}
          <div className="grid grid-cols-[120px_repeat(24,1fr)] gap-1">
            {/* Encabezado de horas */}
            <div className=""></div>
            {horas.map(hora => (
              <div key={`hora-${hora}`} className="text-center text-xs font-medium text-gray-600 pb-1">
                {hora.toString().padStart(2, '0')}h
              </div>
            ))}

            {/* Filas por día de la semana */}
            {diasSemana.map((dia, diaIdx) => (
              <React.Fragment key={`dia-${diaIdx}`}>
                {/* Nombre del día */}
                <div className="flex items-center text-sm font-medium text-gray-700 pr-2">
                  {dia}
                </div>

                {/* Celdas de horas */}
                {horas.map(hora => {
                  const valor = matrizDatos[diaIdx][hora];
                  const colorClass = obtenerColor(valor);
                  const horaFormateada = `${hora.toString().padStart(2, '0')}h`;
                  const registrosTexto = valor === 1 ? 'registro' : 'registros';
                  
                  return (
                    <div
                      key={`celda-${diaIdx}-${hora}`}
                      className={`h-8 ${colorClass} rounded transition-all hover:ring-2 hover:ring-green-600 hover:scale-110 cursor-pointer flex items-center justify-center relative group`}
                      title={`${dia} ${horaFormateada}: ${valor} ${registrosTexto}`}
                    >
                      {valor > 0 && (
                        <span className="text-xs font-semibold text-white">
                          {valor}
                        </span>
                      )}
                      
                      {/* Tooltip hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-semibold">{dia} {horaFormateada}</div>
                        <div className="text-gray-300">{valor} {registrosTexto}</div>
                        {/* Flecha del tooltip */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center gap-4 justify-center flex-wrap">
        <span className="text-xs text-gray-600 font-medium">Intensidad:</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-gray-100 rounded border border-gray-300"></div>
          <span className="text-xs text-gray-600">Ninguna</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-green-200 rounded"></div>
          <span className="text-xs text-gray-600">Baja</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-green-400 rounded"></div>
          <span className="text-xs text-gray-600">Media</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-green-600 rounded"></div>
          <span className="text-xs text-gray-600">Alta</span>
        </div>
      </div>
    </div>
  );
};

HeatmapDisponibilidadVoluntario.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool
};

HeatmapDisponibilidadVoluntario.defaultProps = {
  data: [],
  loading: false
};

export default HeatmapDisponibilidadVoluntario;
