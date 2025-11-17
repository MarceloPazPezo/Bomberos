import React from 'react';

/**
 * Componente de carga específico para la aplicación de bomberos
 * @param {Object} props - Props del componente
 * @param {boolean} props.fullScreen - Si debe ocupar toda la pantalla
 * @param {string} props.message - Mensaje personalizado de carga
 * @param {string} props.size - Tamaño ('sm', 'md', 'lg')
 * @returns {JSX.Element} Componente BomberosLoader
 */
const BomberosLoader = ({ 
  fullScreen = false, 
  message = "Cargando...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const Spinner = () => (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Anillo exterior */}
      <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
      
      {/* Anillo giratorio con gradiente de bomberos */}
      <div className="absolute inset-0 border-4 border-transparent rounded-full animate-spin">
        <div className="absolute inset-0 border-4 border-transparent border-t-[#4EB9FA] border-r-[#2C3E50] rounded-full"></div>
      </div>
      
      {/* Centro con ícono de bomberos */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-gradient-to-br from-[#4EB9FA] to-[#2C3E50] rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Spinner />
      
      {/* Mensaje de carga */}
      <div className="text-center">
        <p className="text-[#2C3E50] font-medium text-sm">
          {message}
        </p>
        <div className="flex justify-center mt-2 space-x-1">
          <div className="w-1 h-1 bg-[#4EB9FA] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-[#4EB9FA] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-[#4EB9FA] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white/95 via-blue-50/90 to-gray-100/95 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-[#4EB9FA]/20">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

export default BomberosLoader;
