import React from 'react';
import PropTypes from 'prop-types';
import { Calendar } from 'primereact/calendar';

const CustomFilters = ({ 
  fechaInicio, 
  fechaFin, 
  onFechaInicioChange, 
  onFechaFinChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
      <div className="flex-1 min-w-0 sm:min-w-[200px]">
        <label htmlFor="fechaInicio" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          Fecha Inicio
        </label>
        <Calendar
          id="fechaInicio"
          value={fechaInicio}
          onChange={(e) => onFechaInicioChange(e.value)}
          dateFormat="dd/mm/yy"
          showIcon
          maxDate={fechaFin}
          className="w-full"
          placeholder="Seleccione fecha inicio"
        />
      </div>
        <div className="flex-1 min-w-0 sm:min-w-[200px]">
          <label htmlFor="fechaFin" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          Fecha Fin
        </label>
        <Calendar
          id="fechaFin"
          value={fechaFin}
          onChange={(e) => onFechaFinChange(e.value)}
          dateFormat="dd/mm/yy"
          showIcon
          minDate={fechaInicio}
          className="w-full"
          placeholder="Seleccione fecha fin"
        />
      </div>
    </div>
  );
};

CustomFilters.propTypes = {
  fechaInicio: PropTypes.instanceOf(Date),
  fechaFin: PropTypes.instanceOf(Date),
  onFechaInicioChange: PropTypes.func.isRequired,
  onFechaFinChange: PropTypes.func.isRequired,
};

export default CustomFilters;
