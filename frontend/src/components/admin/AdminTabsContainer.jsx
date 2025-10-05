import React from 'react';
import { useAdmin } from '@context/AdminContext';
import { 
  MdPeople, 
  MdSecurity, 
  MdVpnKey, 
  MdBusiness, 
  MdLocationOn,
  MdPerson
} from 'react-icons/md';

// Importar componentes de pestañas
import AdminBomberosTab from './tabs/AdminBomberosTab';
import AdminRolesTab from './tabs/AdminRolesTab';
import AdminPermisosTab from './tabs/AdminPermisosTab';
import AdminCompaniasTab from './tabs/AdminCompaniasTab';
import AdminDireccionesTab from './tabs/AdminDireccionesTab';
import AdminEstadoCivilTab from './tabs/AdminEstadoCivilTab';

// Mapeo de iconos
const iconMap = {
  MdPeople,
  MdSecurity,
  MdVpnKey,
  MdBusiness,
  MdLocationOn,
  MdPerson
};

/**
 * Contenedor principal que maneja la navegación entre pestañas
 * y renderiza el componente correspondiente
 */
const AdminTabsContainer = () => {
  const { activeTab, availableTabs, handleTabChange } = useAdmin();

  // Renderizar el componente de pestaña activa
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'bomberos':
        return <AdminBomberosTab />;
      case 'roles':
        return <AdminRolesTab />;
      case 'permisos':
        return <AdminPermisosTab />;
      case 'companias':
        return <AdminCompaniasTab />;
      case 'direcciones':
        return <AdminDireccionesTab />;
      case 'estadoCivil':
        return <AdminEstadoCivilTab />;
      default:
        return (
          <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-8 rounded-2xl text-center">
            <p className="text-gray-500">Pestaña no encontrada o sin permisos</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Navegación de pestañas */}
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          {availableTabs.map((tab) => {
            const IconComponent = iconMap[tab.icon];
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#4EB9FA] text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-[#4EB9FA]/10'
                }`}
                title={tab.description}
              >
                {IconComponent && <IconComponent size={18} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      {renderActiveTab()}
    </div>
  );
};

export default AdminTabsContainer;