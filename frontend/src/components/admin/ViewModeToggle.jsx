import { MdViewList, MdViewModule } from 'react-icons/md';

/**
 * Componente para alternar entre vista de lista y vista de cards
 * @param {Object} props - Props del componente
 * @param {string} props.viewMode - Modo de vista actual ('list' o 'cards')
 * @param {Function} props.onViewModeChange - Función para cambiar el modo de vista
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente ViewModeToggle
 */
const ViewModeToggle = ({ viewMode, onViewModeChange, className = '' }) => {
  return (
    <div className={`flex items-center border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => onViewModeChange('list')}
        className={`px-3 py-2 transition-colors ${
          viewMode === 'list' 
            ? 'bg-[#4EB9FA] text-white' 
            : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-gray-50'
        }`}
        title="Vista de lista"
        type="button"
      >
        <MdViewList size={20} />
      </button>
      <button
        onClick={() => onViewModeChange('cards')}
        className={`px-3 py-2 transition-colors ${
          viewMode === 'cards' 
            ? 'bg-[#4EB9FA] text-white' 
            : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-gray-50'
        }`}
        title="Vista de cards"
        type="button"
      >
        <MdViewModule size={20} />
      </button>
    </div>
  );
};

export default ViewModeToggle;