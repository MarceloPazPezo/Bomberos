import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import { MdClose, MdCheckCircle, MdCancel, MdWarning } from "react-icons/md";

// Configurar el elemento de la aplicación para react-modal
if (typeof document !== "undefined") {
  Modal.setAppElement(document.getElementById("root") || document.body);
}

/**
 * Modal para aprobar o rechazar un parte de emergencia
 * Permite agregar comentarios (obligatorios para rechazo)
 */
export default function ModalRevisionParte({
  isOpen,
  onClose,
  onConfirm,
  tipo = "aprobar",
  incidenteId,
}) {
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const isAprobar = tipo === "aprobar";
  const titulo = isAprobar ? "Aprobar Parte de Emergencia" : "Rechazar Parte de Emergencia";
  const colorBoton = isAprobar ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";
  const textoBoton = isAprobar ? "Aprobar" : "Rechazar";

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setComentario("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validar que el comentario sea obligatorio al rechazar
    if (!isAprobar && !comentario.trim()) {
      setError("El comentario es obligatorio al rechazar un parte");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(comentario.trim() || null);
      handleCloseModal();
    } catch (err) {
      setError(err.message || "Error al procesar la revisión");
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setComentario("");
      setError("");
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

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
      maxWidth: "600px",
      width: "90%",
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCloseModal}
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
        <div
          className={`relative ${
            isAprobar
              ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200"
              : "bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200"
          } rounded-2xl shadow-2xl overflow-hidden`}
        >
          {/* Barra decorativa superior */}
          <div
            className={`h-2 ${isAprobar ? "bg-green-500" : "bg-red-500"} relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>

          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            {/* Botón de cerrar */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200/50 transition-colors duration-200 z-10"
            >
              <MdClose className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>

            {/* Icono y título */}
            <div className="flex flex-col items-center mb-4">
              <div className={`text-4xl mb-2 ${isAprobar ? "text-green-600" : "text-red-600"}`}>
                {isAprobar ? (
                  <MdCheckCircle className="w-16 h-16" />
                ) : (
                  <MdCancel className="w-16 h-16" />
                )}
              </div>

              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">{titulo}</h2>

              <div
                className={`w-16 h-1 ${isAprobar ? "bg-green-500" : "bg-red-500"} rounded-full`}
              ></div>
            </div>

            <p className="text-center text-gray-600 text-sm">
              {isAprobar
                ? "¿Estás seguro de que deseas aprobar este parte de emergencia?"
                : "¿Estás seguro de que deseas rechazar este parte de emergencia?"}
            </p>
            {!isAprobar && (
              <p className="text-center text-sm text-red-600 mt-2">
                * Debes proporcionar un comentario explicando las correcciones necesarias
              </p>
            )}
          </div>

          {/* Contenido */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 pb-6">
              <div className="mb-4">
                <label
                  htmlFor="comentario"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Comentario {!isAprobar && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id="comentario"
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 transition-all
                    ${
                      error
                        ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                        : `border-gray-300 ${
                            isAprobar
                              ? "focus:border-green-400 focus:ring-green-200"
                              : "focus:border-red-400 focus:ring-red-200"
                          }`
                    }`}
                  placeholder={
                    isAprobar
                      ? "Agrega un comentario opcional..."
                      : "Explica las correcciones necesarias..."
                  }
                  value={comentario}
                  onChange={(e) => {
                    setComentario(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={isSubmitting}
                  required={!isAprobar}
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <MdWarning className="w-4 h-4" />
                    {error}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  {isAprobar
                    ? "El redactor será notificado de la aprobación del parte."
                    : "Este comentario será enviado al redactor como notificación"}
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                    ${colorBoton} ${isAprobar ? "focus:ring-green-500" : "focus:ring-red-500"}`}
                >
                  {isAprobar ? (
                    <MdCheckCircle className="w-4 h-4" />
                  ) : (
                    <MdCancel className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Procesando..." : textoBoton}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}

ModalRevisionParte.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  tipo: PropTypes.oneOf(["aprobar", "rechazar"]).isRequired,
  incidenteId: PropTypes.number,
};
