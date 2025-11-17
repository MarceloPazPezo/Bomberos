import React from 'react';
import PropTypes from 'prop-types';

const QuickFilters = ({ filtroRapido, onFilterChange }) => {
  const filtros = [
    { id: 'semanal', label: 'Semanal' },
    { id: 'mensual', label: 'Mensual' },
    { id: 'anual', label: 'Anual' },
  ];

  return (
    <div className="mb-3 sm:mb-4">
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
        Acceso Rápido
      </label>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {filtros.map((filtro) => (
          <button
            key={filtro.id}
            onClick={() => onFilterChange(filtro.id)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
              filtroRapido === filtro.id
                ? 'bg-[#4EB9FA] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>
    </div>
  );
};

QuickFilters.propTypes = {
  filtroRapido: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
};

export default QuickFilters;
