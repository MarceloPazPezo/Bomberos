
import React, { useState } from 'react';
import Form from '@components/Form';
import { MdClose, MdHelpOutline } from 'react-icons/md';
import '@styles/popup.css';

export default function UpdateUserPopup({ show, setShow, data, onUserUpdated }) {
    const userData = data || {};
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            // Los roles ya vienen del multiselect integrado en Form
            if (onUserUpdated && userData.rut) {
                const result = await onUserUpdated(formData, userData.rut);
                if (result.success) {
                    setShow(false);
                }
            }
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShow(false);
    };

    const patternRut = new RegExp(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/);

    return (
        <div>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="relative w-full max-w-xs sm:max-w-2xl h-auto p-0 animate-fade-in flex flex-col rounded-2xl bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl">
                        {/* Header */}
                        <div className="flex items-center px-4 sm:px-10 pt-6 pb-4 border-b border-[#4EB9FA]/20 relative">
                            <h2 className="text-2xl font-bold text-[#2C3E50] flex-1">Editar usuario</h2>
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
                            <div className="w-full space-y-6">
                                <Form
                                    title="Editar Usuario"
                                    defaultValues={{
                                        nombres: Array.isArray(userData.nombres) ? userData.nombres.join(' ') : userData.nombres || "",
                                        apellidos: Array.isArray(userData.apellidos) ? userData.apellidos.join(' ') : userData.apellidos || "",
                                        email: userData.email || "",
                                        rut: userData.rut || "",
                                        telefono: userData.telefono || "",
                                        fechaNacimiento: userData.fechaNacimiento ? userData.fechaNacimiento.split('T')[0] : "",
                                        newPassword: "",
                                        roles: (() => {
                                            // Obtener roles del usuario para valores por defecto
                                            let userRoles = [];
                                            if (userData.roles && Array.isArray(userData.roles)) {
                                                userRoles = userData.roles;
                                            } else if (userData.rol) {
                                                if (typeof userData.rol === 'string') {
                                                    userRoles = [userData.rol];
                                                } else if (typeof userData.rol === 'object' && userData.rol.nombre) {
                                                    userRoles = [userData.rol.nombre];
                                                }
                                            }
                                            return userRoles;
                                        })()
                                    }}
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
                                            maxLength: 100,
                                            autoComplete: "new-email"
                                        },
                                        {
                                            label: "Rut",
                                            name: "rut",
                                            placeholder: '21.308.770-3',
                                            fieldType: 'input',
                                            type: "text",
                                            minLength: 9,
                                            maxLength: 12,
                                            pattern: patternRut,
                                            patternMessage: "Debe ser xx.xxx.xxx-x o xxxxxxxx-x",
                                            required: true,
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
                                            autoComplete: "tel"
                                        },
                                        {
                                            label: "Fecha de nacimiento",
                                            name: "fechaNacimiento",
                                            fieldType: 'input',
                                            type: "date",
                                            required: false,
                                            autoComplete: "bday"
                                        },
                                        {
                                            label: (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-[#2C3E50]">Nueva contraseña</span>
                                                    <span className="relative group">
                                                        <MdHelpOutline className="w-4 h-4 cursor-pointer" />
                                                        <span className="absolute left-6 top-1 z-10 hidden group-hover:block bg-white text-xs text-[#2C3E50] border border-[#4EB9FA]/30 rounded px-2 py-1 shadow-lg min-w-max">
                                                            Este campo es opcional
                                                        </span>
                                                    </span>
                                                </div>
                                            ),
                                            name: "newPassword",
                                            placeholder: "**********",
                                            fieldType: 'input',
                                            type: "password",
                                            required: false,
                                            minLength: 8,
                                            maxLength: 26,
                                            pattern: /^[a-zA-Z0-9]+$/,
                                            patternMessage: "Debe contener solo letras y números",
                                            autoComplete: "new-password"
                                        },
                                        {
                                            label: "Roles",
                                            name: "roles",
                                            fieldType: 'multiselect',
                                            dataSource: 'roles',
                                            required: true,
                                            placeholder: "Seleccionar roles...",
                                            searchPlaceholder: "Buscar roles..."
                                        }
                                    ]}
                                    onSubmit={handleSubmit}
                                    loading={loading}
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
                                                <span>Actualizando...</span>
                                            </div>
                                        ) : (
                                            'Actualizar Usuario'
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