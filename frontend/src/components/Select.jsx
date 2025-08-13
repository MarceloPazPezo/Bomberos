import React, { useState, useRef, useEffect } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import PropTypes from 'prop-types';

const Select = ({ 
  options = [], 
  value = '', 
  onChange, 
  placeholder = 'Seleccionar opción',
  disabled = false,
  icon = null,
  className = '',
  name = '',
  required = false,
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calcular posición del dropdown
  const calculateDropdownPosition = () => {
    if (!selectRef.current) return;

    const selectRect = selectRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 200; // Altura máxima estimada del dropdown
    
    const spaceBelow = viewportHeight - selectRect.bottom;
    const spaceAbove = selectRect.top;

    // Si hay más espacio arriba y no hay suficiente espacio abajo
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setDropdownPosition('top');
    } else {
      setDropdownPosition('bottom');
    }
  };

  // Manejar click fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      calculateDropdownPosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Manejar teclas
  const handleKeyDown = (event) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
    }
  };

  const handleOptionClick = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative" ref={selectRef}>
      {/* Select Button */}
      <button
        type="button"
        className={`
          relative w-full bg-white rounded-lg text-left focus:outline-none transition-all duration-200 min-h-[48px] flex items-center
          ${icon ? 'pl-11 pr-4' : 'px-3'}
          ${error ? 'border border-red-400 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' : 'border border-[rgba(44,62,80,0.2)]'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60 border-gray-200' : 'hover:border-[rgba(44,62,80,0.3)] cursor-pointer'}
          ${isOpen ? 'border-[rgba(78,185,250,0.4)] shadow-[0_0_0_2px_rgba(78,185,250,0.4)]' : ''}
          ${!isOpen && !error ? 'focus:border-[rgba(78,185,250,0.4)] focus:shadow-[0_0_0_2px_rgba(78,185,250,0.4)]' : ''}
          ${className}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
      >
        {/* Icon */}
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2C3E50] opacity-70 pointer-events-none">
            {icon}
          </span>
        )}
        
        {/* Selected Value */}
        <span className={`block truncate text-sm ${selectedOption ? 'text-[#2C3E50]' : 'text-[rgba(44,62,80,0.6)]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        {/* Arrow Icon */}
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isOpen ? (
            <MdKeyboardArrowUp className="w-5 h-5 text-[rgba(44,62,80,0.6)] transition-transform duration-200" />
          ) : (
            <MdKeyboardArrowDown className="w-5 h-5 text-[rgba(44,62,80,0.6)] transition-transform duration-200" />
          )}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-50 w-full bg-white rounded-lg overflow-hidden mt-1 min-w-[200px] max-w-[100vw]
            ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
          `}
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(44, 62, 80, 0.2)',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '4px' }}>
            {/* Empty Option */}
            <button
              type="button"
              style={{
                backgroundColor: 'transparent',
                borderRadius: '6px',
                margin: '2px 0',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '400',
              }}
              className="w-full text-left text-[rgba(44,62,80,0.6)] hover:bg-[rgba(78,185,250,0.1)] hover:text-[#2C3E50] transition-colors duration-150 border-b border-gray-100 cursor-pointer"
              onClick={() => handleOptionClick('')}
            >
              {placeholder}
            </button>
            
            {/* Options */}
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                style={{
                  backgroundColor: option.value === value ? '#4EB9FA' : 'transparent',
                  borderRadius: '6px',
                  margin: '2px 0',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: option.value === value ? '500' : '400',
                }}
                className={`
                  w-full text-left transition-colors duration-150 cursor-pointer
                  ${option.value === value
                    ? 'text-white hover:bg-[#4EB9FA]'
                    : 'text-[#2C3E50] hover:bg-[rgba(78,185,250,0.1)]'
                  }
                `}
                onClick={() => handleOptionClick(option.value)}
                onMouseEnter={(e) => {
                  if (option.value !== value) {
                    e.target.style.backgroundColor = 'rgba(78, 185, 250, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (option.value !== value) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {option.label}
              </button>
            ))}
            
            {/* No Options Message */}
            {options.length === 0 && (
              <div style={{ padding: '8px 12px', fontSize: '14px' }} className="text-[rgba(44,62,80,0.6)] text-center">
                No hay opciones disponibles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.element,
  className: PropTypes.string,
  name: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.bool,
};

export default Select;