import React from 'react';
import { MdClose, MdBusiness, MdEmail, MdPhone, MdLocationOn, MdCalendarToday, MdEdit, MdDelete, MdLanguage, MdDescription } from 'react-icons/md';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CompaniaLogo from '@components/companias/CompaniaLogo';

export default function ViewCompaniaPopup({ 
    show, 
    setShow, 
    companiaData, 
    onEdit, 
    onDelete, 
    canEdit = false, 
    canDelete = false 
}) {
    const handleClose = () => {
        setShow(false);
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit(companiaData);
        }
        handleClose();
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(companiaData);
        }
        handleClose();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        try {
            const date = new Date(dateString);
            return format(date, 'dd \'de\' MMMM \'de\' yyyy', { locale: es });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    if (!show || !companiaData) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                            <MdBusiness className="w-6 h-6 text-[#3A9BD9]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Detalles de la Compañía
                            </h2>
                            <p className="text-blue-100 text-sm">
                                Información completa de la compañía
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-3 text-white hover:bg-red-500 hover:bg-opacity-80 rounded-lg transition-colors"
                    >
                        <MdClose className="w-6 h-6 text-red-300 hover:text-white" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto">
                    {/* Banner con Logo */}
                    <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <CompaniaLogo
                                compania={companiaData}
                                nombre={companiaData.nombre}
                                size="banner"
                                isRound={false}
                                className="w-full h-full object-cover"
                                alt={`Logo ${companiaData.nombre}`}
                            />
                        </div>
                    </div>

                    {/* Información Principal */}
                    <div className="p-6">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {companiaData.nombre}
                            </h1>
                            <p className="text-gray-600">ID: #{companiaData.id}</p>
                        </div>

                        {/* Información Básica */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                <MdBusiness className="text-[#4EB9FA]" />
                                Información
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Email */}
                                {companiaData.email && (
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <MdEmail className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="text-gray-900 font-medium break-all">{companiaData.email}</p>
                                    </div>
                                )}

                                {/* Teléfono */}
                                {companiaData.telefono && (
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <MdPhone className="w-6 h-6 text-green-600" />
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                                        <p className="text-gray-900 font-medium">{companiaData.telefono}</p>
                                    </div>
                                )}

                                {/* Fecha de Fundación */}
                                {companiaData.fechaFundacion && (
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <MdCalendarToday className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">Fundación</p>
                                        <p className="text-gray-900 font-medium">{formatDate(companiaData.fechaFundacion)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información Adicional */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            {/* Descripción */}
                            {companiaData.descripcion && (
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <MdDescription className="text-[#4EB9FA]" />
                                        Descripción
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {companiaData.descripcion}
                                    </p>
                                </div>
                            )}

                            {/* Sitio Web */}
                            {companiaData.sitioWeb && (
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <MdLanguage className="text-[#4EB9FA]" />
                                        Sitio Web
                                    </h3>
                                    <a 
                                        href={companiaData.sitioWeb} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[#4EB9FA] hover:underline font-medium break-all"
                                    >
                                        {companiaData.sitioWeb}
                                    </a>
                                </div>
                            )}

                            {/* Ubicación */}
                            {companiaData.direccion && (
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <MdLocationOn className="text-[#4EB9FA]" />
                                        Ubicación
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-gray-900 font-medium">
                                            {companiaData.direccion.calle} {companiaData.direccion.numero}
                                            {companiaData.direccion.depto && `, Depto. ${companiaData.direccion.depto}`}
                                        </p>
                                        {companiaData.direccion.referencia && (
                                            <p className="text-gray-600 text-sm">{companiaData.direccion.referencia}</p>
                                        )}
                                        {companiaData.direccion.codigoPostal && (
                                            <p className="text-gray-600 text-sm">CP: {companiaData.direccion.codigoPostal}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex justify-between px-6 py-4 bg-white border-t border-gray-200 rounded-b-2xl">
                    <div className="flex space-x-3">
                        {canEdit && (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="flex items-center space-x-2 px-4 py-2.5 text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all duration-200 font-medium"
                            >
                                <MdEdit className="w-4 h-4 text-green-500" />
                                <span>Editar</span>
                            </button>
                        )}
                        {canDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex items-center space-x-2 px-4 py-2.5 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 font-medium"
                            >
                                <MdDelete className="w-4 h-4 text-red-500" />
                                <span>Eliminar</span>
                            </button>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                    >
                        <MdClose className="w-4 h-4 text-gray-500" />
                        <span>Cerrar</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

ViewCompaniaPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    companiaData: PropTypes.object,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    canEdit: PropTypes.bool,
    canDelete: PropTypes.bool
};
