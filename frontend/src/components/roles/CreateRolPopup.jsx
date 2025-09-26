import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MdClose, MdSecurity, MdCheck, MdExpandMore, MdExpandLess, MdSelectAll, MdClear, MdSave } from 'react-icons/md';
import Form from '@components/Form';
import { getPermisos } from '@services/permiso.service';
import { useRoles } from '@hooks/roles/useRoles';
import usePermisos from '@hooks/permisos/usePermisos';

export default function CreateRolePopup({ show, setShow, onRoleCreated }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { permisos, permisosByCategory, refreshPermisosByCategory } = usePermisos();
    
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        permisos: []
    });
    
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    
    const { handleCreateRole } = useRoles();

    // Cargar permisos cuando se muestra el modal
    useEffect(() => {
        if (show) {
            refreshPermisosByCategory();
        }
    }, [show]); // Removido refreshPermisosByCategory de las dependencias

    // useEffect para manejar scroll lock
    useEffect(() => {
        if (show) {
            // Bloquear scroll del body cuando el popup está abierto
            document.body.style.overflow = 'hidden';
        } else {
            // Restaurar scroll del body cuando el popup se cierra
            document.body.style.overflow = 'unset';
        }

        return () => {
            // Limpiar al desmontar el componente
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    // Inicializar cuando se abre el modal
    useEffect(() => {
        if (show) {
            setFormData({
                nombre: '',
                descripcion: '',
                permisos: []
            });
            setErrors({});
        }
    }, [show]);

    // Expandir categorías cuando se cargan los permisos
    useEffect(() => {
        if (show && Object.keys(permisosByCategory).length > 0) {
            setExpandedCategories(new Set(Object.keys(permisosByCategory)));
        }
    }, [show, permisosByCategory]);

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
    const handlePermisoToggle = (permisoName) => {
        setFormData(prev => ({
            ...prev,
            permisos: prev.permisos.includes(permisoName)
                ? prev.permisos.filter(p => p !== permisoName)
                : [...prev.permisos, permisoName]
        }));
    };

    // Seleccionar/deseleccionar todos los permisos de una categoría
    const handleCategoryToggle = (category) => {
        const categoryPermisos = permisosByCategory[category].map(p => p.nombre);
        const allSelected = categoryPermisos.every(p => formData.permisos.includes(p));
        
        setFormData(prev => ({
            ...prev,
            permisos: allSelected
                ? prev.permisos.filter(p => !categoryPermisos.includes(p))
                : [...new Set([...prev.permisos, ...categoryPermisos])]
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
            // Validaciones adicionales antes de enviar
            const validationErrors = {};
            
            // Validar nombre según patrón del backend
            const nombrePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-_]+$/;
            if (!nombrePattern.test(createdRoleData.nombre)) {
                validationErrors.nombre = "El nombre del rol solo puede contener letras, números, espacios, guiones o guiones bajos.";
            }
            
            // Validar longitud de descripción
            if (createdRoleData.descripcion && createdRoleData.descripcion.length > 500) {
                validationErrors.descripcion = "La descripción del rol debe tener como máximo 500 caracteres.";
            }
            
            // Validar permisos (deben ser strings válidos)
            if (formData.permisos.length > 0) {
                const permisoPattern = /^[a-zA-Z0-9_:]+$/;
                const invalidPermisos = formData.permisos.filter(permiso => !permisoPattern.test(permiso));
                if (invalidPermisos.length > 0) {
                    validationErrors.permisos = "Algunos permisos contienen caracteres no permitidos.";
                }
            }
            
            // Si hay errores de validación, mostrarlos
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
            
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
                            
                            {/* Botones de acción en el header */}
                            <div className="flex items-center gap-2">
                                {/* Botón Guardar */}
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
                                    disabled={loading || !formData.nombre.trim()}
                                    className="flex items-center justify-center w-10 h-10 bg-[#4EB9FA] text-white shadow-lg hover:bg-[#3A9BD9] transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={loading ? "Guardando..." : "Guardar rol"}
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <MdSave size={20} />
                                    )}
                                </button>
                                
                                {/* Botón Cerrar (X) */}
                                <button
                                    className="flex items-center justify-center w-10 h-10 bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all duration-200 rounded-lg"
                                    onClick={handleClose}
                                    disabled={loading}
                                    title="Cerrar"
                                >
                                    <MdClose size={20} />
                                </button>
                            </div>
                        </div>
                        
                        {/* Body con scroll interno si es necesario */}
                        <div className="px-4 sm:px-10 py-6 sm:py-10 pr-2 sm:pr-6 flex flex-col items-center flex-1 min-h-0 w-full overflow-y-auto scrollbar-thin">
                            <div className="w-full space-y-6">
                                {/* Mostrar error general si existe */}
                                {errors.general && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">{errors.general}</p>
                                    </div>
                                )}
                                
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
                                            pattern: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-_]+$/,
                                            patternMessage: "Solo se permiten letras, números, espacios, guiones y guiones bajos",
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
                                            maxLength: 500,
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
                                            {formData.permisos.length} de {Object.values(permisosByCategory).flat().length} permisos seleccionados
                                        </span>
                                    </div>
                                    
                                    {/* Mostrar error de permisos si existe */}
                                    {errors.permisos && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-600">{errors.permisos}</p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {Object.entries(permisosByCategory).map(([category, categoryPermisos]) => {
                                            const isExpanded = expandedCategories.has(category);
                                            const selectedCount = categoryPermisos.filter(p => 
                                                formData.permisos.includes(p.nombre)
                                            ).length;
                                            const allSelected = selectedCount === categoryPermisos.length;

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
                                                                    ({selectedCount}/{categoryPermisos.length})
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
                                                            {categoryPermisos.map((permiso) => {
                                                                const isSelected = formData.permisos.includes(permiso.nombre);
                                                                
                                                                return (
                                                                    <label
                                                                        key={permiso.id}
                                                                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                                            isSelected 
                                                                                ? 'bg-green-50 border-green-200' 
                                                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                                                        }`}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={() => handlePermisoToggle(permiso.nombre)}
                                                                            className="mt-1 rounded border-gray-300 text-[#4EB9FA] focus:ring-[#4EB9FA]"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                {isSelected && <MdCheck className="text-green-600" size={16} />}
                                                                                <span className="font-medium text-gray-800">
                                                                                    {permiso.nombre}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-600 mt-1">
                                                                                {permiso.descripcion}
                                                                            </p>
                                                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                                                <span className="bg-gray-100 px-2 py-1 rounded">
                                                                                    {permiso.metodo}
                                                                                </span>
                                                                                <span>{permiso.ruta}</span>
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