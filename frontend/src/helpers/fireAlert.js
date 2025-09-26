// Helper para compatibilidad con SweetAlert pero usando FireAlert
let globalFireAlert = null;

// Función para configurar la instancia global del FireAlert
export const setGlobalFireAlert = (fireAlertInstance) => {
  globalFireAlert = fireAlertInstance;
};

// Funciones de compatibilidad con SweetAlert
export const showSuccessAlert = (title, message) => {
  if (globalFireAlert) {
    globalFireAlert.fireSuccess(title, message);
  } else {
    console.warn('FireAlert no está configurado. Usando alert nativo.');
    alert(`${title}: ${message}`);
  }
};

export const showErrorAlert = (title, message) => {
  if (globalFireAlert) {
    globalFireAlert.fireError(title, message);
  } else {
    console.warn('FireAlert no está configurado. Usando alert nativo.');
    alert(`${title}: ${message}`);
  }
};

export const showWarningAlert = (title, message) => {
  if (globalFireAlert) {
    globalFireAlert.fireWarning(title, message);
  } else {
    console.warn('FireAlert no está configurado. Usando alert nativo.');
    alert(`${title}: ${message}`);
  }
};

export const showInfoAlert = (title, message) => {
  if (globalFireAlert) {
    globalFireAlert.fireInfo(title, message);
  } else {
    console.warn('FireAlert no está configurado. Usando alert nativo.');
    alert(`${title}: ${message}`);
  }
};

export const showConflictAlert = (title, message) => {
  if (globalFireAlert) {
    globalFireAlert.fireConflict(title, message);
  } else {
    console.warn('FireAlert no está configurado. Usando alert nativo.');
    alert(`${title}: ${message}`);
  }
};

export const showSecurityAlert = (title, message) => {
  if (globalFireAlert) {
    globalFireAlert.fireSecurity(title, message);
  } else {
    console.warn('FireAlert no está configurado. Usando alert nativo.');
    alert(`${title}: ${message}`);
  }
};

// Función para confirmaciones
export const showConfirmAlert = async (title, text, confirmButtonText = "Sí, continuar", cancelButtonText = "Cancelar") => {
  if (globalFireAlert) {
    try {
      const result = await globalFireAlert.fireConfirm(title, text, {
        confirmText: confirmButtonText,
        cancelText: cancelButtonText
      });
      
      // Devolver en formato compatible con SweetAlert
      return { isConfirmed: result };
    } catch (error) {
      console.error('Error en showConfirmAlert:', error);
      return { isConfirmed: false };
    }
  } else {
    console.warn('FireAlert no está configurado. Usando confirm nativo.');
    const result = confirm(`${title}: ${text}`);
    return { isConfirmed: result };
  }
};

// Función específica para eliminar datos (compatibilidad con el código existente)
export const deleteDataAlert = async () => {
  if (globalFireAlert) {
    return {
      isConfirmed: await globalFireAlert.fireConfirm(
        "¿Confirmar Eliminación?", 
        "Esta acción no se puede deshacer. El elemento será eliminado permanentemente del sistema.",
        {
          type: 'warning',
          confirmText: "Sí, Eliminar",
          cancelText: "Cancelar"
        }
      )
    };
  } else {
    console.warn('FireAlert no está configurado. Usando confirm nativo.');
    return {
      isConfirmed: confirm("¿Estás seguro de que quieres eliminar este elemento?")
    };
  }
};