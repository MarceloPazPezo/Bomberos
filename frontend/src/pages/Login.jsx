import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { login } from '@services/auth.service.js';
import useLogin from '@hooks/auth/useLogin.jsx';
import { showErrorAlert } from "../helpers/sweetAlert.js";
import Form from '@components/Form';
import { MdPerson, MdClose, MdSecurity, MdDashboard, MdTrendingUp, MdArrowForward, MdLocalFireDepartment, MdEmergency, MdGroup } from 'react-icons/md';
import { useRutFormatter, formatRutForAPI, formatRutForDisplay } from '@helpers/rutFormatter.js';

const Login = () => {
    const navigate = useNavigate();
    const [showBaseUsers, setShowBaseUsers] = useState(false);
    const formRef = useRef(null);
    const {
        errorRut,
        errorPassword,
        errorData,
        clearErrors
    } = useLogin();

    // Hook para formateo de RUT
    const rutFormatter = useRutFormatter(
        (fieldName, value) => formRef.current?.setValue(fieldName, value),
        'run'
    );

    // Usuarios base del initialSetup
    const baseUsers = [
        {
            name: "Admin Principal",
            email: "admin@example.com",
            run: "1234567-4",
            password: "user1234",
            role: "Administrador",
            description: "Usuario administrador con acceso total al sistema"
        },
        {
            name: "Juan Andrés Pérez",
            email: "editor.juan@example.com", 
            run: "12345678-5",
            password: "user1234",
            role: "Supervisor",
            description: "Usuario supervisor con permisos limitados"
        },
        {
            name: "Ana Lucia López",
            email: "ana.lopez@example.com",
            run: "18765432-7", 
            password: "user1234",
            role: "Usuario",
            description: "Usuario básico (Nota: Este usuario está inactivo)"
        }
    ];

    const loginSubmit = async (data) => {
        try {
            // Formatear RUT para API (sin puntos, solo guión)
            const formattedData = {
                ...data,
                run: formatRutForAPI(data.run)
            };
            
            const response = await login(formattedData);
            if (response.status === 'Success') {
                navigate('/home');
            } else if (response.status === 'Client error') {
                errorData(response.details);
                showErrorAlert("Acceso denegado", response.details.message);
            }
        } catch (error) {
            // Error handling is done by the auth service
        }
    };



    const selectBaseUser = (user) => {
        if (formRef.current) {
            // Formatear RUT para visualización (con puntos y guión)
            const formattedRut = formatRutForDisplay(user.run);
            formRef.current.setValue('run', formattedRut);
            formRef.current.setValue('password', user.password);
        }
        clearErrors(); // Limpiar errores al seleccionar un usuario
        setShowBaseUsers(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            {/* Efectos de fondo sutiles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="relative w-full max-w-5xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200/50 flex overflow-hidden">
                {/* Lado izquierdo: formulario */}
                <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white/95 backdrop-blur-sm px-6 py-8">
                    <div className="w-full max-w-sm">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-full mb-3">
                                <MdLocalFireDepartment className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-1">Sistema Bomberos</h1>
                            <p className="text-gray-600 text-base">Accede al sistema de gestión de emergencias</p>
                        </div>
                        
                        <Form
                            ref={formRef}
                            title=""
                            fields={[
                                {
                                    ...rutFormatter.getFieldConfig(),
                                    errorMessageData: errorRut,
                                    autoComplete: "username"
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
                                    errorMessageData: errorPassword,
                                    autoComplete: "current-password"
                                },
                            ]}
                            buttonText="Iniciar sesión"
                            onSubmit={loginSubmit}
                            footerContent={
                                <div className="text-center text-gray-400 text-xs mt-3">
                                    <p className="leading-tight">
                                        ¿No tienes cuenta o se te olvidaron tus credenciales? 
                                        <span className="block sm:inline sm:ml-1">
                                            Contacta al administrador: <a href="mailto:admin@bomberos.cl" className="underline text-red-500 hover:text-red-600">admin@bomberos.cl</a>
                                        </span>
                                    </p>
                                </div>
                            }
                        />
                        
                        {/* Botón para usuarios base - Movido debajo del formulario */}
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => setShowBaseUsers(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-slate-50 text-blue-700 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-slate-100 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
                            >
                                <MdPerson className="w-4 h-4" />
                                <span className="font-medium">Usar usuario base para pruebas</span>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Lado derecho: Diseño moderno con iconos y gradientes */}
                <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-red-500 to-orange-600 relative overflow-hidden">
                    {/* Efectos de fondo sutiles */}
                    <div className="absolute inset-0">
                        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/3 rounded-full blur-2xl"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center text-center text-white p-8">
                        {/* Iconos flotantes */}
                        <div className="relative mb-8">
                            <div className="flex items-center justify-center space-x-4 mb-6">
                                <div className="p-4 bg-white/15 backdrop-blur-sm rounded-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                                    <MdLocalFireDepartment className="w-8 h-8" />
                                </div>
                                <div className="p-4 bg-white/15 backdrop-blur-sm rounded-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                                    <MdEmergency className="w-8 h-8" />
                                </div>
                                <div className="p-4 bg-white/15 backdrop-blur-sm rounded-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500">
                                    <MdGroup className="w-8 h-8" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Contenido principal */}
                        <h2 className="text-4xl font-bold mb-4 text-white">
                            Sistema de Gestión de Bomberos
                        </h2>
                        <p className="text-xl text-white/80 mb-6 max-w-md leading-relaxed">
                            Plataforma integral para la gestión de emergencias, personal y recursos de la compañía de bomberos
                        </p>
                        
                        {/* Características */}
                        <div className="space-y-3 text-left">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span className="text-white/90">Gestión de personal y voluntarios</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span className="text-white/90">Control de emergencias y servicios</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span className="text-white/90">Administración de recursos y equipos</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span className="text-white/90">Reportes y estadísticas operacionales</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de usuarios base */}
            {showBaseUsers && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/20">
                        {/* Header del modal */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-slate-50">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                                    <MdPerson className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Usuarios Base para Pruebas</h2>
                            </div>
                            <button
                                onClick={() => setShowBaseUsers(false)}
                                className="p-2 hover:bg-white/50 rounded-full transition-all duration-200 hover:scale-110"
                            >
                                <MdClose className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <p className="text-gray-600 mb-6">
                                Selecciona uno de los usuarios predefinidos para iniciar sesión rápidamente:
                            </p>
                            
                            <div className="space-y-4">
                                {baseUsers.map((user, index) => (
                                    <div
                                        key={index}
                                        className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] overflow-hidden"
                                        onClick={() => selectBaseUser(user)}
                                    >
                                        {/* Efecto de fondo en hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        <div className="relative z-10 flex items-start justify-between">
                                            <div className="flex-1">
                                                {/* Header de la tarjeta */}
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className={`p-2 rounded-xl ${
                                                        user.role === 'Administrador' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                        user.role === 'Supervisor' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                                        'bg-gradient-to-r from-green-500 to-green-600'
                                                    }`}>
                                                        <MdPerson className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                            user.role === 'Administrador' ? 'bg-red-100 text-red-700' :
                                                            user.role === 'Supervisor' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{user.description}</p>
                                                
                                                {/* Información del usuario */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                        <span className="font-medium text-gray-700">Email:</span>
                                                        <span className="text-gray-600 truncate">{user.email}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                                        <span className="font-medium text-gray-700">RUT:</span>
                                                        <span className="text-gray-600 font-mono">{formatRutForDisplay(user.run)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 md:col-span-2">
                                                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                                        <span className="font-medium text-gray-700">Contraseña:</span>
                                                        <span className="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-md">{user.password}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Botón de selección */}
                                            <div className="ml-6 flex-shrink-0">
                                                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 group-hover:scale-110">
                                                    <span className="flex items-center space-x-2">
                                                        <span>Seleccionar</span>
                                                        <MdArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer del modal */}
                        <div className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full">
                                        <span className="text-white text-sm">💡</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-800">Tip:</span> Estos usuarios se crean automáticamente en el initialSetup
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowBaseUsers(false)}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200 font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Login;