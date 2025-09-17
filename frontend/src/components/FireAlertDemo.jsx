import React from 'react';
import { useGlobalFireAlert } from './FireAlertProvider';

const FireAlertDemo = () => {
  const { fireSuccess, fireError, fireWarning, fireInfo, fireConflict, fireSecurity, fireConfirm } = useGlobalFireAlert();

  const testSuccess = () => {
    fireSuccess('¡Misión Cumplida!', 'El bombero ha sido registrado exitosamente en el sistema');
  };

  const testError = () => {
    fireError('Emergencia Detectada', 'No se pudo conectar con el servidor. Verificar conexión de red.');
  };

  const testWarning = () => {
    fireWarning('Alerta de Seguridad', 'Se detectó un intento de acceso no autorizado al sistema');
  };

  const testInfo = () => {
    fireInfo('Información del Cuartel', 'El mantenimiento programado del sistema comenzará en 30 minutos');
  };

  const testConflict = () => {
    fireConflict('Operación Bloqueada', 'El rol "Supervisor" está actualmente asignado a 3 bomberos. Para eliminar este rol, primero debes reasignar o quitar el rol de todos los bomberos que lo tienen asignado.');
  };

  const testSecurity = () => {
    fireSecurity('Acceso Restringido', 'No tienes los permisos necesarios para realizar esta operación. Contacta con tu administrador.');
  };

  const testConfirm = async () => {
    const confirmed = await fireConfirm(
      '¿Confirmar Eliminación?',
      'Esta acción eliminará permanentemente el registro del bombero del sistema. ¿Estás seguro de continuar?'
    );
    
    if (confirmed) {
      fireSuccess('¡Confirmado!', 'El usuario confirmó la eliminación');
    } else {
      fireInfo('Operación Cancelada', 'El usuario canceló la eliminación');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">🚒 FireAlert Demo - Sistema de Alertas de Bomberos</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={testSuccess}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          ✅ Éxito
        </button>
        <button
          onClick={testError}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          ❌ Error
        </button>
        <button
          onClick={testWarning}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
        >
          ⚠️ Advertencia
        </button>
        <button
          onClick={testInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          ℹ️ Información
        </button>
        <button
          onClick={testConflict}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
        >
          🔥 Conflicto
        </button>
        <button
          onClick={testSecurity}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          🛡️ Seguridad
        </button>
        <button
          onClick={testConfirm}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm col-span-2"
        >
          🤔 Confirmación
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Esta es una demostración del sistema de alertas personalizado. Puedes eliminar este componente una vez que hayas probado las alertas.
      </p>
    </div>
  );
};

export default FireAlertDemo;