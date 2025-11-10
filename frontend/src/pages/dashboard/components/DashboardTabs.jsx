import React from 'react';
import PropTypes from 'prop-types';
import { MdLocalFireDepartment, MdEvent, MdPeople } from 'react-icons/md';

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
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-3 px-6 py-4
                transition-all duration-200 relative
                ${isActive 
                  ? 'text-[#4EB9FA] bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              <Icon size={24} className={isActive ? 'text-[#4EB9FA]' : 'text-gray-500'} />
              <div className="text-left">
                <div className={`font-semibold text-base ${isActive ? 'text-[#4EB9FA]' : 'text-gray-700'}`}>
                  {tab.label}
                </div>
                <div className="text-xs text-gray-500">
                  {tab.description}
                </div>
              </div>
              
              {/* Indicador activo */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4EB9FA] rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

DashboardTabs.propTypes = {
  activeTab: PropTypes.oneOf(['incidentes', 'eventos', 'asistencia']).isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default DashboardTabs;
