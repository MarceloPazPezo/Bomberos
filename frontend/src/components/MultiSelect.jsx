import React from 'react';
import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';
import PropTypes from 'prop-types';

const animatedComponents = makeAnimated();

const filterOptions = (inputValue, options) => {
  return options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );
};

const promiseOptions = (inputValue, options) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(filterOptions(inputValue, options));
    }, 1000);
  });

const customStyles = {
  control: (styles, { isFocused, isDisabled }) => ({
    ...styles,
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: isFocused ? 'rgba(78, 185, 250, 0.4)' : 'rgba(44, 62, 80, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    minHeight: '48px',
    boxShadow: isFocused ? '0 0 0 2px rgba(78, 185, 250, 0.4)' : 'none',
    '&:hover': {
      borderColor: isFocused ? 'rgba(78, 185, 250, 0.4)' : 'rgba(44, 62, 80, 0.3)',
    },
    cursor: isDisabled ? 'not-allowed' : 'default',
    opacity: isDisabled ? 0.6 : 1,
  }),
  menu: (styles) => ({
    ...styles,
    zIndex: 50,
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(44, 62, 80, 0.2)',
    overflow: 'hidden',
    marginTop: '4px',
    width: '100%',
    minWidth: '200px',
    maxWidth: '100vw',
  }),
  menuList: (styles) => ({
    ...styles,
    maxHeight: '200px',
    overflowY: 'auto',
    padding: '4px',
    width: '100%',
    boxSizing: 'border-box',
  }),
  option: (styles, { isDisabled, isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isDisabled
      ? 'transparent'
      : isSelected
      ? '#4EB9FA'
      : isFocused
      ? 'rgba(78, 185, 250, 0.1)'
      : 'transparent',
    color: isDisabled ? '#ccc' : isSelected ? 'white' : '#2C3E50',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    borderRadius: '6px',
    margin: '2px 0',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: isSelected ? '500' : '400',
    ':active': {
      ...styles[':active'],
      backgroundColor: !isDisabled
        ? isSelected
          ? '#4EB9FA'
          : 'rgba(78, 185, 250, 0.2)'
        : 'transparent',
    },
  }),
  multiValue: (styles) => ({
    ...styles,
    backgroundColor: 'rgba(78, 185, 250, 0.1)',
    borderRadius: '6px',
    margin: '2px',
    border: '1px solid rgba(78, 185, 250, 0.3)',
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    color: '#2C3E50',
    fontSize: '14px',
    fontWeight: '500',
    paddingLeft: '8px',
    paddingRight: '4px',
  }),
  multiValueRemove: (styles) => ({
    ...styles,
    color: '#2C3E50',
    cursor: 'pointer',
    borderRadius: '0 6px 6px 0',
    paddingLeft: '4px',
    paddingRight: '8px',
    ':hover': {
      backgroundColor: '#ef4444',
      color: 'white',
    },
  }),
  placeholder: (styles) => ({
    ...styles,
    color: 'rgba(44, 62, 80, 0.6)',
    fontSize: '14px',
  }),
  singleValue: (styles) => ({
    ...styles,
    color: '#2C3E50',
    fontSize: '14px',
  }),
  input: (styles) => ({
    ...styles,
    color: '#2C3E50',
    fontSize: '14px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
    color: 'rgba(44, 62, 80, 0.6)',
    ':hover': {
      color: '#2C3E50',
    },
  }),
  clearIndicator: (styles) => ({
    ...styles,
    color: 'rgba(44, 62, 80, 0.6)',
    ':hover': {
      color: '#ef4444',
    },
  }),
};

const MultiSelect = ({
  options = [],
  selectedOptions = [],
  onChange,
  name,
  isLoading = false,
  icon = null,
  placeholder = "Seleccionar opciones...",
  searchPlaceholder = "Buscar...",
  required = false,
}) => {
  const loadOptions = (inputValue) => promiseOptions(inputValue, options);

  // Validar que las opciones tengan la estructura correcta
  const validOptions = options.filter(option => 
    option && 
    typeof option === 'object' && 
    option.hasOwnProperty('value') && 
    option.hasOwnProperty('label') &&
    option.value !== undefined &&
    option.value !== null &&
    option.label !== undefined &&
    option.label !== null &&
    option.value !== '' // También filtrar valores vacíos
  );

  // Estilos personalizados que consideran el icono
  const stylesWithIcon = {
    ...customStyles,
    control: (styles, state) => ({
      ...customStyles.control(styles, state),
      paddingLeft: icon ? '40px' : '12px', // Espacio para el icono
    }),
  };

  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2C3E50] opacity-70 pointer-events-none z-10">
          {icon}
        </span>
      )}
      <AsyncSelect
        isMulti
        cacheOptions
        defaultOptions={validOptions} // Usar las opciones validadas
        components={animatedComponents}
        loadOptions={(inputValue) => promiseOptions(inputValue, validOptions)}
        value={selectedOptions}
        isLoading={isLoading}
        onChange={(selected) => onChange(name, selected || [])}
        name={name}
        styles={stylesWithIcon}
        placeholder={placeholder}
        noOptionsMessage={() => validOptions.length === 0 ? "No hay opciones disponibles" : "No se encontraron opciones"}
        loadingMessage={() => "Cargando..."}
        menuPlacement="auto"
        menuPosition="absolute"
        menuShouldScrollIntoView={false}
        closeMenuOnScroll={false}
        isClearable={true}
        isSearchable={true}
        blurInputOnSelect={false}
        captureMenuScroll={false}
        menuShouldBlockScroll={false}
        maxMenuHeight={200}
        menuPortalTarget={null}
      />
    </div>
  );
};

MultiSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  icon: PropTypes.element,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  required: PropTypes.bool,
};

export default MultiSelect;