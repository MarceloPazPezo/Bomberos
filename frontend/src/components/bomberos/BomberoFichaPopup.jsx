import React, { useState, useEffect } from 'react';
import { 
  MdClose, 
  MdEdit, 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdLocationOn,
  MdDateRange,
  MdWork,
  MdTrendingUp,
  MdEmergency,
  MdSchool,
  MdFavorite,
  MdHistory,
  MdCheckCircle,
  MdCancel,
  MdError
} from 'react-icons/md';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBomberoDetalles } from '@hooks/bomberos/useBomberoDetalles';
import BomberosLoader from '@components/BomberosLoader';
import BomberoAvatar from './BomberoAvatar';

/**
 * Componente popup para mostrar la ficha completa del bombero
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.bombero - Datos del bombero
 * @param {boolean} props.isOpen - Si el popup está abierto
 * @param {Function} props.onClose - Función para cerrar el popup
 * @param {Function} props.onEdit - Función para editar (opcional)
 * @returns {JSX.Element} Componente popup de ficha de bombero
 */
const BomberoFichaPopup = ({ bombero, isOpen, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('personal');
  
  // Hook para obtener detalles del bombero
  const {
    bomberoData,
    informacionPersonal,
    contactosEmergencia,
    capacitaciones,
    historialActividades,
    eppAcargo,
    estadisticas,
    loading,
    error
  } = useBomberoDetalles(bombero?.id || null);

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Calcular edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  // Obtener nombre completo (usar datos de la API si están disponibles)
  const getNombreCompleto = () => {
    const data = bomberoData || bombero;
    
    if (data.nombreCompleto) return data.nombreCompleto;
    if (data.nombres && data.apellidos) {
      const nombres = Array.isArray(data.nombres) ? data.nombres.join(' ') : data.nombres;
      const apellidos = Array.isArray(data.apellidos) ? data.apellidos.join(' ') : data.apellidos;
      return `${nombres} ${apellidos}`.trim();
    }
    return data.ficha?.nombre || data.email?.split('@')[0] || `Bombero ${data.id}`;
  };

  // Obtener estado de servicio
  const getEstadoServicio = () => {
    const data = bomberoData || bombero;
    return data.activo ? 'En Servicio' : 'Fuera de Servicio';
  };

  // Obtener color del estado
  const getEstadoColor = () => {
    const data = bomberoData || bombero;
    return data.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Obtener último rol
  const getUltimoRol = () => {
    const data = bomberoData || bombero;
    if (data.roles && data.roles.length > 0) {
      return data.roles[0].nombre;
    }
    return 'Sin rol asignado';
  };

  if (!isOpen || !bombero) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header del popup */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 text-white hover:bg-red-500 hover:bg-opacity-80 rounded-lg transition-colors"
          >
            <MdClose className="w-6 h-6 text-red-300 hover:text-white" />
          </button>
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Ficha de Bombero</h2>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(bombero)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <MdEdit className="w-4 h-4" />
                  <span>Editar Perfil</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Tarjeta principal del bombero */}
          <div className="p-6 bg-gray-50">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="shrink-0">
                <BomberoAvatar
                  src={bombero.ficha?.fotoPerfilURL}
                  alt={`Foto de ${getNombreCompleto()}`}
                  nombre={getNombreCompleto()}
                  size="2xl"
                  showBorder={true}
                  borderColor="border-gray-200"
                  isRound={true}
                  bombero={bombero}
                />
              </div>

              {/* Información principal */}
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {getNombreCompleto()}
                </h3>
                
                {/* Información de contacto */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MdEmail className="w-4 h-4" />
                    <span>{bombero.email}</span>
                  </div>
                  {bombero.ficha?.telefono && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MdPhone className="w-4 h-4" />
                      <span>{bombero.ficha.telefono}</span>
                    </div>
                  )}
                </div>

                {/* Estados y fechas */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col">
                    <div className="flex space-x-2 mb-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEstadoColor()}`}>
                        {getEstadoServicio()}
                      </span>
                      <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                        {getUltimoRol()}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {bombero.ficha?.fechaIngreso && (
                        <div className="flex items-center space-x-2">
                          <MdDateRange className="w-4 h-4" />
                          <span>Ingreso: {formatDate(bombero.ficha.fechaIngreso)}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <MdTrendingUp className="w-4 h-4" />
                        <span>Última actividad: Hoy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Navegación de pestañas */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
            {[
              { id: 'personal', label: 'Información Personal', icon: MdPerson },
              { id: 'emergency', label: 'Contactos de Emergencia', icon: MdEmergency },
              { id: 'training', label: 'Capacitación', icon: MdSchool },
              { id: 'history', label: 'Historial', icon: MdHistory }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6 bg-gray-50">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <BomberosLoader size="md" message="Cargando información del bombero..." />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <MdError className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Datos Personales */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                          <p className="text-gray-900">{getNombreCompleto()}</p>
                        </div>
                        {(bomberoData?.run || bombero.run) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">RUN</label>
                            <p className="text-gray-900 font-mono">{bomberoData?.run || bombero.run}</p>
                          </div>
                        )}
                        {(informacionPersonal?.fechaNacimiento || bombero.ficha?.fechaNacimiento) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                            <p className="text-gray-900">
                              {formatDate(informacionPersonal?.fechaNacimiento || bombero.ficha?.fechaNacimiento)} 
                              {calculateAge(informacionPersonal?.fechaNacimiento || bombero.ficha?.fechaNacimiento) && ` (${calculateAge(informacionPersonal?.fechaNacimiento || bombero.ficha?.fechaNacimiento)} años)`}
                            </p>
                          </div>
                        )}
                        {(informacionPersonal?.direccion || bombero.ficha?.direccion) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <div className="flex items-center space-x-2">
                              <MdLocationOn className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <p className="text-gray-900">
                                  {(informacionPersonal?.direccion || bombero.ficha?.direccion)?.calle} {(informacionPersonal?.direccion || bombero.ficha?.direccion)?.numero}
                                  {(informacionPersonal?.direccion?.depto || bombero.ficha?.direccion?.depto) && `, ${(informacionPersonal?.direccion?.depto || bombero.ficha?.direccion?.depto)}`}
                                  {(informacionPersonal?.direccion?.comuna || bombero.ficha?.direccion?.comuna) && `, ${(informacionPersonal?.direccion?.comuna || bombero.ficha?.direccion?.comuna)?.nombre}`}
                                </p>
                                {(informacionPersonal?.direccion?.referencia || bombero.ficha?.direccion?.referencia) && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    📍 {(informacionPersonal?.direccion?.referencia || bombero.ficha?.direccion?.referencia)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información de Contacto */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <div className="flex items-center space-x-2">
                            <MdEmail className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900">{bomberoData?.email || bombero.email}</p>
                          </div>
                        </div>
                        {(informacionPersonal?.telefono || bombero.ficha?.telefono) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <div className="flex items-center space-x-2">
                              <MdPhone className="w-4 h-4 text-gray-400" />
                              <p className="text-gray-900">{informacionPersonal?.telefono || bombero.ficha?.telefono}</p>
                            </div>
                          </div>
                        )}
                        {(informacionPersonal?.fechaIngreso || bombero.ficha?.fechaIngreso) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                            <div className="flex items-center space-x-2">
                              <MdDateRange className="w-4 h-4 text-gray-400" />
                              <p className="text-gray-900">{formatDate(informacionPersonal?.fechaIngreso || bombero.ficha?.fechaIngreso)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información Médica */}
                    <div className="col-span-2">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Médica</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Información médica disponible */}
                        {(informacionPersonal?.donante || bombero.ficha?.donante) && (
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-2">
                              <MdFavorite className="w-5 h-5 text-red-600" />
                              <span className="font-medium text-red-800">Donante de órganos</span>
                            </div>
                          </div>
                        )}
                        
                        {(informacionPersonal?.tipoSangre || bombero.ficha?.tipoSangre) && (
                          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                            <div className="flex items-center space-x-2">
                              <MdFavorite className="w-5 h-5 text-pink-600" />
                              <span className="font-medium text-pink-800">
                                Tipo: {(informacionPersonal?.tipoSangre?.nombre) || (bombero.ficha?.tipoSangre?.nombre)}
                              </span>
                            </div>
                          </div>
                        )}

                        {(informacionPersonal?.licenciaClaseF || bombero.ficha?.licenciaClaseF) && (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2">
                              <MdWork className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-green-800">Licencia Clase F</span>
                            </div>
                          </div>
                        )}

                        {/* Mensaje si no hay información médica */}
                        {!(informacionPersonal?.donante || bombero.ficha?.donante) && 
                         !(informacionPersonal?.tipoSangre || bombero.ficha?.tipoSangre) && 
                         !(informacionPersonal?.licenciaClaseF || bombero.ficha?.licenciaClaseF) && (
                          <div className="col-span-2 text-center py-6">
                            <MdFavorite className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 text-sm">No hay información médica registrada</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Contactos de Emergencia</h4>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <BomberosLoader size="md" message="Cargando contactos de emergencia..." />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <MdError className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                ) : contactosEmergencia.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contactosEmergencia.map((contacto) => (
                      <div key={contacto.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <MdEmergency className="w-8 h-8 text-blue-600" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{contacto.nombreCompleto}</h5>
                            <p className="text-sm text-gray-600">{contacto.vinculo?.nombre || 'Sin vínculo especificado'}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <MdPhone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{contacto.telefono}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MdEmergency className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay contactos de emergencia registrados</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'training' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Capacitaciones</h4>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <BomberosLoader size="md" message="Cargando capacitaciones..." />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <MdError className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                ) : capacitaciones.length > 0 ? (
                  <div className="space-y-4">
                    {capacitaciones.map((capacitacion) => (
                      <div key={capacitacion.id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-start space-x-3">
                          <MdSchool className="w-6 h-6 text-green-600 mt-1" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">
                              {capacitacion.tipoCapacitacion?.nombre || 'Capacitación'}
                            </h5>
                            {capacitacion.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">{capacitacion.descripcion}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <MdDateRange className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Registrada: {formatDate(capacitacion.creadoEl)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MdSchool className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay capacitaciones registradas</p>
                  </div>
                )}
              </div>
            )}


            {activeTab === 'history' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Historial de Actividades</h4>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <BomberosLoader size="md" message="Cargando historial de actividades..." />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <MdError className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                ) : historialActividades.length > 0 ? (
                  <div className="space-y-4">
                    {historialActividades.map((actividad) => (
                      <div key={actividad.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            actividad.tipo === 'evento' ? 'bg-blue-500' :
                            actividad.tipo === 'incidente' ? 'bg-red-500' :
                            actividad.tipo === 'accidente' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-semibold text-gray-900">{actividad.titulo}</h5>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                actividad.estado === 'asistido' ? 'bg-green-100 text-green-800' :
                                actividad.estado === 'accidentado' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {actividad.estado}
                              </span>
                            </div>
                            {actividad.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">{actividad.descripcion}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <MdDateRange className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatDate(actividad.fecha)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MdHistory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay historial de actividades registrado</p>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BomberoFichaPopup;
