import { Link } from 'react-router-dom';
import { MdHome, MdArrowBack, MdLocalFireDepartment, MdError } from 'react-icons/md';

const Error404 = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
            {/* Hero Section similar a Home.jsx */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-600">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <MdError className="h-16 w-16 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Error 404
                        </h1>
                        <p className="text-xl text-red-100 mb-6">
                            Página no encontrada
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-4xl mx-auto p-4 sm:p-8">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
                    
                    {/* Número 404 grande y llamativo */}
                    <div className="text-8xl sm:text-9xl font-black text-red-600 leading-none mb-6">
                        404
                    </div>
                    
                    {/* Título principal */}
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                        Página no encontrada
                    </h2>
                    
                    {/* Descripción */}
                    <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
                        Lo sentimos, la página que estás buscando no existe o ha sido movida. 
                        Verifica la URL o regresa al inicio para continuar navegando.
                    </p>
                    
                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <Link 
                            to="/home"
                            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            <MdHome className="h-5 w-5" />
                            Ir al Inicio
                        </Link>
                        <button 
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            <MdArrowBack className="h-5 w-5" />
                            Volver Atrás
                        </button>
                    </div>
                </div>

                {/* Sección de ayuda adicional */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 text-center hover:shadow-xl transition-shadow">
                        <MdLocalFireDepartment className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-900 mb-2">Sistema de Bomberos</h3>
                        <p className="text-sm text-slate-600">Regresa al sistema principal para acceder a todas las funcionalidades</p>
                        <Link 
                            to="/home" 
                            className="inline-block mt-4 text-red-600 hover:text-red-700 font-medium transition-colors"
                        >
                            Ir al Dashboard →
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 text-center hover:shadow-xl transition-shadow">
                        <MdError className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-900 mb-2">¿Necesitas Ayuda?</h3>
                        <p className="text-sm text-slate-600">Si crees que esto es un error, contacta al administrador del sistema</p>
                        <button 
                            onClick={() => window.history.back()} 
                            className="inline-block mt-4 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                        >
                            Reportar Problema →
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center mt-16 pb-8 text-slate-500">
                    <p>© {new Date().getFullYear()} Sistema de Gestión para Cuerpos de Bomberos.</p>
                </footer>
            </div>
        </div>
    );
};

export default Error404;