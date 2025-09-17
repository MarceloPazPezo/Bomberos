import { toast } from 'react-toastify';

// Configuraciones personalizadas para toasts de éxito con temática de bomberos
const toastConfig = {
  position: "bottom-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// 🚒 Toast de éxito con temática de bomberos
export const fireSuccessToast = (message = "¡Misión cumplida exitosamente!") => {
  toast.success(`🚒 ${message}`, {
    ...toastConfig,
    className: 'toast-success',
    progressClassName: 'toast-progress-success',
  });
};

// 🚁 Toast de eliminación exitosa
export const fireDeleteSuccessToast = (itemName = "elemento") => {
  fireSuccessToast(`${itemName} eliminado exitosamente del sistema`);
};

// 📋 Toast de creación exitosa
export const fireCreateSuccessToast = (itemName = "elemento") => {
  fireSuccessToast(`${itemName} creado exitosamente en el sistema`);
};

// 🔧 Toast de actualización exitosa
export const fireUpdateSuccessToast = (itemName = "elemento") => {
  fireSuccessToast(`${itemName} actualizado exitosamente`);
};

// Funciones de conveniencia específicas para roles (solo éxitos)
export const roleCreatedToast = () => fireCreateSuccessToast("Rol");
export const roleUpdatedToast = () => fireUpdateSuccessToast("Rol");
export const roleDeletedToast = () => fireDeleteSuccessToast("Rol");

// Funciones de conveniencia específicas para bomberos (solo éxitos)
export const bomberoCreatedToast = () => fireCreateSuccessToast("Bombero");
export const bomberoUpdatedToast = () => fireUpdateSuccessToast("Bombero");
export const bomberoDeletedToast = () => fireDeleteSuccessToast("Bombero");