import React, { useState } from 'react';
import { useProfile } from '@hooks/bomberos/useProfile';
import { useAuth } from '@hooks/auth/useAuth';
import { formatRut } from '@helpers/formatData';
import { 
  MdPerson, 
  MdEmail, 
  MdEdit, 
  MdSave, 
  MdCancel, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff,
  MdShield,
  MdBadge,
  MdCalendarToday
} from 'react-icons/md';

const Profile = () => {
  const { hasPermiso } = useAuth();
  const { 
    profile, 
    loading, 
    error, 
    fieldErrors, 
    updating, 
    updateProfile, 
    updatePassword, 
    setError, 
    clearFieldError 
  } = useProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para formularios
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Función para manejar cambios en los campos y limpiar errores
  const handleFieldChange = (fieldName, value) => {
    clearFieldError(fieldName);
    if (isEditing) {
      setEditForm(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  // Función para manejar cambios en los campos de contraseña
  const handlePasswordFieldChange = (fieldName, value) => {
    clearFieldError(fieldName);
    setPasswordForm(prev => ({ ...prev, [fieldName]: value }));
  };

  // Inicializar formulario de edición
  const handleEditStart = () => {
    if (!hasPermiso('bombero:actualizar_perfil')) {
      setError('No tienes permisos para editar el perfil');
      return;
    }
    setEditForm({
      email: profile?.email || '',
    });
    setIsEditing(true);
    setError(null);
    setSuccessMessage('');
  };

  // Cancelar edición
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({});
    setError(null);
  };

  // Guardar cambios del perfil
  const handleEditSave = async () => {
    const formData = { ...editForm };
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
      setSuccessMessage('Perfil actualizado correctamente');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  // Inicializar cambio de contraseña
  const handlePasswordChangeStart = () => {
    if (!hasPermiso('bombero:cambiar_contrasena')) {
      setError('No tienes permisos para cambiar la contraseña');
      return;
    }
    setIsChangingPassword(true);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError(null);
    setSuccessMessage('');
  };

  // Manejar cambio de contraseña
  const handlePasswordChange = async () => {
    // Validaciones locales
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    const result = await updatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });

    if (result.success) {
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Contraseña actualizada correctamente');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  // Función para alternar visibilidad de contraseñas
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Función para renderizar errores de campo
  const renderFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      return (
        <p className="mt-1 text-sm text-red-600">
          {fieldErrors[fieldName]}
        </p>
      );
    }
    return null;
  };

  // Función para obtener clases CSS del campo con error
  const getFieldClasses = (fieldName, baseClasses) => {
    if (fieldErrors[fieldName]) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500`;
    }
    return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
  };

  // Función para obtener el nombre completo
  const getFullName = () => {
    if (profile?.nombres && profile?.apellidos) {
      const nombres = Array.isArray(profile.nombres) ? profile.nombres.join(' ') : profile.nombres;
      const apellidos = Array.isArray(profile.apellidos) ? profile.apellidos.join(' ') : profile.apellidos;
      return `${nombres} ${apellidos}`;
    }
    return 'No especificado';
  };

  // Debug temporal - log para ver qué datos recibe profile
  if (profile) {
    console.log('Profile data:', profile);
    console.log('Profile roles:', profile.roles);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No se pudo cargar el perfil</h2>
          <p className="text-gray-600">Por favor, intenta recargar la página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
                <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
              </div>
              {!isEditing && !isChangingPassword && hasPermiso('bombero:actualizar_perfil') && (
                <button
                  onClick={handleEditStart}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <MdEdit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </button>
              )}
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          <div className="px-6 py-6 space-y-8">
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              
              {/* Campos no editables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MdPerson className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{getFullName()}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Este campo no se puede modificar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RUT
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MdShield className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {formatRut(profile.run) || 'No especificado'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Este campo no se puede modificar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Registro
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MdCalendarToday className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {profile.creadoEl ? 
                        new Date(profile.creadoEl).toLocaleDateString('es-CL') : 
                        'No especificado'
                      }
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Este campo no se puede modificar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MdBadge className="h-5 w-5 text-gray-400 mr-3" />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      profile.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Este campo no se puede modificar</p>
                </div>
              </div>

              {/* Campos editables */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <div>
                      <div className="relative">
                        <MdEmail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          className={getFieldClasses('email', "pl-10 pr-3 py-3 block w-full rounded-lg shadow-sm text-gray-900")}
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                      {renderFieldError('email')}
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-white border border-gray-300 rounded-lg">
                      <MdEmail className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profile.email || 'No especificado'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Roles y Permisos */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Roles Asignados</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.roles && profile.roles.length > 0 ? (
                    profile.roles.map((role, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          role.nombre === 'Administrador' ? 'bg-red-100 text-red-800' :
                          role.nombre === 'Supervisor' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {role.nombre}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Sin roles asignados</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Los roles son asignados por un administrador</p>
              </div>

              {/* Botones de acción para modo edición */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleEditCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <MdCancel className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={updating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <MdSave className="h-4 w-4 mr-2" />
                    {updating ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </div>

            {/* Sección de Seguridad */}
            {hasPermiso('bombero:cambiar_contrasena') && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Seguridad</h3>
                
                {!isChangingPassword ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Contraseña</h4>
                        <p className="text-sm text-gray-600">Última actualización: Hace tiempo</p>
                      </div>
                      <button
                        onClick={handlePasswordChangeStart}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <MdLock className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña Actual
                      </label>
                      <div className="relative">
                        <MdLock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                          className={getFieldClasses('currentPassword', "pl-10 pr-10 py-3 block w-full rounded-lg shadow-sm text-gray-900")}
                          placeholder="Ingresa tu contraseña actual"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                        </button>
                      </div>
                      {renderFieldError('currentPassword')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <MdLock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                          className={getFieldClasses('newPassword', "pl-10 pr-10 py-3 block w-full rounded-lg shadow-sm text-gray-900")}
                          placeholder="Ingresa una nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                        </button>
                      </div>
                      {renderFieldError('newPassword')}
                      <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="relative">
                        <MdLock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                          className={getFieldClasses('confirmPassword', "pl-10 pr-10 py-3 block w-full rounded-lg shadow-sm text-gray-900")}
                          placeholder="Confirma la nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                        </button>
                      </div>
                      {renderFieldError('confirmPassword')}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setError(null);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <MdCancel className="h-4 w-4 mr-2" />
                        Cancelar
                      </button>
                      <button
                        onClick={handlePasswordChange}
                        disabled={updating}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <MdSave className="h-4 w-4 mr-2" />
                        {updating ? 'Actualizando...' : 'Cambiar Contraseña'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
