import { useForm } from 'react-hook-form';
import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { fieldIcons } from '@helpers/fieldIcons';
import { MdVisibility, MdVisibilityOff, MdAdd, MdRemove } from 'react-icons/md';
import { FaAsterisk } from "react-icons/fa";
import MultiSelect from '@components/MultiSelect';
import Select from '@components/Select';
import LoadingSpinner from '@components/LoadingSpinner';
import { format, parseISO, isValid } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import DatePicker from './DatePicker';

// Zona horaria de Chile (Santiago)
const CHILE_TIMEZONE = 'America/Santiago';


// Helper para convertir string de fecha a Date en zona horaria de Chile
const stringToChileDate = (dateString) => {
    if (!dateString) return null;
    try {
        // Parsear la fecha ISO (YYYY-MM-DD) y convertirla a zona horaria de Chile
        const date = parseISO(dateString + 'T00:00:00');
        return toZonedTime(date, CHILE_TIMEZONE);
    } catch (error) {
        console.error('Error parsing date:', error);
        return null;
    }
};

// Helper para convertir Date a string ISO en zona horaria de Chile
const chileDateToString = (date) => {
    if (!date || !isValid(date)) return '';
    try {
        // Convertir la fecha de Chile a UTC y formatear como ISO
        const utcDate = fromZonedTime(date, CHILE_TIMEZONE);
        return format(utcDate, 'yyyy-MM-dd');
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

// Helper para crear fecha máxima/minima en zona horaria de Chile
const createChileDate = (dateString, time = '00:00:00') => {
    if (!dateString) return null;
    try {
        const date = parseISO(dateString + 'T' + time);
        return toZonedTime(date, CHILE_TIMEZONE);
    } catch (error) {
        console.error('Error creating Chile date:', error);
        return null;
    }
};

const Form = forwardRef(({
    title,
    fields,
    buttonText,
    onSubmit,
    footerContent,
    backgroundColor,
    autoComplete,
    size = 'max-w-2xl',
    defaultValues = {},
    loading = false,
    submitButtonVariant = 'primary',
}, ref) => {
    const { register, handleSubmit, formState: { errors }, watch, setValue, getValues, clearErrors } = useForm({
        defaultValues
    });

    // Exponer métodos del formulario al componente padre
    useImperativeHandle(ref, () => ({
        setValue,
        getValues,
        watch
    }));
    const [showPassword, setShowPassword] = useState({});
    const [dynamicFields, setDynamicFields] = useState({});
    const [selectedOptions, setSelectedOptions] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const fieldRefs = useRef({});

    useEffect(() => {
        const initialOptions = {};
        fields.forEach((field) => {
            if (field.fieldType === 'multiselect') {
                // Asegurar que defaultValue siempre sea un array
                const defaultValue = Array.isArray(field.defaultValue) ? field.defaultValue : [];
                initialOptions[field.name] = defaultValue;
                setValue(field.name, defaultValue); // Sincroniza con react-hook-form
            }
            
            // Configurar validaciones para el Select personalizado
            if (field.fieldType === 'select') {
                register(field.name, {
                    required: field.required ? 'Este campo es obligatorio' : false,
                    validate: field.validate || {},
                });
            }
        });
        setSelectedOptions(initialOptions);
    }, [fields, setValue, register]);

    // Detectar errores específicos por campo y hacer auto-focus
    useEffect(() => {
        const currentFieldErrors = {};
        
        // Detectar errores de react-hook-form
        Object.keys(errors).forEach(fieldName => {
            if (errors[fieldName]) {
                currentFieldErrors[fieldName] = true;
            }
        });

        // Detectar errores específicos del backend (errorMessageData)
        fields.forEach(field => {
            if (field.errorMessageData) {
                currentFieldErrors[field.name] = true;
            }
        });

        setFieldErrors(currentFieldErrors);

        // Auto-focus en el primer campo con error
        const firstErrorField = fields.find(field => 
            currentFieldErrors[field.name] && fieldRefs.current[field.name]
        );

        if (firstErrorField && fieldRefs.current[firstErrorField.name]) {
            const fieldElement = fieldRefs.current[firstErrorField.name];
            
            // Hacer scroll suave al campo
            fieldElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Hacer focus después de un pequeño delay para que el scroll termine
            setTimeout(() => {
                fieldElement.focus();
            }, 300);
        }
    }, [errors, fields]);

    const togglePasswordVisibility = (fieldName) => {
        setShowPassword(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    const addDynamicField = (fieldName) => {
        setDynamicFields(prev => ({
            ...prev,
            [fieldName]: [...(prev[fieldName] || []), '']
        }));
    };

    const removeDynamicField = (fieldName, index) => {
        setDynamicFields(prev => ({
            ...prev,
            [fieldName]: prev[fieldName].filter((_, i) => i !== index)
        }));
    };

    const updateDynamicField = (fieldName, index, value) => {
        setDynamicFields(prev => ({
            ...prev,
            [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
        }));
    };

    const handleMultiSelectChange = (name, selected) => {
        setSelectedOptions((prevState) => ({
            ...prevState,
            [name]: selected,
        }));
        setValue(name, selected);
        
        // Limpiar errores cuando se selecciona algo
        if (selected && selected.length > 0 && clearErrors) {
            clearErrors(name);
        }
    };

    const onFormSubmit = (data) => {
        // Incluir campos dinámicos y multiselect en los datos del formulario
        const formData = {
            ...data,
            ...dynamicFields,
            // Los datos del multiselect ya están incluidos en selectedOptions y se pasan a través de setValue
            ...Object.keys(selectedOptions).reduce((acc, fieldName) => {
                acc[fieldName] = selectedOptions[fieldName];
                return acc;
            }, {})
        };
        
        // Hacer auto-focus en el primer campo con error después del submit
        setTimeout(() => {
            const firstErrorField = fields.find(field => 
                errors[field.name] && fieldRefs.current[field.name]
            );

            if (firstErrorField && fieldRefs.current[firstErrorField.name]) {
                const fieldElement = fieldRefs.current[firstErrorField.name];
                
                // Hacer scroll suave al campo
                fieldElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Hacer focus después de un pequeño delay para que el scroll termine
                setTimeout(() => {
                    fieldElement.focus();
                }, 300);
            }
        }, 100);
        
        onSubmit(formData);
    };

    const getButtonVariantClasses = () => {
        const baseClasses = "w-full font-bold py-3 rounded-lg mt-4 transition-all duration-300 ease-in-out hover:-translate-y-0.5 focus:outline-none focus:ring-2";

        switch (submitButtonVariant) {
            case 'secondary':
                return `${baseClasses} bg-gray-500/10 border border-gray-500/20 text-gray-700 hover:bg-gray-500/20 focus:ring-gray-400/50`;
            case 'danger':
                return `${baseClasses} bg-red-500/10 border border-red-500/20 text-red-700 hover:bg-red-500/20 focus:ring-red-400/50`;
            case 'success':
                return `${baseClasses} bg-green-500/10 border border-green-500/20 text-green-700 hover:bg-green-500/20 focus:ring-green-400/50`;
            default:
                return `${baseClasses} bg-[#2C3E50]/10 border border-[#2C3E50]/20 text-[#2C3E50] hover:bg-[#2C3E50]/20 focus:ring-[#4EB9FA]/50`;
        }
    };

    const getFieldClasses = (fieldName, baseClasses) => {
        const hasError = fieldErrors[fieldName] || errors[fieldName];
        if (hasError) {
            return `${baseClasses} border-red-500 focus:ring-red-500/40 bg-red-50`;
        }
        return baseClasses;
    };

    return (
        // --- CAMBIOS PRINCIPALES AQUÍ ---
        // 1. Se usa `w-full` para que ocupe el 100% del ancho en móviles.
        // 2. La prop `size` (`max-w-2xl` por defecto) limita el ancho en pantallas grandes.
        // 3. `mx-auto` centra el formulario en el medio de la pantalla.
        // 4. Se ajustó el padding para ser más amigable en móviles (p-6).
        <form
            className={`bg-blue backdrop-blur-lg p-4 sm:p-5 md:p-6 rounded-2xl w-full ${size} mx-auto`}
            style={{ backgroundColor: backgroundColor }}
            onSubmit={handleSubmit(onFormSubmit)}
            autoComplete={autoComplete === undefined ? "on" : autoComplete}
        >
            {title && (
                // --- CAMBIO DE TAMAÑO DE TEXTO RESPONSIVO ---
                <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-8 text-center">{title}</h1>
            )}

            {fields.map((field, index) => (
                <div className="w-full mb-3" key={index}>
                    {field.label && (
                        <label className="block text-sm font-semibold text-[#2C3E50] mb-1.5" htmlFor={field.name}>
                            <div className="flex items-center gap-1">
                                {typeof field.label === 'string' ? (
                                    <>
                                        <span>{field.label}</span>
                                        {field.required && (
                                            <span className="relative group">
                                                <FaAsterisk className="w-2 h-2 text-red-500" />
                                                <span className="absolute left-4 top-0 z-10 hidden group-hover:block bg-white text-xs text-[#2C3E50] border border-[#4EB9FA]/30 rounded px-2 py-1 shadow-lg min-w-max">
                                                    Este campo es obligatorio
                                                </span>
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    // Para labels complejos como el de contraseña que ya tiene su propio JSX
                                    field.label
                                )}
                            </div>
                        </label>
                    )}

                    {field.fieldType === 'input' && (
                        <div className="relative flex items-center">
                            {fieldIcons[field.name] && (
                                <span className="absolute left-3 text-[#2C3E50] opacity-70 pointer-events-none">
                                    {fieldIcons[field.name]({ size: 22 })}
                                </span>
                            )}
                            <input
                                ref={(el) => fieldRefs.current[field.name] = el}
                                className={getFieldClasses(field.name, `w-full p-3 ${fieldIcons[field.name] ? 'pl-11' : ''} ${field.type === 'password' ? 'pr-11' : ''} bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition`)}
                                {...register(field.name, {
                                    required: field.required ? 'Este campo es obligatorio' : false,
                                    minLength: field.minLength ? { value: field.minLength, message: `Debe tener al menos ${field.minLength} caracteres` } : false,
                                    maxLength: field.maxLength ? { value: field.maxLength, message: `Debe tener máximo ${field.maxLength} caracteres` } : false,
                                    pattern: field.pattern ? { value: field.pattern, message: field.patternMessage || 'Formato no válido' } : false,
                                    validate: field.validate || {},
                                    onChange: (e) => {
                                        // Llamar al onChange personalizado si existe
                                        if (field.onChange) {
                                            field.onChange(e);
                                        }
                                    }
                                })}
                                name={field.name}
                                placeholder={field.placeholder}
                                type={field.type === 'password' ? (showPassword[field.name] ? 'text' : 'password') : field.type}
                                defaultValue={field.defaultValue || ''}
                                disabled={field.disabled}
                                autoComplete={field.autoComplete || "off"}
                                onKeyDown={(e) => {
                                    // Manejar Enter para enviar el formulario
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(onFormSubmit)();
                                    }
                                }}
                            />
                            {field.type === 'password' && (
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2C3E50] opacity-70"
                                    onClick={() => togglePasswordVisibility(field.name)}
                                    tabIndex={0}
                                    aria-label="Mostrar/ocultar contraseña"
                                >
                                    {showPassword[field.name] ? <MdVisibility size={22} /> : <MdVisibilityOff size={22} />}
                                </button>
                            )}
                        </div>
                    )}

                    {field.fieldType === 'textarea' && (
                        <div className="relative flex items-start">
                            {fieldIcons[field.name] && (
                                <span className="absolute left-3 top-3 text-[#2C3E50] opacity-70 pointer-events-none">
                                    {fieldIcons[field.name]({ size: 22 })}
                                </span>
                            )}
                            <textarea
                                ref={(el) => fieldRefs.current[field.name] = el}
                                className={getFieldClasses(field.name, `w-full p-3 ${fieldIcons[field.name] ? 'pl-11' : ''} bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition`)}
                                {...register(field.name, {
                                    required: field.required ? 'Este campo es obligatorio' : false,
                                    minLength: field.minLength ? { value: field.minLength, message: `Debe tener al menos ${field.minLength} caracteres` } : false,
                                    maxLength: field.maxLength ? { value: field.maxLength, message: `Debe tener máximo ${field.maxLength} caracteres` } : false,
                                    pattern: field.pattern ? { value: field.pattern, message: field.patternMessage || 'Formato no válido' } : false,
                                    validate: field.validate || {},
                                })}
                                name={field.name}
                                placeholder={field.placeholder}
                                defaultValue={field.defaultValue || ''}
                                disabled={field.disabled}
                                onChange={field.onChange}
                                rows="4" // Añadido para un tamaño por defecto razonable
                            />
                        </div>
                    )}

                    {field.fieldType === 'select' && (
                        <Select
                            ref={(el) => fieldRefs.current[field.name] = el}
                            options={field.options || []}
                            value={watch(field.name) || field.defaultValue || ''}
                            onChange={(e) => {
                                setValue(field.name, e.target.value);
                                if (field.onChange) field.onChange(e);
                                // Limpiar errores cuando se selecciona algo
                                if (e.target.value) {
                                    clearErrors(field.name);
                                }
                            }}
                            placeholder={field.placeholder || "Seleccionar opción"}
                            disabled={field.disabled}
                            icon={fieldIcons[field.name] ? fieldIcons[field.name]({ size: 22 }) : null}
                            name={field.name}
                            required={field.required}
                            error={!!errors[field.name]}
                        />
                    )}

                    {field.fieldType === 'checkbox' && (
                        <div className="space-y-2">
                            {field.options ? (
                                // Múltiples checkboxes
                                field.options.map((option, optIndex) => (
                                    <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register(field.name, {
                                                required: field.required ? 'Debe seleccionar al menos una opción' : false,
                                                validate: field.validate || {},
                                            })}
                                            value={option.value}
                                            className="w-4 h-4 text-[#4EB9FA] bg-white border-[#2C3E50]/20 rounded focus:ring-[#4EB9FA]/40 focus:ring-2"
                                            disabled={field.disabled}
                                        />
                                        <span className="text-[#2C3E50] text-sm">{option.label}</span>
                                    </label>
                                ))
                            ) : (
                                // Checkbox único
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register(field.name, {
                                            required: field.required ? 'Este campo es obligatorio' : false,
                                            validate: field.validate || {},
                                        })}
                                        className="w-4 h-4 text-[#4EB9FA] bg-white border-[#2C3E50]/20 rounded focus:ring-[#4EB9FA]/40 focus:ring-2"
                                        disabled={field.disabled}
                                    />
                                    <span className="text-[#2C3E50] text-sm">{field.checkboxLabel || field.label}</span>
                                </label>
                            )}
                        </div>
                    )}

                    {field.fieldType === 'radio' && (
                        <div className="space-y-2">
                            {field.options && field.options.map((option, optIndex) => (
                                <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        {...register(field.name, {
                                            required: field.required ? 'Debe seleccionar una opción' : false,
                                            validate: field.validate || {},
                                        })}
                                        value={option.value}
                                        className="w-4 h-4 text-[#4EB9FA] bg-white border-[#2C3E50]/20 focus:ring-[#4EB9FA]/40 focus:ring-2"
                                        disabled={field.disabled}
                                    />
                                    <span className="text-[#2C3E50] text-sm">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {field.fieldType === 'file' && (
                        <input
                            type="file"
                            {...register(field.name, {
                                required: field.required ? 'Este campo es obligatorio' : false,
                                validate: field.validate || {},
                            })}
                            className="w-full p-3 bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4EB9FA]/10 file:text-[#2C3E50] hover:file:bg-[#4EB9FA]/20"
                            accept={field.accept}
                            multiple={field.multiple}
                            disabled={field.disabled}
                        />
                    )}

                    {field.fieldType === 'image' && (
                        <div className="w-full space-y-4">
                            {/* Preview de imagen - ancho completo */}
                            <div className="w-full">
                                {field.preview ? (
                                    <div className="relative w-full h-48 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
                                        <img 
                                            src={field.preview} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        {field.onRemove && (
                                            <button
                                                type="button"
                                                onClick={field.onRemove}
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    /* Placeholder cuando no hay imagen */
                                    <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-500 text-center">Sin imagen seleccionada</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Input de archivo - ancho completo como otros campos */}
                            <div className="w-full">
                                <input
                                    type="file"
                                    id={`${field.name}-upload`}
                                    accept={field.accept || "image/jpeg,image/jpg,image/png,image/gif"}
                                    onChange={field.onChange}
                                    className="hidden"
                                    disabled={field.disabled}
                                />
                                <label
                                    htmlFor={`${field.name}-upload`}
                                    className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition cursor-pointer hover:bg-gray-50"
                                >
                                    <svg className="h-5 w-5 text-[#4EB9FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="font-medium">
                                        {field.preview ? 'Cambiar imagen' : 'Subir imagen'}
                                    </span>
                                </label>
                                {field.helpText && (
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        {field.helpText}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {field.fieldType === 'banner' && (
                        <div className="w-full space-y-4">
                            {/* Preview de banner - más alto que imagen normal */}
                            <div className="w-full">
                                {field.preview ? (
                                    <div className="relative w-full h-64 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
                                        <img 
                                            src={field.preview} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        {field.onRemove && (
                                            <button
                                                type="button"
                                                onClick={field.onRemove}
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    /* Placeholder cuando no hay banner */
                                    <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-500 text-center">Sin banner seleccionado</span>
                                        <span className="text-xs text-gray-400 text-center mt-1">Recomendado: 1200x400px</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Input de archivo - ancho completo como otros campos */}
                            <div className="w-full">
                                <input
                                    type="file"
                                    id={`${field.name}-upload`}
                                    accept={field.accept || "image/jpeg,image/jpg,image/png,image/gif"}
                                    onChange={field.onChange}
                                    className="hidden"
                                    disabled={field.disabled}
                                />
                                <label
                                    htmlFor={`${field.name}-upload`}
                                    className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition cursor-pointer hover:bg-gray-50"
                                >
                                    <svg className="h-5 w-5 text-[#4EB9FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="font-medium">
                                        {field.preview ? 'Cambiar banner' : 'Subir banner'}
                                    </span>
                                </label>
                                {field.helpText && (
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        {field.helpText}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {field.fieldType === 'multiselect' && (
                        <MultiSelect
                            options={field.options || []}
                            selectedOptions={Array.isArray(selectedOptions[field.name]) ? selectedOptions[field.name] : []}
                            onChange={(name, selectedOptions) => {
                                handleMultiSelectChange(name, selectedOptions);
                                // Limpiar errores cuando se selecciona algo
                                if (selectedOptions && selectedOptions.length > 0) {
                                    clearErrors(name);
                                }
                            }}
                            name={field.name}
                            required={field.required}
                            isLoading={field.isLoading}
                            icon={fieldIcons[field.name] ? fieldIcons[field.name]({ size: 22 }) : null}
                            placeholder={field.placeholder || "Seleccionar opciones..."}
                            searchPlaceholder={field.searchPlaceholder || "Buscar..."}
                        />
                    )}

                    {field.fieldType === 'dynamic' && (
                        <div className="space-y-2">
                            {(dynamicFields[field.name] || []).map((value, dynIndex) => (
                                <div key={dynIndex} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => updateDynamicField(field.name, dynIndex, e.target.value)}
                                        className="flex-1 p-3 bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition"
                                        placeholder={field.placeholder || `${field.label} ${dynIndex + 1}`}
                                        disabled={field.disabled}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeDynamicField(field.name, dynIndex)}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                        disabled={field.disabled}
                                    >
                                        <MdRemove size={20} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addDynamicField(field.name)}
                                className="flex items-center space-x-2 p-2 text-[#4EB9FA] hover:bg-[#4EB9FA]/10 rounded-lg transition"
                                disabled={field.disabled}
                            >
                                <MdAdd size={20} />
                                <span className="text-sm">Agregar {field.label}</span>
                            </button>
                        </div>
                    )}

                    {field.fieldType === 'datepicker' && (
                        <div className="relative w-full">
                            <DatePicker
                                value={watch(field.name)}
                                onChange={(e) => {
                                    setValue(field.name, e.target.value);
                                    if (field.onChange) {
                                        field.onChange(e);
                                    }
                                    clearErrors(field.name);
                                }}
                                placeholder={field.placeholder || "Seleccionar fecha"}
                                disabled={field.disabled}
                                maxDate={field.maxDate}
                                minDate={field.minDate}
                                showIcon={true}
                                error={!!(fieldErrors[field.name] || errors[field.name])}
                                className="w-full"
                            />
                            <input
                                type="hidden"
                                {...register(field.name, {
                                    required: field.required ? 'Este campo es obligatorio' : false,
                                    validate: field.validate || {},
                                })}
                            />
                        </div>
                    )}

                    {/* --- MENSAJE DE ERROR MEJORADO --- */}
                    <div className={`error-message text-red-600 font-semibold mt-1 min-h-[1.25em] text-sm transition-all duration-300 ${(errors[field.name]?.message || field.errorMessageData) ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-1'}`}>
                        {errors[field.name]?.message || field.errorMessageData || ''}
                    </div>
                </div>
            ))}

            {buttonText && (
                <button
                    className={`${getButtonVariantClasses()} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <LoadingSpinner variant="spinner" size="sm" color="current" />
                            <span>Procesando...</span>
                        </div>
                    ) : (
                        buttonText
                    )}
                </button>
            )}

            {footerContent && <div className='text-center text-sm text-[#2C3E50]/80 font-medium mt-4 h-5'>{footerContent}</div>}
        </form>
    );
});

import PropTypes from 'prop-types';

Form.propTypes = {
    title: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.object).isRequired,
    buttonText: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    footerContent: PropTypes.node,
    backgroundColor: PropTypes.string,
    autoComplete: PropTypes.string,
    size: PropTypes.string,
    defaultValues: PropTypes.object,
    loading: PropTypes.bool,
    submitButtonVariant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
};

export default Form;