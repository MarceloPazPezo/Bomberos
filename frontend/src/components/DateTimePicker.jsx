import React, { useState, useRef, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import dateHelper from '@helpers/dateHelper';

const DateTimePicker = ({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  showTime = false,
  minDate = null,
  maxDate = null,
  className = "",
  disabled = false,
  clearable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? dateHelper.fromJSDate(value) : null);
  const [viewMode, setViewMode] = useState('day'); // 'day', 'month', 'year'
  const [viewDate, setViewDate] = useState(
    selectedDate || dateHelper.now()
  );
  const [timeValue, setTimeValue] = useState(
    selectedDate ? dateHelper.format(selectedDate, 'HH:mm') : '09:00'
  );
  const [holidays, setHolidays] = useState([]);
  
  const containerRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar cuando cambie el valor externo
  useEffect(() => {
    if (value) {
      const newDate = dateHelper.fromJSDate(value);
      setSelectedDate(newDate);
      setViewDate(newDate);
      if (showTime) {
        setTimeValue(dateHelper.format(newDate, 'HH:mm'));
      }
    } else {
      setSelectedDate(null);
    }
  }, [value, showTime]);

  // Cargar feriados al montar el componente
  useEffect(() => {
    fetchHolidays();
  }, []);

  // Función para obtener feriados de la API de Boostr
  const fetchHolidays = async () => {
    try {
      const response = await fetch('https://api.boostr.cl/holidays.json');
      if (response.ok) {
        const result = await response.json();
        // La API devuelve un objeto con status y data
        if (result.status === 'success' && result.data) {
          // Convertir las fechas de string a objetos Date para comparación
          const holidayDates = result.data.map(holiday => new Date(holiday.date + 'T00:00:00'));
          setHolidays(holidayDates);
          return;
        }
      }
    } catch (error) {
      console.warn('No se pudieron cargar los feriados desde API:', error);
    }
    
    // Fallback: usar feriados estáticos para Chile 2024-2025
    const staticHolidays = [
      '2024-01-01', // Año Nuevo
      '2024-03-29', // Viernes Santo
      '2024-03-30', // Sábado Santo
      '2024-05-01', // Día del Trabajador
      '2024-05-21', // Día de las Glorias Navales
      '2024-06-29', // San Pedro y San Pablo
      '2024-07-16', // Día de la Virgen del Carmen
      '2024-08-15', // Asunción de la Virgen
      '2024-09-18', // Independencia Nacional
      '2024-09-19', // Día de las Glorias del Ejército
      '2024-10-12', // Encuentro de Dos Mundos
      '2024-11-01', // Día de Todos los Santos
      '2024-12-08', // Inmaculada Concepción
      '2024-12-25', // Navidad
      '2025-01-01', // Año Nuevo
      '2025-04-18', // Viernes Santo
      '2025-04-19', // Sábado Santo
      '2025-05-01', // Día del Trabajador
      '2025-05-21', // Día de las Glorias Navales
      '2025-06-29', // San Pedro y San Pablo
      '2025-07-16', // Día de la Virgen del Carmen
      '2025-08-15', // Asunción de la Virgen
      '2025-09-18', // Independencia Nacional
      '2025-09-19', // Día de las Glorias del Ejército
      '2025-10-12', // Encuentro de Dos Mundos
      '2025-11-01', // Día de Todos los Santos
      '2025-12-08', // Inmaculada Concepción
      '2025-12-25'  // Navidad
    ];
    
    const holidayDates = staticHolidays.map(dateStr => new Date(dateStr + 'T00:00:00'));
    setHolidays(holidayDates);
  };

  // Función para verificar si una fecha es feriado
  const isHoliday = (date) => {
    // Convertir Luxon DateTime a Date para comparación
    const jsDate = date.toJSDate();
    return holidays.some(holiday => 
      holiday.getDate() === jsDate.getDate() &&
      holiday.getMonth() === jsDate.getMonth() &&
      holiday.getFullYear() === jsDate.getFullYear()
    );
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return '';
    
    if (showTime) {
      return dateHelper.format(selectedDate, 'dd-MM-yyyy HH:mm');
    }
    return dateHelper.format(selectedDate, 'dd-MM-yyyy');
  };

  const handleDateSelect = (day) => {
    let newDate = viewDate.set({ day });
    
    if (showTime) {
      const [hours, minutes] = timeValue.split(':');
      newDate = newDate.set({ 
        hour: parseInt(hours), 
        minute: parseInt(minutes) 
      });
    }

    // Validar contra minDate y maxDate
    if (minDate && newDate < dateHelper.fromJSDate(minDate)) return;
    if (maxDate && newDate > dateHelper.fromJSDate(maxDate)) return;

    setSelectedDate(newDate);
    onChange?.(newDate.toJSDate());
    
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const handleTimeChange = (newTime) => {
    setTimeValue(newTime);
    
    if (selectedDate) {
      const [hours, minutes] = newTime.split(':');
      const newDate = selectedDate.set({ 
        hour: parseInt(hours), 
        minute: parseInt(minutes) 
      });
      
      setSelectedDate(newDate);
      onChange?.(newDate.toJSDate());
    }
  };

  const handleMonthSelect = (month) => {
    const newViewDate = viewDate.set({ month: month + 1 });
    setViewDate(newViewDate);
    setViewMode('day');
  };

  const handleYearSelect = (year) => {
    const newViewDate = viewDate.set({ year });
    setViewDate(newViewDate);
    setViewMode('month');
  };

  const navigateMonth = (direction) => {
    setViewDate(viewDate.plus({ months: direction }));
  };

  const navigateYear = (direction) => {
    setViewDate(viewDate.plus({ years: direction }));
  };

  const navigateDecade = (direction) => {
    setViewDate(viewDate.plus({ years: direction * 10 }));
  };

  const clear = () => {
    setSelectedDate(null);
    onChange?.(null);
    setIsOpen(false);
  };

  const getDaysInMonth = () => {
    const firstDay = viewDate.startOf('month');
    const lastDay = viewDate.endOf('month');
    
    // Ajustar para que la semana empiece en lunes (weekday 1 en Luxon)
    let startDate = firstDay;
    while (startDate.weekday !== 1) { // 1 = lunes en Luxon
      startDate = startDate.minus({ days: 1 });
    }
    
    let endDate = lastDay;
    while (endDate.weekday !== 7) { // 7 = domingo en Luxon
      endDate = endDate.plus({ days: 1 });
    }
    
    const days = [];
    let current = startDate;
    
    while (current <= endDate) {
      days.push(current);
      current = current.plus({ days: 1 });
    }
    
    return days;
  };

  const getMonths = () => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    return months.map((month, i) => ({
      value: i,
      label: month
    }));
  };

  const getYears = () => {
    const currentYear = viewDate.year;
    const startYear = Math.floor(currentYear / 10) * 10;
    return Array.from({ length: 12 }, (_, i) => startYear + i - 1);
  };

  const isDateDisabled = (date) => {
    if (minDate) {
      const minDateTime = dateHelper.fromJSDate(minDate).startOf('day');
      const currentDateTime = date.startOf('day');
      if (currentDateTime < minDateTime) return true;
    }
    if (maxDate) {
      const maxDateTime = dateHelper.fromJSDate(maxDate).startOf('day');
      const currentDateTime = date.startOf('day');
      if (currentDateTime > maxDateTime) return true;
    }
    return false;
  };

  const renderDayView = () => (
    <div className="p-4">
      {/* Header con navegación de mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <FaChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded"
          >
            {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][viewDate.month - 1]}
          </button>
          <button
            onClick={() => setViewMode('year')}
            className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded"
          >
            {viewDate.year}
          </button>
        </div>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <FaChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(day => (
          <div key={day} className="p-2 text-xs font-medium text-gray-500 text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth().map(date => {
          const isCurrentMonth = date.month === viewDate.month;
          const isSelected = selectedDate && date.hasSame(selectedDate, 'day');
          const isToday = date.hasSame(dateHelper.now(), 'day');
          const isDisabled = isDateDisabled(date);
          const isHolidayDate = isHoliday(date);
          const isSunday = date.weekday === 7; // En Luxon, domingo es 7
          const isSaturday = date.weekday === 6; // En Luxon, sábado es 6

          return (
            <button
              key={date.toISODate()}
              onClick={() => !isDisabled && handleDateSelect(date.day)}
              disabled={isDisabled}
              className={`
                p-2 text-sm rounded transition-colors relative
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isSelected ? 'bg-blue-600 text-white' : ''}
                ${isToday && !isSelected ? 'bg-blue-100 text-blue-600' : ''}
                ${isHolidayDate && !isSelected ? 'text-red-600 font-semibold' : ''}
                ${isSunday && !isSelected && !isHolidayDate ? 'text-red-500' : ''}
                ${isSaturday && !isSelected && !isHolidayDate ? 'text-gray-600' : ''}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                ${isSelected ? '' : 'hover:bg-gray-100'}
                ${isHolidayDate && !isSelected ? 'hover:bg-red-50' : ''}
              `}
            >
              {date.day}
              {isHolidayDate && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full transform translate-x-1 -translate-y-1"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selector de hora */}
      {showTime && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <FaClock className="h-4 w-4 text-gray-500" />
            <input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderMonthView = () => (
    <div className="p-4">
      {/* Header con navegación de año */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateYear(-1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <FaChevronLeft className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => setViewMode('year')}
          className="px-3 py-1 text-lg font-medium hover:bg-gray-100 rounded"
        >
          {viewDate.year}
        </button>
        
        <button
          onClick={() => navigateYear(1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <FaChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Meses */}
      <div className="grid grid-cols-3 gap-2">
        {getMonths().map(month => (
          <button
            key={month.value}
            onClick={() => handleMonthSelect(month.value)}
            className={`
              p-3 text-sm rounded transition-colors
              ${viewDate.month === month.value + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
            `}
          >
            {month.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderYearView = () => (
    <div className="p-4">
      {/* Header con navegación de década */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateDecade(-1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <FaChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="px-3 py-1 text-lg font-medium">
          {Math.floor(viewDate.year / 10) * 10}s
        </div>
        
        <button
          onClick={() => navigateDecade(1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <FaChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Años */}
      <div className="grid grid-cols-3 gap-2">
        {getYears().map(year => (
          <button
            key={year}
            onClick={() => handleYearSelect(year)}
            className={`
              p-3 text-sm rounded transition-colors
              ${viewDate.year === year ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
            `}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <FaCalendarAlt className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          readOnly
          value={formatDisplayValue()}
          placeholder={placeholder}
          className="flex-1 text-sm bg-transparent outline-none cursor-pointer"
          disabled={disabled}
        />
        {clearable && selectedDate && !disabled && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <FaTimes className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[300px]">
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'year' && renderYearView()}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
