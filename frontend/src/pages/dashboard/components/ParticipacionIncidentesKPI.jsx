import React from 'react';
import PropTypes from 'prop-types';
import { MdShowChart } from 'react-icons/md';

const ParticipacionIncidentesKPI = ({ 
  porcentaje = 0, 
  asistenciaPromedio = 0, 
  totalVoluntarios = 0,
  filtroActivo = 'mensual', 
  onFiltroChange, 
  loading = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <MdShowChart className="text-green-600" size={20} />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">
          Participación en Incidentes
        </h3>
      </div>

      {/* KPI Value */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-green-600">
                {Number(porcentaje || 0).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">participación promedio</p>
          </div>

        </>
      )}

      {/* Filtros Radio */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onFiltroChange('semanal')}
          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            filtroActivo === 'semanal'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Semanal
        </button>
        <button
          onClick={() => onFiltroChange('mensual')}
          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            filtroActivo === 'mensual'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => onFiltroChange('anual')}
          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            filtroActivo === 'anual'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Anual
        </button>
      </div>
    </div>
  );
};

ParticipacionIncidentesKPI.propTypes = {
  porcentaje: PropTypes.number,
  asistenciaPromedio: PropTypes.number,
  totalVoluntarios: PropTypes.number,
  filtroActivo: PropTypes.oneOf(['semanal', 'mensual', 'anual']),
  onFiltroChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ParticipacionIncidentesKPI;
