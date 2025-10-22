import React, { useState, useRef, useEffect, useMemo } from 'react';
import { format, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// Zona horaria de Chile
const CHILE_TIMEZONE = 'America/Santiago';

// Helper para convertir string de fecha a Date en zona horaria de Chile
const stringToChileDate = (dateString) => {
    if (!dateString) return null;
    try {
        const date = parseISO(dateString + 'T00:00:00');
        return toZonedTime(date, CHILE_TIMEZONE);
    } catch (error) {
        console.error('Error parsing date:', error);
        return null;
    }
};

// Helper para convertir Date a string ISO en zona horaria de Chile
const chileDateToString = (date) => {
    if (!date || !isValid(date)) return '';
    try {
        const utcDate = fromZonedTime(date, CHILE_TIMEZONE);
        return format(utcDate, 'yyyy-MM-dd');
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

// Helper para crear fecha máxima/minima en zona horaria de Chile
const createChileDate = (dateString, time = '00:00:00') => {
    if (!dateString) return null;
    try {
        const date = parseISO(dateString + 'T' + time);
        return toZonedTime(date, CHILE_TIMEZONE);
    } catch (error) {
        console.error('Error creating Chile date:', error);
        return null;
    }
};

const LightweightDatePicker = ({
    value,
    onChange,
    placeholder = "Seleccionar fecha",
    disabled = false,
    maxDate,
    minDate,
    className = "",
    inputClassName = "",
    showIcon = true,
    error = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(value ? stringToChileDate(value) : new Date());
    const [selectedDate, setSelectedDate] = useState(value ? stringToChileDate(value) : null);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'month', 'year'
    const [yearRange, setYearRange] = useState(() => {
        const currentYear = new Date().getFullYear();
        const currentDecade = Math.floor(currentYear / 10) * 10;
        return { start: currentDecade, end: currentDecade + 9 };
    }); // Para navegación por décadas
    const [dropdownPosition, setDropdownPosition] = useState({ top: 'auto', bottom: 'auto', left: 'auto', right: 'auto' });
    const [holidays, setHolidays] = useState([]);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Nombres de días y meses en español (Lunes a Domingo)
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

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
                    // Debug log removido para producción
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
        console.log('Feriados cargados (estáticos):', holidayDates.length);
    };

    // Función para verificar si una fecha es feriado
    const isHoliday = (date) => {
        return holidays.some(holiday => 
            holiday.getDate() === date.getDate() &&
            holiday.getMonth() === date.getMonth() &&
            holiday.getFullYear() === date.getFullYear()
        );
    };

    // Calcular posición del dropdown
    const calculateDropdownPosition = () => {
        if (!inputRef.current) return;

        const inputRect = inputRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const dropdownHeight = 400; // Altura aproximada del dropdown
        const dropdownWidth = 320; // Ancho del dropdown

        let position = { top: 'auto', bottom: 'auto', left: 'auto', right: 'auto' };

        // Calcular posición vertical
        const spaceBelow = viewportHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;

        if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
            // Mostrar abajo
            position.top = `${inputRect.height + 4}px`;
        } else {
            // Mostrar arriba
            position.bottom = `${inputRect.height + 4}px`;
        }

        // Calcular posición horizontal
        const spaceRight = viewportWidth - inputRect.left;
        const spaceLeft = inputRect.right;

        if (spaceRight >= dropdownWidth) {
            // Alinear a la izquierda
            position.left = '0px';
        } else if (spaceLeft >= dropdownWidth) {
            // Alinear a la derecha
            position.right = '0px';
        } else {
            // Centrar
            position.left = `${(dropdownWidth - inputRect.width) / -2}px`;
        }

        setDropdownPosition(position);
    };

    // Cargar feriados al montar el componente
    useEffect(() => {
        fetchHolidays();
    }, []);

    // Actualizar selectedDate cuando cambia el prop value
    useEffect(() => {
        const newSelectedDate = value ? stringToChileDate(value) : null;
        setSelectedDate(newSelectedDate);
        
        // También actualizar currentMonth si hay una fecha seleccionada
        if (newSelectedDate) {
            setCurrentMonth(newSelectedDate);
        }
    }, [value]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setViewMode('calendar');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            calculateDropdownPosition();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Recalcular posición al cambiar el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => {
            if (isOpen) {
                calculateDropdownPosition();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    // Generar días del mes
    const generateDays = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes como primer día
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    };

    // Manejar selección de fecha
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        const isoDate = chileDateToString(date);
        onChange({ target: { value: isoDate } });
        setIsOpen(false);
    };

    // Navegación de meses
    const goToPreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    // Generar años para un rango específico
    const generateYearsForRange = (start, end) => {
        const years = [];
        for (let year = start; year <= end; year++) {
            years.push(year);
        }
        return years;
    };

    // Generar años para el selector con navegación por décadas
    const generateYears = useMemo(() => {
        return generateYearsForRange(yearRange.start, yearRange.end);
    }, [yearRange.start, yearRange.end]);

    // Navegar a la década anterior
    const goToPreviousDecade = () => {
        console.log('Navegando a década anterior');
        setYearRange(prev => {
            const newStart = Math.max(1800, prev.start - 10);
            const newEnd = newStart + 9;
            console.log('Nueva década:', newStart, '-', newEnd);
            return { start: newStart, end: newEnd };
        });
    };

    // Navegar a la década siguiente
    const goToNextDecade = () => {
        console.log('Navegando a década siguiente');
        const currentYear = new Date().getFullYear();
        setYearRange(prev => {
            const newStart = Math.min(currentYear + 40, prev.start + 10);
            const newEnd = newStart + 9;
            console.log('Nueva década:', newStart, '-', newEnd);
            return { start: newStart, end: newEnd };
        });
    };

    // Manejar selección de mes
    const handleMonthSelect = (monthIndex) => {
        const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
        setCurrentMonth(newDate);
        setViewMode('calendar');
    };

    // Manejar selección de año
    const handleYearSelect = (year) => {
        const newDate = new Date(year, currentMonth.getMonth(), 1);
        setCurrentMonth(newDate);
        setViewMode('calendar');
    };

    // Abrir selector de mes
    const openMonthSelector = () => {
        setViewMode('month');
    };

    // Abrir selector de año
    const openYearSelector = () => {
        setViewMode('year');
    };

    // Verificar si una fecha está deshabilitada
    const isDateDisabled = (date) => {
        if (minDate) {
            const minChileDate = createChileDate(minDate, '00:00:00');
            if (minChileDate && date < minChileDate) return true;
        }
        if (maxDate) {
            const maxChileDate = createChileDate(maxDate, '23:59:59');
            if (maxChileDate && date > maxChileDate) return true;
        }
        return false;
    };

    // Obtener clases CSS para una fecha
    const getDateClasses = (date) => {
        const baseClasses = "w-8 h-8 flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors";
        const isSunday = date.getDay() === 0; // 0 = Domingo
        const isHolidayDate = isHoliday(date);
        
        if (!isSameMonth(date, currentMonth)) {
            return `${baseClasses} text-gray-400 cursor-not-allowed`;
        }
        
        if (isDateDisabled(date)) {
            return `${baseClasses} text-gray-300 cursor-not-allowed bg-gray-100`;
        }
        
        if (selectedDate && isSameDay(date, selectedDate)) {
            return `${baseClasses} bg-[#4EB9FA] text-white font-semibold`;
        }
        
        if (isSameDay(date, new Date())) {
            return `${baseClasses} bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200`;
        }
        
        // Feriados oficiales de Chile - siempre en rojo
        if (isHolidayDate) {
            return `${baseClasses} text-red-600 font-semibold hover:bg-red-100`;
        }
        
        // Domingo (feriado en Chile) - siempre en rojo
        if (isSunday) {
            return `${baseClasses} text-red-600 font-semibold hover:bg-red-100`;
        }
        
        return `${baseClasses} text-gray-700 hover:bg-gray-100`;
    };

    const days = generateDays();

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: es }) : ''}
                    placeholder={placeholder}
                    readOnly
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`
                        w-full p-3 bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition cursor-pointer
                        ${error ? 'border-red-500 focus:ring-red-500/40 bg-red-50' : ''}
                        ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
                        ${inputClassName}
                    `}
                />
                {showIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2C3E50] opacity-70 pointer-events-none">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                    </div>
                )}
            </div>

            {/* Dropdown Calendar */}
            {isOpen && (
                <div 
                    className="absolute bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 min-w-[320px] max-w-[320px]"
                    style={{
                        top: dropdownPosition.top,
                        bottom: dropdownPosition.bottom,
                        left: dropdownPosition.left,
                        right: dropdownPosition.right,
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={goToPreviousMonth}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={viewMode !== 'calendar'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15,18 9,12 15,6"/>
                            </svg>
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={openMonthSelector}
                                className="text-lg font-semibold text-[#2C3E50] hover:text-[#4EB9FA] transition-colors px-2 py-1 rounded"
                            >
                                {monthNames[currentMonth.getMonth()]}
                            </button>
                            <button
                                type="button"
                                onClick={openYearSelector}
                                className="text-lg font-semibold text-[#2C3E50] hover:text-[#4EB9FA] transition-colors px-2 py-1 rounded"
                            >
                                {currentMonth.getFullYear()}
                            </button>
                        </div>
                        
                        <button
                            type="button"
                            onClick={goToNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={viewMode !== 'calendar'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9,18 15,12 9,6"/>
                            </svg>
                        </button>
                    </div>

                    {/* Month Selector */}
                    {viewMode === 'month' && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {monthNames.map((month, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleMonthSelect(index)}
                                    className={`p-2 text-sm rounded transition-colors ${
                                        index === currentMonth.getMonth()
                                            ? 'bg-[#4EB9FA] text-white font-semibold'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Year Selector */}
                    {viewMode === 'year' && (
                        <div className="mb-4">
                            {/* Navegación por décadas */}
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    type="button"
                                    onClick={goToPreviousDecade}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    disabled={yearRange.start <= 1800}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="15,18 9,12 15,6"/>
                                    </svg>
                                </button>
                                
                                <div className="text-sm font-semibold text-[#2C3E50]">
                                    {yearRange.start} - {yearRange.end}
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={goToNextDecade}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    disabled={yearRange.end >= new Date().getFullYear() + 49}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9,18 15,12 9,6"/>
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Grid de años */}
                            <div className="max-h-48 overflow-y-auto">
                                <div className="grid grid-cols-4 gap-2">
                                    {generateYears.map((year) => (
                                        <button
                                            key={year}
                                            type="button"
                                            onClick={() => handleYearSelect(year)}
                                            className={`p-2 text-sm rounded transition-colors ${
                                                year === currentMonth.getFullYear()
                                                    ? 'bg-[#4EB9FA] text-white font-semibold'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Calendar View */}
                    {viewMode === 'calendar' && (
                        <>
                            {/* Days of week */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {dayNames.map((day) => (
                                    <div key={day} className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-gray-500">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((date, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => !isDateDisabled(date) && handleDateSelect(date)}
                                        disabled={isDateDisabled(date)}
                                        className={getDateClasses(date)}
                                    >
                                        {format(date, 'd')}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Footer buttons */}
                    <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                        {viewMode === 'calendar' && (
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    setCurrentMonth(today);
                                    handleDateSelect(today);
                                }}
                                className="px-3 py-1 text-sm text-[#4EB9FA] hover:bg-blue-50 rounded transition-colors"
                            >
                                Hoy
                            </button>
                        )}
                        {viewMode !== 'calendar' && (
                            <button
                                type="button"
                                onClick={() => setViewMode('calendar')}
                                className="px-3 py-1 text-sm text-[#4EB9FA] hover:bg-blue-50 rounded transition-colors"
                            >
                                ← Volver
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedDate(null);
                                onChange({ target: { value: '' } });
                                setIsOpen(false);
                                setViewMode('calendar');
                            }}
                            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LightweightDatePicker;
