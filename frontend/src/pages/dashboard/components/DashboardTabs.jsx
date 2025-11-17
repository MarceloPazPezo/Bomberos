import React from 'react';
import PropTypes from 'prop-types';
import { MdLocalFireDepartment, MdEvent, MdPeople, MdHistory } from 'react-icons/md';

const DashboardTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'incidentes',
      label: 'Incidentes',
      icon: MdLocalFireDepartment,
      description: 'Análisis de emergencias y partes'
    },
    {
      id: 'eventos',
      label: 'Eventos',
      icon: MdEvent,
      description: 'Actividades y eventos programados'
    },
    {
      id: 'asistencia',
      label: 'Asistencia',
      icon: MdPeople,
      description: 'Control de asistencia y disponibilidad'
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: MdHistory,
      description: 'Registro histórico de la compañía'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                  flex-1 flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4
                transition-all duration-200 relative
                  border-b sm:border-b-0 last:border-b-0
                ${isActive 
                  ? 'text-[#4EB9FA] bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
                <Icon size={20} className={`${isActive ? 'text-[#4EB9FA]' : 'text-gray-500'} sm:w-6 sm:h-6`} />
                <div className="text-left flex-1">
                  <div className={`font-semibold text-sm sm:text-base ${isActive ? 'text-[#4EB9FA]' : 'text-gray-700'}`}>
                  {tab.label}
                </div>
                  <div className="hidden sm:block text-xs text-gray-500">
                  {tab.description}
                </div>
              </div>
              
              {/* Indicador activo */}
              {isActive && (
             <div className="absolute bottom-0 sm:bottom-0 left-0 right-0 h-1 bg-[#4EB9FA] sm:rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

DashboardTabs.propTypes = {
  activeTab: PropTypes.oneOf(['incidentes', 'eventos', 'asistencia', 'historial']).isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default DashboardTabs;
