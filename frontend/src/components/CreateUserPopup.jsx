import React, { useState, useRef, useEffect } from 'react';
import Form from './Form';
import { MdClose, MdPersonAdd, MdSave, MdCalendarToday } from 'react-icons/md';
import PropTypes from 'prop-types';
import { useRoles } from '@hooks/roles/useRoles';
import { useRutFormatter, formatRutForAPI } from '@helpers/rutFormatter.js';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

// Registrar el locale español
registerLocale('es', es);

export default function CreateUserPopup({ show, setShow, onUserCreated }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const formRef = useRef(null);
    
    // Hook para formateo de RUT
    const rutFormatter = useRutFormatter(
        (fieldName, value) => formRef.current?.setValue(fieldName, value),
        'run'
    );

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
        
        // Para campos de fecha, convertir Date a formato ISO si es necesario
        if ((field === 'fechaNacimiento' || field === 'fechaIngreso') && value instanceof Date) {
            // El DatePicker ya maneja la conversión a ISO en Form.jsx
            // Solo necesitamos limpiar errores aquí
            return;
        }
    };

    // Hook para obtener roles
    const { roles, loading: rolesLoading, fetchRoles } = useRoles();
    
    // Cargar roles cuando se abre el modal
    useEffect(() => {
        if (show && (!roles || roles.length === 0) && !rolesLoading) {
            fetchRoles(true);
        }
    }, [show]);
    
    // Transformar roles para el multiselect - solo si hay roles disponibles
    const rolesOptions = roles && roles.length > 0 ? roles
        .filter(role => {
            // Filtrar roles que tengan los campos necesarios
            return role.id && role.nombre;
        })
        .map((role) => ({
            value: role.id,
            label: role.nombre,
        })) : [];

    const errorData = (errorDetails) => {
        setErrors(errorDetails || {});
    };

    const patternRut = new RegExp(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/);

    const handleSubmit = async (createdUserData) => {
        if (createdUserData && onUserCreated) {
            setLoading(true);
            try {
                // Transformar los datos para que coincidan con el formato esperado por el backend
                const transformedData = {
                    ...createdUserData,
                    // Formatear RUT para API (sin puntos, solo guión)
                    run: formatRutForAPI(createdUserData.run),
                    // Convertir nombres y apellidos de string a array
                    nombres: createdUserData.nombres ? createdUserData.nombres.split(' ').filter(name => name.trim() !== '') : [],
                    apellidos: createdUserData.apellidos ? createdUserData.apellidos.split(' ').filter(apellido => apellido.trim() !== '') : [],
                    // Transformar roles del multiselect al formato esperado por el backend
                    roles: createdUserData.roles ? createdUserData.roles.map(role => role.value) : [],
                    // Convertir alergias de string a array separando solo por comas
                    alergias: createdUserData.alergias ? 
                        createdUserData.alergias.split(',').map(alergia => alergia.trim()).filter(alergia => alergia !== '') : [],
                    // Convertir medicamentos de string a array separando solo por comas
                    medicamentos: createdUserData.medicamentos ? 
                        createdUserData.medicamentos.split(',').map(medicamento => medicamento.trim()).filter(medicamento => medicamento !== '') : [],
                    // Convertir condiciones de string a array separando solo por comas
                    condiciones: createdUserData.condiciones ? 
                        createdUserData.condiciones.split(',').map(condicion => condicion.trim()).filter(condicion => condicion !== '') : []
                };

                // Si el tipo de sangre está vacío o es "No especificado", no lo incluir en los datos
                if (!transformedData.tipoSangre || transformedData.tipoSangre === '') {
                    delete transformedData.tipoSangre;
                }

                // Si las fechas están vacías, no las incluir en los datos
                if (!transformedData.fechaNacimiento || transformedData.fechaNacimiento === '') {
                    delete transformedData.fechaNacimiento;
                }
                if (!transformedData.fechaIngreso || transformedData.fechaIngreso === '') {
                    delete transformedData.fechaIngreso;
                }
                
                const result = await onUserCreated(transformedData);
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
                console.error('Error creating user:', error);
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
                                <h2 className="text-xl font-bold text-white">Crear Nuevo Usuario</h2>
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
                                fields={[
                                    {
                                        label: "Nombres",
                                        name: "nombres",
                                        placeholder: 'Diego Alexis',
                                        fieldType: 'input',
                                        type: "text",
                                        required: false,
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
                                        placeholder: 'Salazar Jara',
                                        fieldType: 'input',
                                        type: "text",
                                        required: false,
                                        minLength: 2,
                                        maxLength: 50,
                                        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑàèìòùÀÈÌÒÙ\s]+$/,
                                        errorMessageData: errors.apellidos,
                                        onChange: (e) => handleInputChange('apellidos', e.target.value),
                                        autoComplete: "off"
                                    },
                                    {
                                        label: "Correo electrónico",
                                        name: "email",
                                        placeholder: 'example@gmail.cl',
                                        fieldType: 'input',
                                        type: "email",
                                        required: true,
                                        minLength: 15,
                                        maxLength: 255,
                                        errorMessageData: errors.email,
                                        onChange: (e) => handleInputChange('email', e.target.value),
                                        autoComplete: "new-email"
                                    },
                                    {
                                        ...rutFormatter.getFieldConfig(),
                                        errorMessageData: errors.run,
                                        onChange: (e) => {
                                            // Primero ejecutar el formateo del RUT
                                            rutFormatter.getFieldConfig().onChange(e);
                                            // Luego limpiar errores
                                            handleInputChange('run', e.target.value);
                                        }
                                    },
                                    {
                                        label: "Teléfono",
                                        name: "telefono",
                                        placeholder: '+56912345678',
                                        fieldType: 'input',
                                        type: "tel",
                                        required: false,
                                        minLength: 8,
                                        maxLength: 20,
                                        errorMessageData: errors.telefono,
                                        onChange: (e) => handleInputChange('telefono', e.target.value),
                                        autoComplete: "tel"
                                    },
                                    {
                                        label: "Fecha de nacimiento",
                                        name: "fechaNacimiento",
                                        fieldType: 'datepicker',
                                        required: true,
                                        errorMessageData: errors.fechaNacimiento,
                                        onChange: (date) => handleInputChange('fechaNacimiento', date),
                                        maxDate: new Date(), // No permitir fechas futuras
                                        autoComplete: "bday"
                                    },
                                    {
                                        label: "Fecha de ingreso",
                                        name: "fechaIngreso",
                                        fieldType: 'datepicker',
                                        required: false,
                                        errorMessageData: errors.fechaIngreso,
                                        onChange: (date) => handleInputChange('fechaIngreso', date),
                                        autoComplete: "off"
                                    },
                                    {
                                        label: "Dirección",
                                        name: "direccion",
                                        placeholder: 'Av. Principal 123, Santiago',
                                        fieldType: 'input',
                                        type: "text",
                                        required: false,
                                        minLength: 5,
                                        maxLength: 255,
                                        errorMessageData: errors.direccion,
                                        onChange: (e) => handleInputChange('direccion', e.target.value),
                                        autoComplete: "street-address"
                                    },
                                    {
                                        label: "Tipo de sangre",
                                        name: "tipoSangre",
                                        fieldType: 'select',
                                        required: false,
                                        placeholder: "Seleccionar tipo de sangre",
                                        options: [
                                            { value: '', label: 'No especificado' },
                                            { value: 'A+', label: 'A+' },
                                            { value: 'A-', label: 'A-' },
                                            { value: 'B+', label: 'B+' },
                                            { value: 'B-', label: 'B-' },
                                            { value: 'AB+', label: 'AB+' },
                                            { value: 'AB-', label: 'AB-' },
                                            { value: 'O+', label: 'O+' },
                                            { value: 'O-', label: 'O-' }
                                        ],
                                        errorMessageData: errors.tipoSangre,
                                        onChange: (e) => handleInputChange('tipoSangre', e.target.value)
                                    },
                                    {
                                        label: "Alergias",
                                        name: "alergias",
                                        placeholder: 'Penicilina, mariscos, polen de abedul (separar con comas)',
                                        fieldType: 'textarea',
                                        required: false,
                                        maxLength: 500,
                                        rows: 3,
                                        errorMessageData: errors.alergias,
                                        onChange: (e) => handleInputChange('alergias', e.target.value),
                                        autoComplete: "off"
                                    },
                                    {
                                        label: "Medicamentos",
                                        name: "medicamentos",
                                        placeholder: 'Aspirina, Losartán 50mg, Metformina XR (separar con comas)',
                                        fieldType: 'textarea',
                                        required: false,
                                        maxLength: 500,
                                        rows: 3,
                                        errorMessageData: errors.medicamentos,
                                        onChange: (e) => handleInputChange('medicamentos', e.target.value),
                                        autoComplete: "off"
                                    },
                                    {
                                        label: "Condiciones médicas",
                                        name: "condiciones",
                                        placeholder: 'Diabetes tipo 2, Hipertensión arterial, Asma bronquial (separar con comas)',
                                        fieldType: 'textarea',
                                        required: false,
                                        maxLength: 500,
                                        rows: 3,
                                        errorMessageData: errors.condiciones,
                                        onChange: (e) => handleInputChange('condiciones', e.target.value),
                                        autoComplete: "off"
                                    },
                                    {
                                        label: "Roles",
                                        name: "roles",
                                        fieldType: 'multiselect',
                                        options: rolesOptions,
                                        defaultValue: [],
                                        required: true,
                                        placeholder: rolesLoading ? "Cargando roles..." : "Seleccionar roles...",
                                        searchPlaceholder: "Buscar roles...",
                                        errorMessageData: errors.roles,
                                        isLoading: rolesLoading
                                    },
                                    {
                                        label: "Contraseña",
                                        name: "password",
                                        placeholder: "**********",
                                        fieldType: 'input',
                                        type: "password",
                                        required: true,
                                        minLength: 8,
                                        maxLength: 26,
                                        pattern: /^[a-zA-Z0-9]+$/,
                                        patternMessage: "Debe contener solo letras y números",
                                        errorMessageData: errors.password,
                                        onChange: (e) => handleInputChange('password', e.target.value),
                                        autoComplete: "new-password"
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
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Creando...</span>
                                    </>
                                ) : (
                                    <>
                                        <MdSave className="w-4 h-4" />
                                        <span>Crear Usuario</span>
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
CreateUserPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    onUserCreated: PropTypes.func.isRequired,
};