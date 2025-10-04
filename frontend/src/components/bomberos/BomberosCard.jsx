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
  MdBadge
} from 'react-icons/md';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
        {/* Estado en la esquina superior derecha */}
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1">
            {React.createElement(getEstadoIcon(bombero.activo), {
              className: `w-3 h-3 ${bombero.activo ? 'text-green-300' : 'text-red-300'}`
            })}
            <span className="text-xs font-medium text-white">
              {bombero.activo ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>
        </div>

        <div className="flex items-start space-x-4 pt-2">
          {/* Foto de perfil más grande */}
          <div className="relative">
            {bombero.ficha?.fotoPerfilURL ? (
              <img
                src={bombero.ficha.fotoPerfilURL}
                alt={`Foto de ${bombero.nombreCompleto}`}
                className="w-32 h-36 object-cover border-2 border-white shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-32 h-36 bg-gray-200 flex items-center justify-center border-2 border-white shadow-md ${bombero.ficha?.fotoPerfilURL ? 'hidden' : 'flex'}`}
            >
              <MdPerson className="w-14 h-14 text-gray-500" />
            </div>
          </div>

          {/* Información básica */}
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="text-lg font-bold text-white truncate">
              {bombero.nombreCompleto || 
               (bombero.nombres && bombero.apellidos ? 
                `${Array.isArray(bombero.nombres) ? bombero.nombres.join(' ') : bombero.nombres} ${Array.isArray(bombero.apellidos) ? bombero.apellidos.join(' ') : bombero.apellidos}`.trim() :
                bombero.ficha?.nombre || 
                bombero.email?.split('@')[0] || 
                `Bombero ${bombero.id}`)}
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
        {bombero.tieneFicha && bombero.ficha ? (
          <div className="space-y-3">
            <div className="text-sm font-bold text-gray-700 mb-3">INFORMACIÓN ADICIONAL</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Licencia de conducir */}
              {bombero.ficha.licenciaClaseF && (
                <div className="flex items-center space-x-2 bg-green-50 p-3 rounded">
                  <MdDriveEta className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-green-700 font-medium">Licencia F</span>
                </div>
              )}

              {/* Donante de órganos */}
              {bombero.ficha.donante && (
                <div className="flex items-center space-x-2 bg-red-50 p-3 rounded">
                  <MdBloodtype className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-red-700 font-medium">Donante de órganos</span>
                </div>
              )}

              {/* Tipo de sangre */}
              {bombero.ficha.tipoSangre && (
                <div className="flex items-center space-x-2 bg-pink-50 p-3 rounded col-span-2">
                  <MdBloodtype className="w-4 h-4 text-pink-600 flex-shrink-0" />
                  <span className="text-pink-700 font-medium">Tipo: {bombero.ficha.tipoSangre.nombre}</span>
                </div>
              )}

              {/* Fecha de nacimiento */}
              {bombero.ficha.fechaNacimiento && (
                <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded">
                  <MdDateRange className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-blue-700 font-medium">Nac: {formatDate(bombero.ficha.fechaNacimiento)}</span>
                </div>
              )}

              {/* Fecha de ingreso */}
              {bombero.ficha.fechaIngreso && (
                <div className="flex items-center space-x-2 bg-purple-50 p-3 rounded">
                  <MdWork className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="text-purple-700 font-medium">Ingreso: {formatDate(bombero.ficha.fechaIngreso)}</span>
                </div>
              )}

              {/* Mensaje si tiene ficha pero no hay información adicional */}
              {!bombero.ficha.licenciaClaseF && !bombero.ficha.donante && !bombero.ficha.tipoSangre && !bombero.ficha.fechaNacimiento && !bombero.ficha.fechaIngreso && (
                <div className="col-span-2 flex items-center space-x-2 text-gray-500 p-2">
                  <MdInfo className="w-4 h-4 text-gray-400" />
                  <span className="italic">Ficha sin información adicional</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <MdInfo className="w-4 h-4 text-gray-400" />
              <span className="italic">Sin ficha de datos adicionales</span>
            </div>
          </div>
        )}

      </div>

      {/* Footer con acciones */}
      {showActions && (
        <div className={`px-6 py-4 flex justify-center ${
          bombero.activo 
            ? 'bg-gray-50' 
            : 'bg-red-50/20'
        }`}>
          <button
            onClick={() => onViewDetails && onViewDetails(bombero)}
            className={`flex items-center space-x-2 px-6 py-3 text-base rounded-lg transition-colors font-medium ${
              bombero.activo 
                ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-100' 
                : 'text-red-500 hover:text-red-700 hover:bg-red-100/50'
            }`}
          >
            <MdVisibility className="w-5 h-5" />
            <span>Ver Detalles</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BomberosCard;
