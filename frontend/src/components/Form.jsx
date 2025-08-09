import { useForm } from 'react-hook-form';
import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { fieldIcons } from '@helpers/fieldIcons';
import { MdVisibility, MdVisibilityOff, MdAdd, MdRemove } from 'react-icons/md';
import MultiSelect from '@components/MultiSelect';
import { useRoles } from '@hooks/roles/useRoles';

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
    submitButtonVariant = 'primary'
}, ref) => {
    const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm({
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
    const [multiSelectFields, setMultiSelectFields] = useState({});
    
    // Hook para obtener roles
    const { roles, loading: rolesLoading, fetchRoles } = useRoles();

    // Efecto para cargar roles cuando hay campos multiselect de tipo roles
    useEffect(() => {
        const hasRoleMultiSelect = fields.some(field => field.fieldType === 'multiselect' && field.dataSource === 'roles');
        if (hasRoleMultiSelect && roles.length === 0 && !rolesLoading) {
            fetchRoles();
        }
    }, [fields, roles.length, fetchRoles, rolesLoading]);

    // Efecto para inicializar campos MultiSelect con valores por defecto
    useEffect(() => {
        const multiSelectFieldsToInit = {};
        fields.forEach(field => {
            if (field.fieldType === 'multiselect' && field.defaultValue) {
                multiSelectFieldsToInit[field.name] = getMultiSelectDefaultValue(field);
            }
        });
        
        if (Object.keys(multiSelectFieldsToInit).length > 0) {
            setMultiSelectFields(prev => ({
                ...prev,
                ...multiSelectFieldsToInit
            }));
        }
    }, [fields, roles]); // Incluir roles para reinicializar cuando se cargan

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

    const updateMultiSelectField = (fieldName, selectedOptions) => {
        setMultiSelectFields(prev => ({
            ...prev,
            [fieldName]: selectedOptions
        }));
    };

    const getMultiSelectOptions = (field) => {
        if (field.dataSource === 'roles') {
            const options = roles.map(role => ({
                value: role.nombre,
                label: role.nombre.charAt(0).toUpperCase() + role.nombre.slice(1)
            }));
            return options;
        }
        return field.options || [];
    };

    const getMultiSelectDefaultValue = (field) => {
        if (field.defaultValue) {
            if (Array.isArray(field.defaultValue)) {
                return field.defaultValue.map(value => ({
                    value: value,
                    label: typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : value
                }));
            }
        }
        return [];
    };

    const onFormSubmit = (data) => {
        // Incluir campos dinámicos y multiselect en los datos del formulario
        const multiSelectData = {};
        Object.keys(multiSelectFields).forEach(fieldName => {
            multiSelectData[fieldName] = multiSelectFields[fieldName].map(option => option.value);
        });
        
        const formData = {
            ...data,
            ...dynamicFields,
            ...multiSelectData
        };
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

    return (
        // --- CAMBIOS PRINCIPALES AQUÍ ---
        // 1. Se usa `w-full` para que ocupe el 100% del ancho en móviles.
        // 2. La prop `size` (`max-w-2xl` por defecto) limita el ancho en pantallas grandes.
        // 3. `mx-auto` centra el formulario en el medio de la pantalla.
        // 4. Se ajustó el padding para ser más amigable en móviles (p-6).
        <form
            className={`bg-blue backdrop-blur-lg border border-[#2C3E50]/20 shadow-xl p-4 sm:p-5 md:p-6 rounded-2xl w-full ${size} mx-auto`}
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
                    {field.label && <label className="block text-sm font-semibold text-[#2C3E50] mb-1.5" htmlFor={field.name}>{field.label}</label>}
                    
                    {field.fieldType === 'input' && (
                        <div className="relative flex items-center">
                          {fieldIcons[field.name] && (
                            <span className="absolute left-3 text-[#2C3E50] opacity-70 pointer-events-none">
                              {fieldIcons[field.name]({ size: 22 })}
                            </span>
                          )}
                          <input
                            className={`w-full p-3 ${fieldIcons[field.name] ? 'pl-11' : ''} ${field.type === 'password' ? 'pr-11' : ''} bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition`}
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
                        <textarea
                            className="w-full p-3 bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition"
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
                    )}

                    {field.fieldType === 'select' && (
                        <select 
                            className="w-full p-3 bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition appearance-none"
                            {...register(field.name, {
                                required: field.required ? 'Este campo es obligatorio' : false,
                                validate: field.validate || {},
                            })}
                            name={field.name}
                            defaultValue={field.defaultValue || ''}
                            disabled={field.disabled}
                            onChange={field.onChange}
                        >
                            <option value="">Seleccionar opción</option>
                            {field.options && field.options.map((option, optIndex) => (
                                <option className="text-black bg-white" key={optIndex} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
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

                    {field.fieldType === 'multiselect' && (
                        <MultiSelect
                            options={getMultiSelectOptions(field)}
                            selectedValues={multiSelectFields[field.name] || []}
                            onChange={(values) => updateMultiSelectField(field.name, values)}
                            placeholder={field.placeholder || `Seleccionar ${field.label}`}
                            searchPlaceholder={field.searchPlaceholder || "Buscar..."}
                            disabled={field.disabled}
                            loading={field.dataSource === 'roles' ? rolesLoading : false}
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

                    {/* --- MENSAJE DE ERROR MEJORADO --- */}
                    <div className={`error-message text-red-600 font-semibold mt-1 min-h-[1.25em] text-sm`}> 
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
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
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

export default Form;