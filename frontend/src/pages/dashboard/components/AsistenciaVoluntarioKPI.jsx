import React from 'react';
import PropTypes from 'prop-types';
import { MdCheckCircle, MdEvent, MdLocalFireDepartment } from 'react-icons/md';

const AsistenciaVoluntarioKPI = ({ 
  totalAsistencias = 0, 
  asistenciaEventos = 0, 
  asistenciaIncidentes = 0,
  loading = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <MdCheckCircle className="text-green-600" size={20} />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">
          Mis Asistencias
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
                {totalAsistencias || 0}
              </span>
              <span className="text-sm text-gray-500">asistencias</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">en el período seleccionado</p>
          </div>

          {/* Stats adicionales */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded">
                <MdEvent className="text-blue-600" size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Eventos</p>
                <p className="text-sm font-semibold text-gray-700">{asistenciaEventos || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-100 rounded">
                <MdLocalFireDepartment className="text-red-600" size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Incidentes</p>
                <p className="text-sm font-semibold text-gray-700">{asistenciaIncidentes || 0}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

AsistenciaVoluntarioKPI.propTypes = {
  totalAsistencias: PropTypes.number,
  asistenciaEventos: PropTypes.number,
  asistenciaIncidentes: PropTypes.number,
  loading: PropTypes.bool,
};

export default AsistenciaVoluntarioKPI;
