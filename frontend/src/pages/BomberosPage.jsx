import React, { useState, useEffect } from 'react';
import { 
  MdError,
  MdPeople,
  MdHelpOutline
} from 'react-icons/md';
import BomberosGrid from '@components/bomberos/BomberosGrid';
import BomberosLoader from '@components/BomberosLoader';
import BomberoFichaPopup from '@components/bomberos/BomberoFichaPopup';
import { useBomberoCompania } from '@hooks/bomberos/useBomberoCompania';
import { showErrorAlert, showInfoAlert } from '@helpers/fireAlert';
import Tooltip from '@components/Tooltip.jsx';

/**
 * Página principal para mostrar todos los bomberos de la compañía
 * @returns {JSX.Element} Página de bomberos
 */
const BomberosPage = () => {
  const [error, setError] = useState(null);
  const [selectedBombero, setSelectedBombero] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('mi-compania');

  // Hook para manejar la lógica de bomberos por compañía
  const {
    compania,
    bomberos,
    estadisticas,
    bomberosOtrasCompanias,
    loading,
    loadingOtrasCompanias,
    refreshing,
    refreshData,
    getRolesUnicos,
    loadBomberosOtrasCompanias,
    loadAllBomberos,
    totalBomberos,
    bomberosActivos,
    bomberosConFicha,
    bomberosConLicencia,
    totalBomberosOtrasCompanias,
    totalAllBomberos,
    allBomberos
  } = useBomberoCompania();

  // Manejar errores
  useEffect(() => {
    if (error) {
      showErrorAlert('Error', error);
      setError(null);
    }
  }, [error]);


  // Función para ver detalles de un bombero
  const handleViewDetails = (bombero) => {
    setSelectedBombero(bombero);
    setIsPopupOpen(true);
  };

  // Función para cerrar el popup
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedBombero(null);
  };

  // Función para cambiar de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'todas-las-companias' && allBomberos.length === 0) {
      loadAllBomberos();
    } else if (tab === 'otras-companias' && bomberosOtrasCompanias.length === 0) {
      loadBomberosOtrasCompanias();
    }
  };




  // Mostrar loading inicial
  if (loading) {
    return (
      <div className="min-h-[80vh]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-6 flex items-center justify-center min-h-[400px]">
            <BomberosLoader size="lg" message="Cargando bomberos de la compañía..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh]">
      {/* Header principal con tabs integradas */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MdPeople className="h-8 w-8 text-[#4EB9FA]" />
              <div>
                <h1 className="text-2xl font-bold text-[#2C3E50]">
                  Gestión de Bomberos
                </h1>
              </div>
              <Tooltip
                id="bomberos-help"
                content="Sistema de gestión de bomberos. Aquí puedes ver todos los bomberos registrados, sus fichas personales, roles y información adicional. Las tarjetas están diseñadas como carnés de identidad oficiales."
                place="right"
                variant="dark"
              >
                <MdHelpOutline className="h-4 w-4 text-gray-400 hover:text-[#4EB9FA] transition-colors cursor-help" />
              </Tooltip>
            </div>
          </div>
          
          {/* Pestañas */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('mi-compania')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'mi-compania'
                    ? 'border-[#4EB9FA] text-[#4EB9FA]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mi Compañía
                {activeTab === 'mi-compania' && compania && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({totalBomberos} total • {bomberosActivos} habilitados)
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('todas-las-companias')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'todas-las-companias'
                    ? 'border-[#4EB9FA] text-[#4EB9FA]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Todas las Compañías
                {activeTab === 'todas-las-companias' && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({totalAllBomberos} total)
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 mt-2">
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4">
        {activeTab === 'mi-compania' ? (
          <BomberosGrid
            bomberos={bomberos}
            compania={compania}
            estadisticas={estadisticas}
            loading={loading}
            refreshing={refreshing}
            onViewDetails={handleViewDetails}
            rolesUnicos={getRolesUnicos()}
          />
        ) : activeTab === 'todas-las-companias' ? (
          <BomberosGrid
            bomberos={allBomberos}
            compania={null}
            estadisticas={null}
            loading={loadingOtrasCompanias}
            refreshing={false}
            onViewDetails={handleViewDetails}
            rolesUnicos={[]}
            showCompanyInfo={true}
          />
        ) : (
          <BomberosGrid
            bomberos={bomberosOtrasCompanias}
            compania={null}
            estadisticas={null}
            loading={loadingOtrasCompanias}
            refreshing={false}
            onViewDetails={handleViewDetails}
            rolesUnicos={[]}
            showCompanyInfo={true}
          />
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <MdError className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}
        </div>
      </div>

      {/* Popup de ficha de bombero */}
      <BomberoFichaPopup
        bombero={selectedBombero}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
      />

    </div>
  );
};

export default BomberosPage;
