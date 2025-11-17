import React, { useState, useRef, useEffect } from 'react';

const TimePickerComponent = ({
    value,
    onChange,
    placeholder = "Seleccionar hora",
    disabled = false,
    format = "24", // "24" o "12"
    step = 1, // Intervalos en minutos (1 = todos los minutos)
    maxTime,
    minTime,
    className = "",
    inputClassName = "",
    showIcon = true,
    error = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState('');
    const [selectedMinute, setSelectedMinute] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 'auto', bottom: 'auto', left: 'auto', right: 'auto' });
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Parsear valor inicial
    useEffect(() => {
        if (value) {
            const [hour, minute] = value.split(':');
            setSelectedHour(hour || '');
            setSelectedMinute(minute || '');
        } else {
            setSelectedHour('');
            setSelectedMinute('');
        }
    }, [value]);

    // Calcular posición del dropdown
    const calculateDropdownPosition = () => {
        if (!inputRef.current) return;

        const inputRect = inputRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const dropdownHeight = 250;
        const dropdownWidth = 320;

        let position = { top: 'auto', bottom: 'auto', left: 'auto', right: 'auto' };

        // Calcular posición vertical
        const spaceBelow = viewportHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;

        if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
            position.top = `${inputRect.height + 4}px`;
        } else {
            position.bottom = `${inputRect.height + 4}px`;
        }

        // Calcular posición horizontal
        const spaceRight = viewportWidth - inputRect.left;
        const spaceLeft = inputRect.right;

        if (spaceRight >= dropdownWidth) {
            position.left = '0px';
        } else if (spaceLeft >= dropdownWidth) {
            position.right = '0px';
        } else {
            position.left = `${(dropdownWidth - inputRect.width) / -2}px`;
        }

        setDropdownPosition(position);
    };

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
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

    // Generar horas
    const generateHours = () => {
        const hours = [];
        const maxHour = format === "12" ? 12 : 23;
        const startHour = format === "12" ? 1 : 0;
        
        for (let hour = startHour; hour <= maxHour; hour++) {
            hours.push(hour.toString().padStart(2, '0'));
        }
        return hours;
    };

    // Generar minutos
    const generateMinutes = () => {
        const minutes = [];
        for (let minute = 0; minute < 60; minute += step) {
            minutes.push(minute.toString().padStart(2, '0'));
        }
        return minutes;
    };

    // Manejar selección de hora
    const handleHourSelect = (hour) => {
        setSelectedHour(hour);
        if (selectedMinute) {
            const timeString = `${hour}:${selectedMinute}`;
            onChange({ target: { value: timeString } });
        }
    };

    // Manejar selección de minuto
    const handleMinuteSelect = (minute) => {
        setSelectedMinute(minute);
        if (selectedHour) {
            const timeString = `${selectedHour}:${minute}`;
            onChange({ target: { value: timeString } });
            setIsOpen(false);
        }
    };

    // Función para establecer la hora actual
    const setCurrentTime = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        setSelectedHour(hours);
        setSelectedMinute(minutes);
        onChange({ target: { value: timeString } });
    };

    // Formatear hora para mostrar
    const formatDisplayTime = () => {
        if (!selectedHour || !selectedMinute) return '';
        return `${selectedHour}:${selectedMinute}`;
    };

    // Limpiar selección
    const clearSelection = () => {
        setSelectedHour('');
        setSelectedMinute('');
        onChange({ target: { value: '' } });
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className="flex gap-2">
                {/* Input */}
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={formatDisplayTime()}
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
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                        </div>
                    )}
                </div>
                
                {/* Botón "Ahora" */}
                <button
                    type="button"
                    onClick={setCurrentTime}
                    disabled={disabled}
                    className={`
                        px-3 py-3 bg-[#4EB9FA] text-white rounded-lg hover:bg-[#3A9AE1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center
                        ${error ? 'border border-red-500' : ''}
                    `}
                    title="Establecer hora actual"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                </button>
            </div>

                 {/* Dropdown Time Picker */}
                 {isOpen && (
                     <div 
                         className="absolute bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-6 min-w-[280px] max-w-[280px]"
                         style={{
                             top: dropdownPosition.top,
                             bottom: dropdownPosition.bottom,
                             left: dropdownPosition.left,
                             right: dropdownPosition.right,
                         }}
                     >
                         {/* Time Inputs - Sin Header */}
                         <div className="flex items-center justify-center gap-2 mb-6">
                        {/* Hour Input */}
                        <div className="flex flex-col items-center">
                            {/* Flecha arriba (decrementar) */}
                            <button
                                type="button"
                                onClick={() => {
                                    const currentHour = parseInt(selectedHour) || 0;
                                    const maxHour = format === "12" ? 12 : 23;
                                    const newHour = currentHour <= (format === "12" ? 1 : 0) ? maxHour : currentHour - 1;
                                    const hourStr = newHour.toString().padStart(2, '0');
                                    setSelectedHour(hourStr);
                                    if (selectedMinute) {
                                        const timeString = `${hourStr}:${selectedMinute}`;
                                        onChange({ target: { value: timeString } });
                                    }
                                }}
                                className="w-10 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="18,15 12,9 6,15"/>
                                </svg>
                            </button>
                            
                            <input
                                type="text"
                                value={selectedHour}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                    const hour = format === "12" ? Math.min(parseInt(value) || 0, 12) : Math.min(parseInt(value) || 0, 23);
                                    const hourStr = hour.toString().padStart(2, '0');
                                    setSelectedHour(hourStr);
                                    if (selectedMinute) {
                                        const timeString = `${hourStr}:${selectedMinute}`;
                                        onChange({ target: { value: timeString } });
                                    }
                                }}
                                onFocus={(e) => e.target.select()}
                                className="w-16 h-14 text-3xl font-light text-center border-0 bg-transparent text-gray-800 focus:outline-none"
                                placeholder="00"
                                maxLength="2"
                            />
                            
                            {/* Flecha abajo (incrementar) */}
                            <button
                                type="button"
                                onClick={() => {
                                    const currentHour = parseInt(selectedHour) || 0;
                                    const maxHour = format === "12" ? 12 : 23;
                                    const newHour = currentHour >= maxHour ? (format === "12" ? 1 : 0) : currentHour + 1;
                                    const hourStr = newHour.toString().padStart(2, '0');
                                    setSelectedHour(hourStr);
                                    if (selectedMinute) {
                                        const timeString = `${hourStr}:${selectedMinute}`;
                                        onChange({ target: { value: timeString } });
                                    }
                                }}
                                className="w-10 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6,9 12,15 18,9"/>
                                </svg>
                            </button>
                        </div>

                        {/* Separador */}
                        <div className="flex items-center">
                            <div className="text-3xl font-light text-gray-400">:</div>
                        </div>

                        {/* Minute Input */}
                        <div className="flex flex-col items-center">
                            {/* Flecha arriba (decrementar) */}
                            <button
                                type="button"
                                onClick={() => {
                                    const currentMinute = parseInt(selectedMinute) || 0;
                                    const newMinute = currentMinute <= 0 ? 59 : currentMinute - 1;
                                    const minuteStr = newMinute.toString().padStart(2, '0');
                                    setSelectedMinute(minuteStr);
                                    if (selectedHour) {
                                        const timeString = `${selectedHour}:${minuteStr}`;
                                        onChange({ target: { value: timeString } });
                                    }
                                }}
                                className="w-10 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="18,15 12,9 6,15"/>
                                </svg>
                            </button>
                            
                            <input
                                type="text"
                                value={selectedMinute}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                    const minute = Math.min(parseInt(value) || 0, 59);
                                    const minuteStr = minute.toString().padStart(2, '0');
                                    setSelectedMinute(minuteStr);
                                    if (selectedHour) {
                                        const timeString = `${selectedHour}:${minuteStr}`;
                                        onChange({ target: { value: timeString } });
                                    }
                                }}
                                onFocus={(e) => e.target.select()}
                                className="w-16 h-14 text-3xl font-light text-center border-0 bg-transparent text-gray-800 focus:outline-none"
                                placeholder="00"
                                maxLength="2"
                            />
                            
                            {/* Flecha abajo (incrementar) */}
                            <button
                                type="button"
                                onClick={() => {
                                    const currentMinute = parseInt(selectedMinute) || 0;
                                    const newMinute = currentMinute >= 59 ? 0 : currentMinute + 1;
                                    const minuteStr = newMinute.toString().padStart(2, '0');
                                    setSelectedMinute(minuteStr);
                                    if (selectedHour) {
                                        const timeString = `${selectedHour}:${minuteStr}`;
                                        onChange({ target: { value: timeString } });
                                    }
                                }}
                                className="w-10 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6,9 12,15 18,9"/>
                                </svg>
                            </button>
                        </div>

                        {/* AM/PM Selector (solo para formato 12h) */}
                        {format === "12" && (
                            <div className="flex flex-col gap-1 ml-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Lógica para cambiar AM/PM si es necesario
                                    }}
                                    className="w-12 h-8 text-sm font-medium rounded-lg bg-[#4EB9FA] text-white transition-colors"
                                >
                                    AM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Lógica para cambiar AM/PM si es necesario
                                    }}
                                    className="w-12 h-8 text-sm font-medium rounded-lg bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    PM
                                </button>
                            </div>
                        )}
                    </div>

                        {/* Footer - Minimalista */}
                        <div className="flex justify-end items-center pt-4 border-t border-gray-100">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={clearSelection}
                                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-[#4EB9FA] hover:bg-[#4EB9FA]/10 rounded-lg transition-colors"
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                </div>
            )}
        </div>
    );
};

export default TimePickerComponent;
