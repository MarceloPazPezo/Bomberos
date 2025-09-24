import React, { useState, useRef, useEffect, useMemo } from 'react';
import Form from '../Form';
import LoadingSpinner from '@components/LoadingSpinner';
import { MdClose, MdPersonAdd, MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';
import { useRoles } from '@hooks/roles/useRoles';

export default function UpdateBomberoPopup({ show, setShow, data, onBomberoUpdated }) {
    const bomberoData = data || {};
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const formRef = useRef(null);

    // Función para enfocar el primer campo con error
    const focusFirstErrorField = () => {
        const errorFields = Object.keys(errors);
        if (errorFields.length > 0) {
            const firstErrorField = errorFields[0];
            
            // Buscar el elemento del campo con error
            const fieldElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (fieldElement) {
                // Hacer scroll hasta el elemento
                fieldElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Enfocar el elemento después de un pequeño delay para que el scroll termine
                setTimeout(() => {
                    fieldElement.focus();
                }, 300);
            }
        }
    };

    // useEffect para enfocar automáticamente cuando hay errores
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            focusFirstErrorField();
        }
    }, [errors]);

    // useEffect para manejar tecla Escape y scroll lock
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && show) {
                handleClose();
            }
        };

        if (show) {
            // Bloquear scroll del body cuando el popup está abierto
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscape);
        } else {
            // Restaurar scroll del body cuando el popup se cierra
            document.body.style.overflow = 'unset';
        }

        return () => {
            // Limpiar al desmontar el componente
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [show]);

    // Función para manejar click fuera del modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };
    
    const handleInputChange = (field, value) => {
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
        
        // Para nombres y apellidos, convertir string a array
        if (field === 'nombres' || field === 'apellidos') {
            if (typeof value === 'string' && value.trim()) {
                // Dividir por espacios y filtrar elementos vacíos
                const arrayValue = value.split(' ').filter(item => item.trim() !== '');
                // Retornar para uso posterior en transformedData
                return arrayValue;
            }
        }
    };

    // Función para manejar cambios en la selección de roles
    const handleRolesChange = (newSelectedRoles) => {
        // Buscar el rol "Bombero" en la lista de roles disponibles
        const bomberoRole = rolesOptions.find(role => role.label === 'Bombero');
        
        if (bomberoRole) {
            // Asegurar que el rol "Bombero" siempre esté seleccionado
            const hasBomberoRole = newSelectedRoles.some(role => role.value === bomberoRole.value);
            
            if (!hasBomberoRole) {
                // Si no está seleccionado, agregarlo automáticamente
                newSelectedRoles = [bomberoRole, ...newSelectedRoles];
            }
        }
        
        // Actualizar el estado local
        setSelectedRoles(newSelectedRoles);
        
        // Limpiar error del campo roles si existe
        if (errors.roles) {
            setErrors(prev => ({ ...prev, roles: null }));
        }
        
        return newSelectedRoles;
    };

    // Hook para obtener roles
    const { roles, loading: rolesLoading, fetchRoles } = useRoles();
    
    // Transformar roles para el multiselect - solo si hay roles disponibles
    const rolesOptions = useMemo(() => {
        return roles && roles.length > 0 ? roles
            .filter(role => {
                // Filtrar roles que tengan los campos necesarios
                return role.id && role.nombre;
            })
            .map((role) => ({
                value: role.id,
                label: role.nombre,
                isLocked: role.nombre === 'Bombero' // Marcar el rol Bombero como bloqueado
            })) : [];
    }, [roles]);
    
    // Cargar roles cuando se abre el modal
    useEffect(() => {
        if (show && (!roles || roles.length === 0) && !rolesLoading) {
            fetchRoles(true);
        }
    }, [show]);

    // Estado para los roles seleccionados
    const [selectedRoles, setSelectedRoles] = useState([]);

    // Actualizar valores por defecto cuando se cargan los roles
    useEffect(() => {
        if (show && bomberoData && roles && roles.length > 0) {
            // Obtener roles del bombero para valores por defecto
            let bomberoRoles = [];
            if (bomberoData.roles && Array.isArray(bomberoData.roles)) {
                bomberoRoles = bomberoData.roles.map(role => ({
                    value: role.id || role,
                    label: role.nombre || role,
                    isLocked: (role.nombre || role) === 'Bombero' // Marcar como bloqueado si es Bombero
                }));
            }
            
            // Buscar el rol "Bombero" directamente en roles (no en rolesOptions para evitar dependencia circular)
            const bomberoRole = roles.find(role => role.nombre === 'Bombero');
            if (bomberoRole && !bomberoRoles.some(role => role.value === bomberoRole.id)) {
                bomberoRoles.unshift({
                    value: bomberoRole.id,
                    label: bomberoRole.nombre,
                    isLocked: true
                }); // Agregar al inicio
            }
            
            // Actualizar el estado local de roles seleccionados
            setSelectedRoles(bomberoRoles);
        }
    }, [show, bomberoData, roles]);

    const errorData = (errorDetails) => {
        setErrors(errorDetails || {});
    };

    const handleSubmit = async (updatedBomberoData) => {
        if (updatedBomberoData && onBomberoUpdated) {
            setLoading(true);
            try {
                // Función para formatear RUT para API (remover puntos, mantener guión)
                const formatRutForAPI = (rut) => {
                    if (!rut) return '';
                    return rut.replace(/\./g, '');
                };

                // Buscar el rol "Bombero" en la lista de roles disponibles
                const bomberoRole = roles.find(role => role.nombre === 'Bombero');
                const bomberoRoleId = bomberoRole ? bomberoRole.id : null;

                // Transformar los datos para que coincidan con el formato esperado por el backend
                const transformedData = {
                    // Formatear RUT para API (sin puntos, solo guión)
                    run: formatRutForAPI(updatedBomberoData.run),
                    // Convertir nombres y apellidos de string a array
                    nombres: updatedBomberoData.nombres ? updatedBomberoData.nombres.split(' ').filter(name => name.trim() !== '') : [],
                    apellidos: updatedBomberoData.apellidos ? updatedBomberoData.apellidos.split(' ').filter(apellido => apellido.trim() !== '') : [],
                    // Campos básicos requeridos
                    email: updatedBomberoData.email,
                    // Solo incluir contraseña si se proporcionó una nueva
                    ...(updatedBomberoData.newPassword && { password: updatedBomberoData.newPassword }),
                    // Forzar el rol "Bombero" + roles seleccionados por el usuario
                    roles: [
                        ...(bomberoRoleId ? [bomberoRoleId] : []), // Siempre incluir rol Bombero
                        ...(updatedBomberoData.roles ? updatedBomberoData.roles.map(role => role.value) : [])
                    ].filter((value, index, self) => self.indexOf(value) === index), // Eliminar duplicados
                    // Estado activo
                    activo: updatedBomberoData.activo !== undefined ? updatedBomberoData.activo : bomberoData.activo
                };

                console.log('DEBUG - bomberoData completo:', bomberoData);
                console.log('DEBUG - bomberoData.id:', bomberoData.id);
                const result = await onBomberoUpdated(transformedData, bomberoData.run);
                if (result.success) {
                    setShow(false);
                    setErrors({});
                } else if (result.error && typeof result.error === 'object') {
                    // Si el error es un objeto, son errores específicos por campo
                    errorData(result.error);
                } else if (result.error) {
                    // Si el error es un string, es un error general
                    console.error('Error general:', result.error);
                }
            } catch (error) {
                console.error('Error updating bombero:', error);
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
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                >
                    <div className="relative w-full max-w-xs sm:max-w-2xl h-auto p-0 animate-fade-in flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-200">
                        {/* Header mejorado */}
                        <div className="flex items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
                            <div className="flex items-center space-x-3 flex-1">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <MdPersonAdd className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Editar Bombero</h2>
                            </div>
                            <button
                                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 group"
                                onClick={handleClose}
                                aria-label="Cerrar (Esc)"
                                title="Cerrar (Esc)"
                            >
                                <MdClose className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        
                        {/* Contenido mejorado */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-h-[70vh] bg-gray-50/50">
                            <Form
                                ref={formRef}
                                title={null}
                                autoComplete="off"
                                size="max-w-xs sm:max-w-2xl"
                                defaultValues={{
                                    nombres: Array.isArray(bomberoData.nombres) ? bomberoData.nombres.join(' ') : bomberoData.nombres || "",
                                    apellidos: Array.isArray(bomberoData.apellidos) ? bomberoData.apellidos.join(' ') : bomberoData.apellidos || "",
                                    email: bomberoData.email || "",
                                    run: bomberoData.run || "",
                                    newPassword: "",
                                    roles: selectedRoles, // Usar el estado local
                                    activo: bomberoData.activo !== undefined ? bomberoData.activo.toString() : 'true'
                                }}
                                fields={[
                                    {
                                        label: "Nombres",
                                        name: "nombres",
                                        placeholder: 'Ingrese los nombres',
                                        fieldType: 'input',
                                        type: "text",
                                        required: true,
                                        minLength: 2,
                                        maxLength: 50,
                                        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑàèìòùÀÈÌÒÙ\s]+$/,
                                        errorMessageData: errors.nombres,
                                        onChange: (e) => handleInputChange('nombres', e.target.value),
                                        autoComplete: "off"
                                    },
                                    {
                                        label: "Apellidos",
                                        name: "apellidos",
                                        placeholder: 'Ingrese los apellidos',
                                        fieldType: 'input',
                                        type: "text",
                                        required: true,
                                        minLength: 2,
                                        maxLength: 50,
                                        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑàèìòùÀÈÌÒÙ\s]+$/,
                                        errorMessageData: errors.apellidos,
                                        onChange: (e) => handleInputChange('apellidos', e.target.value),
                                        autoComplete: "off"
                                    },
                                    {
                                        label: "RUT",
                                        name: "run",
                                        placeholder: '12.345.678-9',
                                        fieldType: 'input',
                                        type: "text",
                                        required: true,
                                        minLength: 11,
                                        maxLength: 12,
                                        pattern: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
                                        patternMessage: "Formato válido: 12.345.678-9",
                                        errorMessageData: errors.run,
                                        onChange: (e) => {
                                            // Formateo automático del RUT
                                            let value = e.target.value.replace(/[^\dkK]/g, '');
                                            if (value.length > 1) {
                                                value = value.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + value.slice(-1);
                                            }
                                            e.target.value = value;
                                            handleInputChange('run', value);
                                        },
                                        autoComplete: "off"
                                    },
                                    {
                                        label: "Correo electrónico",
                                        name: "email",
                                        placeholder: 'example@gmail.com',
                                        fieldType: 'input',
                                        type: "email",
                                        required: true,
                                        minLength: 5,
                                        maxLength: 255,
                                        pattern: /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|live\.com|msn\.com|icloud\.com|me\.com|[a-zA-Z0-9.-]+\.cl)$/,
                                        patternMessage: "Debe usar un dominio permitido (ej. @gmail.com, @hotmail.com, @example.cl)",
                                        errorMessageData: errors.email,
                                        onChange: (e) => handleInputChange('email', e.target.value),
                                        autoComplete: "new-email"
                                    },
                                    {
                                        label: "Nueva contraseña (opcional)",
                                        name: "newPassword",
                                        placeholder: "Dejar vacío para mantener la actual",
                                        fieldType: 'input',
                                        type: "password",
                                        required: false,
                                        minLength: 8,
                                        maxLength: 26,
                                        pattern: /^[a-zA-Z0-9]+$/,
                                        patternMessage: "Debe contener solo letras y números",
                                        errorMessageData: errors.newPassword,
                                        onChange: (e) => handleInputChange('newPassword', e.target.value),
                                        autoComplete: "new-password"
                                    },
                                    {
                                        label: "Roles",
                                        name: "roles",
                                        fieldType: 'multiselect',
                                        options: rolesOptions,
                                        defaultValue: selectedRoles,
                                        required: true,
                                        placeholder: rolesLoading ? "Cargando roles..." : "Seleccionar roles adicionales...",
                                        searchPlaceholder: "Buscar roles...",
                                        errorMessageData: errors.roles,
                                        isLoading: rolesLoading,
                                        onChange: handleRolesChange
                                    },
                                    {
                                        label: "Estado",
                                        name: "activo",
                                        fieldType: 'select',
                                        required: true,
                                        placeholder: "Seleccionar estado",
                                        options: [
                                            { value: 'true', label: 'Activo' },
                                            { value: 'false', label: 'Inactivo' }
                                        ],
                                        errorMessageData: errors.activo,
                                        onChange: (e) => handleInputChange('activo', e.target.value === 'true')
                                    }
                                ]}
                                onSubmit={handleSubmit}
                                backgroundColor={'#fff'}
                            />
                        </div>

                        {/* Botones mejorados */}
                        <div className="flex justify-end space-x-3 px-4 sm:px-6 py-4 bg-white border-t border-gray-200 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                                disabled={loading}
                            >
                                <MdClose className="w-4 h-4" />
                                <span>Cancelar</span>
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
                                className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner variant="spinner" size="sm" color="white" />
                                        <span>Actualizando...</span>
                                    </>
                                ) : (
                                    <>
                                        <MdSave className="w-4 h-4" />
                                        <span>Actualizar Bombero</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

UpdateBomberoPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    data: PropTypes.object,
    onBomberoUpdated: PropTypes.func.isRequired,
};