import { useState, useEffect, useRef, useMemo } from 'react';
import { MdPerson, MdSecurity, MdAdminPanelSettings, MdBusiness, MdLocationOn, MdHome, MdLocalHospital } from 'react-icons/md';

/**
 * Componente de navegación por pestañas para el panel de administración con slider animado
 * @param {Object} props - Props del componente
 * @param {Array} props.availableTabs - Lista de pestañas disponibles
 * @param {string} props.activeTab - Pestaña activa actual
 * @param {Function} props.onTabChange - Función para cambiar la pestaña activa
 * @param {Function} props.hasPermiso - Función para verificar permisos
 * @returns {JSX.Element} Componente AdminTabNavigation
 */
const AdminTabNavigation = ({ availableTabs, activeTab, onTabChange, hasPermiso }) => {
  const [sliderStyle, setSliderStyle] = useState({});
  const containerRef = useRef(null);
  const tabRefs = useRef({});

  const tabConfig = {
    bomberos: {
      icon: MdPerson,
      label: 'Bomberos',
      permiso: 'bombero:obtener'
    },
    roles: {
      icon: MdSecurity,
      label: 'Roles',
      permiso: 'rol:obtener'
    },
    permisos: {
      icon: MdAdminPanelSettings,
      label: 'Permisos',
      permiso: 'permiso:obtener'
    },
    companias: {
      icon: MdBusiness,
      label: 'Compañías',
      permiso: 'compania:obtener'
    },
    direcciones: {
      icon: MdLocationOn,
      label: 'Direcciones',
      permiso: 'region:obtener'
    },
    estadoCivil: {
      icon: MdPerson,
      label: 'Estados Civiles',
      permiso: 'estadoCivil:obtener'
    },
    servicios: {
      icon: MdLocalHospital,
      label: 'Servicios',
      permiso: 'servicio:obtener'
    }
  };

  // Memoizar las pestañas visibles para evitar recálculos innecesarios
  const visibleTabs = useMemo(() => {
    const filtered = availableTabs.filter(tabKey => {
      const tab = tabConfig[tabKey];
      const hasPermission = tab && hasPermiso(tab.permiso);
      console.log(`[DEBUG] TabNavigation - ${tabKey}:`, {
        tab: tab,
        hasPermission,
        permiso: tab?.permiso
      });
      return hasPermission;
    });
    console.log('[DEBUG] TabNavigation - visibleTabs:', filtered);
    return filtered;
  }, [availableTabs, hasPermiso]);

  // Función para actualizar la posición del slider
  const updateSliderPosition = () => {
    if (tabRefs.current[activeTab] && containerRef.current) {
      const activeTabElement = tabRefs.current[activeTab];
      const containerElement = containerRef.current;
      
      const containerRect = containerElement.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      const left = tabRect.left - containerRect.left - 4; // -4 por el padding del contenedor
      const width = tabRect.width;
      
      setSliderStyle({
        transform: `translateX(${left}px)`,
        width: `${width}px`,
      });
    }
  };

  // Actualizar posición del slider cuando cambia la pestaña activa
  useEffect(() => {
    updateSliderPosition();
  }, [activeTab]);

  // Actualizar posición del slider cuando cambian las pestañas visibles
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSliderPosition();
    }, 0);
    
    return () => clearTimeout(timer);
  }, [visibleTabs.length]);

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <div className="flex">
      <div 
        ref={containerRef}
        className="relative flex bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-1 shadow-inner border border-gray-200/50"
      >
        {/* Slider animado */}
        <div
          className="absolute top-1 bottom-1 bg-white rounded-lg shadow-lg border border-[#4EB9FA]/20 transition-all duration-300 ease-out"
          style={sliderStyle}
        >
          {/* Efecto de brillo en el slider */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4EB9FA]/5 via-[#4EB9FA]/10 to-[#4EB9FA]/5 rounded-lg"></div>
        </div>

        {/* Pestañas */}
        {visibleTabs.map((tabKey) => {
          const tab = tabConfig[tabKey];
          const Icon = tab.icon;
          const isActive = activeTab === tabKey;

          return (
            <button
              key={tabKey}
              ref={(el) => tabRefs.current[tabKey] = el}
              onClick={() => onTabChange(tabKey)}
              className={`
                relative px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ease-out transform
                ${isActive
                  ? 'text-[#2C3E50] scale-105 z-10'
                  : 'text-gray-600 hover:text-[#2C3E50] hover:scale-102 z-0'
                }
              `}
              type="button"
            >
              <span className="flex items-center gap-2 relative z-10">
                <Icon 
                  size={18} 
                  className={`transition-all duration-300 ${
                    isActive 
                      ? 'text-[#4EB9FA] drop-shadow-sm' 
                      : 'text-gray-500 group-hover:text-[#4EB9FA]'
                  }`} 
                />
                <span className={`transition-all duration-300 ${
                  isActive ? 'font-semibold' : 'font-medium'
                }`}>
                  {tab.label}
                </span>
              </span>
              
              {/* Indicador de actividad sutil */}
              {isActive && (
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#4EB9FA] rounded-full opacity-60"></div>
              )}
            </button>
          );
        })}
        
        {/* Efecto de brillo en los bordes */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default AdminTabNavigation;