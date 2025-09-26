import { useState, useCallback, useRef } from 'react';

/**
 * Hook personalizado para manejar múltiples modales de forma centralizada
 * Versión mejorada con funcionalidades adicionales
 */
export const useAdminModals = () => {
  const [modals, setModals] = useState({});
  const [modalData, setModalData] = useState({});
  const [modalHistory, setModalHistory] = useState([]);
  const modalStackRef = useRef([]);

  // Función para abrir un modal con datos opcionales
  const openModal = useCallback((modalId, data = null, options = {}) => {
    const { 
      preventMultiple = true, 
      addToHistory = true,
      onOpen,
      priority = 0
    } = options;

    // Verificar si el modal ya está abierto (si se previene múltiples)
    if (preventMultiple && modals[modalId]) {
      console.warn(`Modal '${modalId}' ya está abierto`);
      return false;
    }

    // Actualizar estado de modales
    setModals(prev => ({ ...prev, [modalId]: true }));

    // Guardar datos del modal si se proporcionan
    if (data !== null) {
      setModalData(prev => ({ ...prev, [modalId]: data }));
    }

    // Agregar al historial si está habilitado
    if (addToHistory) {
      setModalHistory(prev => [...prev, { 
        modalId, 
        timestamp: Date.now(),
        data: data || null 
      }]);
    }

    // Agregar al stack de modales (para gestión de orden/prioridad)
    modalStackRef.current.push({ modalId, priority, timestamp: Date.now() });
    modalStackRef.current.sort((a, b) => b.priority - a.priority);

    // Ejecutar callback de apertura si existe
    if (onOpen && typeof onOpen === 'function') {
      try {
        onOpen(modalId, data);
      } catch (error) {
        console.error('Error ejecutando callback onOpen:', error);
      }
    }

    return true;
  }, [modals]);

  // Función para cerrar un modal
  const closeModal = useCallback((modalId, options = {}) => {
    const { 
      clearData = true, 
      onClose,
      force = false 
    } = options;

    // Verificar si el modal está abierto
    if (!modals[modalId] && !force) {
      console.warn(`Intento de cerrar modal '${modalId}' que no está abierto`);
      return false;
    }

    // Actualizar estado de modales
    setModals(prev => {
      const newModals = { ...prev };
      delete newModals[modalId];
      return newModals;
    });

    // Limpiar datos del modal si está habilitado
    if (clearData) {
      setModalData(prev => {
        const newData = { ...prev };
        delete newData[modalId];
        return newData;
      });
    }

    // Remover del stack de modales
    modalStackRef.current = modalStackRef.current.filter(
      modal => modal.modalId !== modalId
    );

    // Ejecutar callback de cierre si existe
    if (onClose && typeof onClose === 'function') {
      try {
        onClose(modalId);
      } catch (error) {
        console.error('Error ejecutando callback onClose:', error);
      }
    }

    return true;
  }, [modals]);

  // Función para cerrar todos los modales
  const closeAllModals = useCallback((options = {}) => {
    const { onCloseAll } = options;
    
    setModals({});
    setModalData({});
    modalStackRef.current = [];

    if (onCloseAll && typeof onCloseAll === 'function') {
      try {
        onCloseAll();
      } catch (error) {
        console.error('Error ejecutando callback onCloseAll:', error);
      }
    }
  }, []);

  // Función para verificar si un modal está abierto
  const isModalOpen = useCallback((modalId) => {
    return Boolean(modals[modalId]);
  }, [modals]);

  // Función para obtener datos de un modal
  const getModalData = useCallback((modalId) => {
    return modalData[modalId] || null;
  }, [modalData]);

  // Función para actualizar datos de un modal abierto
  const updateModalData = useCallback((modalId, newData, merge = true) => {
    if (!modals[modalId]) {
      console.warn(`Intento de actualizar datos de modal '${modalId}' que no está abierto`);
      return false;
    }

    setModalData(prev => ({
      ...prev,
      [modalId]: merge && prev[modalId] 
        ? { ...prev[modalId], ...newData }
        : newData
    }));

    return true;
  }, [modals]);

  // Función para obtener el modal superior en el stack
  const getTopModal = useCallback(() => {
    return modalStackRef.current.length > 0 
      ? modalStackRef.current[0] 
      : null;
  }, []);

  // Función para obtener todos los modales abiertos
  const getOpenModals = useCallback(() => {
    return Object.keys(modals).filter(modalId => modals[modalId]);
  }, [modals]);

  // Función para limpiar el historial de modales
  const clearModalHistory = useCallback(() => {
    setModalHistory([]);
  }, []);

  // Función para obtener estadísticas de modales
  const getModalStats = useCallback(() => {
    const openModals = getOpenModals();
    return {
      totalOpen: openModals.length,
      openModals,
      historyLength: modalHistory.length,
      topModal: getTopModal(),
      hasOpenModals: openModals.length > 0
    };
  }, [getOpenModals, modalHistory, getTopModal]);

  return {
    // Estado básico
    modals,
    modalData,
    modalHistory,

    // Funciones principales
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalData,

    // Funciones avanzadas
    updateModalData,
    getTopModal,
    getOpenModals,
    clearModalHistory,
    getModalStats
  };
};