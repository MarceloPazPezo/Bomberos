import React from 'react';
import { useDisponibilidad } from '@context/DisponibilidadContext';
import { 
  MdAdd, 
  MdHistory
} from 'react-icons/md';

// Mapeo de iconos
const iconMap = {
  MdAdd,
  MdHistory
};

/**
 * Componente de navegación de tabs para integrar en el header
 */
const DisponibilidadTabNavigation = () => {
  const { activeTab, availableTabs, handleTabChange } = useDisponibilidad();

  return (
    <div className="relative bg-gradient-to-r from-gray-100 to-gray-200 rounded-full p-0.5 shadow-inner border border-gray-300">
      {/* Carril de fondo con efecto 3D */}
      <div className="absolute inset-0.5 bg-gray-50 rounded-full shadow-inner"></div>

      {/* Slider animado */}
      <div
        className={`absolute top-0.5 bottom-0.5 bg-gradient-to-b from-white to-gray-50 rounded-full shadow-lg border border-gray-200 transition-all duration-500 ease-in-out transform ${
          activeTab === 'marcar'
            ? 'left-0.5 translate-x-0'
            : 'left-1/2 translate-x-0'
        }`}
        style={{
          width: 'calc(50% - 1px)'
        }}
      />

      {/* Contenedor de botones */}
      <div className="relative z-10 flex">
        {availableTabs.map((tab) => {
          const IconComponent = iconMap[tab.icon];
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out rounded-full ${
                isActive
                  ? 'text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title={tab.description}
            >
              {IconComponent && (
                <IconComponent 
                  className={`h-3.5 w-3.5 transition-all duration-300 ${
                    isActive ? 'scale-110 text-blue-600' : 'scale-100'
                  }`} 
                />
              )}
              <span className="hidden sm:inline font-semibold">{tab.label}</span>
              <span className="sm:hidden font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DisponibilidadTabNavigation;