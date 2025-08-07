import React from 'react';
import { MdSchedule, MdUpdate, MdCalendarToday } from 'react-icons/md';

const DateDisplay = ({ createdAt, updatedAt, compact = false }) => {
  const formatDate = (dateValue) => {
    if (!dateValue) return null;
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
    
    return { 
      date: `${day}-${month}-${year}`, 
      time,
      fullDate: date,
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 604800)} semanas`;
    if (diffInSeconds < 31536000) return `Hace ${Math.floor(diffInSeconds / 2592000)} meses`;
    return `Hace ${Math.floor(diffInSeconds / 31536000)} años`;
  };

  const created = formatDate(createdAt);
  const updated = formatDate(updatedAt);
  const hasBeenUpdated = updated && updatedAt !== createdAt;

  if (compact) {
    return (
      <div className="text-xs w-full h-full px-2 py-1">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 w-full">
          <div className="text-green-600 font-medium whitespace-nowrap">Creación:</div>
          <div className="text-right">
            {created ? (
              <>
                <div className="font-medium">{created.date}</div>
                <div className="text-gray-500">{created.time}</div>
              </>
            ) : (
              <span className="text-gray-400">Sin fecha</span>
            )}
          </div>
          <div className="text-blue-600 font-medium whitespace-nowrap">Última Ed.:</div>
          <div className="text-right">
            {hasBeenUpdated && updated ? (
              <>
                <div className="font-medium">{updated.date}</div>
                <div className="text-gray-500">{updated.time}</div>
              </>
            ) : (
              <span className="text-gray-400">Sin cambios</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Fecha de creación */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <MdSchedule size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-green-700">CREACIÓN</span>
              {created && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  {created.relative}
                </span>
              )}
            </div>
            {created ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{created.date}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {created.time}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Sin fecha de creación</span>
            )}
          </div>
        </div>
      </div>

      {/* Fecha de actualización */}
      {hasBeenUpdated ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MdUpdate size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-blue-700">ÚLTIMA EDICIÓN</span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  {updated.relative}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{updated.date}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {updated.time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MdUpdate size={16} className="text-gray-400 flex-shrink-0" />
            <div>
              <span className="text-xs font-semibold text-gray-500">ÚLTIMA EDICIÓN</span>
              <div className="text-sm text-gray-400 mt-1">Sin modificaciones</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateDisplay;