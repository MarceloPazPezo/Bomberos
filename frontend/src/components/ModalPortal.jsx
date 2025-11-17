import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Componente Portal para renderizar modales fuera del árbol DOM normal
 * Esto evita problemas con z-index y contenedores padre que limiten el alcance
 */
const ModalPortal = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
};

export default ModalPortal;

