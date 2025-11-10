import React from 'react';
import PropTypes from 'prop-types';
import { MdPeople } from 'react-icons/md';

const AsistenciaPromedioKPI = ({ 
  promedio = 0, 
  totalIncidentes = 0, 
  totalVoluntarios = 0,
  filtroActivo = 'mensual', 
  onFiltroChange, 
  loading = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MdPeople className="text-blue-600" size={20} />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">
          Asistencia Promedio
        </h3>
      </div>

      {/* KPI Value */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-blue-600">
                {promedio || 0}
              </span>
              <span className="text-sm text-gray-500">voluntarios</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">por incidente</p>
          </div>

          {/* Stats adicionales */}
          <div className="grid grid-cols-2 gap-2 mb-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Total incidentes</p>
              <p className="text-sm font-semibold text-gray-700">{totalIncidentes || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total asistencias</p>
              <p className="text-sm font-semibold text-gray-700">{totalVoluntarios || 0}</p>
            </div>
          </div>
        </>
      )}

      {/* Filtros Radio */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onFiltroChange('semanal')}
          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            filtroActivo === 'semanal'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Semanal
        </button>
        <button
          onClick={() => onFiltroChange('mensual')}
          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            filtroActivo === 'mensual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => onFiltroChange('anual')}
          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            filtroActivo === 'anual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Anual
        </button>
      </div>
    </div>
  );
};

AsistenciaPromedioKPI.propTypes = {
  promedio: PropTypes.number,
  totalIncidentes: PropTypes.number,
  totalVoluntarios: PropTypes.number,
  filtroActivo: PropTypes.oneOf(['semanal', 'mensual', 'anual']),
  onFiltroChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};



export default AsistenciaPromedioKPI;
