import React from 'react';
import PropTypes from 'prop-types';

const AsistenciaTab = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Sección de Asistencia
        </h3>
        <p className="text-gray-500">
          Próximamente: Control de asistencia y disponibilidad de voluntarios
        </p>
        <div className="mt-6 text-sm text-gray-400">
          Aquí se mostrarán gráficos y estadísticas de asistencia y disponibilidad
        </div>
      </div>
    </div>
  );
};

AsistenciaTab.propTypes = {};

export default AsistenciaTab;
