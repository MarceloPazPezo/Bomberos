/**
 * Convierte un string a StartCase (primera letra de cada palabra en mayúscula)
 * @param {string} text - Texto a convertir
 * @returns {string} - Texto en StartCase
 */
export const toStartCase = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Convierte un string a minúsculas y normaliza espacios
 * @param {string} text - Texto a normalizar
 * @returns {string} - Texto normalizado
 */
export const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' '); // Reemplaza múltiples espacios con uno solo
};

export default {
  toStartCase,
  normalizeText
};
