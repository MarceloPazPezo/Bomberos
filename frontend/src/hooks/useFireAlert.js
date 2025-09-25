import { useState, useCallback } from 'react';

export const useFireAlert = () => {
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    html: '',
    confirmText: 'Entendido',
    cancelText: 'Cancelar',
    showCancel: false,
    onConfirm: null,
    onCancel: null
  });

  const showAlert = useCallback((options) => {
    setAlert({
      isOpen: true,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      html: options.html || '',
      confirmText: options.confirmText || 'Entendido',
      cancelText: options.cancelText || 'Cancelar',
      showCancel: options.showCancel || false,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Métodos de conveniencia con temática de bomberos
  const fireSuccess = useCallback((title, message, options = {}) => {
    showAlert({
      type: 'success',
      title: title || '¡Misión Cumplida!',
      message,
      confirmText: options.confirmText || 'Excelente',
      ...options
    });
  }, [showAlert]);

  const fireError = useCallback((title, message, options = {}) => {
    showAlert({
      type: 'error',
      title: title || 'Emergencia Detectada',
      message,
      confirmText: options.confirmText || 'Entendido',
      ...options
    });
  }, [showAlert]);

  const fireWarning = useCallback((title, message, options = {}) => {
    showAlert({
      type: 'warning',
      title: title || 'Alerta de Seguridad',
      message,
      confirmText: options.confirmText || 'Proceder con Precaución',
      ...options
    });
  }, [showAlert]);

  const fireInfo = useCallback((title, message, options = {}) => {
    showAlert({
      type: 'info',
      title: title || 'Información del Cuartel',
      message,
      confirmText: options.confirmText || 'Entendido',
      ...options
    });
  }, [showAlert]);

  const fireConflict = useCallback((title, message, options = {}) => {
    showAlert({
      type: 'conflict',
      title: title || 'Operación Bloqueada',
      message,
      confirmText: options.confirmText || 'Revisar Situación',
      ...options
    });
  }, [showAlert]);

  const fireSecurity = useCallback((title, message, options = {}) => {
    showAlert({
      type: 'security',
      title: title || 'Acceso Restringido',
      message,
      confirmText: options.confirmText || 'Contactar Administrador',
      ...options
    });
  }, [showAlert]);

  // Método para confirmaciones con temática de bomberos
  const fireConfirm = useCallback((title, message, options = {}) => {
    return new Promise((resolve) => {
      showAlert({
        type: options.type || 'warning',
        title: title || '¿Confirmar Operación?',
        message,
        showCancel: true,
        confirmText: options.confirmText || 'Sí, Proceder',
        cancelText: options.cancelText || 'Cancelar Operación',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        ...options
      });
    });
  }, [showAlert]);

  return {
    alert,
    showAlert,
    hideAlert,
    fireSuccess,
    fireError,
    fireWarning,
    fireInfo,
    fireConflict,
    fireSecurity,
    fireConfirm
  };
};