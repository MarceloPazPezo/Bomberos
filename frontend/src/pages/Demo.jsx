import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  MdCode, 
  MdPlayArrow, 
  MdInfo, 
  MdWarning, 
  MdError, 
  MdCheckCircle,
  MdNotifications,
  MdTableChart,
  MdViewModule,
  MdSecurity,
  MdPerson,
  MdBusiness,
  MdLocationOn,
  MdSettings,
  MdRefresh,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdWaterDrop,
  MdSend,
  MdGroup,
  MdPersonAdd
} from 'react-icons/md';

// Componentes para demostrar
import BomberosLoader from '@components/BomberosLoader';
import Tooltip from '@components/Tooltip.jsx';
import FireAlertDemo from '@components/FireAlertDemo.jsx';
import StaticValuesDemo from '@components/demo/StaticValuesDemo';
import MapIconsDemo from '@components/demo/MapIconsDemo';
import { showConfirmAlert, showInfoAlert, showErrorAlert, showWarningAlert, showConflictAlert, showSecurityAlert } from '@helpers/fireAlert.js';
import { fireSuccessToast, roleCreatedToast, roleDeletedToast } from '@helpers/toastHelper.jsx';
import usePermisos from '@hooks/permisos/usePermisos';
import { useNotifications } from '@context/NotificationContext.jsx';
import { useAuth } from '@hooks/auth/useAuth';
import { NOTIFICATION_TYPES } from '@helpers/notificationTypes.js';

