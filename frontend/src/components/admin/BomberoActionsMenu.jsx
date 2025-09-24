import { useState } from 'react';
import { MdEdit, MdDelete, MdVisibility, MdLink, MdLinkOff, MdMoreVert } from 'react-icons/md';
import Tooltip from '@components/Tooltip.jsx';

/**
 * Componente de menú de acciones para bomberos en la tabla
 * @param {Object} props - Props del componente
 * @param {Object} props.bombero - Datos del bombero (row de la tabla)
 * @param {Object} props.currentBombero - Bombero actual autenticado
 * @param {Function} props.hasPermiso - Función para verificar permisos
 * @param {Function} props.onEdit - Función para editar bombero
 * @param {Function} props.onDelete - Función para eliminar bombero
 * @param {Function} props.onStatusChange - Función para cambiar estado del bombero
 * @param {Function} props.onViewDetails - Función para ver detalles del bombero
 * @returns {JSX.Element|null} Componente BomberoActionsMenu
 */
const BomberoActionsMenu = ({ 
  bombero, 
  currentBombero, 
  hasPermiso, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onViewDetails 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const isCurrentUser = currentBombero && (currentBombero.run === bombero.run || currentBombero.id === bombero.id);
  
  // Verificar si el bombero tiene roles protegidos (Administrador o Capitán)
  const hasProtectedRole = bombero.roles && bombero.roles.some(role => 
    role.nombre === 'Administrador' || role.nombre === 'Capitán'
  );
  
  // Permisos específicos según initialRolPermisos.js
  // Cada permiso incluye también 'bombero:admin' para administradores completos
  const canView = hasPermiso('bombero:obtener_especifico') || hasPermiso('bombero:admin');        // Ver detalles del bombero
  const canEdit = hasPermiso('bombero:actualizar') || hasPermiso('bombero:admin');                // Editar información del bombero
  const canDelete = hasPermiso('bombero:eliminar') || hasPermiso('bombero:admin');                // Eliminar bombero
  const canChangeStatus = (hasPermiso('bombero:cambiar_estado') || hasPermiso('bombero:admin')) && !hasProtectedRole;    // Activar/desactivar bombero (excepto roles protegidos)
  
  // Si no tiene permisos para ninguna acción, no mostrar nada
  if (!canEdit && !canDelete && !canChangeStatus && !canView) {
    return null;
  }

  const handleStatusChange = async (userId, newStatus) => {
    await onStatusChange(userId, newStatus);
  };

  const handleDeleteSingle = () => {
    onDelete([bombero]);
  };

  // Definir las acciones disponibles
  const actions = [];
  
  if (canView) {
    actions.push({
      key: 'view',
      icon: <MdVisibility size={18} />,
      label: 'Ver detalles',
      onClick: () => onViewDetails(bombero),
      className: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
      tooltip: "Ver detalles completos del bombero",
      disabled: false,
      priority: 1
    });
  }

  if (canEdit) {
    actions.push({
      key: 'edit',
      icon: <MdEdit size={18} />,
      label: 'Editar',
      onClick: () => !isCurrentUser && onEdit(bombero),
      className: isCurrentUser 
        ? "text-gray-400 cursor-not-allowed bg-gray-50" 
        : "text-blue-600 hover:text-blue-900 hover:bg-blue-50",
      tooltip: isCurrentUser 
        ? "No puedes editarte a ti mismo" 
        : "Editar información del bombero",
      disabled: isCurrentUser,
      priority: 2
    });
  }

  if (hasPermiso('bombero:cambiar_estado') || hasPermiso('bombero:admin')) {
    const isDisabled = isCurrentUser || hasProtectedRole;
    const getTooltipMessage = () => {
      if (isCurrentUser) return "No puedes cambiar tu propio estado";
      if (hasProtectedRole) return "No se puede cambiar el estado de bomberos con roles Administrador o Capitán";
      return bombero.activo 
        ? "Desactivar bombero - El bombero no podrá acceder al sistema" 
        : "Activar bombero - El bombero podrá acceder al sistema";
    };

    actions.push({
      key: 'status',
      icon: bombero.activo ? <MdLinkOff size={18} /> : <MdLink size={18} />,
      label: bombero.activo ? 'Desactivar' : 'Activar',
      onClick: () => !isDisabled && handleStatusChange(bombero.id, !bombero.activo),
      className: isDisabled
        ? "text-gray-400 cursor-not-allowed bg-gray-50" 
        : bombero.activo 
          ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50" 
          : "text-green-600 hover:text-green-900 hover:bg-green-50",
      tooltip: getTooltipMessage(),
      disabled: isDisabled,
      priority: 3
    });
  }

  if (canDelete) {
    actions.push({
      key: 'delete',
      icon: <MdDelete size={18} />,
      label: 'Eliminar',
      onClick: () => !isCurrentUser && handleDeleteSingle(),
      className: isCurrentUser 
        ? "text-gray-400 cursor-not-allowed bg-gray-50" 
        : "text-red-600 hover:text-red-900 hover:bg-red-50",
      tooltip: isCurrentUser 
        ? "No puedes eliminarte a ti mismo" 
        : "Eliminar bombero permanentemente - Esta acción no se puede deshacer",
      disabled: isCurrentUser,
      priority: 4
    });
  }

  // Ordenar por prioridad y separar acciones principales de secundarias
  const sortedActions = actions.sort((a, b) => a.priority - b.priority);
  const primaryActions = sortedActions.slice(0, 2);
  const secondaryActions = sortedActions.slice(2);
  
  return (
    <div className="flex items-center gap-1">
      {/* Acciones principales (máximo 2) */}
      {primaryActions.map((action) => (
        <Tooltip
          key={action.key}
          id={`${action.key}-${bombero.id}`}
          content={action.tooltip}
          place="top"
          variant={action.disabled ? "light" : "dark"}
        >
          <button 
            className={`transition-all duration-200 p-2 rounded-lg hover:scale-105 ${action.className}`}
            onClick={action.onClick}
            disabled={action.disabled}
            type="button"
          >
            {action.icon}
          </button>
        </Tooltip>
      ))}

      {/* Menú desplegable para acciones secundarias */}
      {secondaryActions.length > 0 && (
        <div className="relative">
          <Tooltip
            id={`more-${bombero.id}`}
            content="Más opciones"
            place="top"
            variant="dark"
          >
            <button 
              className="transition-all duration-200 p-2 rounded-lg hover:scale-105 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setShowDropdown(!showDropdown)}
              type="button"
            >
              <MdMoreVert size={18} />
            </button>
          </Tooltip>

          {/* Dropdown menu */}
          {showDropdown && (
            <>
              {/* Overlay para cerrar al hacer click fuera */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              
              {/* Menu desplegable */}
               <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                 <div className="py-1">
                   {secondaryActions.map((action) => (
                     <Tooltip
                       key={action.key}
                       id={`dropdown-${action.key}-${bombero.id}`}
                       content={action.tooltip}
                       place="left"
                       variant={action.disabled ? "light" : "dark"}
                     >
                       <button
                         onClick={() => {
                           action.onClick();
                           setShowDropdown(false);
                         }}
                         disabled={action.disabled}
                         className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                           action.disabled
                             ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                             : action.key === 'status'
                               ? bombero.activo
                                 ? 'text-orange-600 hover:bg-orange-50'
                                 : 'text-green-600 hover:bg-green-50'
                               : action.key === 'delete'
                                 ? 'text-red-600 hover:bg-red-50'
                                 : action.key === 'edit'
                                   ? 'text-blue-600 hover:bg-blue-50'
                                   : 'text-gray-700 hover:bg-gray-50'
                         }`}
                         type="button"
                       >
                         <span className={`${
                           action.disabled
                             ? 'text-gray-400'
                             : action.key === 'status'
                               ? bombero.activo
                                 ? 'text-orange-600'
                                 : 'text-green-600'
                               : action.key === 'delete'
                                 ? 'text-red-600'
                                 : action.key === 'edit'
                                   ? 'text-blue-600'
                                   : 'text-gray-700'
                         }`}>
                           {action.icon}
                         </span>
                         <span>{action.label}</span>
                       </button>
                     </Tooltip>
                   ))}
                 </div>
               </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BomberoActionsMenu;