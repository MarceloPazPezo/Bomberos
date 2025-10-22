import React from 'react';
import { MdScience, MdInfo } from 'react-icons/md';
import StaticValuesDemo from '@components/demo/StaticValuesDemo';

/**
 * Página demo para mostrar el componente de valores estáticos
 */
const DemoStaticValues = () => {
  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl rounded-2xl mb-4 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MdScience className="h-6 w-6 text-[#4EB9FA]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C3E50]">
              Demo - Valores Estáticos
            </h1>
            <p className="text-gray-600 text-sm">
              Componente de demostración para seleccionar tipos de sangre y estados de reporte
            </p>
          </div>
        </div>
      </div>

      {/* Información del demo */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <MdInfo className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">¿Qué hace este demo?</p>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>Tipos de sangre:</strong> Carga dinámicamente desde la API backend</li>
              <li>• <strong>Estados de reporte:</strong> Muestra valores estáticos simulados</li>
              <li>• <strong>Selección:</strong> Permite seleccionar y obtener valores</li>
              <li>• <strong>Validación:</strong> Muestra confirmaciones y errores</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Componente demo */}
      <StaticValuesDemo />
    </div>
  );
};

export default DemoStaticValues;
