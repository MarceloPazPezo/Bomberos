import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRegion } from '@hooks/region/useRegion.jsx';
import { MdLocationOn, MdLocationCity, MdHome, MdApartment, MdDescription, MdLocalPostOffice } from 'react-icons/md';

const AddressForm = ({ 
  initialData = null, 
  onChange = () => {}, 
  errors = {}, 
  disabled = false,
  showTitle = true 
}) => {
  const { regiones, comunas, loadingComunas, fetchComunasByRegion } = useRegion();
  const lastFormDataRef = useRef(null);
  
  const [formData, setFormData] = useState({
    calle: '',
    numero: '',
    depto: '',
    referencia: '',
    codigoPostal: '',
    idRegion: '',
    idComuna: ''
  });

  // Cargar datos iniciales solo una vez al montar
  useEffect(() => {
    if (initialData) {
      const newFormData = {
        calle: initialData.calle || '',
        numero: initialData.numero || '',
        depto: initialData.depto || '',
        referencia: initialData.referencia || '',
        codigoPostal: initialData.codigoPostal || '',
        idRegion: initialData.comuna?.region?.id || '',
        idComuna: initialData.comuna?.id || ''
      };
      
      setFormData(newFormData);
    }
  }, []); // Solo se ejecuta al montar, no cuando cambia initialData

  // Cargar comunas cuando cambie la región
  useEffect(() => {
    if (formData.idRegion) {
      fetchComunasByRegion(formData.idRegion);
    }
  }, [formData.idRegion]); // Removido fetchComunasByRegion de las dependencias

  // Función estable para notificar cambios
  const stableOnChange = useCallback((data) => {
    // Solo llamar onChange si los datos realmente cambiaron
    if (JSON.stringify(data) !== JSON.stringify(lastFormDataRef.current)) {
      lastFormDataRef.current = data;
      onChange(data);
    }
  }, [onChange]);

  // Notificar cambios al componente padre
  useEffect(() => {
    stableOnChange(formData);
  }, [formData]); // Removido stableOnChange de las dependencias

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
        // Limpiar comuna si cambia la región
        ...(field === 'idRegion' && { idComuna: '' })
      };
      
      return newData;
    });
  };

  const getRegionName = () => {
    const region = regiones.find(r => r.id === parseInt(formData.idRegion));
    return region?.nombre || '';
  };

  const getComunaName = () => {
    const comuna = comunas.find(c => c.id === parseInt(formData.idComuna));
    return comuna?.nombre || '';
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center space-x-2 mb-4">
          <MdLocationOn className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Dirección</h3>
        </div>
      )}

      {/* Región y Comuna */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Región */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MdLocationCity className="inline w-4 h-4 mr-1" />
            Región *
          </label>
          <select
            value={formData.idRegion}
            onChange={(e) => handleInputChange('idRegion', e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.idRegion ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          >
            <option value="">Seleccionar región</option>
            {Array.isArray(regiones) && regiones.map(region => (
              <option key={region.id} value={region.id}>
                {region.nombre}
              </option>
            ))}
          </select>
          {errors.idRegion && (
            <p className="mt-1 text-sm text-red-600">{errors.idRegion}</p>
          )}
        </div>

        {/* Comuna */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MdLocationCity className="inline w-4 h-4 mr-1" />
            Comuna *
          </label>
          <select
            value={formData.idComuna}
            onChange={(e) => handleInputChange('idComuna', e.target.value)}
            disabled={disabled || loadingComunas || !formData.idRegion}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.idComuna ? 'border-red-500' : 'border-gray-300'
            } ${disabled || !formData.idRegion ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          >
            <option value="">
              {loadingComunas ? 'Cargando comunas...' : !formData.idRegion ? 'Seleccione una región primero' : 'Seleccionar comuna'}
            </option>
            {Array.isArray(comunas) && comunas.map(comuna => (
              <option key={comuna.id} value={comuna.id}>
                {comuna.nombre}
              </option>
            ))}
          </select>
          {errors.idComuna && (
            <p className="mt-1 text-sm text-red-600">{errors.idComuna}</p>
          )}
        </div>
      </div>

      {/* Calle y Número */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calle/Sector */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MdHome className="inline w-4 h-4 mr-1" />
            Calle/Sector *
          </label>
          <input
            type="text"
            value={formData.calle}
            onChange={(e) => handleInputChange('calle', e.target.value)}
            disabled={disabled}
            placeholder="Ej: Av. Principal / Sector Centro"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.calle ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          />
          {errors.calle && (
            <p className="mt-1 text-sm text-red-600">{errors.calle}</p>
          )}
        </div>

        {/* Número */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número *
          </label>
          <input
            type="text"
            value={formData.numero}
            onChange={(e) => handleInputChange('numero', e.target.value)}
            disabled={disabled}
            placeholder="123"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.numero ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          />
          {errors.numero && (
            <p className="mt-1 text-sm text-red-600">{errors.numero}</p>
          )}
        </div>
      </div>

      {/* Departamento y Código Postal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MdApartment className="inline w-4 h-4 mr-1" />
            Departamento
          </label>
          <input
            type="text"
            value={formData.depto}
            onChange={(e) => handleInputChange('depto', e.target.value)}
            disabled={disabled}
            placeholder="Depto 4A"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.depto ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          />
          {errors.depto && (
            <p className="mt-1 text-sm text-red-600">{errors.depto}</p>
          )}
        </div>

        {/* Código Postal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MdLocalPostOffice className="inline w-4 h-4 mr-1" />
            Código Postal
          </label>
          <input
            type="text"
            value={formData.codigoPostal}
            onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
            disabled={disabled}
            placeholder="1234567"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.codigoPostal ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          />
          {errors.codigoPostal && (
            <p className="mt-1 text-sm text-red-600">{errors.codigoPostal}</p>
          )}
        </div>
      </div>

      {/* Referencia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MdDescription className="inline w-4 h-4 mr-1" />
          Referencia
        </label>
        <textarea
          value={formData.referencia}
          onChange={(e) => handleInputChange('referencia', e.target.value)}
          disabled={disabled}
          placeholder="Cerca del supermercado, frente al parque..."
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.referencia ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {errors.referencia && (
          <p className="mt-1 text-sm text-red-600">{errors.referencia}</p>
        )}
      </div>

      {/* Resumen de la dirección */}
      {(formData.calle && formData.numero && formData.idComuna) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Dirección:</strong> {formData.calle} {formData.numero}
            {formData.depto && `, ${formData.depto}`}
            {getComunaName() && `, ${getComunaName()}`}
            {getRegionName() && `, ${getRegionName()}`}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            💡 Puedes usar el formato "Calle / Sector" para mayor precisión
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressForm;
