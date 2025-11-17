import React from 'react';

/**
 * Componente de carga personalizado con múltiples variantes
 * @param {Object} props - Props del componente
 * @param {string} props.variant - Variante del spinner ('spinner', 'dots', 'pulse', 'bars', 'ring')
 * @param {string} props.size - Tamaño del spinner ('sm', 'md', 'lg', 'xl')
 * @param {string} props.color - Color del spinner ('blue', 'red', 'green', 'yellow', 'purple', 'indigo', 'gray')
 * @param {string} props.text - Texto opcional a mostrar debajo del spinner
 * @param {boolean} props.overlay - Si debe mostrar un overlay de fondo
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente LoadingSpinner
 */
const LoadingSpinner = ({ 
  variant = 'spinner', 
  size = 'md', 
  color = 'blue', 
  text = null,
  overlay = false,
  className = ''
}) => {
  // Configuración de tamaños
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Configuración de colores
  const colorClasses = {
    blue: {
      primary: 'text-[#4EB9FA]',
      secondary: 'text-[#4EB9FA]/20',
      border: 'border-[#4EB9FA]',
      bg: 'bg-[#4EB9FA]'
    },
    red: {
      primary: 'text-red-500',
      secondary: 'text-red-500/20',
      border: 'border-red-500',
      bg: 'bg-red-500'
    },
    green: {
      primary: 'text-green-500',
      secondary: 'text-green-500/20',
      border: 'border-green-500',
      bg: 'bg-green-500'
    },
    yellow: {
      primary: 'text-yellow-500',
      secondary: 'text-yellow-500/20',
      border: 'border-yellow-500',
      bg: 'bg-yellow-500'
    },
    purple: {
      primary: 'text-purple-500',
      secondary: 'text-purple-500/20',
      border: 'border-purple-500',
      bg: 'bg-purple-500'
    },
    indigo: {
      primary: 'text-indigo-500',
      secondary: 'text-indigo-500/20',
      border: 'border-indigo-500',
      bg: 'bg-indigo-500'
    },
    gray: {
      primary: 'text-gray-500',
      secondary: 'text-gray-500/20',
      border: 'border-gray-500',
      bg: 'bg-gray-500'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Spinner clásico giratorio
  const SpinnerVariant = () => (
    <div className={`${sizeClass} animate-spin`}>
      <svg className="w-full h-full" viewBox="0 0 24 24">
        <circle
          className={`${colors.secondary}`}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <circle
          className={`${colors.primary}`}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeDasharray="31.416"
          strokeDashoffset="20.944"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  // Puntos saltarines
  const DotsVariant = () => (
    <div className="flex space-x-1">
      <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : size === 'xl' ? 'w-5 h-5' : 'w-3 h-3'} ${colors.bg} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : size === 'xl' ? 'w-5 h-5' : 'w-3 h-3'} ${colors.bg} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : size === 'xl' ? 'w-5 h-5' : 'w-3 h-3'} ${colors.bg} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  // Pulso concéntrico
  const PulseVariant = () => (
    <div className="relative">
      <div className={`${sizeClass} ${colors.bg} rounded-full animate-ping opacity-75`}></div>
      <div className={`absolute top-0 left-0 ${sizeClass} ${colors.bg} rounded-full animate-pulse`}></div>
    </div>
  );

  // Barras de carga
  const BarsVariant = () => (
    <div className="flex items-end space-x-1">
      <div className={`${size === 'sm' ? 'w-1 h-4' : size === 'lg' ? 'w-2 h-8' : size === 'xl' ? 'w-3 h-12' : 'w-1.5 h-6'} ${colors.bg} animate-pulse`} style={{ animationDelay: '0ms' }}></div>
      <div className={`${size === 'sm' ? 'w-1 h-6' : size === 'lg' ? 'w-2 h-12' : size === 'xl' ? 'w-3 h-16' : 'w-1.5 h-8'} ${colors.bg} animate-pulse`} style={{ animationDelay: '150ms' }}></div>
      <div className={`${size === 'sm' ? 'w-1 h-4' : size === 'lg' ? 'w-2 h-8' : size === 'xl' ? 'w-3 h-12' : 'w-1.5 h-6'} ${colors.bg} animate-pulse`} style={{ animationDelay: '300ms' }}></div>
      <div className={`${size === 'sm' ? 'w-1 h-2' : size === 'lg' ? 'w-2 h-4' : size === 'xl' ? 'w-3 h-6' : 'w-1.5 h-3'} ${colors.bg} animate-pulse`} style={{ animationDelay: '450ms' }}></div>
    </div>
  );

  // Anillo giratorio
  const RingVariant = () => (
    <div className={`${sizeClass} relative`}>
      <div className={`absolute inset-0 rounded-full border-2 ${colors.secondary}`}></div>
      <div className={`absolute inset-0 rounded-full border-2 border-transparent ${colors.border} border-t-transparent animate-spin`}></div>
    </div>
  );

  // Ondas de agua
  const WaveVariant = () => (
    <div className="flex items-center space-x-1">
      <div className={`${size === 'sm' ? 'w-1 h-6' : size === 'lg' ? 'w-2 h-12' : size === 'xl' ? 'w-3 h-16' : 'w-1.5 h-8'} ${colors.bg} animate-pulse rounded-full`} style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
      <div className={`${size === 'sm' ? 'w-1 h-8' : size === 'lg' ? 'w-2 h-16' : size === 'xl' ? 'w-3 h-20' : 'w-1.5 h-12'} ${colors.bg} animate-pulse rounded-full`} style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
      <div className={`${size === 'sm' ? 'w-1 h-6' : size === 'lg' ? 'w-2 h-12' : size === 'xl' ? 'w-3 h-16' : 'w-1.5 h-8'} ${colors.bg} animate-pulse rounded-full`} style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
    </div>
  );

  // Seleccionar variante
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant />;
      case 'pulse':
        return <PulseVariant />;
      case 'bars':
        return <BarsVariant />;
      case 'ring':
        return <RingVariant />;
      case 'wave':
        return <WaveVariant />;
      default:
        return <SpinnerVariant />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className={`text-sm font-medium ${colors.primary} text-center`}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
