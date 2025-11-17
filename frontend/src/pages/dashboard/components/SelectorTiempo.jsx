import React from 'react';
import PropTypes from 'prop-types';

const SelectorTiempo = ({ tiempoSeleccionado, onChange }) => {
  const opciones = [
    { value: 'semanal', label: 'Última Semana' },
    { value: 'mensual', label: 'Último Mes' },
    { value: 'anual', label: 'Último Año' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Período de Análisis
      </label>
      <div className="flex gap-2 flex-wrap">
        {opciones.map((opcion) => (
          <button
            key={opcion.value}
            onClick={() => onChange(opcion.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              tiempoSeleccionado === opcion.value
                ? 'bg-[#22C55E] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {opcion.label}
          </button>
        ))}
      </div>
    </div>
  );
};

SelectorTiempo.propTypes = {
  tiempoSeleccionado: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SelectorTiempo;
