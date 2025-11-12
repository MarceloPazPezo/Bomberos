import React from 'react';
import PropTypes from 'prop-types';
import { MdLocalFireDepartment, MdLocalShipping } from 'react-icons/md';

const ResponsabilidadesKPI = ({ 
  incidentesACargo = 0, 
  vecesChofer = 0,
  loading = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <MdLocalFireDepartment className="text-orange-600" size={20} />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">
          Responsabilidades
        </h3>
      </div>

      {/* KPI Values */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <>
          {/* Grid de métricas */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Incidentes a cargo */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <MdLocalFireDepartment className="text-blue-600" size={16} />
                <p className="text-xs text-gray-600 font-medium">A cargo</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-600">
                  {incidentesACargo || 0}
                </span>
                <span className="text-xs text-gray-500">incidentes</span>
              </div>
            </div>

            {/* Veces como chofer */}
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <div className="flex items-center gap-2 mb-1">
                <MdLocalShipping className="text-green-600" size={16} />
                <p className="text-xs text-gray-600 font-medium">Chofer</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-green-600">
                  {vecesChofer || 0}
                </span>
                <span className="text-xs text-gray-500">veces</span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600 text-center">
              Total de responsabilidades: <span className="font-semibold text-gray-800">{(incidentesACargo || 0) + (vecesChofer || 0)}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

ResponsabilidadesKPI.propTypes = {
  incidentesACargo: PropTypes.number,
  vecesChofer: PropTypes.number,
  loading: PropTypes.bool,
};

export default ResponsabilidadesKPI;
