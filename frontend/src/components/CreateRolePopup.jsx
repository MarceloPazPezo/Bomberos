import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MdClose, MdSecurity, MdCheck, MdExpandMore, MdExpandLess, MdSelectAll, MdClear } from 'react-icons/md';
import Form from '@components/Form';
import { getPermissions } from '@services/permission.service';
import { useRoles } from '@hooks/roles/useRoles';
import usePermissions from '@hooks/permissions/usePermissions';

export default function CreateRolePopup({ show, setShow, onRoleCreated }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { permissions, permissionsByCategory } = usePermissions();
    
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        permisos: []
    });
    
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    
    const { handleCreateRole } = useRoles();

    // Inicializar cuando se abre el modal
    useEffect(() => {
        if (show) {
            setFormData({
                nombre: '',
                descripcion: '',
                permisos: []
            });
            setErrors({});
            // Expandir todas las categorías por defecto
            setExpandedCategories(new Set(Object.keys(permissionsByCategory)));
        }
    }, [show, permissionsByCategory]);

    const handleInputChange = (field, value) => {
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const errorData = (errorDetails) => {
        setErrors(errorDetails || {});
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

    const handleSubmit = async (createdRoleData) => {
        if (createdRoleData) {
            setLoading(true);
            try {
                // Combinar datos del formulario básico con los permisos seleccionados
                const roleData = {
                    ...createdRoleData,
                    permisos: formData.permisos
                };
                
                const result = await handleCreateRole(roleData);
                if (result.success) {
                    setShow(false);
                    setErrors({});
                    setFormData({
                        nombre: '',
                        descripcion: '',
                        permisos: []
                    });
                    if (onRoleCreated) {
                        onRoleCreated();
                    }
                } else if (result.error && typeof result.error === 'object') {
                    setErrors(result.error);
                } else {
                    setErrors({ general: result.error || 'Error al crear el rol' });
                }
            } catch (error) {
                console.error('Error creating role:', error);
                setErrors({ general: 'Error inesperado al crear el rol' });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleClose = () => {
        setShow(false);
    };

    return (
        <div>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="relative w-full max-w-xs sm:max-w-4xl h-auto p-0 animate-fade-in flex flex-col rounded-2xl bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center px-4 sm:px-10 pt-6 pb-4 border-b border-[#4EB9FA]/20 relative flex-shrink-0">
                            <div className="flex items-center gap-3 flex-1">
                                <MdSecurity className="text-[#4EB9FA]" size={24} />
                                <h2 className="text-2xl font-bold text-[#2C3E50]">Crear rol</h2>
                            </div>
                            <button
                                className="p-2 rounded-full bg-white border border-[#4EB9FA]/30 hover:bg-[#4EB9FA]/10 transition ml-2"
                                onClick={handleClose}
                                aria-label="Cerrar"
                                style={{ lineHeight: 0 }}
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Body con scroll interno si es necesario */}
                        <div className="px-4 sm:px-10 py-6 sm:py-10 pr-2 sm:pr-6 flex flex-col items-center flex-1 min-h-0 w-full overflow-y-auto scrollbar-thin">
                            <div className="w-full space-y-6">
                                {/* Formulario básico */}
                                <Form
                                    title={null}
                                    autoComplete="off"
                                    size="max-w-xs sm:max-w-4xl"
                                    fields={[
                                        {
                                            label: "Nombre del rol",
                                            name: "nombre",
                                            placeholder: 'Ej: Supervisor, Moderador, etc.',
                                            fieldType: 'input',
                                            type: "text",
                                            required: true,
                                            minLength: 2,
                                            maxLength: 50,
                                            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑàèìòùÀÈÌÒÙ\s]+$/,
                                            patternMessage: "Solo se permiten letras y espacios",
                                            errorMessageData: errors.nombre,
                                            onChange: (e) => handleInputChange('nombre', e.target.value),
                                            autoComplete: "off",
                                            value: formData.nombre
                                        },
                                        {
                                            label: "Descripción",
                                            name: "descripcion",
                                            placeholder: 'Describe las responsabilidades de este rol...',
                                            fieldType: 'textarea',
                                            required: false,
                                            minLength: 0,
                                            maxLength: 255,
                                            errorMessageData: errors.descripcion,
                                            onChange: (e) => handleInputChange('descripcion', e.target.value),
                                            autoComplete: "off",
                                            value: formData.descripcion,
                                            rows: 3
                                        }
                                    ]}
                                    onSubmit={handleSubmit}
                                    backgroundColor={'#fff'}
                                    hideSubmitButton={true}
                                />

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

                                {/* Botones personalizados */}
                                <div className="flex justify-end space-x-3 mt-6 w-full">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2 text-[#2C3E50] bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Activar el submit del formulario
                                            const form = document.querySelector('form');
                                            if (form) {
                                                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                                                form.dispatchEvent(submitEvent);
                                            }
                                        }}
                                        className={`px-4 py-2 bg-[#4EB9FA] text-white rounded-lg hover:bg-[#3A9BD9] transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={loading || !formData.nombre.trim()}
                                    >
                                        {loading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Creando...</span>
                                            </div>
                                        ) : (
                                            'Crear Rol'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

CreateRolePopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    onRoleCreated: PropTypes.func.isRequired,
};