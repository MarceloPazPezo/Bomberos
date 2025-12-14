import React from "react";
import PropTypes from "prop-types";
import { MdCalendarToday, MdDateRange, MdEvent } from "react-icons/md";

const GranularidadSelector = ({ granularidad, onChange }) => {
  const opciones = [
    { value: "semana", label: "Por Semana", Icon: MdEvent },
    { value: "mes", label: "Por Mes", Icon: MdDateRange },
    { value: "año", label: "Por Año", Icon: MdCalendarToday },
  ];

  return (
    <div className="bg-white p-4  mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
          Agrupar por:
        </label>
        <div className="flex flex-wrap gap-2">
          {opciones.map((opcion) => {
            const IconComponent = opcion.Icon;
            return (
              <button
                key={opcion.value}
                onClick={() => onChange(opcion.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  flex items-center gap-2
                  ${
                    granularidad === opcion.value
                      ? "bg-[#4EB9FA] text-white shadow-md scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                  }
                `}
              >
                <IconComponent className="w-5 h-5" />
                <span>{opcion.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

GranularidadSelector.propTypes = {
  granularidad: PropTypes.oneOf(["semana", "mes", "año"]).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default GranularidadSelector;
