import React from 'react';
import { useDisponibilidad } from '@context/DisponibilidadContext';

// Importar componentes de pestañas
import DisponibilidadMarcarTab from './tabs/DisponibilidadMarcarTab';
import DisponibilidadHistorialTab from './tabs/DisponibilidadHistorialTab';

/**
 * Componente que solo renderiza el contenido de la pestaña activa
 */
const DisponibilidadTabContent = () => {
  const { activeTab } = useDisponibilidad();

  // Renderizar el componente de pestaña activa
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'marcar':
        return <DisponibilidadMarcarTab />;
      case 'historial':
        return <DisponibilidadHistorialTab />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Pestaña no encontrada o sin permisos</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4">
      <div className="transition-all duration-300 ease-in-out">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default DisponibilidadTabContent;