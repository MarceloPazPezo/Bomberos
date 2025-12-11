import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { MdClose, MdSend, MdWarning } from 'react-icons/md';

// Configurar el elemento de la aplicación para react-modal
if (typeof document !== 'undefined') {
  Modal.setAppElement(document.getElementById('root') || document.body);
}

const ComentarioRechazoModal = ({ isOpen, onClose, onConfirm, incidenteId }) => {
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setComentario('');
      setError('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSubmit = () => {
    if (!comentario || comentario.trim() === '') {
      setError('Debes indicar el motivo del rechazo');
      return;
    }

    onConfirm(comentario.trim());
    handleClose();
  };

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      position: 'relative',
      top: 'auto',
      left: 'auto',
      right: 'auto',
      bottom: 'auto',
      border: 'none',
      background: 'transparent',
      overflow: 'visible',
      WebkitOverflowScrolling: 'touch',
      borderRadius: '0',
      outline: 'none',
      padding: '0',
      maxWidth: '600px',
      width: '90%',
    }
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
      <div className={`
        transform transition-all duration-200 ease-out
        ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        <div className="relative bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Barra decorativa superior */}
          <div className="h-2 bg-red-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>

          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            {/* Botón de cerrar */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200/50 transition-colors duration-200 z-10"
            >
              <MdClose className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>

            {/* Icono y título */}
            <div className="flex flex-col items-center mb-4">
              <div className="text-4xl mb-2 animate-bounce">
                🚨
              </div>
              
              <div className="absolute top-6 left-6 text-red-500">
                <MdWarning className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
                Motivo del Rechazo
              </h2>
              
              <div className="w-16 h-1 bg-red-500 rounded-full"></div>
            </div>

            <p className="text-center text-gray-600 text-sm">
              Indica las correcciones que debe realizar el redactor del parte #{incidenteId}
            </p>
          </div>

          {/* Contenido */}
          <div className="px-6 pb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios de corrección <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comentario}
                onChange={(e) => {
                  setComentario(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ejemplo: Falta completar información de vehículos afectados. Revisar datos de bomberos asistentes..."
                rows={5}
                className={`
                  w-full px-4 py-3 border-2 rounded-lg resize-none
                  focus:outline-none focus:ring-2 transition-all
                  ${error 
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-red-400 focus:ring-red-200'
                  }
                `}
                autoFocus
              />
              
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <MdWarning className="w-4 h-4" />
                  {error}
                </p>
              )}

              <p className="mt-2 text-xs text-gray-500">
                Este comentario será enviado al redactor como notificación
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                <MdSend className="w-4 h-4" />
                Enviar a Corrección
              </button>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Sistema de Gestión de Bomberos 🚒
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ComentarioRechazoModal;
