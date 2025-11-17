import React, { useState, useEffect } from 'react';
import { MdCalendarToday, MdFilterList, MdClear } from 'react-icons/md';

const DateFilter = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState('creation'); // 'creation' | 'update' | 'both'
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [quickFilter, setQuickFilter] = useState(''); // 'today' | 'week' | 'month' | 'year'

  const clearFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    setQuickFilter('');
    setFilterType('creation');
    // Notificar al componente padre que se limpiaron los filtros
    if (onFilterChange) {
      onFilterChange(null);
    }
  };

  const hasActiveFilters = dateRange.startDate || dateRange.endDate || quickFilter;

  const quickFilterOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'year', label: 'Este año' }
  ];

  // Función para calcular fechas basadas en filtros rápidos
  const getQuickFilterDates = (filterType) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterType) {
      case 'today':
        return {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          startDate: startOfWeek.toISOString().split('T')[0],
          endDate: endOfWeek.toISOString().split('T')[0]
        };
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0]
        };
      case 'year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        return {
          startDate: startOfYear.toISOString().split('T')[0],
          endDate: endOfYear.toISOString().split('T')[0]
        };
      default:
        return null;
    }
  };

  // Efecto para notificar cambios de filtro al componente padre
  useEffect(() => {
    if (!onFilterChange) return;

    let filterData = null;
    
    if (quickFilter) {
      const dates = getQuickFilterDates(quickFilter);
      if (dates) {
        filterData = {
          type: filterType,
          startDate: dates.startDate,
          endDate: dates.endDate,
          quickFilter
        };
      }
    } else if (dateRange.startDate || dateRange.endDate) {
      filterData = {
        type: filterType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        quickFilter: null
      };
    }

    onFilterChange(filterData);
  }, [filterType, dateRange, quickFilter, onFilterChange]);

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          hasActiveFilters
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <MdCalendarToday size={16} />
        <span className="text-sm font-medium">
          {hasActiveFilters ? 'Filtros activos' : 'Filtrar fechas'}
        </span>
        {hasActiveFilters && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {quickFilter || 'Personalizado'}
          </span>
        )}
      </button>

      {/* Panel de filtros */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MdFilterList size={16} />
                Filtros de Fecha
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <MdClear size={14} />
                  Limpiar
                </button>
              )}
            </div>

            {/* Tipo de fecha */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Filtrar por:
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="creation">Fecha de creación</option>
                <option value="update">Fecha de actualización</option>
                <option value="both">Cualquier fecha</option>
              </select>
            </div>

            {/* Filtros rápidos */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Filtros rápidos:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {quickFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setQuickFilter(quickFilter === option.value ? '' : option.value);
                      setDateRange({ startDate: '', endDate: '' });
                    }}
                    className={`px-3 py-2 text-xs rounded-md border transition-all ${
                      quickFilter === option.value
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Separador */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-xs text-gray-500">o rango personalizado</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Rango personalizado */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha inicio:
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, startDate: e.target.value }));
                    setQuickFilter('');
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha fin:
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, endDate: e.target.value }));
                    setQuickFilter('');
                  }}
                  min={dateRange.startDate}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;