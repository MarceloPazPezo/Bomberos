/**
 * Mapa de iconos SVG para puntos de interés en el mapa
 * Convierte nombres de react-icons a SVG para usar en MapLibre
 */

export const mapIcons = {
    // === ICONOS DE FONT AWESOME ===
    // Temporario: usar un ícono de libro (Material Design-like) para testear rendering
    'FaFaucet': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4a2 2 0 0 1 2-2h8a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H5a2 2 0 0 0-2 2V4Zm13 1h3a2 2 0 0 1 2 2v13a3 3 0 0 0-3-3h-2V5ZM6 8h7v2H6V8Zm0 4h7v2H6v-2Z"/></svg>',

    'FaHospital': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',

    'FaBuilding': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/></svg>',

    'FaGasPump': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v11h8v-5h1c1.1 0 2 .9 2 2v3.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 13H7V5h5v8z"/></svg>',

    'FaSchool': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>',

    'FaWater': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zM7.83 14c.37 0 .67.26.74.62.41 2.22 2.28 2.98 3.64 3.2.24.06.49.1.75.1.26 0 .51-.04.75-.1 1.37-.22 3.24-.98 3.64-3.2.07-.36.37-.62.74-.62.42 0 .77.32.73.75-.45 4.07-3.41 5.25-5.39 5.25-1.98 0-4.94-1.18-5.39-5.25-.04-.43.31-.75.73-.75z"/></svg>',

    'FaCar': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>',

    'FaTree': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75S7 8 17 8z"/></svg>',

    'FaShoppingCart': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>',

    // === ICONOS DE MATERIAL DESIGN ===
    'MdLocalFireDepartment': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',

    'MdPlace': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',

    'MdWarning': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',

    'MdWaterDrop': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 7 6 9.8 6 12.5A6 6 0 0 0 12 18.5A6 6 0 0 0 18 12.5C18 9.8 16 7 12 2Z"/></svg>',

    'MdDangerous': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.73,3H8.27L3,8.27V15.73L8.27,21H15.73L21,15.73V8.27L15.73,3M12,17.3C10.29,17.3 8.9,15.91 8.9,14.2C8.9,12.49 10.29,11.1 12,11.1C13.71,11.1 15.1,12.49 15.1,14.2C15.1,15.91 13.71,17.3 12,17.3M12,9.1C9.24,9.1 6.9,11.44 6.9,14.2C6.9,16.96 9.24,19.3 12,19.3C14.76,19.3 17.1,16.96 17.1,14.2C17.1,11.44 14.76,9.1 12,9.1Z"/></svg>',

    'MdElectricBolt': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7,2V13H10V22L17,10H13L17,2H7Z"/></svg>',

    'MdSecurity': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,16.6 15.6,17 15,17H9C8.4,17 8,16.6 8,16V13C8,12.4 8.4,11.5 9,11.5V10C9,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.2,9.2 10.2,10V11.5H13.8V10C13.8,9.2 12.8,8.2 12,8.2Z"/></svg>',

    'MdEmergency': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/></svg>',

    'MdPhone': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/></svg>',

    'MdDirectionsCar': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5,11L6.5,6.5H17.5L19,11M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M18.92,6C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.28,5.42 5.08,6L3,12V20A1,1 0 0,0 4,21H5A1,1 0 0,0 6,20V19H18V20A1,1 0 0,0 19,21H20A1,1 0 0,0 21,20V12L18.92,6Z"/></svg>',

    // === ICONOS ADICIONALES PARA BOMBEROS ===
    'MdFireExtinguisher': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7,19H17V14H7V19M12,2A1,1 0 0,1 13,3V4H14A2,2 0 0,1 16,6V10A2,2 0 0,1 14,12H10A2,2 0 0,1 8,10V6A2,2 0 0,1 10,4H11V3A1,1 0 0,1 12,2M10,6V10H14V6H10Z"/></svg>',

    'MdLocalPolice': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,16.6 15.6,17 15,17H9C8.4,17 8,16.6 8,16V13C8,12.4 8.4,11.5 9,11.5V10C9,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.2,9.2 10.2,10V11.5H13.8V10C13.8,9.2 12.8,8.2 12,8.2Z"/></svg>',

    'MdLocalAmbulance': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19,8H18V7A2,2 0 0,0 16,5H8A2,2 0 0,0 6,7V8H5A1,1 0 0,0 4,9V19A1,1 0 0,0 5,20H6A1,1 0 0,0 7,19V18H17V19A1,1 0 0,0 18,20H19A1,1 0 0,0 20,19V9A1,1 0 0,0 19,8M8,7H16V8H8V7M18,16H6V10H18V16Z"/></svg>',

    'MdLocalGasStation': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.58,1H5.42L3,16H21L18.58,1M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M19,15H5L6.1,3H17.9L19,15Z"/></svg>',

    'MdLocalParking': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5,3H6V21H10V14H13.5A1.5,1.5 0 0,0 15,12.5V4.5A1.5,1.5 0 0,0 13.5,3M13.5,12H10V5H13.5V12Z"/></svg>',

    'MdStorage': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2,20H22V4H2M4,6H20V8H4V6M4,11H20V13H4V11M4,16H11V18H4V16M13,16H20V18H13V16Z"/></svg>',

    'MdBusiness': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,7V3H2V21H22V7H12M12,9H20V19H4V9H12M6,11H8V13H6V11M6,15H8V17H6V15M10,11H12V13H10V11M10,15H12V17H10V15M14,11H16V13H14V11M14,15H16V17H14V15M18,11H20V13H18V11M18,15H20V17H18V15Z"/></svg>'
};

// Íconos personalizados
mapIcons['CustomHydrant'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 2h4v2h2a1 1 0 0 1 1 1v1h-2v2h2v2h-2v6h1a1 1 0 0 1 1 1v2h-2v2h-6v-2H7v-2a1 1 0 0 1 1-1h1v-6H7V8h2V6H7V5a1 1 0 0 1 1-1h2V2Zm2 6a1 1 0 0 0-1 1v6h2V9a1 1 0 0 0-1-1Z"/></svg>';

/**
 * Obtiene el SVG de un icono por su nombre
 * @param {string} iconName - Nombre del icono (ej: 'FaFaucet', 'MdPlace')
 * @returns {string} - SVG del icono o un círculo por defecto
 */
export const getIconoSvg = (iconName) => {
    return mapIcons[iconName] || '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>';
};

/**
 * Lista de todos los iconos disponibles
 * @returns {string[]} - Array con los nombres de todos los iconos disponibles
 */
export const getAvailableIcons = () => {
    return Object.keys(mapIcons);
};

/**
 * Obtiene información de un icono específico
 * @param {string} iconName - Nombre del icono
 * @returns {object} - Información del icono {name, svg, category}
 */
export const getIconInfo = (iconName) => {
    const categories = {
        'Fa': 'Font Awesome',
        'Md': 'Material Design'
    };

    const category = categories[iconName.substring(0, 2)] || 'Otros';

    return {
        name: iconName,
        svg: mapIcons[iconName],
        category: category,
        available: !!mapIcons[iconName]
    };
};

