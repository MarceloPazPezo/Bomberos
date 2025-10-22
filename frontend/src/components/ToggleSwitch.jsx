import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente ToggleSwitch (interruptor deslizante)
 * Para valores booleanos con mejor UX que checkboxes
 */
const ToggleSwitch = ({ 
  checked = false, 
  onChange, 
  disabled = false, 
  size = 'md',
  label = '',
  id = '',
  className = '',
  ...props 
}) => {
  // Tamaños predefinidos
  const sizeClasses = {
    sm: {
      container: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      container: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      container: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  };

  const currentSize = sizeClasses[size];

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`} {...props}>
      {label && (
        <label 
          htmlFor={id}
          className={`text-sm font-medium text-gray-700 ${disabled ? 'text-gray-400' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
      
      <button
        type="button"
        id={id}
        onClick={handleToggle}
        disabled={disabled}
        className={`
          ${currentSize.container}
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-200 hover:bg-gray-300'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer'
          }
        `}
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? `${id}-label` : undefined}
      >
        <span
          className={`
            ${currentSize.thumb}
            inline-block transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
            ${checked ? currentSize.translate : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
};

ToggleSwitch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string
};

export default ToggleSwitch;