const Demo = () => {
  const { permisos, permisosByCategory, loading: permisosLoading, refreshPermisos } = usePermisos();
  const { 
    sendIndividualNotification, 
    sendSystemNotification, 
    sendCompaniaNotification, 
    loadNotifications,
    unreadCount,
    isConnected 
  } = useNotifications();
  const { bombero: user } = useAuth();

  // Funciones de demostración
  const showToastDemo = (type) => {
    switch (type) {
      case 'success':
        fireSuccessToast('¡Operación exitosa!', 'Los datos se han guardado correctamente.');
        break;
      case 'role-created':
        roleCreatedToast('Administrador');
        break;
      case 'role-deleted':
        roleDeletedToast('Usuario básico');
        break;
      case 'react-toastify':
        toast.success('🚒 ¡Toast de React Toastify!');
        break;
      default:
        toast.info('Demo de notificación');
    }
  };

  const showFireAlertDemo = async (type) => {
    switch (type) {
      case 'confirm':
        const result = await showConfirmAlert(
          'Confirmar acción',
          '¿Estás seguro de que quieres realizar esta acción?',
          'Sí, confirmar',
          'Cancelar'
        );
        if (result.isConfirmed) {
          showInfoAlert('¡Confirmado!', 'La acción se ha realizado correctamente.');
        }
        break;
      case 'info':
        showInfoAlert('Información', 'Esta es una demostración del alert informativo.');
        break;
      case 'error':
        showErrorAlert('Error', 'Ha ocurrido un error durante la operación.');
        break;
      case 'warning':
        showWarningAlert('Advertencia', 'Esta es una advertencia importante.');
        break;
      case 'conflict':
        showConflictAlert('Conflicto', 'Se ha detectado un conflicto en los datos.');
        break;
      case 'security':
        showSecurityAlert('Seguridad', 'Alerta relacionada con la seguridad del sistema.');
        break;
    }
  };

  // Función para probar permisos
  const testPermisos = () => {
    console.log('=== TESTING PERMISOS ===');
    console.log('Total permisos:', permisos.length);
    console.log('Permisos por categoría:', permisosByCategory);
    console.log('Categorías:', Object.keys(permisosByCategory));
    refreshPermisos(true);
  };

  // Funciones de demo para notificaciones
  const sendNotificationDemo = async (type) => {
    if (!user?.id) {
      showErrorAlert('Error', 'Usuario no autenticado');
      return;
    }

    const notifications = {
      personal: {
        type: NOTIFICATION_TYPES.PERSONAL,
        title: 'Notificación Personal',
        message: 'Esta es una notificación personal de prueba desde el Demo.',
        data: { source: 'demo', timestamp: new Date().toISOString() }
      },
      recordatorio: {
        type: NOTIFICATION_TYPES.RECORDATORIO,
        title: 'Recordatorio de Reunión',
        message: 'Recuerda que tienes una reunión programada para mañana a las 10:00 AM.',
        data: { meetingId: 'DEMO-001', time: '10:00 AM' }
      },
      emergencia: {
        type: NOTIFICATION_TYPES.EMERGENCIA,
        title: 'Simulación de Emergencia',
        message: 'Esta es una simulación de emergencia para pruebas del sistema.',
        data: { simulation: true, level: 'critical' }
      },
      sistema: {
        type: NOTIFICATION_TYPES.SISTEMA,
        title: 'Mantenimiento del Sistema',
        message: 'El sistema estará en mantenimiento el próximo domingo de 2:00 a 4:00 AM.',
        data: { maintenanceType: 'scheduled', duration: '2 hours' }
      },
      compania: {
        type: NOTIFICATION_TYPES.GRUPAL,
        title: 'Comunicado de Compañía',
        message: 'Mensaje importante para todos los miembros de la compañía.',
        data: { companyId: user.companiaId || 1, broadcast: true }
      }
    };

    try {
      switch (type) {
        case 'personal':
          await sendIndividualNotification(
            user.id,
            notifications.personal.type,
            notifications.personal.title,
            notifications.personal.message,
            notifications.personal.data
          );
          showInfoAlert('✅ Éxito', 'Notificación personal enviada correctamente');
          break;

        case 'recordatorio':
          await sendIndividualNotification(
            user.id,
            notifications.recordatorio.type,
            notifications.recordatorio.title,
            notifications.recordatorio.message,
            notifications.recordatorio.data
          );
          showInfoAlert('✅ Éxito', 'Recordatorio enviado correctamente');
          break;

        case 'emergencia':
          await sendIndividualNotification(
            user.id,
            notifications.emergencia.type,
            notifications.emergencia.title,
            notifications.emergencia.message,
            notifications.emergencia.data
          );
          showWarningAlert('⚠️ Simulación', 'Notificación de emergencia simulada enviada');
          break;

        case 'sistema':
          await sendSystemNotification(
            notifications.sistema.type,
            notifications.sistema.title,
            notifications.sistema.message,
            notifications.sistema.data
          );
          showInfoAlert('✅ Éxito', 'Notificación del sistema enviada');
          break;

        case 'compania':
          await sendCompaniaNotification(
            user.companiaId || 1,
            [], // Array vacío para que el backend obtenga todos los bomberos de la compañía
            notifications.compania.type,
            notifications.compania.title,
            notifications.compania.message,
            notifications.compania.data
          );
          showInfoAlert('✅ Éxito', 'Notificación de compañía enviada a todos los miembros');
          break;

        default:
          showErrorAlert('Error', 'Tipo de notificación no válido');
      }

      // Recargar notificaciones para mostrar la nueva
      await loadNotifications();
      
    } catch (error) {
      console.error('Error enviando notificación:', error);
      showErrorAlert('❌ Error', 'Error al enviar la notificación: ' + error.message);
    }
  };

  // Función para probar Pub/Sub usando el servicio de notificaciones
  const testPubSub = async () => {
    try {
      // Verificar que el usuario esté autenticado
      if (!user?.id) {
        showErrorAlert('❌ Error', 'Usuario no autenticado. Por favor, inicia sesión.');
        return;
      }

      console.log('Usuario:', user.nombres, 'ID:', user.id);

      // Importar el servicio de notificaciones
      const { default: notificationService } = await import('@services/notification.service.js');
      
      // Usar el servicio que ya tiene la autenticación configurada
      const response = await notificationService.testPubSub({
        channel: `notifications:test:${user.id}`,
        message: 'Mensaje de prueba de Pub/Sub desde Demo'
      });

      showInfoAlert('✅ Éxito', 'Mensaje de prueba publicado en Pub/Sub');
      console.log('Resultado del test Pub/Sub:', response);
      
    } catch (error) {
      console.error('Error probando Pub/Sub:', error);
      showErrorAlert('❌ Error', 'Error al probar Pub/Sub: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MdCode className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Demo de Componentes</h1>
              <p className="text-gray-600">
                Demostración interactiva de los componentes personalizados del sistema de bomberos
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Sección 1: Loaders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MdRefresh className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Bomberos Loader</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Loader personalizado con temática de bomberos para indicar carga de datos.
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <h3 className="font-medium mb-2">Tamaño Pequeño</h3>
                  <BomberosLoader size="sm" message="Cargando..." />
                </div>
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <h3 className="font-medium mb-2">Tamaño Mediano</h3>
                  <BomberosLoader size="md" message="Procesando datos..." />
                </div>
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <h3 className="font-medium mb-2">Tamaño Grande</h3>
                  <BomberosLoader size="lg" message="Cargando sistema..." subMessage="Por favor espere..." />
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Tooltips */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MdInfo className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Tooltips</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Tooltips informativos para mejorar la experiencia del usuario.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Tooltip id="tooltip-default" content="Tooltip por defecto">
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg">
                  Hover aquí
                </button>
              </Tooltip>
              
              <Tooltip id="tooltip-success" content="Tooltip de éxito" variant="light">
                <button className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg">
                  Éxito
                </button>
              </Tooltip>
              
              <Tooltip id="tooltip-warning" content="Tooltip de advertencia" variant="light">
                <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg">
                  Advertencia
                </button>
              </Tooltip>
              
              <Tooltip id="tooltip-error" content="Tooltip de error" variant="light">
                <button className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg">
                  Error
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Sección 3: Notificaciones Toast */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MdNotifications className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Notificaciones Toast</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Sistema de notificaciones toast personalizado para el sistema de bomberos.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => showToastDemo('success')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <MdCheckCircle className="h-4 w-4" />
                <span>Éxito</span>
              </button>
              
              <button
                onClick={() => showToastDemo('role-created')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <MdAdd className="h-4 w-4" />
                <span>Rol creado</span>
              </button>
              
              <button
                onClick={() => showToastDemo('role-deleted')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <MdDelete className="h-4 w-4" />
                <span>Rol eliminado</span>
              </button>
              
              <button
                onClick={() => showToastDemo('react-toastify')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <MdSettings className="h-4 w-4" />
                <span>React Toastify</span>
              </button>
            </div>
          </div>

          {/* Sección 4: Fire Alerts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MdWarning className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Fire Alerts</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Sistema de alertas modales personalizado con temática de bomberos.
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  onClick={() => showFireAlertDemo('confirm')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <MdInfo className="h-4 w-4" />
                  <span>Confirmar</span>
                </button>
                
                <button
                  onClick={() => showFireAlertDemo('info')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <MdInfo className="h-4 w-4" />
                  <span>Información</span>
                </button>
                
                <button
                  onClick={() => showFireAlertDemo('error')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <MdError className="h-4 w-4" />
                  <span>Error</span>
                </button>
                
                <button
                  onClick={() => showFireAlertDemo('warning')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <MdWarning className="h-4 w-4" />
                  <span>Advertencia</span>
                </button>
                
                <button
                  onClick={() => showFireAlertDemo('conflict')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <MdWarning className="h-4 w-4" />
                  <span>Conflicto</span>
                </button>
                
                <button
                  onClick={() => showFireAlertDemo('security')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <MdSecurity className="h-4 w-4" />
                  <span>Seguridad</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sección 5: Sistema de Notificaciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MdNotifications className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Sistema de Notificaciones</h2>
              <div className="ml-auto flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Sistema completo de notificaciones con diferentes tipos y canales de envío.
            </p>
            
            <div className="space-y-4">
              {/* Estado del sistema */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Estado del Sistema:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>WebSocket: {isConnected ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Usuario:</span>
                    <span>{user?.nombres || 'No autenticado'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">ID:</span>
                    <span>{user?.id || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">No leídas:</span>
                    <span className="font-bold text-red-600">{unreadCount}</span>
                  </div>
                </div>
              </div>

              {/* Botones de notificaciones */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <button
                  onClick={() => sendNotificationDemo('personal')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex flex-col items-center space-y-2 transition-colors"
                >
                  <MdPerson className="h-6 w-6" />
                  <span className="text-sm font-medium">Personal</span>
                </button>
                
                <button
                  onClick={() => sendNotificationDemo('recordatorio')}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg flex flex-col items-center space-y-2 transition-colors"
                >
                  <MdInfo className="h-6 w-6" />
                  <span className="text-sm font-medium">Recordatorio</span>
                </button>
                
                <button
                  onClick={() => sendNotificationDemo('emergencia')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex flex-col items-center space-y-2 transition-colors"
                >
                  <MdWarning className="h-6 w-6" />
                  <span className="text-sm font-medium">Emergencia</span>
                </button>
                
                <button
                  onClick={() => sendNotificationDemo('sistema')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex flex-col items-center space-y-2 transition-colors"
                >
                  <MdSettings className="h-6 w-6" />
                  <span className="text-sm font-medium">Sistema</span>
                </button>
                
                <button
                  onClick={() => sendNotificationDemo('compania')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex flex-col items-center space-y-2 transition-colors"
                >
                  <MdGroup className="h-6 w-6" />
                  <span className="text-sm font-medium">Compañía</span>
                </button>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Tipos de Notificación Disponibles:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="bg-white p-2 rounded border">
                    <strong>SISTEMA:</strong> Notificaciones del sistema
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>EMERGENCIA:</strong> Emergencias críticas
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>PERSONAL:</strong> Notificaciones personales
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>RECORDATORIO:</strong> Recordatorios
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>MENSAJE_DIRECTO:</strong> Mensajes directos
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>GRUPAL:</strong> Notificaciones grupales
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>INCIDENTE:</strong> Notificaciones de incidentes
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>EVENTO:</strong> Notificaciones de eventos
                  </div>
                </div>
              </div>

              {/* Botón de prueba de Pub/Sub */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-medium mb-2 text-purple-800">🔧 Pruebas de Sistema:</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={testPubSub}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <MdSettings className="h-4 w-4" />
                    <span>Probar Pub/Sub</span>
                  </button>
                  <span className="text-sm text-purple-600">
                    Prueba el sistema de mensajería en tiempo real de Redis
                  </span>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-medium mb-2 text-yellow-800">💡 Instrucciones:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Haz clic en cualquier botón para enviar una notificación de prueba</li>
                  <li>• Las notificaciones aparecerán en la campana de notificaciones (🔔) en la navbar</li>
                  <li>• Cada tipo de notificación tiene un TTL (tiempo de vida) diferente</li>
                  <li>• Las notificaciones se almacenan individualmente en Redis para cada usuario</li>
                  <li>• El sistema soporta notificaciones individuales, de compañía y del sistema</li>
                  <li>• Las notificaciones de compañía se envían automáticamente a todos los miembros de la compañía</li>
                  <li>• Usa "Probar Pub/Sub" para verificar que Redis 7 esté funcionando correctamente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sección 7: Iconos y Elementos UI */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MdViewModule className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Iconos del Sistema</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Iconos utilizados en el sistema de bomberos con temática consistente.
            </p>
            
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {[
                { icon: MdSecurity, name: 'Seguridad' },
                { icon: MdPerson, name: 'Persona' },
                { icon: MdBusiness, name: 'Compañía' },
                { icon: MdLocationOn, name: 'Ubicación' },
                { icon: MdAdd, name: 'Agregar' },
                { icon: MdEdit, name: 'Editar' },
                { icon: MdDelete, name: 'Eliminar' },
                { icon: MdVisibility, name: 'Ver' },
              ].map((item, index) => (
                <div key={index} className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <item.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sección 8: Testing de Permisos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MdSettings className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Testing de Permisos</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Herramientas de debugging para verificar la carga de permisos del sistema.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={testPermisos}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <MdRefresh className="h-4 w-4" />
                  <span>Test Permisos</span>
                </button>
                {permisosLoading && (
                  <div className="flex items-center">
                    <BomberosLoader size="sm" message="Cargando permisos..." />
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Estado actual:</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Total permisos:</strong> {permisos.length}</p>
                  <p><strong>Categorías:</strong> {Object.keys(permisosByCategory).join(', ')}</p>
                  <p><strong>Loading:</strong> {permisosLoading ? 'Sí' : 'No'}</p>
                </div>
              </div>
              
              {Object.keys(permisosByCategory).length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Permisos por categoría:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries(permisosByCategory).map(([categoria, permisos]) => (
                      <div key={categoria} className="bg-white p-2 rounded border">
                        <strong>{categoria}:</strong> {permisos.length}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Sección 9: Valores Estáticos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MdWaterDrop className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Valores Estáticos</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Componente demo para seleccionar y obtener valores estáticos como tipos de sangre y estados de reporte.
            </p>
            
            <StaticValuesDemo />
          </div>

          {/* Sección 10: Iconos del Mapa */}
          <MapIconsDemo />

          {/* Sección 10: Paleta de Colores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MdSettings className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Paleta de Colores</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Próximamente - Paleta de colores del sistema de bomberos.
            </p>
            
            <div className="flex items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <MdSettings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Próximamente</p>
                <p className="text-gray-400 text-sm">La paleta de colores aún no está definida</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;