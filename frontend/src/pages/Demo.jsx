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
  MdVisibility
} from 'react-icons/md';

// Componentes para demostrar
import BomberosLoader from '@components/BomberosLoader';
import Tooltip from '@components/Tooltip.jsx';
import FireAlertDemo from '@components/FireAlertDemo.jsx';
import { showConfirmAlert, showInfoAlert, showErrorAlert, showWarningAlert, showConflictAlert, showSecurityAlert } from '@helpers/fireAlert.js';
import { fireSuccessToast, roleCreatedToast, roleDeletedToast } from '@helpers/toastHelper.js';
import usePermisos from '@hooks/permisos/usePermisos';

const Demo = () => {
  const { permisos, permisosByCategory, loading: permisosLoading, refreshPermisos } = usePermisos();

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

          {/* Sección 5: Iconos y Elementos UI */}
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

          {/* Sección 6: Testing de Permisos */}
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

          {/* Sección 7: Paleta de Colores */}
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