import { toast } from 'react-toastify';
import React from 'react';
import { 
  MdCheckCircle, 
  MdDelete, 
  MdAdd, 
  MdEdit,
  MdPerson,
  MdSecurity,
  MdBusiness,
  MdAccessTime,
  MdClose
} from 'react-icons/md';

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

// Componente de icono para toast de éxito general
const SuccessIcon = () => (
  <MdCheckCircle className="text-green-600 text-xl mr-2" />
);

// Componente de icono para toast de eliminación
const DeleteIcon = () => (
  <MdDelete className="text-red-600 text-xl mr-2" />
);

// Componente de icono para toast de creación
const CreateIcon = () => (
  <MdAdd className="text-blue-600 text-xl mr-2" />
);

// Componente de icono para toast de actualización
const UpdateIcon = () => (
  <MdEdit className="text-orange-600 text-xl mr-2" />
);

// Componente de icono para toast de bombero
const BomberoIcon = () => (
  <MdPerson className="text-indigo-600 text-xl mr-2" />
);

// Componente de icono para toast de rol
const RolIcon = () => (
  <MdSecurity className="text-purple-600 text-xl mr-2" />
);

// Componente de icono para toast de compañía
const CompaniaIcon = () => (
  <MdBusiness className="text-teal-600 text-xl mr-2" />
);

// Componente de icono para toast de disponibilidad
const DisponibilidadIcon = () => (
  <MdAccessTime className="text-blue-600 text-xl mr-2" />
);

// Componente de icono para toast de cierre
const CloseIcon = () => (
  <MdClose className="text-gray-600 text-xl mr-2" />
);

// Toast de éxito con temática de bomberos
export const fireSuccessToast = (message = "¡Misión cumplida exitosamente!") => {
  toast.success(
    <div className="flex items-center">
      <SuccessIcon />
      <span>{message}</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// Toast de eliminación exitosa
export const fireDeleteSuccessToast = (itemName = "elemento") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{itemName} eliminado exitosamente del sistema</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// Toast de creación exitosa
export const fireCreateSuccessToast = (itemName = "elemento") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{itemName} creado exitosamente en el sistema</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// Toast de actualización exitosa
export const fireUpdateSuccessToast = (itemName = "elemento") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{itemName} actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// Funciones de conveniencia específicas para roles (solo éxitos)
export const roleCreatedToast = () => {
  toast.success(
    <div className="flex items-center">
      <RolIcon />
      <span>Rol creado exitosamente en el sistema</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const roleUpdatedToast = () => {
  toast.success(
    <div className="flex items-center">
      <RolIcon />
      <span>Rol actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const roleDeletedToast = () => {
  toast.success(
    <div className="flex items-center">
      <RolIcon />
      <span>Rol eliminado exitosamente del sistema</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// Funciones de conveniencia específicas para bomberos (solo éxitos)
export const bomberoCreatedToast = () => {
  toast.success(
    <div className="flex items-center">
      <BomberoIcon />
      <span>Bombero creado exitosamente en el sistema</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const bomberoUpdatedToast = () => {
  toast.success(
    <div className="flex items-center">
      <BomberoIcon />
      <span>Bombero actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const bomberoDeletedToast = () => {
  toast.success(
    <div className="flex items-center">
      <BomberoIcon />
      <span>Bombero eliminado exitosamente del sistema</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// Funciones específicas para disponibilidad
export const disponibilidadCreatedToast = (message = "Disponibilidad creada correctamente") => {
  toast.success(
    <div className="flex items-center">
      <DisponibilidadIcon />
      <span>{message}</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const disponibilidadClosedToast = (message = "Disponibilidad cerrada correctamente") => {
  toast.success(
    <div className="flex items-center">
      <CloseIcon />
      <span>{message}</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const disponibilidadUpdatedToast = (message = "Disponibilidad actualizada correctamente") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{message}</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};