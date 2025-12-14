import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  MdWarning,
  MdError,
  MdCheckCircle,
  MdInfo,
  MdClose,
  MdLocalFireDepartment,
  MdSecurity,
  MdBlock,
} from "react-icons/md";

// Configurar el elemento de la aplicación para react-modal
if (typeof document !== "undefined") {
  Modal.setAppElement(document.getElementById("root") || document.body);
}

const FireAlert = ({
  isOpen,
  onClose,
  type = "info",
  title,
  message,
  html,
  confirmText = "Entendido",
  cancelText = "Cancelar",
  showCancel = false,
  // clases opcionales para personalizar botones
  confirmClassName,
  cancelClassName,
  onConfirm,
  onCancel,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200); // Duración de la animación
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };

  // Configuración de tipos de alerta con temática de bomberos
  const alertConfig = {
    success: {
      icon: MdCheckCircle,
      iconColor: "text-green-500",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      accentColor: "bg-green-500",
      buttonColor: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      fireIcon: <MdLocalFireDepartment className="w-10 h-10" />,
      title: title || "¡Operación Exitosa!",
    },
    error: {
      icon: MdError,
      iconColor: "text-red-500",
      bgGradient: "from-red-50 to-rose-50",
      borderColor: "border-red-200",
      accentColor: "bg-red-500",
      buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      fireIcon: <MdError className="w-10 h-10" />,
      title: title || "Error Detectado",
    },
    warning: {
      icon: MdWarning,
      iconColor: "text-amber-500",
      bgGradient: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-200",
      accentColor: "bg-amber-500",
      buttonColor: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
      fireIcon: <MdWarning className="w-10 h-10" />,
      title: title || "Precaución",
    },
    info: {
      icon: MdInfo,
      iconColor: "text-blue-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      accentColor: "bg-blue-500",
      buttonColor: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      fireIcon: <MdInfo className="w-10 h-10" />,
      title: title || "Información",
    },
    conflict: {
      icon: MdBlock,
      iconColor: "text-orange-500",
      bgGradient: "from-orange-50 to-amber-50",
      borderColor: "border-orange-200",
      accentColor: "bg-orange-500",
      buttonColor: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
      fireIcon: <MdLocalFireDepartment className="w-10 h-10" />,
      title: title || "Operación Bloqueada",
    },
    security: {
      icon: MdSecurity,
      iconColor: "text-purple-500",
      bgGradient: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      accentColor: "bg-purple-500",
      buttonColor: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
      fireIcon: <MdSecurity className="w-10 h-10" />,
      title: title || "Acceso Restringido",
    },
  };

  const config = alertConfig[type] || alertConfig.info;
  const IconComponent = config.icon;

  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      position: "relative",
      top: "auto",
      left: "auto",
      right: "auto",
      bottom: "auto",
      border: "none",
      background: "transparent",
      overflow: "visible",
      WebkitOverflowScrolling: "touch",
      borderRadius: "0",
      outline: "none",
      padding: "0",
      maxWidth: "500px",
      width: "90%",
      maxHeight: "90vh",
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customStyles}
      closeTimeoutMS={200}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div
        className={`
        transform transition-all duration-200 ease-out
        ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}
      `}
      >
        {/* Contenedor principal */}
        <div
          className={`
          relative bg-linear-to-br ${config.bgGradient} 
          border-2 ${config.borderColor} 
          rounded-2xl shadow-2xl overflow-hidden
          max-w-md mx-auto
        `}
        >
          {/* Barra decorativa superior con temática de bomberos */}
          <div className={`h-2 ${config.accentColor} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>

          {/* Header con ícono de bomberos */}
          <div className="relative px-6 pt-6 pb-4">
            {/* Botón de cerrar */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200/50 transition-colors duration-200 z-10"
            >
              <MdClose className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>

            {/* Icono principal con efecto de bomberos */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                {/* Icono de fondo decorativo */}
                <div className="absolute -top-2 -left-2 text-4xl opacity-20">
                  <MdLocalFireDepartment />
                </div>

                {/* Emoji temático */}
                <div className="text-4xl mb-2 animate-bounce">{config.fireIcon}</div>

                {/* Icono principal */}
                <div className={`absolute bottom-0 right-0 ${config.iconColor}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>

              {/* Título con estilo de bomberos */}
              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">{config.title}</h2>

              {/* Línea decorativa */}
              <div className={`w-16 h-1 ${config.accentColor} rounded-full`}></div>
            </div>
          </div>

          {/* Contenido del mensaje */}
          <div className="px-6 pb-6">
            <div className="text-center">
              {html ? (
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{message}</p>
              )}
            </div>

            {/* Decoración con temática de bomberos */}
            <div className="flex justify-center items-center mt-4 space-x-2 opacity-30">
              <MdLocalFireDepartment className="w-4 h-4 text-gray-400" />
              <div className="w-8 h-px bg-gray-400"></div>
              <MdLocalFireDepartment className="w-4 h-4 text-gray-400" />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 mt-6">
              {showCancel && (
                <button
                  onClick={handleCancel}
                  className={
                    cancelClassName ||
                    "flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  }
                >
                  {cancelText}
                </button>
              )}

              <button
                onClick={handleConfirm}
                className={
                  confirmClassName ||
                  `${showCancel ? "flex-1" : "w-full"} px-4 py-3 ${
                    config.buttonColor
                  } text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:${config.buttonColor
                    .split(" ")[0]
                    .replace("bg-", "ring-")} focus:ring-offset-2 relative overflow-hidden`
                }
              >
                <span className="relative z-10">{confirmText}</span>
                {/* Efecto de brillo en el botón */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>

            {/* Footer con identificación de bomberos */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                Sistema de Gestión de Bomberos <MdLocalFireDepartment className="w-4 h-4" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FireAlert;
