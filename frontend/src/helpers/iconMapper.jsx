import React from 'react';
import {
    MdLocalFireDepartment,
    MdWarning,
    MdPlace,
    MdWaterDrop,
    MdDangerous,
    MdElectricBolt,
    MdStorage,
    MdBusiness,
} from 'react-icons/md';
import {
    FaFaucet,
    FaHospital,
    FaBuilding,
    FaGasPump,
    FaSchool,
    FaWater,
    FaCar,
    FaTree,
    FaShoppingCart,
} from 'react-icons/fa';

// Mapeo de nombres de iconos a componentes
const iconMap = {
    FaFaucet,
    MdLocalFireDepartment,
    FaHospital,
    FaBuilding,
    MdWarning,
    MdPlace,
    MdWaterDrop,
    MdDangerous,
    FaGasPump,
    FaSchool,
    FaWater,
    FaCar,
    MdElectricBolt,
    FaTree,
    FaShoppingCart,
    MdStorage,
    MdBusiness,
};

/**
 * Renderiza un icono basado en su nombre
 * @param {string} iconName - Nombre del icono (ej: "FaFaucet")
 * @param {object} props - Props adicionales para el icono (className, size, etc.)
 * @returns {JSX.Element} - Componente de icono
 */
export const renderIcon = (iconName, props = {}) => {
    const IconComponent = iconMap[iconName];
    
    if (!IconComponent) {
        // Si no existe el icono, retornar un icono por defecto
        return <MdPlace {...props} />;
    }
    
    return <IconComponent {...props} />;
};

export default iconMap;


