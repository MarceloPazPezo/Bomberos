import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Componente de página de carga con layout completo
 * @param {Object} props - Props del componente
 * @param {string} props.title - Título de la página de carga
 * @param {string} props.subtitle - Subtítulo opcional
 * @param {string} props.variant - Variante del spinner
 * @param {boolean} props.showBackground - Si mostrar fondo decorativo
 * @returns {JSX.Element} Componente LoadingPage
 */
const LoadingPage = ({ 
  title = "Cargando datos...", 
  subtitle = null,
  variant = 'spinner',
  showBackground = true 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo decorativo */}
      {showBackground && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50">
          {/* Círculos decorativos */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#4EB9FA]/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#2C3E50]/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-blue-300/20 rounded-full blur-lg animate-pulse delay-500"></div>
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="relative z-10 text-center p-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-[#4EB9FA]/20 max-w-md mx-auto">
          {/* Spinner */}
          <div className="mb-8">
            <LoadingSpinner 
              variant={variant}
              size="xl"
              color="blue"
            />
          </div>
          
          {/* Título */}
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-3">
            {title}
          </h2>
          
          {/* Subtítulo */}
          {subtitle && (
            <p className="text-gray-600 text-sm">
              {subtitle}
            </p>
          )}
          
          {/* Barra de progreso animada */}
          <div className="mt-6 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#4EB9FA] to-[#2C3E50] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
