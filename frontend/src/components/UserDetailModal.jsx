import React from 'react';
import { MdClose, MdPerson, MdEmail, MdPhone, MdCalendarToday, MdLocationOn, MdLocalHospital, MdWarning, MdMedication, MdHealthAndSafety, MdSchedule, MdUpdate, MdPersonAdd } from 'react-icons/md';
import { formatRut, formatTelefono } from '@helpers/formatData';
import PropTypes from 'prop-types';

const UserDetailModal = ({ show, setShow, userData }) => {
  if (!show || !userData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFullName = () => {
    const nombres = Array.isArray(userData.nombres) ? userData.nombres.join(' ') : userData.nombres || '';
    const apellidos = Array.isArray(userData.apellidos) ? userData.apellidos.join(' ') : userData.apellidos || '';
    return `${nombres} ${apellidos}`.trim() || 'Sin nombre';
  };

  const handleClose = () => {
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-4xl max-h-[90vh] p-0 animate-fade-in flex flex-col rounded-2xl bg-white/90 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-[#4EB9FA]/20 bg-gradient-to-r from-[#4EB9FA]/10 to-transparent">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#2C3E50]">Detalles del Usuario</h2>
            <p className="text-sm text-gray-600 mt-1">{getFullName()}</p>
          </div>
          <button
            className="p-2 rounded-full bg-white border border-[#4EB9FA]/30 hover:bg-[#4EB9FA]/10 transition"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Información Personal */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 flex items-center gap-2">
                  <MdPerson className="w-5 h-5" />
                  Información Personal
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nombres</label>
                      <p className="text-gray-900 mt-1">{Array.isArray(userData.nombres) ? userData.nombres.join(' ') : userData.nombres || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Apellidos</label>
                      <p className="text-gray-900 mt-1">{Array.isArray(userData.apellidos) ? userData.apellidos.join(' ') : userData.apellidos || 'No especificado'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">RUT</label>
                    <p className="text-gray-900 mt-1 font-mono">{formatRut(userData.run) || 'No especificado'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MdCalendarToday className="w-4 h-4" />
                      Fecha de Nacimiento
                    </label>
                    <p className="text-gray-900 mt-1">{formatDate(userData.fechaNacimiento)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MdSchedule className="w-4 h-4" />
                      Fecha de Ingreso
                    </label>
                    <p className="text-gray-900 mt-1">{formatDate(userData.fechaIngreso)}</p>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div>
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">Contacto</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MdEmail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="text-gray-900 mt-1">{userData.email || 'No especificado'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MdPhone className="w-4 h-4" />
                      Teléfono
                    </label>
                    <p className="text-gray-900 mt-1 font-mono">{formatTelefono(userData.telefono) || 'No especificado'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MdLocationOn className="w-4 h-4" />
                      Dirección
                    </label>
                    <p className="text-gray-900 mt-1">{userData.direccion || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Médica y Roles */}
            <div className="space-y-6">
              
              {/* Información Médica */}
              <div>
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 flex items-center gap-2">
                  <MdLocalHospital className="w-5 h-5" />
                  Información Médica
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MdHealthAndSafety className="w-4 h-4" />
                      Tipo de Sangre
                    </label>
                    <p className="text-gray-900 mt-1">
                      {userData.tipoSangre || 'No especificado'}
                      {userData.tipoSangre && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          {userData.tipoSangre}
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MdWarning className="w-4 h-4" />
                      Alergias
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 text-sm whitespace-pre-wrap">
                        {userData.alergias || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MdMedication className="w-4 h-4" />
                      Medicamentos
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 text-sm whitespace-pre-wrap">
                        {userData.medicamentos || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MdLocalHospital className="w-4 h-4" />
                      Condiciones Médicas
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 text-sm whitespace-pre-wrap">
                        {userData.condiciones || 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roles y Estado */}
              <div>
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">Roles y Estado</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Roles Asignados</label>
                    <div className="mt-2">
                      {userData.roles && userData.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {userData.roles.map((role, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {role.nombre || role.name || role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Sin roles asignados</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Estado</label>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                        userData.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${userData.activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {userData.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Sistema */}
              <div>
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">Información del Sistema</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <MdPersonAdd className="w-4 h-4" />
                      Creado por:
                    </span>
                    <span className="text-gray-900">{userData.createdBy || 'Sistema'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <MdSchedule className="w-4 h-4" />
                      Fecha de creación:
                    </span>
                    <span className="text-gray-900">{formatDateTime(userData.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <MdUpdate className="w-4 h-4" />
                      Última actualización:
                    </span>
                    <span className="text-gray-900">{formatDateTime(userData.updatedAt)}</span>
                  </div>
                  {userData.updatedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actualizado por:</span>
                      <span className="text-gray-900">{userData.updatedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#4EB9FA]/20 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-[#2C3E50] bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

UserDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  userData: PropTypes.object
};

export default UserDetailModal;
