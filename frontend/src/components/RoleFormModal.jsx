import React, { useState, useEffect } from 'react';
import { 
  MdClose, 
  MdSecurity, 
  MdCheck, 
  MdExpandMore, 
  MdExpandLess,
  MdSelectAll,
  MdClear
} from 'react-icons/md';
import { useRoles } from '@hooks/roles/useRoles';
import usePermissions from '@hooks/permissions/usePermissions';

const RoleFormModal = ({ show, setShow, editingRole, onSuccess }) => {
  const { handleCreateRole, handleUpdateRole } = useRoles();
  const { permissions, permissionsByCategory, refreshPermissionsByCategory } = usePermissions();
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: []
  });
  
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Cargar permisos cuando se muestra el modal
  useEffect(() => {
    if (show) {
      refreshPermissionsByCategory();
    }
  }, [show]); // Removido refreshPermissionsByCategory de las dependencias

  // useEffect para manejar scroll lock
  useEffect(() => {
    if (show) {
      // Bloquear scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body cuando el modal se cierra
      document.body.style.overflow = 'unset';
    }

    return () => {
      // Limpiar al desmontar el componente
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (show) {
      if (editingRole) {
        setFormData({
          nombre: editingRole.nombre || '',
          descripcion: editingRole.descripcion || '',
          permisos: editingRole.permisos || []
        });
      } else {
        setFormData({
          nombre: '',
          descripcion: '',
          permisos: []
        });
      }
    }
  }, [show, editingRole]);

  // Expandir categorías cuando se cargan los permisos
  useEffect(() => {
    if (show && Object.keys(permissionsByCategory).length > 0) {
      setExpandedCategories(new Set(Object.keys(permissionsByCategory)));
    }
  }, [show, permissionsByCategory]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar selección/deselección de permisos
  const handlePermissionToggle = (permissionName) => {
    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permissionName)
        ? prev.permisos.filter(p => p !== permissionName)
        : [...prev.permisos, permissionName]
    }));
  };

  // Seleccionar/deseleccionar todos los permisos de una categoría
  const handleCategoryToggle = (category) => {
    const categoryPermissions = permissionsByCategory[category].map(p => p.nombre);
    const allSelected = categoryPermissions.every(p => formData.permisos.includes(p));
    
    setFormData(prev => ({
      ...prev,
      permisos: allSelected
        ? prev.permisos.filter(p => !categoryPermissions.includes(p))
        : [...new Set([...prev.permisos, ...categoryPermissions])]
    }));
  };

  // Alternar expansión de categoría
  const toggleCategoryExpansion = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editingRole) {
        result = await handleUpdateRole(editingRole.id, formData);
      } else {
        result = await handleCreateRole(formData);
      }

      if (result.success) {
        setShow(false);
        onSuccess();
      }
    } catch (error) {
      console.error('Error al guardar rol:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 pt-16"
      onClick={handleClose}
    >
      <div 
        className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col mx-auto border border-[#4EB9FA]/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <MdSecurity className="text-[#4EB9FA]" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Información básica del rol */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Información del Rol</h3>
              
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4EB9FA] focus:border-transparent"
                  placeholder="Ej: Supervisor, Moderador, etc."
                />
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4EB9FA] focus:border-transparent"
                  placeholder="Describe las responsabilidades de este rol..."
                />
              </div>
            </div>

            {/* Selección de permisos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">Permisos del Rol</h3>
                <span className="text-sm text-gray-600">
                  {formData.permisos.length} de {Object.values(permissionsByCategory).flat().length} permisos seleccionados
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
                  const isExpanded = expandedCategories.has(category);
                  const selectedCount = categoryPermissions.filter(p => 
                    formData.permisos.includes(p.nombre)
                  ).length;
                  const allSelected = selectedCount === categoryPermissions.length;
                  const someSelected = selectedCount > 0 && selectedCount < categoryPermissions.length;

                  return (
                    <div key={category} className="border border-gray-200 rounded-lg">
                      {/* Header de categoría */}
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleCategoryExpansion(category)}
                            className="flex items-center gap-2 text-left flex-1"
                          >
                            {isExpanded ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                            <span className="font-medium text-gray-800">{category}</span>
                            <span className="text-sm text-gray-600">
                              ({selectedCount}/{categoryPermissions.length})
                            </span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleCategoryToggle(category)}
                            className={`p-1 rounded transition-colors ${
                              allSelected 
                                ? 'text-red-600 hover:text-red-800' 
                                : 'text-green-600 hover:text-green-800'
                            }`}
                            title={allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                          >
                            {allSelected ? <MdClear size={18} /> : <MdSelectAll size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Permisos de la categoría */}
                      {isExpanded && (
                        <div className="p-3 space-y-2">
                          {categoryPermissions.map((permission) => {
                            const isSelected = formData.permisos.includes(permission.nombre);
                            
                            return (
                              <label
                                key={permission.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                  isSelected 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handlePermissionToggle(permission.nombre)}
                                  className="mt-1 rounded border-gray-300 text-[#4EB9FA] focus:ring-[#4EB9FA]"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {isSelected && <MdCheck className="text-green-600" size={16} />}
                                    <span className="font-medium text-gray-800">
                                      {permission.nombre}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {permission.descripcion}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                      {permission.metodo}
                                    </span>
                                    <span>{permission.ruta}</span>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nombre.trim()}
              className="px-6 py-2 bg-[#4EB9FA] hover:bg-[#3DA8E9] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {editingRole ? 'Actualizar Rol' : 'Crear Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleFormModal;