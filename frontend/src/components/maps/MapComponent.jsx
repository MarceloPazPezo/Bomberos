import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MdMyLocation, MdLocationOn, MdClear, MdMap, MdSearch } from 'react-icons/md';
import { getCoordinatesByLocation, getCoordinatesByName } from '@helpers/chileCoordinates';

const MapComponent = ({ 
  onLocationSelect = () => {}, 
  initialLocation = null,
  disabled = false,
  showTitle = true,
  height = '400px',
  region = null,
  comuna = null,
  locationName = null
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState('');
  const [maplibregl, setMaplibregl] = useState(null);

  // Obtener coordenadas por defecto basadas en región/comuna
  const getDefaultCenter = () => {
    if (region || comuna) {
      const coords = getCoordinatesByLocation(region, comuna);
      return [coords.lng, coords.lat]; // [lng, lat] para MapLibre
    }
    if (locationName) {
      const coords = getCoordinatesByName(locationName);
      return [coords.lng, coords.lat];
    }
    // Fallback a Santiago
    return [-70.6693, -33.4489]; // [lng, lat] para MapLibre
  };

  const defaultCenter = getDefaultCenter();

  // Cargar MapLibre dinámicamente
  useEffect(() => {
    const loadMapLibre = async () => {
      try {
        // Importar MapLibre dinámicamente
        const maplibreModule = await import('maplibre-gl');
        const maplibre = maplibreModule.default || maplibreModule;
        
        // Importar CSS
        await import('maplibre-gl/dist/maplibre-gl.css');
        
        setMaplibregl(maplibre);
      } catch (error) {
        console.error('Error cargando MapLibre:', error);
        setError('Error al cargar el mapa. Por favor, recarga la página.');
      }
    };

    loadMapLibre();
  }, []);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  // Función para actualizar el centro del mapa
  const updateMapCenter = useCallback(() => {
    if (map.current && !selectedLocation && (region || comuna || locationName)) {
      const newCenter = getDefaultCenter();
      map.current.setCenter(newCenter);
      // También ajustar el zoom para mejor vista
      map.current.setZoom(13);
    }
  }, [region, comuna, locationName, selectedLocation]);

  // Actualizar centro del mapa cuando cambien región/comuna
  useEffect(() => {
    updateMapCenter();
  }, [updateMapCenter]);

  // Inicializar el mapa
  useEffect(() => {
    if (!mapContainer.current || map.current || !maplibregl) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }
          ]
        },
        center: selectedLocation ? [selectedLocation.lng, selectedLocation.lat] : defaultCenter,
        zoom: 15,
        attributionControl: true
      });

      // Agregar controles de navegación
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

      // Agregar marcador inicial si hay ubicación seleccionada
      if (selectedLocation) {
        addMarker(selectedLocation);
      }

      // Agregar listener para clics en el mapa
      map.current.on('click', (e) => {
        if (disabled) return;
        
        const location = {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        };
        
        handleLocationSelect(location);
      });

      // Cargar cuando el mapa esté listo
      map.current.on('load', () => {
        // Re-centrar el mapa si hay región/comuna especificada
        setTimeout(() => {
          updateMapCenter();
        }, 100);
      });

    } catch (error) {
      console.error('Error inicializando mapa:', error);
      setError('Error al cargar el mapa');
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [maplibregl, selectedLocation, disabled]);

  // Actualizar marcador cuando cambie la ubicación seleccionada
  useEffect(() => {
    if (!map.current || !selectedLocation || !maplibregl) return;

    if (marker.current) {
      marker.current.setLngLat([selectedLocation.lng, selectedLocation.lat]);
      map.current.setCenter([selectedLocation.lng, selectedLocation.lat]);
    } else {
      addMarker(selectedLocation);
    }

    // Obtener dirección desde coordenadas
    getAddressFromCoordinates(selectedLocation);
  }, [selectedLocation, maplibregl]);

  const addMarker = (location) => {
    if (!maplibregl) return;
    
    if (marker.current) {
      marker.current.remove();
    }

    marker.current = new maplibregl.Marker({
      draggable: !disabled,
      color: '#ef4444' // Color rojo para el marcador
    })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current);

    // Agregar listener para arrastrar marcador
    if (!disabled) {
      marker.current.on('dragend', () => {
        const lngLat = marker.current.getLngLat();
        const location = {
          lat: lngLat.lat,
          lng: lngLat.lng
        };
        handleLocationSelect(location);
      });
    }
  };

  const handleLocationSelect = (location) => {
    if (disabled) return;

    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no está disponible en este navegador');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setUserLocation(location);
        handleLocationSelect(location);
        setLoading(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        setError('No se pudo obtener la ubicación actual');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const clearLocation = () => {
    if (disabled) return;
    
    setSelectedLocation(null);
    setUserLocation(null);
    setAddress('');
    onLocationSelect(null);
    
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
  };

  const getAddressFromCoordinates = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (error) {
      console.warn('Error obteniendo dirección:', error);
    }
  };

  const formatCoordinates = (location) => {
    if (!location) return 'No seleccionada';
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
  };

  // Mostrar loading mientras se carga MapLibre
  if (!maplibregl) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            <MdMap className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ubicación en el Mapa</h3>
            <span className="text-sm text-gray-500">(Opcional)</span>
          </div>
        )}
        
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Cargando mapa...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center space-x-2 mb-4">
          <MdMap className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ubicación en el Mapa</h3>
            {(region || comuna || locationName) && (
              <p className="text-sm text-gray-600">
                Centrado en: {comuna || region || locationName || 'Santiago, Chile'}
              </p>
            )}
          </div>
          <span className="text-sm text-gray-500">(Opcional)</span>
        </div>
      )}

      {/* Controles */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={disabled || loading}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          <MdMyLocation className="w-4 h-4" />
          <span>{loading ? 'Obteniendo...' : 'Mi Ubicación'}</span>
        </button>

        {selectedLocation && (
          <button
            type="button"
            onClick={clearLocation}
            disabled={disabled}
            className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            <MdClear className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Mapa */}
      <div className="relative">
        <div
          ref={mapContainer}
          style={{ height }}
          className="w-full rounded-lg border border-gray-300 overflow-hidden"
        />
        
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Obteniendo ubicación...</span>
            </div>
          </div>
        )}
      </div>

      {/* Información de la ubicación */}
      {selectedLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <MdLocationOn className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Ubicación seleccionada:</p>
              <p className="text-sm text-green-700 font-mono">
                {formatCoordinates(selectedLocation)}
              </p>
              {address && (
                <p className="text-sm text-green-600 mt-1 break-words">
                  {address}
                </p>
              )}
              {userLocation && (
                <p className="text-xs text-green-600 mt-1">
                  Basada en tu ubicación actual
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-sm text-gray-600">
          <strong>Instrucciones:</strong> Haz clic en el mapa para seleccionar una ubicación, 
          o usa "Mi Ubicación" para obtener tu posición actual. 
          Puedes arrastrar el marcador para ajustar la posición.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
