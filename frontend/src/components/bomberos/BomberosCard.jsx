import React from 'react';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdDateRange, 
  MdDriveEta, 
  MdBloodtype,
  MdLocationOn,
  MdWork,
  MdVisibility,
  MdCheckCircle,
  MdCancel,
  MdInfo,
  MdBadge,
  MdFavorite,
  MdSecurity,
  MdStar
} from 'react-icons/md';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import BomberoAvatar from './BomberoAvatar';

/**
 * Componente para mostrar la información de un bombero en formato de tarjeta estilo DNI
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.bombero - Datos del bombero
 * @param {Function} props.onViewDetails - Función para ver detalles
 * @param {boolean} props.showActions - Si mostrar botones de acción
 * @param {boolean} props.showCompanyInfo - Si mostrar información de la compañía
 * @returns {JSX.Element} Componente de tarjeta de bombero
 */
const BomberosCard = ({ 
  bombero, 
  onViewDetails, 
  showActions = true,
  showCompanyInfo = false
}) => {
  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Función para obtener el nombre completo del bombero
  const getNombreCompleto = () => {
    if (bombero.nombreCompleto) return bombero.nombreCompleto;
    
    if (bombero.nombres && bombero.apellidos) {
      const nombres = Array.isArray(bombero.nombres) ? bombero.nombres.join(' ') : bombero.nombres;
      const apellidos = Array.isArray(bombero.apellidos) ? bombero.apellidos.join(' ') : bombero.apellidos;
      return `${nombres} ${apellidos}`.trim();
    }
    
    return bombero.ficha?.nombre || bombero.email?.split('@')[0] || `Bombero ${bombero.id}`;
  };



  // Función para obtener el color del estado
  const getEstadoColor = (activo) => {
    return activo ? 'text-green-600' : 'text-red-600';
  };

  // Función para obtener el icono del estado
  const getEstadoIcon = (activo) => {
    return activo ? MdCheckCircle : MdCancel;
  };

  return (
    <div className={`rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 overflow-hidden group w-full h-full min-w-[350px] ${
      bombero.activo 
        ? 'bg-white border-blue-200 hover:border-blue-300' 
        : 'bg-red-50/30 border-red-200 hover:border-red-300'
    }`}>
      {/* Header estilo DNI */}
      <div className={`text-white p-6 relative ${
        bombero.activo 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
          : 'bg-gradient-to-r from-red-500 to-red-600'
      }`}>
        {/* Estado mejorado en la esquina superior derecha */}
        <div className="absolute top-3 right-3">
          <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-full backdrop-blur-sm ${
            bombero.activo 
              ? 'bg-green-500/20 border border-green-300/30' 
              : 'bg-red-500/20 border border-red-300/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              bombero.activo ? 'bg-green-300 animate-pulse' : 'bg-red-300'
            }`}></div>
            <span className="text-xs font-semibold text-white">
              {bombero.activo ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>
        </div>

        <div className="flex items-start space-x-4 pt-2">
          {/* Foto de perfil más grande */}
          <BomberoAvatar
            src={bombero.ficha?.fotoPerfilURL}
            alt={`Foto de ${getNombreCompleto()}`}
            nombre={getNombreCompleto()}
            size="xl"
            showBorder={true}
            borderColor="border-white"
            bombero={bombero}
          />

          {/* Información básica */}
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="text-lg font-bold text-white truncate">
              {getNombreCompleto()}
            </h3>
            
            {/* RUN */}
            {bombero.run && (
              <div className="text-base text-blue-100">
                <span className="font-semibold">RUN: </span>
                <span className="font-mono">{bombero.run}</span>
              </div>
            )}

            {/* Email */}
            <div className="text-base text-blue-100 truncate">
              <span className="font-semibold">Email: </span>
              <span>{bombero.email}</span>
            </div>
            
            {/* Teléfono */}
            {bombero.ficha?.telefono ? (
              <div className="text-base text-blue-100">
                <span className="font-semibold">Tel: </span>
                <span>{bombero.ficha.telefono}</span>
              </div>
            ) : (
              <div className="text-base text-blue-200 italic">
                Sin teléfono registrado
              </div>
            )}

            {/* Solo tipo de sangre en el header si está disponible */}
            {bombero.ficha?.tipoSangre && (
              <div className="flex items-center space-x-3 mt-3">
                <div className="flex items-center space-x-1 bg-pink-500/20 px-2 py-1 rounded-full border border-pink-300/30">
                  <MdBloodtype className="w-4 h-4 text-pink-200" />
                  <span className="text-xs font-semibold text-pink-100">{bombero.ficha.tipoSangre.nombre}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className={`p-6 space-y-4 ${
        bombero.activo 
          ? 'bg-gray-50' 
          : 'bg-red-50/20'
      }`}>

        {/* Compañía - Solo mostrar si showCompanyInfo es true */}
        {showCompanyInfo && (
          <div className="border-b border-gray-300 pb-3">
            <div className="text-sm font-bold text-gray-700 mb-2">COMPAÑÍA</div>
            <div className="text-base text-gray-800 font-medium">
              {bombero.ficha?.compania?.nombre || 'Sin compañía asignada'}
            </div>
          </div>
        )}

        {/* Roles */}
        <div className="border-b border-gray-300 pb-3">
          <div className="text-sm font-bold text-gray-700 mb-2">ROL/CARGO</div>
          {bombero.roles && bombero.roles.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {bombero.roles.map((rol, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded"
                >
                  {rol.nombre}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-500 italic">Sin roles asignados</span>
          )}
        </div>

        {/* Información adicional de la ficha */}
        {bombero.ficha ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MdBadge className="w-5 h-5 text-blue-600" />
              <div className="text-sm font-bold text-gray-700">INFORMACIÓN ADICIONAL</div>
            </div>
            
            {/* Grid de información con mejor diseño */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Licencia de conducir */}
              {bombero.ficha.licenciaClaseF && (
                <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MdDriveEta className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Licencia</div>
                    <div className="text-sm font-medium text-green-800">Clase F</div>
                  </div>
                </div>
              )}

              {/* Donante de órganos */}
              {bombero.ficha.donante && (
                <div className="flex items-center space-x-3 bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <MdFavorite className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-red-600 uppercase tracking-wide">Donante</div>
                    <div className="text-sm font-medium text-red-800">Órganos</div>
                  </div>
                </div>
              )}

              {/* Fecha de nacimiento */}
              {bombero.ficha.fechaNacimiento && (
                <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MdDateRange className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Nacimiento</div>
                    <div className="text-sm font-medium text-blue-800">{formatDate(bombero.ficha.fechaNacimiento)}</div>
                  </div>
                </div>
              )}

              {/* Fecha de ingreso */}
              {bombero.ficha.fechaIngreso && (
                <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MdWork className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Ingreso</div>
                    <div className="text-sm font-medium text-purple-800">{formatDate(bombero.ficha.fechaIngreso)}</div>
                  </div>
                </div>
              )}

              {/* Tipo de sangre */}
              {bombero.ficha.tipoSangre && (
                <div className="flex items-center space-x-3 bg-pink-50 p-3 rounded-lg border border-pink-200">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <MdBloodtype className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Tipo de Sangre</div>
                    <div className="text-sm font-medium text-pink-800">{bombero.ficha.tipoSangre.nombre}</div>
                  </div>
                </div>
              )}

              {/* Mensaje si no hay información adicional */}
              {!bombero.ficha.licenciaClaseF && !bombero.ficha.donante && !bombero.ficha.fechaNacimiento && !bombero.ficha.fechaIngreso && !bombero.ficha.tipoSangre && (
                <div className="col-span-2 flex items-center justify-center space-x-2 text-gray-500 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <MdInfo className="w-4 h-4 text-gray-400" />
                  <span className="text-sm italic">Información adicional disponible en el perfil completo</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="flex flex-col items-center space-y-2 text-gray-500">
              <MdInfo className="w-8 h-8 text-gray-400" />
              <span className="text-sm italic">Sin ficha de datos adicionales</span>
            </div>
          </div>
        )}

      </div>

      {/* Footer con acciones mejorado */}
      {showActions && (
        <div className={`px-6 py-4 flex justify-center ${
          bombero.activo 
            ? 'bg-gray-50' 
            : 'bg-red-50/20'
        }`}>
          <button
            onClick={() => onViewDetails && onViewDetails(bombero)}
            className={`group flex items-center space-x-2 px-6 py-3 text-base rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md ${
              bombero.activo 
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105' 
                : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'
            }`}
          >
            <MdVisibility className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Ver Detalles</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BomberosCard;
