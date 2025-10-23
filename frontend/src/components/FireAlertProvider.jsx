import React, { createContext, useContext, useEffect } from 'react';
import FireAlert from './FireAlert';
import { useFireAlert } from '../hooks/useFireAlert.js';
import { setGlobalFireAlert } from '../helpers/fireAlert';

const FireAlertContext = createContext();

export const useGlobalFireAlert = () => {
  const context = useContext(FireAlertContext);
  if (!context) {
    throw new Error('useGlobalFireAlert debe ser usado dentro de un FireAlertProvider');
  }
  return context;
};

export const FireAlertProvider = ({ children }) => {
  const fireAlertHook = useFireAlert();

  // Configurar la instancia global para compatibilidad con helpers
  useEffect(() => {
    setGlobalFireAlert(fireAlertHook);
  }, [fireAlertHook]);

  return (
    <FireAlertContext.Provider value={fireAlertHook}>
      {children}
      <FireAlert
        isOpen={fireAlertHook.alert.isOpen}
        onClose={fireAlertHook.hideAlert}
        type={fireAlertHook.alert.type}
        title={fireAlertHook.alert.title}
        message={fireAlertHook.alert.message}
        html={fireAlertHook.alert.html}
        confirmText={fireAlertHook.alert.confirmText}
        cancelText={fireAlertHook.alert.cancelText}
        showCancel={fireAlertHook.alert.showCancel}
        onConfirm={fireAlertHook.alert.onConfirm}
        onCancel={fireAlertHook.alert.onCancel}
      />
    </FireAlertContext.Provider>
  );
};