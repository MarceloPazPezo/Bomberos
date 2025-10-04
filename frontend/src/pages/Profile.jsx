import React, { useState, useEffect } from 'react';
import { 
  MdEdit, 
  MdSave, 
  MdCancel, 
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
  MdAdd,
  MdDelete,
  MdCheck,
  MdClose,
  MdInfo,
  MdCake,
  MdWaterDrop
} from 'react-icons/md';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBomberoDetalles } from '@hooks/bomberos/useBomberoDetalles';
import { useAuth } from '@hooks/auth/useAuth';
import BomberosLoader from '@components/BomberosLoader';
import Avatar from '@components/Avatar';
import EditPersonalInfoModal from '@components/bomberos/EditPersonalInfoModal';
import EditContactoEmergenciaModal from '@components/bomberos/EditContactoEmergenciaModal';
import EditCapacitacionModal from '@components/bomberos/EditCapacitacionModal';
import EditBomberoModal from '@components/bomberos/EditBomberoModal';
import { perfilCompletoService } from '@services/perfilCompleto.service';
import { showErrorAlert, showSuccessAlert, showInfoAlert, showConfirmAlert } from '@helpers/fireAlert';
import { 
  contactoEmergenciaCreatedToast, 
  contactoEmergenciaUpdatedToast, 
  contactoEmergenciaDeletedToast,
  capacitacionCreatedToast,
  capacitacionUpdatedToast,
  capacitacionDeletedToast
} from '@helpers/toastHelper';

/**
 * Página completa de perfil del bombero con funcionalidad de edición
 * Similar al popup de ficha pero con capacidades de modificación
 */
