import React, { useState, useEffect } from 'react';
import Form from './Form';
import { MdClose, MdHelpOutline } from 'react-icons/md';
import PropTypes from 'prop-types';
import { useRoles } from '@hooks/roles/useRoles';

export default function CreateUserPopup({ show, setShow, onUserCreated }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field, value) => {
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
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
                    // Convertir nombres y apellidos de string a array
                    nombres: createdUserData.nombres ? createdUserData.nombres.split(' ').filter(name => name.trim() !== '') : [],
                    apellidos: createdUserData.apellidos ? createdUserData.apellidos.split(' ').filter(apellido => apellido.trim() !== '') : [],
                    // Transformar roles del multiselect al formato esperado por el backend
                    roles: createdUserData.roles ? createdUserData.roles.map(role => role.value) : [],
                    // Convertir alergias de string a array separando por comas o espacios
                    alergias: createdUserData.alergias ? 
                        createdUserData.alergias.split(/[,\s]+/).filter(alergia => alergia.trim() !== '') : [],
                    // Convertir medicamentos de string a array separando por comas o espacios
                    medicamentos: createdUserData.medicamentos ? 
                        createdUserData.medicamentos.split(/[,\s]+/).filter(medicamento => medicamento.trim() !== '') : [],
                    // Convertir condiciones de string a array separando por comas o espacios
                    condiciones: createdUserData.condiciones ? 
                        createdUserData.condiciones.split(/[,\s]+/).filter(condicion => condicion.trim() !== '') : []
                };
                
                const result = await onUserCreated(transformedData);
                if (result.success) {
                    setShow(false);
                    setErrors({});
                } else if (result.error && typeof result.error === 'object') {
                    errorData(result.error);
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="relative w-full max-w-xs sm:max-w-2xl h-auto p-0 animate-fade-in flex flex-col rounded-2xl bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl">
                        {/* Header */}
                        <div className="flex items-center px-4 sm:px-10 pt-6 pb-4 border-b border-[#4EB9FA]/20 relative">
                            <h2 className="text-2xl font-bold text-[#2C3E50] flex-1">Crear usuario</h2>
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
                        <div className="px-4 sm:px-10 py-6 sm:py-10 pr-2 sm:pr-6 flex flex-col items-center flex-1 min-h-0 w-full overflow-y-auto scrollbar-thin" style={{ maxHeight: 'calc(90vh - 90px)' }}>
                            <Form
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
                                        placeholder: 'Salazar Jara',
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
                                        label: "Rut",
                                        name: "run",
                                        placeholder: '21.308.770-3',
                                        fieldType: 'input',
                                        type: "text",
                                        minLength: 9,
                                        maxLength: 12,
                                        pattern: patternRut,
                                        patternMessage: "Debe ser xx.xxx.xxx-x o xxxxxxxx-x",
                                        required: true,
                                        errorMessageData: errors.run,
                                        onChange: (e) => handleInputChange('run', e.target.value),
                                        autoComplete: "off"
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
                                        onChange: (e) => handleInputChange('telefono', e.target.value),
                                        autoComplete: "tel"
                                    },
                                    {
                                        label: "Fecha de nacimiento",
                                        name: "fechaNacimiento",
                                        fieldType: 'input',
                                        type: "date",
                                        required: true,
                                        errorMessageData: errors.fechaNacimiento,
                                        onChange: (e) => handleInputChange('fechaNacimiento', e.target.value),
                                        autoComplete: "bday"
                                    },
                                    {
                                        label: "Fecha de ingreso",
                                        name: "fechaIngreso",
                                        fieldType: 'input',
                                        type: "date",
                                        required: true,
                                        errorMessageData: errors.fechaIngreso,
                                        onChange: (e) => handleInputChange('fechaIngreso', e.target.value),
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
                                        placeholder: 'Penicilina, mariscos, polen (separar con comas o espacios)',
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
                                        placeholder: 'Aspirina, Losartán, Metformina (separar con comas o espacios)',
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
                                        placeholder: 'Diabetes, Hipertensión, Asma (separar con comas o espacios)',
                                        fieldType: 'textarea',
                                        required: false,
                                        maxLength: 500,
                                        rows: 3,
                                        errorMessageData: errors.condiciones,
                                        onChange: (e) => handleInputChange('condiciones', e.target.value),
                                        autoComplete: "off"
                                    },
                                    {
                                        label: (
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-[#2C3E50]">Contraseña</span>
                                                <span className="relative group">
                                                    <MdHelpOutline className="w-4 h-4 cursor-pointer" />
                                                    <span className="absolute left-6 top-1 z-10 hidden group-hover:block bg-white text-xs text-[#2C3E50] border border-[#4EB9FA]/30 rounded px-2 py-1 shadow-lg min-w-max">
                                                        Este campo es obligatorio
                                                    </span>
                                                </span>
                                            </div>
                                        ),
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
                                    }
                                ]}
                                onSubmit={handleSubmit}
                                backgroundColor={'#fff'}
                            />

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
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Creando...</span>
                                        </div>
                                    ) : (
                                        'Crear Usuario'
                                    )}
                                </button>
                            </div>
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