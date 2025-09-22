import { useState, useMemo } from 'react';

/**
 * Hook personalizado para filtrar bomberos por diferentes criterios
 * @param {Array} bomberos - Lista de bomberos
 * @returns {Object} - Bomberos filtrados y función para cambiar filtros
 */
export const useBomberosFilter = (bomberos = []) => {
  const [dateFilter, setDateFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Filtrar bomberos basado en todos los criterios
  const filteredBomberos = useMemo(() => {
    if (!Array.isArray(bomberos)) return [];

    return bomberos.filter(bombero => {
      // Filtro por búsqueda de texto
      if (searchFilter) {
        const searchTerm = searchFilter.toLowerCase();
        const matchesSearch = 
          bombero.nombres?.toLowerCase().includes(searchTerm) ||
          bombero.apellidos?.toLowerCase().includes(searchTerm) ||
          bombero.run?.toLowerCase().includes(searchTerm) ||
          bombero.email?.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Filtro por estado
      if (statusFilter !== 'all') {
        const isActive = bombero.activo === true;
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'inactive' && isActive) return false;
      }

      // Filtro por rol
      if (roleFilter !== 'all') {
        const hasRole = bombero.roles?.some(role => 
          role.nombre?.toLowerCase().includes(roleFilter.toLowerCase())
        );
        if (!hasRole) return false;
      }

      // Filtro por fecha (si está implementado)
      if (dateFilter) {
        // TODO: Implementar filtro por fecha cuando sea necesario
        // Por ejemplo, filtrar por fecha de creación, última modificación, etc.
      }

      return true;
    });
  }, [bomberos, dateFilter, statusFilter, roleFilter, searchFilter]);

  // Handlers para cambiar filtros
  const handleDateFilterChange = (newDateFilter) => {
    setDateFilter(newDateFilter);
  };

  const handleStatusFilterChange = (newStatusFilter) => {
    setStatusFilter(newStatusFilter);
  };

  const handleRoleFilterChange = (newRoleFilter) => {
    setRoleFilter(newRoleFilter);
  };

  const handleSearchFilterChange = (newSearchFilter) => {
    setSearchFilter(newSearchFilter);
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setDateFilter(null);
    setStatusFilter('all');
    setRoleFilter('all');
    setSearchFilter('');
  };

  // Función para verificar si hay filtros activos
  const hasActiveFilters = () => {
    return dateFilter !== null || 
           statusFilter !== 'all' || 
           roleFilter !== 'all' || 
           searchFilter !== '';
  };

  // Estadísticas de filtrado
  const filterStats = useMemo(() => {
    const total = bomberos.length;
    const filtered = filteredBomberos.length;
    const active = filteredBomberos.filter(b => b.activo).length;
    const inactive = filtered - active;

    return {
      total,
      filtered,
      active,
      inactive,
      percentage: total > 0 ? Math.round((filtered / total) * 100) : 0
    };
  }, [bomberos, filteredBomberos]);

  return {
    // Datos filtrados
    filteredBomberos,
    filterStats,

    // Estados de filtros
    dateFilter,
    statusFilter,
    roleFilter,
    searchFilter,

    // Handlers
    handleDateFilterChange,
    handleStatusFilterChange,
    handleRoleFilterChange,
    handleSearchFilterChange,

    // Utilidades
    clearAllFilters,
    hasActiveFilters
  };
};