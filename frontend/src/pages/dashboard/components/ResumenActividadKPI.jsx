import React from 'react';
import PropTypes from 'prop-types';
import { MdAccessTime, MdCalendarToday, MdEventAvailable, MdAvTimer } from 'react-icons/md';

const ResumenActividadKPI = ({ 
  horasDisponibles = 0,
  minutosDisponibles = 0,
  diasDisponibles = 0,
  totalSesiones = 0,
  promedioHorasSesion = 0,
  promedioMinutosSesion = 0,
  loading = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <MdAccessTime className="text-green-600" size={20} />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">
          Mi Disponibilidad
        </h3>
      </div>

      {/* KPI Values */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          {/* Total de horas destacado */}
          <div className="mb-3 bg-linear-to-br from-green-50 to-emerald-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <MdAccessTime className="text-green-600" size={20} />
              <span className="text-xs font-medium text-green-800">Tiempo total</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-green-600">
                {horasDisponibles || 0}
              </span>
              <span className="text-lg font-semibold text-green-600">h</span>
              {minutosDisponibles > 0 && (
                <>
                  <span className="text-2xl font-bold text-green-600 ml-1">
                    {minutosDisponibles}
                  </span>
                  <span className="text-lg font-semibold text-green-600">m</span>
                </>
              )}
            </div>
          </div>

          {/* Métricas de disponibilidad */}
          <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-gray-100">
            {/* Días distintos */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded">
                <MdCalendarToday className="text-blue-600" size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Días</p>
                <p className="text-lg font-semibold text-gray-700">{diasDisponibles || 0}</p>
              </div>
            </div>

            {/* Total de sesiones */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded">
                <MdEventAvailable className="text-purple-600" size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Sesiones</p>
                <p className="text-lg font-semibold text-gray-700">{totalSesiones || 0}</p>
              </div>
            </div>
          </div>

          {/* Promedio por sesión */}
          <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
            <div className="flex items-center gap-2 mb-1">
              <MdAvTimer className="text-amber-600" size={16} />
              <p className="text-xs font-medium text-amber-900">Promedio por sesión</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-amber-700">
                {promedioHorasSesion || 0}
              </span>
              <span className="text-sm font-semibold text-amber-700">h</span>
              {promedioMinutosSesion > 0 && (
                <>
                  <span className="text-xl font-bold text-amber-700 ml-1">
                    {promedioMinutosSesion}
                  </span>
                  <span className="text-sm font-semibold text-amber-700">m</span>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

ResumenActividadKPI.propTypes = {
  horasDisponibles: PropTypes.number,
  minutosDisponibles: PropTypes.number,
  diasDisponibles: PropTypes.number,
  totalSesiones: PropTypes.number,
  promedioHorasSesion: PropTypes.number,
  promedioMinutosSesion: PropTypes.number,
  loading: PropTypes.bool,
};

export default ResumenActividadKPI;
