import React, { useState } from 'react';
import { useCompanyConfig } from '../hooks/useSystemConfig';
import { MdEdit, MdSave, MdCancel, MdBusiness, MdSettings } from 'react-icons/md';

const SystemConfigManager = () => {
  const { configs, loading, error, updateConfig } = useCompanyConfig();
  const [editingConfig, setEditingConfig] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEdit = (config) => {
    setEditingConfig(config.key);
    setEditValue(config.value);
  };

  const handleSave = async (configKey) => {
    try {
      setSaving(true);
      await updateConfig(configKey, editValue);
      setEditingConfig(null);
      setEditValue('');
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center mb-4">
          <MdSettings className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-slate-900">Configuración de la Compañía</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center mb-4">
          <MdSettings className="h-6 w-6 text-red-600 mr-2" />
          <h2 className="text-xl font-bold text-slate-900">Configuración de la Compañía</h2>
        </div>
        <div className="text-red-600 text-center py-4">
          Error al cargar configuraciones: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center mb-6">
        <MdBusiness className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-slate-900">Configuración de la Compañía</h2>
      </div>
      
      <div className="space-y-4">
        {configs.map((config) => (
          <div key={config.key} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                {getConfigLabel(config.key)}
              </label>
              {config.isEditable && editingConfig !== config.key && (
                <button
                  onClick={() => handleEdit(config)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Editar"
                >
                  <MdEdit className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {editingConfig === config.key ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={config.description}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(config.key)}
                    disabled={saving}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <MdSave className="h-4 w-4 mr-1" />
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <MdCancel className="h-4 w-4 mr-1" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-900">
                {config.value || (
                  <span className="text-slate-400 italic">No configurado</span>
                )}
              </div>
            )}
            
            {config.description && (
              <p className="text-xs text-slate-500 mt-1">{config.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemConfigManager;