import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'primereact/dropdown';

const YearFilter = ({ añoDesde, añoHasta, onAñoDesdeChange, onAñoHastaChange }) => {
  // Generar lista de años (últimos 10 años + año actual)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push({ label: i.toString(), value: i });
  }

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="añoDesde" className="block text-sm font-medium text-gray-700 mb-2">
          Año Desde
        </label>
        <Dropdown
          id="añoDesde"
          value={añoDesde}
          options={years}
          onChange={(e) => onAñoDesdeChange(e.value)}
          placeholder="Seleccione año"
          className="w-full"
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="añoHasta" className="block text-sm font-medium text-gray-700 mb-2">
          Año Hasta
        </label>
        <Dropdown
          id="añoHasta"
          value={añoHasta}
          options={years.filter(year => !añoDesde || year.value >= añoDesde)}
          onChange={(e) => onAñoHastaChange(e.value)}
          placeholder="Seleccione año"
          className="w-full"
          disabled={!añoDesde}
        />
      </div>
    </div>
  );
};

YearFilter.propTypes = {
  añoDesde: PropTypes.number,
  añoHasta: PropTypes.number,
  onAñoDesdeChange: PropTypes.func.isRequired,
  onAñoHastaChange: PropTypes.func.isRequired,
};

export default YearFilter;
