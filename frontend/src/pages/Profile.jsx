import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useProfile } from '@hooks/bomberos/useProfile';
import { useAuth } from '@hooks/auth/useAuth';
import { formatRut } from '@helpers/formatData';
import LoadingPage from '@components/LoadingPage';
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
  MdCalendarToday,
  MdCheck,
  MdClose
} from 'react-icons/md';

const Profile = () => {
  const { hasPermiso, bombero, bomberoPermisos } = useAuth();
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

  // Función para validar la seguridad de la contraseña
  const validatePasswordSecurity = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)
    };
    
    const isValid = Object.values(requirements).every(req => req);
    return { requirements, isValid };
  };

  // Función para manejar cambios en los campos de contraseña
  const handlePasswordFieldChange = (fieldName, value) => {
    clearFieldError(fieldName);
    setPasswordForm(prev => ({ ...prev, [fieldName]: value }));
  };

  // Inicializar formulario de edición
  const handleEditStart = () => {
    if (!hasPermiso('bombero:actualizar_perfil')) {
      toast.error('No tienes permisos para editar el perfil', {
        position: "top-right",
        autoClose: 4000,
        icon: "🚫",
      });
      return;
    }
    setEditForm({
      email: profile?.email || '',
    });
    setIsEditing(true);
    setError(null);
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
      toast.success('Perfil actualizado correctamente', {
        position: "bottom-right",
        autoClose: 3000,
      });
    } else {
      toast.error(result.error || 'Error al actualizar el perfil', {
        position: "bottom-right",
        autoClose: 5000,
      });
    }
  };

  // Función para inicializar cambio de contraseña
  const handlePasswordChangeStart = () => {
    if (!hasPermiso('bombero:cambiar_contrasena')) {
      toast.error('No tienes permisos para cambiar la contraseña', {
        position: "top-right",
        autoClose: 4000,
        icon: "🚫",
      });
      return;
    }
    setIsChangingPassword(true);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError(null);
  };

  // Función para cancelar cambio de contraseña
  const handlePasswordChangeCancel = () => {
    setIsChangingPassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError(null);
    // Limpiar cualquier error de campo específico
    Object.keys(fieldErrors).forEach(field => {
      if (field.includes('Password') || field.includes('password')) {
        clearFieldError(field);
      }
    });
  };

  // Manejar cambio de contraseña
  const handlePasswordChange = async () => {
    // Limpiar errores previos
    setError(null);
    
    // Validaciones locales
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden', {
        position: "top-right",
        autoClose: 4000,
        icon: "⚠️",
      });
      return;
    }

    // Validar seguridad de la contraseña
    const { isValid, requirements } = validatePasswordSecurity(passwordForm.newPassword);
    if (!isValid) {
      const missingRequirements = [];
      if (!requirements.minLength) missingRequirements.push('al menos 8 caracteres');
      if (!requirements.hasUppercase) missingRequirements.push('una letra mayúscula');
      if (!requirements.hasLowercase) missingRequirements.push('una letra minúscula');
      if (!requirements.hasNumber) missingRequirements.push('un número');
      if (!requirements.hasSpecialChar) missingRequirements.push('un carácter especial');
      
      toast.error(`La contraseña debe contener: ${missingRequirements.join(', ')}`, {
        position: "top-right",
        autoClose: 6000,
        icon: "🔐",
      });
      return;
    }

    const result = await updatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });

    if (result.success) {
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('¡Contraseña actualizada correctamente!', {
        position: "top-right",
        autoClose: 4000,
        icon: "🔐",
      });
    } else {
      // Los errores ya fueron manejados por el hook useProfile
      // Solo necesitamos asegurarnos de que se muestren
      if (result.error && !result.fieldErrors) {
        toast.error(result.error, {
          position: "top-right",
          autoClose: 5000,
        });
      } else if (result.fieldErrors && result.fieldErrors.currentPassword) {
        toast.error('La contraseña actual es incorrecta', {
          position: "top-right",
          autoClose: 5000,
          icon: "🔒",
        });
      }
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

  // Función para obtener la fecha de última actualización de contraseña
  const getPasswordLastUpdate = () => {
    if (!profile?.actualizadoEl) {
      return 'No disponible';
    }
    
    const updateDate = new Date(profile.actualizadoEl);
    const now = new Date();
    const diffTime = Math.abs(now - updateDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Menos de 1 minuto
    if (diffMinutes < 1) {
      return 'Hace un momento';
    }
    
    // Entre 1 y 59 minutos
    if (diffMinutes < 60) {
      return diffMinutes === 1 ? 'Hace 1 minuto' : `Hace ${diffMinutes} minutos`;
    }
    
    // Entre 1 y 23 horas
    if (diffHours < 24) {
      return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
    }
    
    // Entre 1 y 6 días
    if (diffDays <= 6) {
      return diffDays === 1 ? 'Hace 1 día' : `Hace ${diffDays} días`;
    }
    
    // Más de 6 días: mostrar fecha completa
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return updateDate.toLocaleDateString('es-CL', options);
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

  if (loading) {
    return <LoadingPage message="Cargando perfil..." />;
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
                        <p className="text-sm text-gray-600">
                          Última actualización: {getPasswordLastUpdate()}
                        </p>
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
                      {fieldErrors.currentPassword ? (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <MdClose className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-red-600">
                              Verifica que hayas ingresado correctamente tu contraseña actual
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          Ingresa la contraseña que usas actualmente para iniciar sesión
                        </p>
                      )}
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
                      
                      {/* Indicadores de requisitos de seguridad */}
                      {passwordForm.newPassword && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de seguridad:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {(() => {
                              const { requirements } = validatePasswordSecurity(passwordForm.newPassword);
                              return [
                                { key: 'minLength', text: 'Al menos 8 caracteres', valid: requirements.minLength },
                                { key: 'hasUppercase', text: 'Una letra mayúscula', valid: requirements.hasUppercase },
                                { key: 'hasLowercase', text: 'Una letra minúscula', valid: requirements.hasLowercase },
                                { key: 'hasNumber', text: 'Un número', valid: requirements.hasNumber },
                                { key: 'hasSpecialChar', text: 'Un carácter especial', valid: requirements.hasSpecialChar }
                              ].map(({ key, text, valid }) => (
                                <div key={key} className="flex items-center">
                                  {valid ? (
                                    <MdCheck className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                  ) : (
                                    <MdClose className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                                  )}
                                  <span className={`text-xs ${valid ? 'text-green-600' : 'text-red-600'}`}>
                                    {text}
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
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
                      
                      {/* Indicador de coincidencia de contraseñas */}
                      {passwordForm.confirmPassword && (
                        <div className="mt-2">
                          {passwordForm.newPassword === passwordForm.confirmPassword ? (
                            <div className="flex items-center">
                              <MdCheck className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-xs text-green-600">Las contraseñas coinciden</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <MdClose className="h-4 w-4 text-red-500 mr-2" />
                              <span className="text-xs text-red-600">Las contraseñas no coinciden</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handlePasswordChangeCancel}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <MdCancel className="h-4 w-4 mr-2" />
                        Cancelar
                      </button>
                      <button
                        onClick={handlePasswordChange}
                        disabled={
                          updating || 
                          !passwordForm.currentPassword || 
                          !passwordForm.newPassword || 
                          !passwordForm.confirmPassword ||
                          passwordForm.newPassword !== passwordForm.confirmPassword ||
                          !validatePasswordSecurity(passwordForm.newPassword).isValid
                        }
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
