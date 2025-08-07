import React, { useState, useRef, useEffect } from 'react';
import { MdKeyboardArrowDown, MdClose } from 'react-icons/md';
import PropTypes from 'prop-types';

const MultiSelect = ({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Seleccionar opciones...",
  label,
  required = false,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener las opciones seleccionadas
  const selectedOptions = options.filter(option => value.includes(option.value));

  // Manejar clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar selección de opción
  const handleOptionSelect = (optionValue) => {
    let newValue;
    if (value.includes(optionValue)) {
      // Remover si ya está seleccionado
      newValue = value.filter(v => v !== optionValue);
    } else {
      // Agregar si no está seleccionado
      newValue = [...value, optionValue];
    }
    onChange(newValue);
  };

  // Remover opción seleccionada
  const handleRemoveOption = (optionValue, event) => {
    event.stopPropagation();
    const newValue = value.filter(v => v !== optionValue);
    onChange(newValue);
  };

  // Limpiar todas las selecciones
  const handleClearAll = (event) => {
    event.stopPropagation();
    onChange([]);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Campo principal */}
      <div
        className={`
          min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg 
          bg-white cursor-pointer transition-all duration-200
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-[#4EB9FA] focus-within:border-[#4EB9FA] focus-within:ring-1 focus-within:ring-[#4EB9FA]'}
          ${isOpen ? 'border-[#4EB9FA] ring-1 ring-[#4EB9FA]' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 items-center min-h-[26px]">
          {/* Opciones seleccionadas */}
          {selectedOptions.length > 0 ? (
            selectedOptions.map(option => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[#4EB9FA]/10 text-[#2C3E50] text-sm rounded-md border border-[#4EB9FA]/20"
              >
                {option.label}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveOption(option.value, e)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <MdClose size={14} />
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          )}
          
          {/* Botones de acción */}
          <div className="ml-auto flex items-center gap-1">
            {selectedOptions.length > 0 && !disabled && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpiar todo"
              >
                <MdClose size={16} />
              </button>
            )}
            <MdKeyboardArrowDown 
              className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              size={20}
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Campo de búsqueda */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#4EB9FA]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Lista de opciones */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors duration-150
                    ${value.includes(option.value) 
                      ? 'bg-[#4EB9FA]/10 text-[#2C3E50]' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                  onClick={() => handleOptionSelect(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.label}</span>
                    {value.includes(option.value) && (
                      <span className="text-[#4EB9FA] text-xs">✓</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No se encontraron opciones
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

MultiSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })).isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default MultiSelect;