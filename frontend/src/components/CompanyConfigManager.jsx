import { useState, useEffect } from 'react';
import { useSystemConfig } from '@hooks/useSystemConfig';
import { MdEdit, MdSave, MdCancel, MdBusiness, MdLocationOn, MdPhone, MdEmail, MdImage, MdCalendarToday, MdRefresh } from 'react-icons/md';
import Tooltip from '@components/Tooltip';

const CompanyConfigManager = () => {
  const { configs, loading, error, fetchConfigs, updateConfig } = useSystemConfig(null, 'company');
  const [editingConfig, setEditingConfig] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleEdit = (config) => {
    setEditingConfig(config.key);
    setEditValue(config.value);
  };

  const handleSave = async (configKey) => {
    setSaving(true);
    try {
      await updateConfig(configKey, editValue);
      setEditingConfig(null);
      setEditValue('');
      // Refrescar las configuraciones después de guardar
      await fetchConfigs();
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingConfig(null);
    setEditValue('');
  };

  const handleRefresh = () => {
    fetchConfigs();
  };

  const getConfigIcon = (key) => {
    switch (key) {
      case 'company_name':
        return <MdBusiness className="w-5 h-5 text-blue-600" />;
      case 'company_address':
        return <MdLocationOn className="w-5 h-5 text-green-600" />;
      case 'company_phone':
        return <MdPhone className="w-5 h-5 text-purple-600" />;
      case 'company_email':
        return <MdEmail className="w-5 h-5 text-red-600" />;
      case 'company_logo_url':
        return <MdImage className="w-5 h-5 text-yellow-600" />;
      case 'company_founded_year':
        return <MdCalendarToday className="w-5 h-5 text-indigo-600" />;
      case 'company_region':
        return <MdLocationOn className="w-5 h-5 text-teal-600" />;
      case 'company_city':
        return <MdLocationOn className="w-5 h-5 text-cyan-600" />;
      default:
        return <MdBusiness className="w-5 h-5 text-gray-600" />;
    }
  };

  const getConfigLabel = (key) => {
    const labels = {
      company_name: 'Nombre de la Compañía',
      company_address: 'Dirección',
      company_phone: 'Teléfono',
      company_email: 'Email',
      company_logo_url: 'URL del Logo',
      company_founded_year: 'Año de Fundación',
      company_region: 'Región',
      company_city: 'Ciudad'
    };
    return labels[key] || key;
  };

  const getInputType = (key) => {
    switch (key) {
      case 'company_email':
        return 'email';
      case 'company_phone':
        return 'tel';
      case 'company_logo_url':
        return 'url';
      case 'company_founded_year':
        return 'number';
      default:
        return 'text';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4EB9FA]"></div>
        <span className="ml-3 text-gray-600">Cargando configuraciones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 font-medium">Error al cargar configuraciones</div>
          <button
            onClick={handleRefresh}
            className="ml-auto text-red-600 hover:text-red-800 transition-colors"
          >
            <MdRefresh className="w-5 h-5" />
          </button>
        </div>
        <div className="text-red-500 text-sm mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Configuración de la Empresa</h2>
          <p className="text-gray-600 text-sm mt-1">
            Gestiona la información básica de la compañía de bomberos
          </p>
        </div>
        <Tooltip
          id="refresh-configs"
          content="Actualizar configuraciones"
          place="top"
          variant="dark"
        >
          <button
            onClick={handleRefresh}
            className={`px-3 py-2 border rounded-lg transition-colors ${
              loading 
                ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                : 'text-[#4EB9FA] hover:text-[#3DA8E9] border-[#4EB9FA] hover:bg-[#4EB9FA]/10'
            }`}
            disabled={loading}
          >
            <MdRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </Tooltip>
      </div>

      {/* Configuraciones */}
      <div className="grid gap-4 md:grid-cols-2">
        {configs.map((config) => (
          <div
            key={config.key}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getConfigIcon(config.key)}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {getConfigLabel(config.key)}
                  </h3>
                  {config.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {config.description}
                    </p>
                  )}
                </div>
              </div>
              {config.isEditable && editingConfig !== config.key && (
                <Tooltip
                  id={`edit-${config.key}`}
                  content="Editar configuración"
                  place="top"
                  variant="dark"
                >
                  <button
                    onClick={() => handleEdit(config)}
                    className="text-gray-400 hover:text-[#4EB9FA] transition-colors p-1"
                  >
                    <MdEdit className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
            </div>

            {editingConfig === config.key ? (
              <div className="space-y-3">
                <input
                  type={getInputType(config.key)}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4EB9FA] focus:border-transparent"
                  placeholder={`Ingrese ${getConfigLabel(config.key).toLowerCase()}`}
                  disabled={saving}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(config.key)}
                    disabled={saving || editValue.trim() === ''}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <MdSave className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    <MdCancel className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700">
                {config.value || (
                  <span className="text-gray-400 italic">Sin configurar</span>
                )}
              </div>
            )}

            {!config.isEditable && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Solo lectura
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {configs.length === 0 && (
        <div className="text-center py-12">
          <MdBusiness className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No hay configuraciones disponibles
          </h3>
          <p className="text-gray-500">
            Las configuraciones de la empresa se cargarán automáticamente.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyConfigManager;