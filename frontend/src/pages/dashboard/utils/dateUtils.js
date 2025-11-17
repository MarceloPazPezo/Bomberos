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
  let fin = new Date();

  switch (tipo) {
    case 'semanal':
      // Inicio: lunes de la semana actual (día 1)
      const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
      const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1; // Si es domingo, retroceder 6 días
      inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - diasDesdeInicio);
      inicio.setHours(0, 0, 0, 0);
      // Fin: domingo de la semana actual
      const diasHastaDomingo = diaSemana === 0 ? 0 : 7 - diaSemana;
      fin = new Date(hoy);
      fin.setDate(hoy.getDate() + diasHastaDomingo);
      fin.setHours(23, 59, 59, 999);
      break;
      
    case 'mensual':
      // Inicio: día 1 del mes actual
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      inicio.setHours(0, 0, 0, 0);
      // Fin: último día del mes actual
      fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      fin.setHours(23, 59, 59, 999);
      break;
      
    case 'anual':
      // Inicio: 1 de enero del año actual
      inicio = new Date(hoy.getFullYear(), 0, 1);
      inicio.setHours(0, 0, 0, 0);
      // Fin: 31 de diciembre del año actual
      fin = new Date(hoy.getFullYear(), 11, 31);
      fin.setHours(23, 59, 59, 999);
      break;
      
    default:
      // Por defecto: mes actual
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      inicio.setHours(0, 0, 0, 0);
      fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      fin.setHours(23, 59, 59, 999);
  }

  return {
    fechaInicio: inicio,
    fechaFin: fin,
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
