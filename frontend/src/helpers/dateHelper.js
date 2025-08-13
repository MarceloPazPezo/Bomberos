import { DateTime } from 'luxon';

// Zona horaria de Santiago, Chile
const SANTIAGO_TIMEZONE = 'America/Santiago';

/**
 * Helper para manejo de fechas con zona horaria de Santiago
 */
export const dateHelper = {
  /**
   * Obtiene la fecha y hora actual en Santiago
   * @returns {DateTime} Fecha actual en zona horaria de Santiago
   */
  now() {
    return DateTime.now().setZone(SANTIAGO_TIMEZONE);
  },

  /**
   * Convierte una fecha a zona horaria de Santiago
   * @param {string|Date|DateTime} date - Fecha a convertir
   * @returns {DateTime} Fecha en zona horaria de Santiago
   */
  toSantiago(date) {
    if (!date) {
      throw new Error('Formato de fecha no válido: fecha es null o undefined');
    }
    
    if (typeof date === 'string') {
      const dateTime = DateTime.fromISO(date).setZone(SANTIAGO_TIMEZONE);
      if (!dateTime.isValid) {
        throw new Error(`Formato de fecha no válido: ${dateTime.invalidReason}`);
      }
      return dateTime;
    }
    
    if (date instanceof Date) {
      const dateTime = DateTime.fromJSDate(date).setZone(SANTIAGO_TIMEZONE);
      if (!dateTime.isValid) {
        throw new Error(`Formato de fecha no válido: fecha JavaScript inválida`);
      }
      return dateTime;
    }
    
    if (DateTime.isDateTime(date)) {
      if (!date.isValid) {
        throw new Error(`Formato de fecha no válido: DateTime inválido - ${date.invalidReason}`);
      }
      return date.setZone(SANTIAGO_TIMEZONE);
    }
    
    throw new Error(`Formato de fecha no válido: tipo no soportado (${typeof date})`);
  },

  /**
   * Convierte una fecha de Santiago a UTC para enviar al backend
   * @param {string|Date|DateTime} date - Fecha en Santiago
   * @returns {DateTime} Fecha en UTC
   */
  toUTC(date) {
    const santiagoDate = this.toSantiago(date);
    return santiagoDate.toUTC();
  },

  /**
   * Formatea una fecha para mostrar en la interfaz
   * @param {string|Date|DateTime} date - Fecha a formatear
   * @param {string} format - Formato deseado (por defecto: 'dd/MM/yyyy HH:mm')
   * @returns {string} Fecha formateada
   */
  format(date, format = 'dd/MM/yyyy HH:mm') {
    const santiagoDate = this.toSantiago(date);
    return santiagoDate.toFormat(format);
  },

  /**
   * Formatea una fecha para inputs datetime-local
   * @param {string|Date|DateTime} date - Fecha a formatear
   * @returns {string} Fecha en formato YYYY-MM-DDTHH:mm
   */
  toInputFormat(date) {
    const santiagoDate = this.toSantiago(date);
    return santiagoDate.toFormat('yyyy-MM-dd\'T\'HH:mm');
  },

  /**
   * Convierte una fecha de input datetime-local a DateTime de Santiago
   * @param {string} inputValue - Valor del input (YYYY-MM-DDTHH:mm)
   * @returns {DateTime} DateTime en zona horaria de Santiago
   */
  fromInputFormat(inputValue) {
    if (!inputValue || typeof inputValue !== 'string') {
      throw new Error('Formato de fecha no válido: valor de entrada inválido');
    }
    const dateTime = DateTime.fromISO(inputValue, { zone: SANTIAGO_TIMEZONE });
    if (!dateTime.isValid) {
      throw new Error(`Formato de fecha no válido: ${dateTime.invalidReason}`);
    }
    return dateTime;
  },

  /**
   * Añade tiempo a una fecha
   * @param {string|Date|DateTime} date - Fecha base
   * @param {Object} duration - Duración a añadir (ej: { hours: 2, minutes: 30 })
   * @returns {DateTime} Nueva fecha con el tiempo añadido
   */
  add(date, duration) {
    const santiagoDate = this.toSantiago(date);
    return santiagoDate.plus(duration);
  },

  /**
   * Obtiene una fecha relativa (ej: "hace 2 horas")
   * @param {string|Date|DateTime} date - Fecha a comparar
   * @returns {string} Tiempo relativo en español
   */
  relative(date) {
    const santiagoDate = this.toSantiago(date);
    const now = this.now();
    return santiagoDate.toRelative({ base: now, locale: 'es' });
  },

  /**
   * Verifica si una fecha es válida
   * @param {string|Date|DateTime} date - Fecha a validar
   * @returns {boolean} True si la fecha es válida
   */
  isValid(date) {
    try {
      const dt = this.toSantiago(date);
      return dt.isValid;
    } catch {
      return false;
    }
  },

  /**
   * Obtiene el inicio del día en Santiago
   * @param {string|Date|DateTime} date - Fecha (opcional, por defecto hoy)
   * @returns {DateTime} Inicio del día (00:00:00)
   */
  startOfDay(date = null) {
    const baseDate = date ? this.toSantiago(date) : this.now();
    return baseDate.startOf('day');
  },

  /**
   * Obtiene el final del día en Santiago
   * @param {string|Date|DateTime} date - Fecha (opcional, por defecto hoy)
   * @returns {DateTime} Final del día (23:59:59.999)
   */
  endOfDay(date = null) {
    const baseDate = date ? this.toSantiago(date) : this.now();
    return baseDate.endOf('day');
  }
};

export default dateHelper;