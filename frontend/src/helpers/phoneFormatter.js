/**
 * Formatea un número de teléfono chileno
 * @param {string|number} telefono - El número de teléfono a formatear
 * @returns {string|null} - El teléfono formateado o null si no es válido
 */
export const formatTelefono = (telefono) => {
  if (!telefono) return null;
  
  const cleanPhone = telefono.toString().replace(/\D/g, '');
  
  if (cleanPhone.length === 9) {
    if (cleanPhone.startsWith('9')) {
      return `+56 9 ${cleanPhone.slice(1, 5)} ${cleanPhone.slice(5)}`;
    }
    return `+56 ${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1, 5)} ${cleanPhone.slice(5)}`;
  } else if (cleanPhone.length === 8) {
    return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4)}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('56')) {
    const localNumber = cleanPhone.slice(2);
    if (localNumber.startsWith('9')) {
      return `+56 9 ${localNumber.slice(1, 5)} ${localNumber.slice(5)}`;
    }
    return `+56 ${localNumber.slice(0, 1)} ${localNumber.slice(1, 5)} ${localNumber.slice(5)}`;
  }
  
  return telefono;
};