const Profile = () => {
  const { bombero: currentBombero } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [editingSection, setEditingSection] = useState(null);
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isContactoModalOpen, setIsContactoModalOpen] = useState(false);
  const [isCapacitacionModalOpen, setIsCapacitacionModalOpen] = useState(false);
  const [isBomberoModalOpen, setIsBomberoModalOpen] = useState(false);
  const [selectedContacto, setSelectedContacto] = useState(null);
  const [selectedCapacitacion, setSelectedCapacitacion] = useState(null);

  // Hook para obtener detalles del bombero actual
  const { 
    bomberoData,
    informacionPersonal,
    contactosEmergencia,
    capacitaciones,
    historialActividades,
    eppAcargo,
    estadisticas,
    loading, 
    error, 
    reloadData
  } = useBomberoDetalles(currentBombero?.id || null);

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

  // Calcular tiempo de servicio
  const calculateServiceTime = (startDate) => {
    if (!startDate) return null;
    try {
      const today = new Date();
      const start = new Date(startDate);
      const diffTime = Math.abs(today - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      const days = diffDays % 30;
      
      if (years > 0) {
        return `${years} año${years > 1 ? 's' : ''}${months > 0 ? ` y ${months} mes${months > 1 ? 'es' : ''}` : ''}`;
      } else if (months > 0) {
        return `${months} mes${months > 1 ? 'es' : ''}${days > 0 ? ` y ${days} día${days > 1 ? 's' : ''}` : ''}`;
      } else {
        return `${days} día${days > 1 ? 's' : ''}`;
      }
    } catch {
      return null;
    }
  };

  // Obtener nombre completo
  const getNombreCompleto = () => {
    const data = bomberoData || currentBombero;
    
    if (data?.nombreCompleto) return data.nombreCompleto;
    if (data?.nombres && data?.apellidos) {
      const nombres = Array.isArray(data.nombres) ? data.nombres.join(' ') : data.nombres;
      const apellidos = Array.isArray(data.apellidos) ? data.apellidos.join(' ') : data.apellidos;
      return `${nombres} ${apellidos}`.trim();
    }
    return data?.ficha?.nombre || data?.email?.split('@')[0] || `Bombero ${data?.id}`;
  };

  // Obtener estado de servicio
  const getEstadoServicio = () => {
    const data = bomberoData || currentBombero;
    return data?.activo ? 'En Servicio' : 'Fuera de Servicio';
  };

  // Obtener color del estado
  const getEstadoColor = () => {
    const data = bomberoData || currentBombero;
    return data?.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Obtener último rol
  const getUltimoRol = () => {
    const data = bomberoData || currentBombero;
    if (data?.roles && data.roles.length > 0) {
      return data.roles[0].nombre;
    }
    return 'Sin rol asignado';
  };

  // Funciones de edición
  const handleEditSection = (section) => {
    if (section === 'personal') {
      setIsBomberoModalOpen(true);
    } else if (section === 'emergency') {
      setSelectedContacto(null);
      setIsContactoModalOpen(true);
    } else if (section === 'training') {
      setSelectedCapacitacion(null);
      setIsCapacitacionModalOpen(true);
    } else {
      setEditingSection(section);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setIsPersonalModalOpen(false);
    setIsContactoModalOpen(false);
    setIsCapacitacionModalOpen(false);
    setIsBomberoModalOpen(false);
    setSelectedContacto(null);
    setSelectedCapacitacion(null);
  };

  const handleSavePersonalInfo = async (data) => {
    try {
      await perfilCompletoService.updateInformacionPersonal(data);
      showSuccessAlert('Éxito', 'Información personal actualizada correctamente');
      // Mostrar mensaje informativo si no tenía ficha antes
      if (!bomberoData?.informacionPersonal) {
        showInfoAlert('Información', 'Se ha creado automáticamente tu ficha personal para poder gestionar tus contactos de emergencia y capacitaciones.');
      }
      setIsPersonalModalOpen(false);
      // Recargar datos
      await reloadData();
    } catch (error) {
      console.error('Error al guardar información personal:', error);
      showErrorAlert('Error', 'No se pudo actualizar la información personal');
      throw error; // Re-throw para que el modal maneje el error
    }
  };

  const handleSaveBomberoInfo = async (data) => {
    try {
      // Recargar datos después de cualquier actualización
      await reloadData();
    } catch (error) {
      console.error('Error al recargar datos del bombero:', error);
    }
  };

  const handleSaveEdit = async (section, data) => {
    try {
      // Aquí implementaremos la lógica de guardado para cada sección
      console.log(`Guardando ${section}:`, data);
      showSuccessAlert('Éxito', 'Información actualizada correctamente');
      setEditingSection(null);
      // Recargar datos
      await reloadData();
    } catch (error) {
      console.error('Error al guardar:', error);
      showErrorAlert('Error', 'No se pudo actualizar la información');
    }
  };

  // Funciones para contactos de emergencia
  const handleSaveContacto = async (data) => {
    try {
      if (selectedContacto) {
        // Actualizar contacto existente
        await perfilCompletoService.updateContactoEmergencia(selectedContacto.id, data);
        contactoEmergenciaUpdatedToast(data.nombreCompleto);
    } else {
        // Agregar nuevo contacto
        await perfilCompletoService.addContactoEmergencia(data);
        contactoEmergenciaCreatedToast(data.nombreCompleto);
        // Mostrar mensaje informativo si es el primer contacto
        if (contactosEmergencia.length === 0) {
          showInfoAlert('Información', 'Se ha creado automáticamente tu ficha personal para poder gestionar tus contactos de emergencia y capacitaciones.');
        }
      }
      setIsContactoModalOpen(false);
      setSelectedContacto(null);
      // Recargar datos del perfil
      await reloadData();
    } catch (error) {
      console.error('Error al guardar contacto de emergencia:', error);
      showErrorAlert('Error', 'No se pudo guardar el contacto de emergencia');
      throw error;
    }
  };

  const handleEditContacto = (contacto) => {
    setSelectedContacto(contacto);
    setIsContactoModalOpen(true);
  };

  const handleDeleteContacto = async (contacto) => {
    try {
      // Mostrar confirmación antes de eliminar
      const confirmResult = await showConfirmAlert(
        '¿Eliminar Contacto de Emergencia?',
        `¿Estás seguro de que quieres eliminar el contacto "${contacto.nombreCompleto}"? Esta acción no se puede deshacer.`,
        'Sí, Eliminar',
        'Cancelar'
      );

      if (!confirmResult.isConfirmed) {
        return; // Usuario canceló la acción
      }

      await perfilCompletoService.deleteContactoEmergencia(contacto.id);
      contactoEmergenciaDeletedToast(contacto.nombreCompleto);
      // Recargar datos del perfil
      await reloadData();
    } catch (error) {
      console.error('Error al eliminar contacto de emergencia:', error);
      showErrorAlert('Error', 'No se pudo eliminar el contacto de emergencia');
    }
  };

  // Funciones para capacitaciones
  const handleSaveCapacitacion = async (data) => {
    try {
      if (selectedCapacitacion) {
        // Actualizar capacitación existente
        await perfilCompletoService.updateCapacitacion(selectedCapacitacion.id, data);
        capacitacionUpdatedToast(data.tipoCapacitacion);
      } else {
        // Agregar nueva capacitación
        await perfilCompletoService.addCapacitacion(data);
        capacitacionCreatedToast(data.tipoCapacitacion);
        // Mostrar mensaje informativo si es la primera capacitación
        if (capacitaciones.length === 0) {
          showInfoAlert('Información', 'Se ha creado automáticamente tu ficha personal para poder gestionar tus contactos de emergencia y capacitaciones.');
        }
      }
      setIsCapacitacionModalOpen(false);
      setSelectedCapacitacion(null);
      // Recargar datos del perfil
      await reloadData();
    } catch (error) {
      console.error('Error al guardar capacitación:', error);
      showErrorAlert('Error', 'No se pudo guardar la capacitación');
      throw error;
    }
  };

  const handleEditCapacitacion = (capacitacion) => {
    setSelectedCapacitacion(capacitacion);
    setIsCapacitacionModalOpen(true);
  };

  const handleDeleteCapacitacion = async (capacitacion) => {
    try {
      // Mostrar confirmación antes de eliminar
      const confirmResult = await showConfirmAlert(
        '¿Eliminar Capacitación?',
        `¿Estás seguro de que quieres eliminar la capacitación "${capacitacion.tipoCapacitacion?.nombre || 'Capacitación'}"? Esta acción no se puede deshacer.`,
        'Sí, Eliminar',
        'Cancelar'
      );

      if (!confirmResult.isConfirmed) {
        return; // Usuario canceló la acción
      }

      await perfilCompletoService.deleteCapacitacion(capacitacion.id);
      capacitacionDeletedToast(capacitacion.tipoCapacitacion?.nombre || 'Capacitación');
      // Recargar datos del perfil
      await reloadData();
    } catch (error) {
      console.error('Error al eliminar capacitación:', error);
      showErrorAlert('Error', 'No se pudo eliminar la capacitación');
    }
  };

  // Mostrar loading inicial
  if (loading && !bomberoData) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl rounded-2xl p-6 flex items-center justify-center min-h-[400px]">
          <BomberosLoader size="lg" message="Cargando tu perfil..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header principal */}
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl rounded-2xl mb-3 p-4">
            <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MdPerson className="h-6 w-6 text-[#4EB9FA]" />
              <div>
              <h1 className="text-xl font-bold text-[#2C3E50]">
                Mi Perfil
              </h1>
              <p className="text-gray-600 text-xs">
                Gestiona tu información personal y profesional
              </p>
            </div>
          </div>
            </div>
          </div>

      {/* Layout principal: 1/3 imagen + 2/3 pestañas */}
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Sección de imagen de perfil (1/3) - Formato Carnet */}
          <div className="lg:w-1/3 bg-gradient-to-br from-[#4EB9FA] to-[#3A9BD9] flex flex-col relative overflow-hidden">
            {/* Patrón de fondo sutil */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-20 right-10 w-16 h-16 border-2 border-white rounded-full"></div>
              <div className="absolute top-1/2 left-5 w-12 h-12 border-2 border-white rounded-full"></div>
            </div>
            
            {/* Imagen de perfil - 75% del espacio */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-6">
              <Avatar
                src={informacionPersonal?.fotoPerfilURL || currentBombero?.ficha?.fotoPerfilURL}
                alt={`Foto de ${getNombreCompleto()}`}
                size="3xl"
                className="w-full h-full max-w-sm max-h-[400px] aspect-square rounded-xl border-4 border-white shadow-2xl"
              />
            </div>
            
            {/* Información personal tipo carnet - 25% del espacio */}
            <div className="relative z-10 bg-black/20 backdrop-blur-sm p-4">
              <div className="text-center text-white space-y-2">
                <div>
                  <h2 className="text-xl font-bold leading-tight">
                    {getNombreCompleto()}
                  </h2>
                </div>

                {(bomberoData?.run || currentBombero?.run) && (
                <div>
                    <p className="text-sm font-mono bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                      RUN: {bomberoData?.run || currentBombero?.run}
                    </p>
                  </div>
                )}

                {(informacionPersonal?.compania || currentBombero?.ficha?.compania) && (
                <div>
                    <p className="text-xs font-medium bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                      {(informacionPersonal?.compania || currentBombero?.ficha?.compania)?.nombre}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección de pestañas (2/3) */}
          <div className="lg:w-2/3 flex flex-col">
            {/* Navegación de pestañas */}
            <div className="border-b border-gray-200 bg-white">
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
            <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-h-[350px]">
            {activeTab === 'personal' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Datos Personales</h4>
                  <button
                    onClick={() => handleEditSection('personal')}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <MdEdit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <BomberosLoader size="md" message="Cargando información personal..." />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-800 font-medium">Error</span>
                </div>
                    <p className="text-red-700 mt-1">{error}</p>
              </div>
                ) : (
                  <div className="space-y-4">
                    

                    {/* Información de Contacto y Servicio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Información de Contacto */}
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h5 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                          <MdEmail className="w-4 h-4 text-green-600 mr-2" />
                          Contacto
                        </h5>
                        <div className="space-y-3">
                <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                            <div className="flex items-center space-x-2">
                              <MdEmail className="w-3 h-3 text-gray-400" />
                              <p className="text-gray-900 text-sm">{bomberoData?.email || currentBombero?.email}</p>
                            </div>
                          </div>
                          {(informacionPersonal?.telefono || currentBombero?.ficha?.telefono) && (
                    <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                              <div className="flex items-center space-x-2">
                                <MdPhone className="w-3 h-3 text-gray-400" />
                                <p className="text-gray-900 text-sm">{informacionPersonal?.telefono || currentBombero?.ficha?.telefono}</p>
                    </div>
                    </div>
                  )}
                </div>
              </div>

                      {/* Información de Servicio */}
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <h5 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                          <MdWork className="w-4 h-4 text-purple-600 mr-2" />
                          Servicio
                        </h5>
                        <div className="space-y-3">
                          {(informacionPersonal?.fechaIngreso || currentBombero?.ficha?.fechaIngreso) && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de Ingreso</label>
                              <div className="flex items-center space-x-2">
                                <MdDateRange className="w-3 h-3 text-gray-400" />
                                <p className="text-gray-900 text-sm">{formatDate(informacionPersonal?.fechaIngreso || currentBombero?.ficha?.fechaIngreso)}</p>
                              </div>
                            </div>
                          )}
                          {(informacionPersonal?.fechaIngreso || currentBombero?.ficha?.fechaIngreso) && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Tiempo de Servicio</label>
                              <div className="flex items-center space-x-2">
                                <MdTrendingUp className="w-3 h-3 text-gray-400" />
                                <p className="text-gray-900 text-sm">
                                  {calculateServiceTime(informacionPersonal?.fechaIngreso || currentBombero?.ficha?.fechaIngreso)}
                                </p>
                              </div>
                </div>
                          )}
                          {(informacionPersonal?.compania || currentBombero?.ficha?.compania) && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Compañía</label>
                              <div className="flex items-center space-x-2">
                                <MdWork className="w-3 h-3 text-gray-400" />
                                <p className="text-gray-900 text-sm">{(informacionPersonal?.compania || currentBombero?.ficha?.compania)?.nombre}</p>
              </div>
                </div>
              )}
            </div>
                      </div>
                    </div>

                    {/* Información Extra - Nuevo diseño tipo carnet */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200 shadow-lg">
                      <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <MdInfo className="w-5 h-5 text-amber-600 mr-2" />
                        Información Adicional
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Fecha de Nacimiento */}
                        {(informacionPersonal?.fechaNacimiento || currentBombero?.ficha?.fechaNacimiento) && (
                          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
                            <div className="flex items-center space-x-3">
                              <div className="bg-amber-100 p-2 rounded-lg">
                                <MdCake className="w-5 h-5 text-amber-600" />
                              </div>
            <div>
                                <label className="block text-xs font-semibold text-amber-700 mb-1">Fecha de Nacimiento</label>
                                <p className="text-gray-900 font-medium">
                                  {formatDate(informacionPersonal?.fechaNacimiento || currentBombero?.ficha?.fechaNacimiento)}
                                  {calculateAge(informacionPersonal?.fechaNacimiento || currentBombero?.ficha?.fechaNacimiento) && (
                                    <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-semibold">
                                      {calculateAge(informacionPersonal?.fechaNacimiento || currentBombero?.ficha?.fechaNacimiento)} años
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tipo de Sangre */}
                        {(informacionPersonal?.tipoSangre || currentBombero?.ficha?.tipoSangre) && (
                          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
                            <div className="flex items-center space-x-3">
                              <div className="bg-red-100 p-2 rounded-lg">
                                <MdWaterDrop className="w-5 h-5 text-red-600" />
                              </div>
                        <div>
                                <label className="block text-xs font-semibold text-amber-700 mb-1">Tipo de Sangre</label>
                                <p className="text-gray-900 font-medium">
                                  {(informacionPersonal?.tipoSangre?.nombre) || (currentBombero?.ficha?.tipoSangre?.nombre)}
                          </p>
                        </div>
                            </div>
                          </div>
                        )}

                        {/* Donante de Órganos */}
                        {(informacionPersonal?.donante || currentBombero?.ficha?.donante) && (
                          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
                            <div className="flex items-center space-x-3">
                              <div className="bg-red-100 p-2 rounded-lg">
                                <MdFavorite className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-amber-700 mb-1">Estado</label>
                                <p className="text-gray-900 font-medium">Donante de órganos</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Licencia Clase F */}
                        {(informacionPersonal?.licenciaClaseF || currentBombero?.ficha?.licenciaClaseF) && (
                          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <MdWork className="w-5 h-5 text-green-600" />
                              </div>
                        <div>
                                <label className="block text-xs font-semibold text-amber-700 mb-1">Licencia</label>
                                <p className="text-gray-900 font-medium">Clase F</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Dirección */}
                        {(() => {
                          const direccion = informacionPersonal?.direccion || currentBombero?.ficha?.direccion;
                          console.log('🏠 Profile - Dirección a mostrar:', direccion);
                          console.log('🏠 Profile - informacionPersonal:', informacionPersonal);
                          console.log('🏠 Profile - currentBombero:', currentBombero);
                          return direccion;
                        })() && (
                          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-amber-200 md:col-span-2">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <MdLocationOn className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-amber-700 mb-1">Dirección</label>
                                <p className="text-gray-900 font-medium">
                                  {(informacionPersonal?.direccion || currentBombero?.ficha?.direccion)?.calle} {(informacionPersonal?.direccion || currentBombero?.ficha?.direccion)?.numero}
                                  {(informacionPersonal?.direccion?.depto || currentBombero?.ficha?.direccion?.depto) && `, ${(informacionPersonal?.direccion?.depto || currentBombero?.ficha?.direccion?.depto)}`}
                                  {(informacionPersonal?.direccion?.comuna || currentBombero?.ficha?.direccion?.comuna) && `, ${(informacionPersonal?.direccion?.comuna || currentBombero?.ficha?.direccion?.comuna)?.nombre}`}
                                </p>
                                {(informacionPersonal?.direccion?.referencia || currentBombero?.ficha?.direccion?.referencia) && (
                          <p className="text-sm text-gray-600 mt-1">
                                    📍 {(informacionPersonal?.direccion?.referencia || currentBombero?.ficha?.direccion?.referencia)}
                          </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
                      </div>

                      {/* Mensaje si no hay información adicional */}
                      {!(informacionPersonal?.fechaNacimiento || currentBombero?.ficha?.fechaNacimiento) && 
                       !(informacionPersonal?.donante || currentBombero?.ficha?.donante) && 
                       !(informacionPersonal?.tipoSangre || currentBombero?.ficha?.tipoSangre) && 
                       !(informacionPersonal?.licenciaClaseF || currentBombero?.ficha?.licenciaClaseF) && 
                       !(informacionPersonal?.direccion || currentBombero?.ficha?.direccion) && (
                        <div className="text-center py-6">
                          <MdInfo className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                          <p className="text-amber-600 font-medium">No hay información adicional registrada</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Contactos de Emergencia</h4>
                  <button
                    onClick={() => handleEditSection('emergency')}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <MdAdd className="w-4 h-4" />
                    <span>Agregar Contacto</span>
                  </button>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <BomberosLoader size="md" message="Cargando contactos de emergencia..." />
                      </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-800 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                ) : contactosEmergencia.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contactosEmergencia.map((contacto) => (
                      <div key={contacto.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <MdEmergency className="w-8 h-8 text-blue-600 mt-1" />
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">{contacto.nombreCompleto}</h5>
                              <p className="text-sm text-gray-600">{contacto.vinculo?.nombre || 'Sin vínculo especificado'}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <MdPhone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{contacto.telefono}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditContacto(contacto)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                              title="Editar contacto"
                            >
                              <MdEdit className="w-4 h-4" />
                            </button>
                        <button
                              onClick={() => handleDeleteContacto(contacto)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                              title="Eliminar contacto"
                            >
                              <MdDelete className="w-4 h-4" />
                        </button>
                          </div>
                        </div>
                      </div>
                    ))}
                        </div>
                      ) : (
                  <div className="text-center py-8">
                    <MdEmergency className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay contactos de emergencia registrados</p>
                    <button
                      onClick={() => handleEditSection('emergency')}
                      className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mx-auto"
                    >
                      <MdAdd className="w-4 h-4" />
                      <span>Agregar primer contacto</span>
                    </button>
                  </div>
                      )}
                    </div>
            )}

            {activeTab === 'training' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Capacitaciones</h4>
                        <button
                    onClick={() => handleEditSection('training')}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                    <MdAdd className="w-4 h-4" />
                    <span>Agregar Capacitación</span>
                        </button>
                      </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <BomberosLoader size="md" message="Cargando capacitaciones..." />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-800 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                ) : capacitaciones.length > 0 ? (
                  <div className="space-y-4">
                    {capacitaciones.map((capacitacion) => (
                      <div key={capacitacion.id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
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
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditCapacitacion(capacitacion)}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                              title="Editar capacitación"
                            >
                              <MdEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCapacitacion(capacitacion)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                              title="Eliminar capacitación"
                            >
                              <MdDelete className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                            </div>
                          ) : (
                  <div className="text-center py-8">
                    <MdSchool className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay capacitaciones registradas</p>
                    <button
                      onClick={() => handleEditSection('training')}
                      className="mt-4 flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors mx-auto"
                    >
                      <MdAdd className="w-4 h-4" />
                      <span>Agregar primera capacitación</span>
                    </button>
                            </div>
                          )}
                        </div>
                      )}


            {activeTab === 'history' && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">Historial de Actividades</h4>
                
                {/* Mensaje de en desarrollo */}
                <div className="text-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                      <MdHistory className="w-10 h-10 text-yellow-600" />
                    </div>
                    <div className="max-w-md">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Funcionalidad en Desarrollo
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        El historial de actividades está siendo desarrollado. Pronto podrás ver un registro completo de tus eventos, incidentes y actividades como bombero.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span>Próximamente disponible</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Modal de edición de información personal */}
      <EditPersonalInfoModal
        isOpen={isPersonalModalOpen}
        bombero={bomberoData || currentBombero}
        onClose={handleCancelEdit}
        onSave={handleSavePersonalInfo}
      />

      {/* Modal de edición de contactos de emergencia */}
      <EditContactoEmergenciaModal
        isOpen={isContactoModalOpen}
        contacto={selectedContacto}
        onClose={handleCancelEdit}
        onSave={handleSaveContacto}
      />

      {/* Modal de edición de capacitaciones */}
      <EditCapacitacionModal
        isOpen={isCapacitacionModalOpen}
        capacitacion={selectedCapacitacion}
        onClose={handleCancelEdit}
        onSave={handleSaveCapacitacion}
      />

      {/* Modal de edición de bombero */}
      <EditBomberoModal
        isOpen={isBomberoModalOpen}
        bombero={bomberoData || currentBombero}
        onClose={handleCancelEdit}
        onSave={handleSaveBomberoInfo}
      />
    </div>
  );
};

export default Profile;