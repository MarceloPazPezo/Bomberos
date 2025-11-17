import React, { useState, useRef, useEffect, useCallback } from 'react';
import Form from '../Form';
import LoadingSpinner from '@components/LoadingSpinner';
import BomberoAvatar from './BomberoAvatar';
import ToggleSwitch from '@components/ToggleSwitch';
import ImageUploader from '@components/FileUpload/ImageUploader';
import { MdClose, MdEdit, MdSave, MdPhotoCamera, MdLock, MdVisibility, MdVisibilityOff, MdLocationOn } from 'react-icons/md';
import PropTypes from 'prop-types';
import { useRoles } from '@hooks/roles/useRoles';
import { useCompania } from '@hooks/compania/useCompania';
import { useTipoSangre } from '@hooks/tipoSangre/useTipoSangre';
import { perfilCompletoService } from '@services/perfilCompleto.service';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '@helpers/fireAlert';
import { perfilActualizadoToast, imagenPerfilActualizadaToast, contraseñaCambiadaToast } from '@helpers/toastHelper';
import DirectionSelector from '@components/forms/DirectionSelector';

export default function EditBomberoModal({ isOpen, bombero, onClose, onSave }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'password', 'ficha', 'direccion'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageError, setProfileImageError] = useState(null);
    const [direccionData, setDireccionData] = useState(null);
    const [formData, setFormData] = useState({
        // Datos editables
        email: '',
        telefono: '',
        licenciaClaseF: false,
        donante: false,
        idTipoSangre: '',
        // Datos de contraseña
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        // Datos de imagen
        removeProfileImage: false
    });
    const formRef = useRef(null);

    // Hooks para datos
    const { roles, loading: rolesLoading } = useRoles();
    const { companias, loading: companiasLoading } = useCompania();
    const { tiposSangre, loading: tiposSangreLoading, fetchTiposSangre } = useTipoSangre();

    // Manejar cambios de dirección
    const handleDireccionChange = useCallback((newDireccionData) => {
        setDireccionData(newDireccionData);
    }, []);

    // Preparar opciones para los selects
    const companiasOptions = companias.map(compania => ({
        value: compania.id,
        label: compania.nombre
    }));

    const tiposSangreOptions = tiposSangre.map(tipo => ({
        value: tipo.id,
        label: tipo.nombre
    }));

    // Cargar datos del bombero cuando se abre el modal
    useEffect(() => {
        if (isOpen && bombero) {
            // Debug: verificar estructura del bombero
            console.log('EditBomberoModal - Bombero data:', bombero);
            console.log('EditBomberoModal - Compañía info:', {
                informacionPersonal: bombero?.informacionPersonal?.compania,
                ficha: bombero?.ficha?.compania,
                final: bombero?.informacionPersonal?.compania?.nombre || bombero?.ficha?.compania?.nombre || 'No asignada'
            });
            
            // Solo cargar datos si el bombero tiene información válida
            if (bombero.email || bombero.informacionPersonal || bombero.ficha) {
                // Manejar tanto la estructura de bomberoData (nueva) como la de currentBombero (antigua)
                const email = bombero.email || '';
                const telefono = bombero.informacionPersonal?.telefono || bombero.ficha?.telefono || '';
                const licenciaClaseF = bombero.informacionPersonal?.licenciaClaseF || bombero.ficha?.licenciaClaseF || false;
                const donante = bombero.informacionPersonal?.donante || bombero.ficha?.donante || false;
                const idTipoSangre = bombero.informacionPersonal?.tipoSangre?.id || bombero.ficha?.tipoSangre?.id || '';
                
                console.log('EditBomberoModal - Loaded data:', { email, telefono, licenciaClaseF, donante, idTipoSangre });
                
                setFormData({
                    email,
                    telefono,
                    licenciaClaseF,
                    donante,
                    idTipoSangre,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    removeProfileImage: false
                });
            } else {
                console.log('EditBomberoModal - No valid bombero data available yet');
            }
            
            setActiveTab('personal');
            setErrors({});
            setProfileImage(null);
            setProfileImageError(null);
            
            // Cargar datos de dirección si existen
            const direccion = bombero.informacionPersonal?.direccion || bombero.ficha?.direccion;
            if (direccion) {
                setDireccionData(direccion);
            } else {
                setDireccionData(null);
            }
        }
    }, [isOpen]); // Removido bombero de las dependencias para evitar resets innecesarios

    // Cargar datos cuando el bombero cambie (para casos donde los datos llegan después)
    useEffect(() => {
        if (isOpen && bombero && (bombero.email || bombero.informacionPersonal || bombero.ficha)) {
            console.log('EditBomberoModal - Bombero data updated:', bombero);
            
            // Manejar tanto la estructura de bomberoData (nueva) como la de currentBombero (antigua)
            const email = bombero.email || '';
            const telefono = bombero.informacionPersonal?.telefono || bombero.ficha?.telefono || '';
            const licenciaClaseF = bombero.informacionPersonal?.licenciaClaseF || bombero.ficha?.licenciaClaseF || false;
            const donante = bombero.informacionPersonal?.donante || bombero.ficha?.donante || false;
            const idTipoSangre = bombero.informacionPersonal?.tipoSangre?.id || bombero.ficha?.tipoSangre?.id || '';
            
            console.log('EditBomberoModal - Updated data:', { email, telefono, licenciaClaseF, donante, idTipoSangre });
            
            setFormData(prev => ({
                ...prev,
                email,
                telefono,
                licenciaClaseF,
                donante,
                idTipoSangre
            }));
        }
    }, [bombero, isOpen]);

    // Cargar tipos de sangre cuando se abre el modal
    useEffect(() => {
        if (isOpen && tiposSangre.length === 0) {
            fetchTiposSangre();
        }
    }, [isOpen, tiposSangre.length, fetchTiposSangre]);

    // Función para enfocar el primer campo con error
    const focusFirstErrorField = () => {
        const errorFields = Object.keys(errors);
        if (errorFields.length > 0) {
            const firstErrorField = errorFields[0];
            const fieldElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (fieldElement) {
                fieldElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                setTimeout(() => {
                    fieldElement.focus();
                }, 300);
            }
        }
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            focusFirstErrorField();
        }
    }, [errors]);

    // Limpiar estado al cerrar
    const handleClose = () => {
        setErrors({});
        setActiveTab('personal');
        setProfileImage(null);
        setProfileImageError(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setLoading(false);
        onClose();
    };

    // Manejar cambio de input
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    // Manejar selección de imagen de perfil
    const handleImageSelect = (file) => {
        setProfileImage(file);
        setProfileImageError(null);
    };

    const handleImageRemove = () => {
        setProfileImage(null);
        setProfileImageError(null);
    };


    // Validar datos personales
    const validatePersonalData = (data) => {
        const newErrors = {};

        if (!data.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)) {
            newErrors.email = 'Email inválido';
        }

        if (data.telefono && !/^\+?[\d\s\-\(\)]+$/.test(data.telefono)) {
            newErrors.telefono = 'Formato de teléfono inválido';
        }

        return newErrors;
    };

    // Validar datos de contraseña
    const validatePasswordData = (data) => {
        const newErrors = {};

        if (!data.currentPassword) {
            newErrors.currentPassword = 'La contraseña actual es requerida';
        }

        if (!data.newPassword || data.newPassword.length < 8) {
            newErrors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres';
        }

        if (data.newPassword !== data.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (data.currentPassword === data.newPassword) {
            newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
        }

        return newErrors;
    };

    // Validar datos de ficha
    const validateFichaData = (data) => {
        const newErrors = {};

        // Validación de documentos de licencia removida - ahora es opcional

        return newErrors;
    };

    // Validar datos de dirección
    const validateDireccionData = (data) => {
        const newErrors = {};

        if (!data) {
            newErrors.general = 'Debe proporcionar datos de dirección';
            return newErrors;
        }

        // Inicializar objeto de errores de dirección
        const direccionErrors = {};

        // Validar calle/sector (obligatorio)
        if (!data.calle || data.calle.trim() === '') {
            direccionErrors.calle = 'La calle/sector es obligatoria';
        }

        // Validar número (obligatorio)
        if (!data.numero || data.numero.trim() === '') {
            direccionErrors.numero = 'El número es obligatorio';
        } else {
            // Validar que número solo contenga letras, números, espacios y guiones (no símbolos)
            const numeroPattern = /^[a-zA-Z0-9\s-]+$/;
            if (!numeroPattern.test(data.numero)) {
                direccionErrors.numero = 'El número solo puede contener letras, números, espacios y guiones';
            }
        }

        // Validar región (obligatorio)
        if (!data.idRegion || data.idRegion === '') {
            direccionErrors.idRegion = 'La región es obligatoria';
        }

        // Validar comuna (obligatorio)
        if (!data.idComuna || data.idComuna === '') {
            direccionErrors.idComuna = 'La comuna es obligatoria';
        }

        // Solo agregar errores de dirección si hay alguno
        if (Object.keys(direccionErrors).length > 0) {
            newErrors.direccion = direccionErrors;
        }

        return newErrors;
    };


    // Manejar submit completo
    const handleSubmit = async () => {
        setLoading(true);
        setErrors({});

        try {
            // Validar datos según la pestaña activa
            let validationErrors = {};
            
            if (activeTab === 'personal') {
                validationErrors = validatePersonalData(formData);
            } else if (activeTab === 'password') {
                validationErrors = validatePasswordData(formData);
            } else if (activeTab === 'ficha') {
                validationErrors = validateFichaData(formData);
            } else if (activeTab === 'direccion') {
                validationErrors = validateDireccionData(direccionData);
            }
            
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                setLoading(false);
                return;
            }

            // Preparar datos para enviar
            const updateData = {};

            if (activeTab === 'personal') {
                updateData.email = formData.email;
                updateData.telefono = formData.telefono;
            } else if (activeTab === 'password') {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            } else if (activeTab === 'ficha') {
                updateData.licenciaClaseF = formData.licenciaClaseF;
                updateData.donante = formData.donante;
                updateData.idTipoSangre = formData.idTipoSangre ? parseInt(formData.idTipoSangre) : null;
            } else if (activeTab === 'direccion') {
                // Enviar datos de dirección completos
                console.log('[EditBomberoModal] Preparando datos de dirección para enviar:', direccionData);
                if (direccionData) {
                    updateData.direccion = {
                        calle: direccionData.calle || null,
                        numero: direccionData.numero || null,
                        depto: direccionData.depto || null,
                        referencia: direccionData.referencia || null,
                        codigoPostal: direccionData.codigoPostal || null,
                        // Incluir idComuna si tiene un valor válido (número > 0 o string no vacío)
                        idComuna: (direccionData.idComuna && (typeof direccionData.idComuna === 'number' && direccionData.idComuna > 0) || (typeof direccionData.idComuna === 'string' && direccionData.idComuna.trim() !== '')) 
                            ? direccionData.idComuna 
                            : undefined,
                        latitud: direccionData.latitud || null,
                        longitud: direccionData.longitud || null
                    };
                    console.log('[EditBomberoModal] Datos de dirección a enviar:', updateData.direccion);
                    console.log('[EditBomberoModal] Coordenadas:', {
                        latitud: updateData.direccion.latitud,
                        longitud: updateData.direccion.longitud,
                        tipoLatitud: typeof updateData.direccion.latitud,
                        tipoLongitud: typeof updateData.direccion.longitud
                    });
                    // Remover idComuna si es undefined para que no se envíe
                    if (updateData.direccion.idComuna === undefined) {
                        delete updateData.direccion.idComuna;
                    }
                } else {
                    console.log('[EditBomberoModal] No hay direccionData, enviando null');
                    updateData.direccion = null;
                }
            }

            // Agregar archivos si existen (independientemente del tab activo)
            if (profileImage) {
                updateData.profileImage = profileImage;
            }

            console.log('Datos a enviar:', {
                activeTab,
                updateData,
                hasProfileImage: !!profileImage
            });

            // Mostrar confirmación para cambios importantes
            if (activeTab === 'password') {
                const confirmResult = await showConfirmAlert(
                    '¿Cambiar Contraseña?',
                    '¿Estás seguro de que quieres cambiar tu contraseña? Deberás iniciar sesión nuevamente.',
                    'Sí, Cambiar',
                    'Cancelar'
                );

                if (!confirmResult.isConfirmed) {
                    setLoading(false);
                    return;
                }
            }

            // Llamar al servicio correspondiente
            if (activeTab === 'password') {
                await perfilCompletoService.changePassword(updateData);
                contraseñaCambiadaToast();
            } else {
                await perfilCompletoService.updateInformacionPersonal(updateData);
                
                // Mostrar toast específico según el tipo de actualización
                if (profileImage) {
                    imagenPerfilActualizadaToast();
                } else {
                    const tipoActualizacion = activeTab === 'personal' ? 'datos personales' :
                                            activeTab === 'ficha' ? 'ficha adicional' :
                                            activeTab === 'direccion' ? 'dirección' : 'información';
                    perfilActualizadoToast(tipoActualizacion);
                }
            }

            handleClose();
            if (onSave) {
                onSave(updateData);
            }
        } catch (error) {
            console.error('Error updating bombero:', error);
            setErrors({ general: error.message || 'Error al actualizar la información' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                            <MdEdit className="w-6 h-6 text-[#3A9BD9]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Editar Información Personal
                            </h2>
                            <p className="text-blue-100 text-sm">
                                Actualiza tu información personal y profesional
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-3 text-white hover:bg-red-500 hover:bg-opacity-80 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <MdClose className="w-6 h-6 text-red-300 hover:text-white" />
                    </button>
                </div>

                {/* Pestañas */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'personal'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        disabled={loading}
                    >
                        <div className="flex items-center justify-center space-x-1">
                            <MdEdit className="w-3 h-3" />
                            <span>Datos Personales</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'password'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        disabled={loading}
                    >
                        <div className="flex items-center justify-center space-x-1">
                            <MdLock className="w-3 h-3" />
                            <span>Contraseña</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('ficha')}
                        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'ficha'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        disabled={loading}
                    >
                        <div className="flex items-center justify-center space-x-1">
                            <MdPhotoCamera className="w-3 h-3" />
                            <span>Ficha Adicional</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('direccion')}
                        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'direccion'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        disabled={loading}
                    >
                        <div className="flex items-center justify-center space-x-1">
                            <MdLocationOn className="w-3 h-3" />
                            <span>Dirección</span>
                        </div>
                    </button>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[65vh] bg-gray-50/50 relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-b-2xl">
                            <LoadingSpinner />
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <div className="space-y-6">
                            {/* Campos bloqueados (solo lectura) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Nombres (No editable)</label>
                                    <div className="p-2 bg-gray-100 rounded border text-gray-600">
                                        {bombero?.nombres ? (Array.isArray(bombero.nombres) ? bombero.nombres.join(' ') : bombero.nombres) : 'No especificado'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Apellidos (No editable)</label>
                                    <div className="p-2 bg-gray-100 rounded border text-gray-600">
                                        {bombero?.apellidos ? (Array.isArray(bombero.apellidos) ? bombero.apellidos.join(' ') : bombero.apellidos) : 'No especificado'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">RUN (No editable)</label>
                                    <div className="p-2 bg-gray-100 rounded border text-gray-600 font-mono">
                                        {bombero?.run || 'No especificado'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Compañía (No editable)</label>
                                    <div className="p-2 bg-gray-100 rounded border text-gray-600">
                                        {bombero?.informacionPersonal?.compania?.nombre || bombero?.ficha?.compania?.nombre || 'No asignada'}
                                    </div>
                                </div>
                            </div>

                            <Form
                                ref={formRef}
                                title={null}
                                autoComplete="off"
                                size="w-full"
                                defaultValues={formData}
                                fields={[
                                    {
                                        label: "Correo electrónico",
                                        name: "email",
                                        placeholder: 'example@gmail.com',
                                        fieldType: 'input',
                                        type: "email",
                                        required: true,
                                        minLength: 5,
                                        maxLength: 255,
                                        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                        errorMessageData: errors.email,
                                        onChange: (e) => handleInputChange('email', e.target.value),
                                        autoComplete: "email"
                                    },
                                    {
                                        label: "Teléfono",
                                        name: "telefono",
                                        placeholder: '+56 9 1234 5678',
                                        fieldType: 'input',
                                        type: "tel",
                                        maxLength: 15,
                                        errorMessageData: errors.telefono,
                                        onChange: (e) => handleInputChange('telefono', e.target.value),
                                        autoComplete: "tel"
                                    }
                                ]}
                                onSubmit={() => {}}
                                backgroundColor={'#fff'}
                            />
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div className="space-y-6">
                            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <MdLock className="w-4 h-4 text-yellow-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-yellow-900 text-sm">
                                        Cambio de Contraseña
                                    </h3>
                                    <p className="text-yellow-700 text-xs mt-1">
                                        Por seguridad, deberás iniciar sesión nuevamente después del cambio.
                                    </p>
                                </div>
                            </div>

                            <Form
                                ref={formRef}
                                title={null}
                                autoComplete="off"
                                size="w-full"
                                defaultValues={formData}
                                fields={[
                                    {
                                        label: "Contraseña actual",
                                        name: "currentPassword",
                                        placeholder: "Ingresa tu contraseña actual",
                                        fieldType: 'input',
                                        type: showPassword ? "text" : "password",
                                        required: true,
                                        errorMessageData: errors.currentPassword,
                                        onChange: (e) => handleInputChange('currentPassword', e.target.value),
                                        autoComplete: "current-password",
                                        icon: showPassword ? MdVisibilityOff : MdVisibility,
                                        onIconClick: () => setShowPassword(!showPassword)
                                    },
                                    {
                                        label: "Nueva contraseña",
                                        name: "newPassword",
                                        placeholder: "Ingresa tu nueva contraseña",
                                        fieldType: 'input',
                                        type: showConfirmPassword ? "text" : "password",
                                        required: true,
                                        minLength: 8,
                                        maxLength: 26,
                                        pattern: /^[a-zA-Z0-9]+$/,
                                        patternMessage: "Debe contener solo letras y números",
                                        errorMessageData: errors.newPassword,
                                        onChange: (e) => handleInputChange('newPassword', e.target.value),
                                        autoComplete: "new-password",
                                        icon: showConfirmPassword ? MdVisibilityOff : MdVisibility,
                                        onIconClick: () => setShowConfirmPassword(!showConfirmPassword)
                                    },
                                    {
                                        label: "Confirmar nueva contraseña",
                                        name: "confirmPassword",
                                        placeholder: "Confirma tu nueva contraseña",
                                        fieldType: 'input',
                                        type: showConfirmPassword ? "text" : "password",
                                        required: true,
                                        errorMessageData: errors.confirmPassword,
                                        onChange: (e) => handleInputChange('confirmPassword', e.target.value),
                                        autoComplete: "new-password"
                                    }
                                ]}
                                onSubmit={() => {}}
                                backgroundColor={'#fff'}
                            />
                        </div>
                    )}

                    {activeTab === 'ficha' && (
                        <div className="space-y-6">
                            {/* Layout de 2 columnas: Imagen de Perfil + Información Personal */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Columna Izquierda: Imagen de Perfil */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <MdPhotoCamera className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">Imagen de Perfil</h3>
                                            <p className="text-xs text-gray-600">Actualiza tu foto (opcional)</p>
                                        </div>
                                    </div>
                                    <ImageUploader
                                        onFileSelect={handleImageSelect}
                                        onFileRemove={handleImageRemove}
                                        value={profileImage}
                                        error={profileImageError}
                                        placeholder="Seleccionar imagen..."
                                        className="w-full"
                                        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                                        maxSize={5 * 1024 * 1024} // 5MB
                                        // cropSize={null} - Usar tamaño mínimo de la imagen automáticamente
                                    />
                                </div>

                                {/* Columna Derecha: Información Personal */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-green-600 font-bold text-sm">ℹ️</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">Información Personal</h3>
                                            <p className="text-xs text-gray-600">Datos adicionales</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Donante de Órganos */}
                                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">❤️</span>
                                                    <span className="font-medium text-gray-900 text-sm">Donante de Órganos</span>
                                                </div>
                                                <ToggleSwitch
                                                    id="donante"
                                                    checked={formData.donante}
                                                    onChange={(checked) => handleInputChange('donante', checked)}
                                                    size="sm"
                                                />
                                            </div>
                                            {errors.donante && (
                                                <p className="text-xs text-red-600 mt-1">{errors.donante}</p>
                                            )}
                                        </div>

                                        {/* Tipo de Sangre */}
                                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xl">🩸</span>
                                                <span className="font-medium text-gray-900 text-sm">Tipo de Sangre</span>
                                            </div>
                                            <select
                                                value={formData.idTipoSangre}
                                                onChange={(e) => handleInputChange('idTipoSangre', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                disabled={tiposSangreLoading}
                                            >
                                                <option value="">
                                                    {tiposSangreLoading ? "Cargando..." : "Seleccionar tipo (opcional)"}
                                                </option>
                                                {tiposSangreOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.idTipoSangre && (
                                                <p className="text-xs text-red-600 mt-1">{errors.idTipoSangre}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección de Licencia y Documentos */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                        <span className="text-amber-600 font-bold text-sm">🚗</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">Licencia de Conducir Clase F</h3>
                                        <p className="text-xs text-gray-600">Información de licencia</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Toggle de Licencia */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">🚗</span>
                                                <div>
                                                    <span className="font-medium text-gray-900 text-sm">¿Tienes licencia Clase F?</span>
                                                </div>
                                            </div>
                                            <ToggleSwitch
                                                id="licenciaClaseF"
                                                checked={formData.licenciaClaseF}
                                                onChange={(checked) => handleInputChange('licenciaClaseF', checked)}
                                                size="md"
                                            />
                                        </div>
                                        {errors.licenciaClaseF && (
                                            <p className="text-sm text-red-600 mt-2">{errors.licenciaClaseF}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'direccion' && (
                        <div className="space-y-6">
                            <DirectionSelector
                                initialData={bombero?.ficha?.direccion || bombero?.informacionPersonal?.direccion}
                                onChange={handleDireccionChange}
                                errors={errors.direccion || {}}
                                disabled={loading}
                                showMap={true}
                            />
                        </div>
                    )}

                    {/* Error general */}
                    {errors.general && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{errors.general}</p>
                        </div>
                    )}
                </div>

                {/* Botones */}
                <div className="flex justify-end px-6 py-4 bg-white border-t border-gray-200 rounded-b-2xl">
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex items-center space-x-2 px-4 py-2.5 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 font-medium"
                            disabled={loading}
                        >
                            <MdClose className="w-4 h-4 text-red-500" />
                            <span>Cancelar</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <MdSave className="w-4 h-4" />
                                    <span>Guardar Cambios</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

EditBomberoModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    bombero: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func
};
