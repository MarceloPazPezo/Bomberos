import { useState, useMemo } from 'react';

/**
 * Hook para manejar el filtrado de bomberos por fechas
 * @param {Array} bomberos - Lista de bomberos
 * @returns {Object} - Bomberos filtrados y funciones de filtro
 */
export const useBomberosFilter = (bomberos) => {
  const [dateFilter, setDateFilter] = useState(null);

  // Función para filtrar bomberos por fechas
  const filteredBomberos = useMemo(() => {
    if (!bomberos || !dateFilter) {
      return bomberos || [];
    }

    const { type, startDate, endDate } = dateFilter;
    
    return bomberos.filter(bombero => {
      const creadoEl = bombero.creadoEl ? new Date(bombero.creadoEl) : null;
      const actualizadoEl = bombero.actualizadoEl ? new Date(bombero.actualizadoEl) : null;
      
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate + 'T23:59:59') : null; // Incluir todo el día final
      
      let dateToCheck = null;
      
      switch (type) {
        case 'creation':
          dateToCheck = creadoEl;
          break;
        case 'update':
          dateToCheck = actualizadoEl;
          break;
        case 'both':
          // Para 'both', verificar si cualquiera de las fechas está en el rango
          const creationInRange = creadoEl && 
            (!start || creadoEl >= start) && 
            (!end || creadoEl <= end);
          const updateInRange = actualizadoEl && 
            (!start || actualizadoEl >= start) && 
            (!end || actualizadoEl <= end);
          return creationInRange || updateInRange;
        default:
          return true;
      }
      
      if (!dateToCheck) return false;
      
      const inRange = (!start || dateToCheck >= start) && (!end || dateToCheck <= end);
      return inRange;
    });
  }, [bomberos, dateFilter]);

  // Función para manejar cambios en el filtro de fechas
  const handleDateFilterChange = (filterData) => {
    setDateFilter(filterData);
  };

  return { 
    filteredBomberos, 
    dateFilter, 
    setDateFilter, 
    handleDateFilterChange 
  };
};