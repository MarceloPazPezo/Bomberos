import { useState } from 'react';

/**
 * Hook para manejar los modales del panel de administración
 * @returns {Object} - Estado y funciones para manejar modales
 */
export const useAdminModals = () => {
  const [modals, setModals] = useState({
    createBombero: false,
    editBombero: false,
    createRol: false,
    bomberoDetail: false
  });

  const [modalData, setModalData] = useState({
    bombero: null,
    bomberoDetail: null
  });

  const openModal = (modalName, data = null) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    if (data) {
      const dataKey = modalName === 'bomberoDetail' ? 'bomberoDetail' : 'bombero';
      setModalData(prev => ({ ...prev, [dataKey]: data }));
    }
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    const dataKey = modalName === 'bomberoDetail' ? 'bomberoDetail' : 'bombero';
    setModalData(prev => ({ ...prev, [dataKey]: null }));
  };

  const closeAllModals = () => {
    setModals({
      createBombero: false,
      editBombero: false,
      createRol: false,
      bomberoDetail: false
    });
    setModalData({
      bombero: null,
      bomberoDetail: null
    });
  };

  return { 
    modals, 
    modalData, 
    openModal, 
    closeModal, 
    closeAllModals 
  };
};