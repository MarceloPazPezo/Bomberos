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
  icon: false, // Desactivar icono por defecto para usar iconos personalizados
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

// Componente de icono para toast de estado civil
const EstadoCivilIcon = () => (
  <MdPerson className="text-purple-600 text-xl mr-2" />
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

export const bomberoStatusChangedToast = (status) => {
  const statusText = status ? 'activado' : 'desactivado';
  toast.success(
    <div className="flex items-center">
      <BomberoIcon />
      <span>Bombero {statusText} exitosamente</span>
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

// Funciones específicas para perfil completo
export const contactoEmergenciaCreatedToast = (contactoName = "Contacto de emergencia") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{contactoName} agregado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const contactoEmergenciaUpdatedToast = (contactoName = "Contacto de emergencia") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{contactoName} actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const contactoEmergenciaDeletedToast = (contactoName = "Contacto de emergencia") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{contactoName} eliminado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const capacitacionCreatedToast = (capacitacionName = "Capacitación") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{capacitacionName} agregada exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const capacitacionUpdatedToast = (capacitacionName = "Capacitación") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{capacitacionName} actualizada exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const capacitacionDeletedToast = (capacitacionName = "Capacitación") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{capacitacionName} eliminada exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// Funciones específicas para actualización de perfil
export const perfilActualizadoToast = (tipoActualizacion = "información personal") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>Perfil actualizado exitosamente - {tipoActualizacion}</span>
    </div>,
    {
      ...toastConfig,
      autoClose: 3000, // Un poco más rápido para actualizaciones de perfil
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const imagenPerfilActualizadaToast = () => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>Imagen de perfil actualizada exitosamente</span>
    </div>,
    {
      ...toastConfig,
      autoClose: 3000,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const contraseñaCambiadaToast = () => {
  toast.success(
    <div className="flex items-center">
      <MdSecurity className="text-green-600 text-xl mr-2" />
      <span>Contraseña cambiada exitosamente</span>
    </div>,
    {
      ...toastConfig,
      autoClose: 4000, // Un poco más tiempo para mensajes de seguridad
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// ============================================================================
// TOASTS PARA ESTADO CIVIL
// ============================================================================

export const estadoCivilCreatedToast = (estadoCivilName = "Estado civil") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{estadoCivilName} creado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const estadoCivilUpdatedToast = (estadoCivilName = "Estado civil") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{estadoCivilName} actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const estadoCivilDeletedToast = (estadoCivilName = "Estado civil") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{estadoCivilName} eliminado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// ===== TOASTS PARA SERVICIOS =====

export const servicioCreatedToast = (servicioName = "Servicio") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{servicioName} creado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const servicioUpdatedToast = (servicioName = "Servicio") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{servicioName} actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const servicioDeletedToast = (servicioName = "Servicio") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{servicioName} eliminado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// ===== TOASTS PARA CARROS =====

export const carroCreatedToast = (carroName = "Carro") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{carroName} creado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const carroUpdatedToast = (carroName = "Carro") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{carroName} actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const carroDeletedToast = (carroName = "Carro") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{carroName} eliminado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// ===== TOASTS PARA TIPOS DE EVENTO =====

export const tipoEventoCreatedToast = (tipoEventoName = "Tipo de evento") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{tipoEventoName} creado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const tipoEventoUpdatedToast = (tipoEventoName = "Tipo de evento") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{tipoEventoName} actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const tipoEventoDeletedToast = (tipoEventoName = "Tipo de evento") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{tipoEventoName} eliminado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// ===== TOASTS PARA TIPO EPP =====

export const tipoEppCreatedToast = (tipoEppName = "Tipo de EPP") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{tipoEppName} creado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const tipoEppUpdatedToast = (tipoEppName = "Tipo de EPP") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{tipoEppName} actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const tipoEppDeletedToast = (tipoEppName = "Tipo de EPP") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{tipoEppName} eliminado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// ===== TOASTS PARA ESTADO EPP =====

export const estadoEppCreatedToast = (estadoEppName = "Estado de EPP") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{estadoEppName} creado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const estadoEppUpdatedToast = (estadoEppName = "Estado de EPP") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{estadoEppName} actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const estadoEppDeletedToast = (estadoEppName = "Estado de EPP") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{estadoEppName} eliminado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// ===== TOASTS PARA VÍNCULOS =====

export const vinculoCreatedToast = (vinculoName = "Vínculo") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{vinculoName} creado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const vinculoUpdatedToast = (vinculoName = "Vínculo") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{vinculoName} actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const vinculoDeletedToast = (vinculoName = "Vínculo") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{vinculoName} eliminado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// ===== TOASTS PARA CLAVE RADIAL =====

export const claveRadialCreatedToast = (claveRadialName = "Clave radial") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{claveRadialName} creada exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const claveRadialUpdatedToast = (claveRadialName = "Clave radial") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{claveRadialName} actualizada exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const claveRadialDeletedToast = (claveRadialName = "Clave radial") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{claveRadialName} eliminada exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// ===== TOASTS PARA SUBTIPO INCIDENTE =====

export const subtipoIncidenteCreatedToast = (subtipoName = "Subtipo de incidente") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{subtipoName} creado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const subtipoIncidenteUpdatedToast = (subtipoName = "Subtipo de incidente") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{subtipoName} actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const subtipoIncidenteDeletedToast = (subtipoName = "Subtipo de incidente") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{subtipoName} eliminado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// ===== TOASTS PARA CLASIFICACION EMERGENCIA =====

export const clasificacionEmergenciaCreatedToast = (clasificacionName = "Clasificación de emergencia") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{clasificacionName} creada exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const clasificacionEmergenciaUpdatedToast = (clasificacionName = "Clasificación de emergencia") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{clasificacionName} actualizada exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const clasificacionEmergenciaDeletedToast = (clasificacionName = "Clasificación de emergencia") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{clasificacionName} eliminada exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

// ===== TOASTS PARA EPP (INVENTARIO) =====

export const eppCreatedToast = (eppName = "EPP") => {
  toast.success(
    <div className="flex items-center">
      <CreateIcon />
      <span>{eppName} creado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const eppUpdatedToast = (eppName = "EPP") => {
  toast.success(
    <div className="flex items-center">
      <UpdateIcon />
      <span>{eppName} actualizado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const eppDeletedToast = (eppName = "EPP") => {
  toast.success(
    <div className="flex items-center">
      <DeleteIcon />
      <span>{eppName} eliminado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const eppAssignedToast = () => {
  toast.success(
    <div className="flex items-center">
      <BomberoIcon />
      <span>EPP asignado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};

export const eppUnassignedToast = () => {
  toast.success(
    <div className="flex items-center">
      <MdSecurity className="text-indigo-600 text-xl mr-2" />
      <span>EPP desasignado exitosamente</span>
    </div>,
    {
      ...toastConfig,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
    }
  );
};