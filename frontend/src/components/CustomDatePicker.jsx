import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { MdCalendarToday, MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { dateHelper } from '../helpers/dateHelper';

const CustomDatePicker = ({
  selected,
  onChange,
  placeholder = "Seleccionar fecha",
  minDate,
  maxDate,
  className = "",
  disabled = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const datePickerRef = useRef(null);
  const containerRef = useRef(null);

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
          console.log('Feriados cargados desde API:', holidayDates.length);
          console.log('Primeros 5 feriados:', holidayDates.slice(0, 5).map(d => d.toISOString().split('T')[0]));
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
    console.log('Incluye 18 de septiembre:', holidayDates.some(d => d.getDate() === 18 && d.getMonth() === 8));
  };

  // Función para verificar si una fecha es feriado
  const isHoliday = (date) => {
    const isHolidayDate = holidays.some(holiday => 
      holiday.getDate() === date.getDate() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getFullYear() === date.getFullYear()
    );
    
    // Log para depuración - solo para fechas específicas
    if (date.getDate() === 18 && date.getMonth() === 8) { // 18 de septiembre (mes 8 = septiembre)
      console.log('Verificando 18 de septiembre:', {
        fecha: date.toISOString().split('T')[0],
        esFeriado: isHolidayDate,
        feriadosDisponibles: holidays.map(h => h.toISOString().split('T')[0])
      });
    }
    
    return isHolidayDate;
  };

  // Cargar feriados al montar el componente
  useEffect(() => {
    fetchHolidays();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const CustomHeader = ({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#4EB9FA]/10 to-[#3A9BD9]/10 border-b border-[#2C3E50]/10">
        <button
          type="button"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          className="p-2 rounded-lg bg-white/80 border border-[#2C3E50]/20 shadow-md hover:shadow-lg hover:bg-[#4EB9FA]/10 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdKeyboardArrowLeft className="w-5 h-5 text-[#2C3E50]" />
        </button>
        
        <div className="text-lg font-bold text-[#2C3E50] tracking-wide">
          {monthNames[date.getMonth()]} {date.getFullYear()}
        </div>
        
        <button
          type="button"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          className="p-2 rounded-lg bg-white/80 border border-[#2C3E50]/20 shadow-md hover:shadow-lg hover:bg-[#4EB9FA]/10 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdKeyboardArrowRight className="w-5 h-5 text-[#2C3E50]" />
        </button>
      </div>
    );
  };

  const CustomDay = ({ day, date, selected, onClick }) => {
    const isToday = new Date().toDateString() === date.toDateString();
    const isSelected = selected && selected.toDateString() === date.toDateString();
    const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);

    let dayClasses = "w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-all duration-300 cursor-pointer ";
    
    if (isDisabled) {
      dayClasses += "text-gray-300 cursor-not-allowed opacity-40";
    } else if (isSelected) {
      dayClasses += "bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold scale-110 shadow-lg";
    } else if (isToday) {
      dayClasses += "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 font-bold ring-2 ring-amber-300";
    } else {
      dayClasses += "text-slate-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:scale-110 hover:shadow-lg";
    }

    return (
      <div
        className={dayClasses}
        onClick={!isDisabled ? onClick : undefined}
      >
        {day}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input Field */}
      <div
        className={`relative cursor-pointer ${className}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <input
          type="text"
          value={formatDate(selected)}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className="w-full pl-11 pr-4 p-3 bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#4EB9FA]/40 hover:shadow-md"
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C3E50]/60 pointer-events-none">
          <MdCalendarToday size={20} />
        </span>
      </div>

      {/* Custom Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-[#2C3E50]/10 overflow-hidden animate-slideIn" style={{
          boxShadow: '0 25px 50px -12px rgba(44, 62, 80, 0.15)'
        }}>
          <DatePicker
            selected={selected}
            onChange={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
            inline
            locale={es}
            minDate={minDate}
            maxDate={maxDate}
            renderCustomHeader={CustomHeader}
            dayClassName={(date) => {
              // Usar solo JavaScript nativo para evitar problemas de zona horaria
              const today = new Date();
              const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
              const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
              
              const isToday = todayStr === dateStr;
              const isSelected = selected && selected.getFullYear() === date.getFullYear() && selected.getMonth() === date.getMonth() && selected.getDate() === date.getDate();
              const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);
              const isSaturday = date.getDay() === 6; // 6 = Sábado
              const isSunday = date.getDay() === 0; // 0 = Domingo
              const isHolidayDate = isHoliday(date);
              

              
              if (isDisabled) return "custom-day-disabled";
              if (isSelected) return "custom-day-selected";
              if (isToday) return "custom-day-today";
              if (isHolidayDate || isSunday) return "custom-day-holiday";
              if (isSaturday) return "custom-day-weekend";
              return "custom-day-normal";
            }}
            {...props}
          />
        </div>
      )}

      <style>{`
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .react-datepicker {
          border: none !important;
          box-shadow: none !important;
          font-family: inherit !important;
        }
        
        .react-datepicker__header {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }
        
        .react-datepicker__current-month,
        .react-datepicker__navigation {
          display: none !important;
        }
        
        .react-datepicker__month-container {
          padding: 1.25rem !important;
        }
        
        .react-datepicker__month {
          margin: 0 !important;
        }
        
        .react-datepicker__day-names {
          display: flex !important;
          justify-content: space-between !important;
          margin-bottom: 0.75rem !important;
          padding: 0 0.5rem !important;
        }
        
        .react-datepicker__day-name {
          color: #2C3E50 !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          width: 2.5rem !important;
          height: 2.5rem !important;
          line-height: 2.5rem !important;
          text-align: center !important;
        }
        
        .react-datepicker__week {
          display: flex !important;
          justify-content: space-between !important;
          margin-bottom: 0.25rem !important;
          padding: 0 0.5rem !important;
        }
        
        .react-datepicker__day {
          width: 2.5rem !important;
          height: 2.5rem !important;
          line-height: 2.5rem !important;
          margin: 0.125rem !important;
          border-radius: 0.5rem !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .react-datepicker__day.custom-day-normal {
          color: #2C3E50 !important;
          background: transparent !important;
        }
        
        .react-datepicker__day.custom-day-normal:hover {
          background: rgba(78, 185, 250, 0.1) !important;
          color: #4EB9FA !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(78, 185, 250, 0.15) !important;
        }
        
        .react-datepicker__day.custom-day-selected {
          background: linear-gradient(to bottom right, #4EB9FA, #3A9BD9) !important;
          color: white !important;
          font-weight: 700 !important;
          transform: scale(1.05) !important;
          box-shadow: 0 6px 20px rgba(78, 185, 250, 0.3) !important;
        }
        
        .react-datepicker__day.custom-day-today {
          background: linear-gradient(to bottom right, #4EB9FA, #3A9BD9) !important;
          color: white !important;
          font-weight: 700 !important;
          box-shadow: 0 0 0 3px #FFC107, 0 4px 12px rgba(78, 185, 250, 0.4) !important;
          transform: scale(1.05) !important;
        }
        
        .react-datepicker__day.custom-day-disabled {
          color: rgba(44, 62, 80, 0.3) !important;
          cursor: not-allowed !important;
          opacity: 0.4 !important;
        }
        
        .react-datepicker__day.custom-day-disabled:hover {
          background: transparent !important;
          transform: none !important;
          box-shadow: none !important;
        }
        
        .react-datepicker__day.custom-day-weekend {
          color: #374151 !important;
          background: transparent !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day.custom-day-weekend:hover {
          background: rgba(55, 65, 81, 0.1) !important;
          color: #1f2937 !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(55, 65, 81, 0.15) !important;
        }
        
        .react-datepicker__day.custom-day-holiday {
          color: #dc2626 !important;
          background: transparent !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day.custom-day-holiday:hover {
          background: rgba(220, 38, 38, 0.1) !important;
          color: #b91c1c !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15) !important;
        }
        
        .react-datepicker__day--outside-month {
          color: rgba(44, 62, 80, 0.3) !important;
          opacity: 0.5 !important;
        }
      `}</style>
    </div>
  );
};

export default CustomDatePicker;