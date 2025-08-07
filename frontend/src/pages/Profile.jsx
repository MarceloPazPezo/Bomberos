import React, { useState } from 'react';
import { useProfile } from '@hooks/useProfile';
import { formatRut, formatTelefono } from '@helpers/formatData';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdCalendarToday, 
  MdEdit, 
  MdSave, 
  MdCancel,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdShield,
  MdInfo
} from 'react-icons/md';

const Profile = () => {
  const { profile, loading, error, updating, updateProfile, updatePassword, setError } = useProfile();
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

  // Mensajes de éxito
  const [successMessage, setSuccessMessage] = useState('');

  // Inicializar formulario de edición
  const handleEditStart = () => {
    setEditForm({
      email: profile?.email || '',
      telefono: profile?.telefono || '',
      fechaNacimiento: profile?.fechaNacimiento ? 
        new Date(profile.fechaNacimiento).toISOString().split('T')[0] : ''
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
    const result = await updateProfile(editForm);
    if (result.success) {
      setIsEditing(false);
      setSuccessMessage('Perfil actualizado correctamente');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  // Manejar cambio de contraseña
  const handlePasswordChange = async () => {
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

  // Toggle visibilidad de contraseñas
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdPerson className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se pudo cargar el perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="mt-2 text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <MdInfo className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <MdInfo className="h-5 w-5 text-green-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario Principal */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Mi Perfil</h2>
            {!isEditing && !isChangingPassword && (
              <button
                onClick={handleEditStart}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MdEdit className="h-4 w-4 mr-2" />
                Editar
              </button>
            )}
          </div>

          <div className="px-6 py-6 space-y-8">
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
               
              {/* Campos no editables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombres
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MdPerson className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {Array.isArray(profile.nombres) ? profile.nombres.join(' ') : profile.nombres || 'No especificado'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Este campo no se puede modificar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MdPerson className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {Array.isArray(profile.apellidos) ? profile.apellidos.join(' ') : profile.apellidos || 'No especificado'}
                    </span>
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
                      {formatRut(profile.rut) || 'No especificado'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Este campo no se puede modificar</p>
                </div>
              </div>

              {/* Campos editables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <MdEmail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 pr-3 py-3 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-white border border-gray-300 rounded-lg">
                      <MdEmail className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profile.email || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <MdPhone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={editForm.telefono}
                        onChange={(e) => setEditForm(prev => ({ ...prev, telefono: e.target.value }))}
                        className="pl-10 pr-3 py-3 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-white border border-gray-300 rounded-lg">
                      <MdPhone className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">
                        {formatTelefono(profile.telefono) || 'No especificado'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <MdCalendarToday className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={editForm.fechaNacimiento}
                        onChange={(e) => setEditForm(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
                        className="pl-10 pr-3 py-3 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-white border border-gray-300 rounded-lg">
                      <MdCalendarToday className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">
                        {profile.fechaNacimiento ? 
                          new Date(profile.fechaNacimiento).toLocaleDateString('es-CL') : 
                          'No especificado'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Roles */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Roles Asignados</h3>
              {profile.roles && profile.roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.roles.map((role, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {role.nombre || role.name || role}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Sin roles asignados</p>
              )}
            </div>

            {/* Seguridad */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Seguridad</h3>
              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <MdLock className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? 
                          <MdVisibilityOff className="h-5 w-5 text-gray-400" /> : 
                          <MdVisibility className="h-5 w-5 text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? 
                          <MdVisibilityOff className="h-5 w-5 text-gray-400" /> : 
                          <MdVisibility className="h-5 w-5 text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? 
                          <MdVisibilityOff className="h-5 w-5 text-gray-400" /> : 
                          <MdVisibility className="h-5 w-5 text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Información de Cuenta */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Cuenta</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estado</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      profile.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Miembro desde</p>
                    <p className="text-sm text-gray-900">
                      {profile.createdAt ? 
                        new Date(profile.createdAt).toLocaleDateString('es-CL') : 
                        'No disponible'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Última actualización</p>
                    <p className="text-sm text-gray-900">
                      {profile.updatedAt ? 
                        new Date(profile.updatedAt).toLocaleDateString('es-CL') : 
                        'No disponible'
                      }
                    </p>
                  </div>
                </div>
              </div>

            {/* Botones de Acción */}
            {(isEditing || isChangingPassword) && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  {isEditing && (
                    <>
                      <button
                        onClick={handleEditSave}
                        disabled={updating}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <MdSave className="h-4 w-4 mr-2" />
                        {updating ? 'Guardando...' : 'Guardar Información'}
                      </button>
                      <button
                        onClick={handleEditCancel}
                        disabled={updating}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <MdCancel className="h-4 w-4 mr-2" />
                        Cancelar
                      </button>
                    </>
                  )}
                  
                  {isChangingPassword && (
                    <>
                      <button
                        onClick={handlePasswordChange}
                        disabled={updating}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <MdLock className="h-4 w-4 mr-2" />
                        {updating ? 'Cambiando...' : 'Cambiar Contraseña'}
                      </button>
                      <button
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setError(null);
                        }}
                        disabled={updating}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <MdCancel className="h-4 w-4 mr-2" />
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;