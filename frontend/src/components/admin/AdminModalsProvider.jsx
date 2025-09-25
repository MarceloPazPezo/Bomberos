import React, { createContext, useContext, useState, useCallback } from 'react';

const AdminModalsContext = createContext();

/**
 * Contexto para gestionar modales de forma centralizada
 * Permite abrir/cerrar modales y pasar datos entre componentes
 */
export const AdminModalsProvider = ({ children }) => {
  const [modals, setModals] = useState({});
  const [modalData, setModalData] = useState({});

  // Función para abrir un modal con datos opcionales
  const openModal = useCallback((modalId, data = null) => {
    setModals(prev => ({ ...prev, [modalId]: true }));
    if (data) {
      setModalData(prev => ({ ...prev, [modalId]: data }));
    }
  }, []);

  // Función para cerrar un modal
  const closeModal = useCallback((modalId) => {
    setModals(prev => ({ ...prev, [modalId]: false }));
    // Opcionalmente limpiar los datos del modal
    setModalData(prev => {
      const newData = { ...prev };
      delete newData[modalId];
      return newData;
    });
  }, []);

  // Función para cerrar todos los modales
  const closeAllModals = useCallback(() => {
    setModals({});
    setModalData({});
  }, []);

  // Función para verificar si un modal está abierto
  const isModalOpen = useCallback((modalId) => {
    return Boolean(modals[modalId]);
  }, [modals]);

  // Función para obtener datos de un modal
  const getModalData = useCallback((modalId) => {
    return modalData[modalId] || null;
  }, [modalData]);

  const value = {
    // Estado
    modals,
    modalData,
    
    // Funciones
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalData
  };

  return (
    <AdminModalsContext.Provider value={value}>
      {children}
    </AdminModalsContext.Provider>
  );
};

/**
 * Hook para usar el contexto de modales
 */
export const useAdminModals = () => {
  const context = useContext(AdminModalsContext);
  
  if (!context) {
    throw new Error('useAdminModals debe ser usado dentro de un AdminModalsProvider');
  }
  
  return context;
};

export default AdminModalsProvider;