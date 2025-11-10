/**
 * Utilidades para manejo de fechas en el dashboard
 */

/**
 * Aplica un filtro rápido de tiempo
 * @param {string} tipo - Tipo de filtro: 'semanal', 'mensual', 'anual'
 * @returns {Object} - Objeto con fechaInicio y fechaFin
 */
export const aplicarFiltroTiempo = (tipo) => {
  const hoy = new Date();
  let inicio = new Date();

  switch (tipo) {
    case 'semanal':
      inicio.setDate(hoy.getDate() - 7);
      break;
    case 'mensual':
      inicio.setMonth(hoy.getMonth() - 1);
      break;
    case 'anual':
      inicio.setFullYear(hoy.getFullYear() - 1);
      break;
    default:
      inicio.setMonth(hoy.getMonth() - 1);
  }

  return {
    fechaInicio: inicio,
    fechaFin: hoy,
  };
};

/**
 * Convierte una fecha a timestamp
 * @param {Date} fecha - Fecha a convertir
 * @returns {number} - Timestamp en milisegundos
 */
export const dateToTimestamp = (fecha) => {
  return fecha ? fecha.getTime() : null;
};
