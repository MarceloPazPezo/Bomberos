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
  MdShield
} from 'react-icons/md';

const Profile = () => {
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
    // Limpiar error del campo cuando el usuario empiece a escribir
    clearFieldError(fieldName);
    
    if (isEditing) {
      setEditForm(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  // Función para manejar cambios en los campos de contraseña
  const handlePasswordFieldChange = (fieldName, value) => {
    // Limpiar error del campo cuando el usuario empiece a escribir
    clearFieldError(fieldName);
    
    setPasswordForm(prev => ({ ...prev, [fieldName]: value }));
  };

  // Inicializar formulario de edición
  const handleEditStart = () => {
    setEditForm({
      email: profile?.email || '',
      telefono: profile?.telefono || '',
      fechaNacimiento: profile?.fechaNacimiento ? 
        new Date(profile.fechaNacimiento).toISOString().split('T')[0] : '',
      direccion: profile?.direccion || '',
      tipoSangre: profile?.tipoSangre || '',
      alergias: Array.isArray(profile?.alergias) ? profile.alergias.join(', ') : profile?.alergias || '',
      medicamentos: Array.isArray(profile?.medicamentos) ? profile.medicamentos.join(', ') : profile?.medicamentos || '',
      condiciones: Array.isArray(profile?.condiciones) ? profile.condiciones.join(', ') : profile?.condiciones || ''
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
    // Crear una copia del formulario para modificar
    const formData = { ...editForm };
    
    // Transformar alergias, medicamentos y condiciones en arrays separados solo por comas
    formData.alergias = formData.alergias.split(',').map(item => item.trim()).filter(item => item !== '');
    formData.medicamentos = formData.medicamentos.split(',').map(item => item.trim()).filter(item => item !== '');
    formData.condiciones = formData.condiciones.split(',').map(item => item.trim()).filter(item => item !== '');
    
    // Si el tipo de sangre está vacío o es "No especificado", no lo incluir en los datos
    if (!formData.tipoSangre || formData.tipoSangre === '') {
      delete formData.tipoSangre;
    }

    // Si las fechas están vacías, no las incluir en los datos
    if (!formData.fechaNacimiento || formData.fechaNacimiento === '') {
      delete formData.fechaNacimiento;
    }

    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
      setSuccessMessage('Perfil actualizado correctamente');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
    // Los errores por campo se manejan automáticamente en el hook
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
    // Los errores por campo se manejan automáticamente en el hook
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
              {!isEditing && !isChangingPassword && (
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                      {formatRut(profile.run) || 'No especificado'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Este campo no se puede modificar</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de ingreso
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MdCalendarToday className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {profile.fechaIngreso ? 
                        new Date(profile.fechaIngreso).toLocaleDateString('es-CL') : 
                        'No especificado'
                      }
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <div>
                      <div className="relative">
                        <MdPhone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={editForm.telefono}
                          onChange={(e) => handleFieldChange('telefono', e.target.value)}
                          className={getFieldClasses('telefono', "pl-10 pr-3 py-3 block w-full rounded-lg shadow-sm text-gray-900")}
                          placeholder="+56 9 1234 5678"
                        />
                      </div>
                      {renderFieldError('telefono')}
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
                    <div>
                      <div className="relative">
                        <MdCalendarToday className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          value={editForm.fechaNacimiento}
                          onChange={(e) => handleFieldChange('fechaNacimiento', e.target.value)}
                          className={getFieldClasses('fechaNacimiento', "pl-10 pr-3 py-3 block w-full rounded-lg shadow-sm text-gray-900")}
                        />
                      </div>
                      {renderFieldError('fechaNacimiento')}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={editForm.direccion}
                        onChange={(e) => handleFieldChange('direccion', e.target.value)}
                        className={getFieldClasses('direccion', "px-3 py-3 block w-full rounded-lg shadow-sm text-gray-900")}
                        placeholder="Av. Principal 123, Santiago"
                      />
                      {renderFieldError('direccion')}
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-white border border-gray-300 rounded-lg">
                      <span className="text-gray-900">{profile.direccion || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Sangre
                  </label>
                  {isEditing ? (
                    <div>
                      <select
                        value={editForm.tipoSangre}
                        onChange={(e) => handleFieldChange('tipoSangre', e.target.value)}
                        className={getFieldClasses('tipoSangre', "px-3 py-3 block w-full rounded-lg shadow-sm text-gray-900")}
                      >
                        <option value="">No especificado</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                      {renderFieldError('tipoSangre')}
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-white border border-gray-300 rounded-lg">
                      <span className="text-gray-900">{profile.tipoSangre || 'No especificado'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información médica */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Información Médica</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alergias
                    </label>
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editForm.alergias}
                          onChange={(e) => handleFieldChange('alergias', e.target.value)}
                          rows={3}
                          className={getFieldClasses('alergias', "px-3 py-3 block w-full rounded-lg shadow-sm text-gray-900")}
                          placeholder="Polen de abedul, frutos secos, mariscos (separar por comas)"
                        />
                        {renderFieldError('alergias')}
                      </div>
                    ) : (
                      <div className="p-3 bg-white border border-gray-300 rounded-lg">
                        <span className="text-gray-900">{profile.alergias || 'No especificado'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medicamentos
                    </label>
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editForm.medicamentos}
                          onChange={(e) => handleFieldChange('medicamentos', e.target.value)}
                          rows={3}
                          className={getFieldClasses('medicamentos', "px-3 py-3 block w-full rounded-lg shadow-sm text-gray-900")}
                          placeholder="Aspirina 100mg, Losartán 50mg, Vitamina D (separar por comas)"
                        />
                        {renderFieldError('medicamentos')}
                      </div>
                    ) : (
                      <div className="p-3 bg-white border border-gray-300 rounded-lg">
                        <span className="text-gray-900">{profile.medicamentos || 'No especificado'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condiciones médicas
                    </label>
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editForm.condiciones}
                          onChange={(e) => handleFieldChange('condiciones', e.target.value)}
                          rows={3}
                          className={getFieldClasses('condiciones', "px-3 py-3 block w-full rounded-lg shadow-sm text-gray-900")}
                          placeholder="Hipertensión arterial, Diabetes tipo 2, Asma bronquial (separar por comas)"
                        />
                        {renderFieldError('condiciones')}
                      </div>
                    ) : (
                      <div className="p-3 bg-white border border-gray-300 rounded-lg">
                        <span className="text-gray-900">{profile.condiciones || 'No especificado'}</span>
                      </div>
                    )}
                  </div>
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
                    <div>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                          className={getFieldClasses('currentPassword', "block w-full pr-10 pl-3 py-3 rounded-lg shadow-sm text-gray-900")}
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
                      {renderFieldError('currentPassword')}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva Contraseña
                    </label>
                    <div>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                          className={getFieldClasses('newPassword', "block w-full pr-10 pl-3 py-3 rounded-lg shadow-sm text-gray-900")}
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
                      {renderFieldError('newPassword')}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <div>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                          className={getFieldClasses('confirmPassword', "block w-full pr-10 pl-3 py-3 rounded-lg shadow-sm text-gray-900")}
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
                      {renderFieldError('confirmPassword')}
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
                      {profile.fechaIngreso ? 
                        new Date(profile.fechaIngreso).toLocaleDateString('es-CL') : 
                        (profile.fechaCreacion ? 
                          new Date(profile.fechaCreacion).toLocaleDateString('es-CL') : 
                          'No disponible'
                        )
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Última actualización</p>
                    <p className="text-sm text-gray-900">
                      {profile.fechaActualizacion ? 
                        new Date(profile.fechaActualizacion).toLocaleDateString('es-CL') : 
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