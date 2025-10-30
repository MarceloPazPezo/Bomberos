import React from 'react';
import { getAvailableIcons, getIconInfo, getIconoSvg } from '@helpers/mapIcons';

const MapIconsDemo = () => {
    const availableIcons = getAvailableIcons();
    
    // Agrupar iconos por categoría
    const iconsByCategory = availableIcons.reduce((acc, iconName) => {
        const info = getIconInfo(iconName);
        if (!acc[info.category]) {
            acc[info.category] = [];
        }
        acc[info.category].push(info);
        return acc;
    }, {});

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    🎨 Iconos Disponibles para Puntos de Interés
                </h2>
                <p className="text-gray-600">
                    Todos los iconos que se pueden usar en el mapa según el tipo de punto.
                </p>
            </div>

            {Object.entries(iconsByCategory).map(([category, icons]) => (
                <div key={category} className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4 border-b border-gray-200 pb-2">
                        {category} ({icons.length} iconos)
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {icons.map((iconInfo) => (
                            <div 
                                key={iconInfo.name} 
                                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                            >
                                <div className="text-center">
                                    {/* Mostrar el icono SVG */}
                                    <div 
                                        className="w-8 h-8 mx-auto mb-2 flex items-center justify-center text-blue-600"
                                        dangerouslySetInnerHTML={{ 
                                            __html: getIconoSvg(iconInfo.name).replace('currentColor', 'currentColor')
                                        }}
                                    />
                                    
                                    {/* Nombre del icono */}
                                    <div className="text-xs text-gray-600 font-mono break-all">
                                        {iconInfo.name}
                                    </div>
                                    
                                    {/* Indicador de uso */}
                                    <div className="text-xs text-green-600 mt-1">
                                        ✓ Disponible
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">💡 Cómo usar estos iconos:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Los iconos se asignan automáticamente según el tipo de punto</li>
                    <li>• Cada tipo de punto tiene un icono específico definido en el backend</li>
                    <li>• Los iconos aparecen tanto en el mapa como en los popups</li>
                    <li>• Se pueden agregar nuevos iconos editando el archivo <code className="bg-blue-100 px-1 rounded">mapIcons.js</code></li>
                </ul>
            </div>
        </div>
    );
};

export default MapIconsDemo;

