import { MdPerson, MdSecurity, MdAdminPanelSettings, MdBusiness } from 'react-icons/md';

/**
 * Componente de navegación por pestañas para el panel de administración
 * @param {Object} props - Props del componente
 * @param {Array} props.availableTabs - Lista de pestañas disponibles
 * @param {string} props.activeTab - Pestaña activa actual
 * @param {Function} props.onTabChange - Función para cambiar la pestaña activa
 * @param {Function} props.hasPermiso - Función para verificar permisos
 * @returns {JSX.Element} Componente AdminTabNavigation
 */
const AdminTabNavigation = ({ availableTabs, activeTab, onTabChange, hasPermiso }) => {
  const tabConfig = {
    bomberos: {
      icon: MdPerson,
      label: 'Bomberos',
      permiso: 'bombero:leer'
    },
    roles: {
      icon: MdSecurity,
      label: 'Roles',
      permiso: 'rol:leer'
    },
    permisos: {
      icon: MdAdminPanelSettings,
      label: 'Permisos',
      permiso: 'permiso:leer'
    },
    configuraciones: {
      icon: MdBusiness,
      label: 'Configuraciones',
      permiso: 'configuracion:leer'
    }
  };

  if (availableTabs.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {availableTabs.map((tabKey) => {
            const tab = tabConfig[tabKey];
            if (!tab || !hasPermiso(tab.permiso)) return null;

            const Icon = tab.icon;
            const isActive = activeTab === tabKey;

            return (
              <button
                key={tabKey}
                onClick={() => onTabChange(tabKey)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  isActive
                    ? 'border-[#4EB9FA] text-[#2C3E50]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <Icon size={18} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminTabNavigation;