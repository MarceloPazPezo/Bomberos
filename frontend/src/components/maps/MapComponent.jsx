import React, { useState, useEffect, useRef, useCallback } from "react";
import { MdLocationOn, MdClear, MdMap, MdSearch, MdInfo, MdWaterDrop } from "react-icons/md";
import { getCoordinatesByLocation, getCoordinatesByName } from "@helpers/chileCoordinates";

const MapComponent = ({
  onLocationSelect = () => {},
  initialLocation = null,
  disabled = false,
  showTitle = true,
  height = "400px",
  region = null,
  comuna = null,
  locationName = null,
  layers = [],
  showLocationInfo = true,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState("");
  const [maplibregl, setMaplibregl] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  // Función auxiliar para validar coordenadas
  const isValidCoordinate = (coord) => {
    return coord !== null && coord !== undefined && !isNaN(coord) && isFinite(coord);
  };

  // Obtener coordenadas por defecto basadas en región/comuna (síncrono para inicialización)
  const getDefaultCenter = () => {
    // Fallback a Cabrero siempre (evita problemas con async)
    return [-72.4, -37.0333]; // [lng, lat] para MapLibre
  };

  const defaultCenter = getDefaultCenter();

  // Cargar MapLibre dinámicamente
  useEffect(() => {
    const loadMapLibre = async () => {
      try {
        // Importar MapLibre dinámicamente
        const maplibreModule = await import("maplibre-gl");
        const maplibre = maplibreModule.default || maplibreModule;

        // Importar CSS
        await import("maplibre-gl/dist/maplibre-gl.css");

        setMaplibregl(maplibre);
      } catch (error) {
        console.error("Error cargando MapLibre:", error);
        setError("Error al cargar el mapa. Por favor, recarga la página.");
      }
    };

    loadMapLibre();
  }, []);

  const handleLocationSelect = useCallback(
    (location) => {
      if (disabled) return;
      setSelectedLocation(location);
      onLocationSelect(location);
    },
    [disabled, onLocationSelect]
  );

  // Función para crear/actualizar marcador
  const addMarker = useCallback(
    (location) => {
      if (!maplibregl || !map.current) return;

      if (marker.current) {
        marker.current.remove();
      }

      // Crear un elemento de marcador personalizado con icono SVG
      const el = document.createElement("div");
      el.style.cursor = "pointer";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.background = "white";
      el.style.borderRadius = "50%";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      el.style.border = "3px solid #3B82F6"; // Azul

      // Crear SVG del icono de ubicación
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "24");
      svg.setAttribute("height", "24");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "#3B82F6");

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      );

      svg.appendChild(path);
      el.appendChild(svg);

      marker.current = new maplibregl.Marker({
        element: el,
        draggable: !disabled,
        anchor: "center",
      })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current);

      // Agregar listener para arrastrar marcador
      if (!disabled) {
        marker.current.on("dragend", () => {
          const lngLat = marker.current.getLngLat();
          const location = {
            lat: lngLat.lat,
            lng: lngLat.lng,
          };
          handleLocationSelect(location);
        });
      }
    },
    [maplibregl, disabled, handleLocationSelect]
  );

  // Función para obtener dirección desde coordenadas
  const getAddressFromCoordinates = useCallback(async (location) => {
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
      console.warn("Error al obtener dirección:", error);
    }
  }, []);

  useEffect(() => {
    if (
      initialLocation &&
      isValidCoordinate(initialLocation.lat) &&
      isValidCoordinate(initialLocation.lng)
    ) {
      setSelectedLocation(initialLocation);

      // Si el mapa ya está inicializado, centrarlo en la nueva ubicación y crear/actualizar marcador
      if (map.current && maplibregl) {
        const currentZoom = map.current.getZoom();
        // Si no hay marcador, crear uno y centrar con zoom apropiado
        if (!marker.current) {
          addMarker(initialLocation);
          map.current.easeTo({
            center: [initialLocation.lng, initialLocation.lat],
            zoom: currentZoom > 13 ? currentZoom : 13, // Usar zoom actual si es mayor, sino 13
            duration: 500,
          });
        } else {
          // Si ya hay marcador, actualizar posición y centrar sin cambiar zoom
          marker.current.setLngLat([initialLocation.lng, initialLocation.lat]);
          map.current.easeTo({
            center: [initialLocation.lng, initialLocation.lat],
            zoom: currentZoom,
            duration: 300,
          });
        }
        // Obtener dirección desde coordenadas
        getAddressFromCoordinates(initialLocation);
      }
    } else if (initialLocation === null) {
      // Si initialLocation es null, limpiar la ubicación seleccionada
      setSelectedLocation(null);
    }
  }, [initialLocation, maplibregl, addMarker, getAddressFromCoordinates]);

  // Función para actualizar el centro del mapa
  const updateMapCenter = useCallback(async () => {
    if (map.current && (region || comuna || locationName) && !selectedLocation) {
      try {
        let newCenter = getDefaultCenter();

        // Intentar obtener coordenadas de la región/comuna si están disponibles
        if (region || comuna) {
          // Para geocodificación, necesitamos importar el servicio dinámicamente
          // o usar un callback. Por ahora, intentemos con getCoordinatesByLocation
          // que puede usar geocodificación si se pasa el callback
          const coords = await getCoordinatesByLocation(
            region,
            comuna,
            // Callback de geocodificación para comunas no encontradas
            async (comunaName, regionName) => {
              try {
                // Importar dinámicamente el servicio de geocodificación
                const { geocodingService } = await import("@services/geocoding.service");
                return await geocodingService.geocodeComuna(comunaName, regionName);
              } catch (error) {
                console.warn("Error al geocodificar en updateMapCenter:", error);
                return null;
              }
            }
          );
          if (coords && isValidCoordinate(coords.lat) && isValidCoordinate(coords.lng)) {
            newCenter = [coords.lng, coords.lat];
          }
        } else if (locationName) {
          const coords = await getCoordinatesByName(locationName);
          if (coords && isValidCoordinate(coords.lat) && isValidCoordinate(coords.lng)) {
            newCenter = [coords.lng, coords.lat];
          }
        }

        // Validar que el centro sea válido antes de establecerlo
        if (isValidCoordinate(newCenter[0]) && isValidCoordinate(newCenter[1])) {
          // Centrar el mapa sin mostrar marcador
          map.current.easeTo({
            center: newCenter,
            zoom: 13,
            duration: 500,
          });
        }
      } catch (error) {
        console.warn("Error al obtener coordenadas para centrar mapa:", error);
        // Usar centro por defecto si hay error
        map.current.easeTo({
          center: defaultCenter,
          zoom: 13,
          duration: 500,
        });
      }
    }
  }, [region, comuna, locationName, selectedLocation, defaultCenter]);

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
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
        },
        center:
          selectedLocation &&
          isValidCoordinate(selectedLocation.lat) &&
          isValidCoordinate(selectedLocation.lng)
            ? [selectedLocation.lng, selectedLocation.lat]
            : defaultCenter,
        zoom: 15,
        attributionControl: true,
      });

      // Agregar controles de navegación
      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
      map.current.addControl(new maplibregl.FullscreenControl(), "top-right");

      // Agregar marcador inicial si hay ubicación seleccionada
      if (selectedLocation) {
        addMarker(selectedLocation);
      }

      // Agregar listener para clics en el mapa
      map.current.on("click", (e) => {
        if (disabled) return;

        const location = {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        };

        handleLocationSelect(location);
      });

      // Cargar cuando el mapa esté listo
      map.current.on("load", () => {
        // Re-centrar el mapa si hay región/comuna especificada
        setTimeout(() => {
          updateMapCenter();
        }, 100);
      });
    } catch (error) {
      console.error("Error inicializando mapa:", error);
      setError("Error al cargar el mapa");
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [maplibregl, disabled]); // Removido selectedLocation para evitar reinicialización

  // Efecto para añadir capas personalizadas
  useEffect(() => {
    if (!map.current || !maplibregl || layers.length === 0) return;

    map.current.on("load", () => {
      layers.forEach((layer) => {
        if (!map.current.getSource(layer.id)) {
          map.current.addSource(layer.id, {
            type: "geojson",
            data: layer.data,
          });
        }
        if (!map.current.getLayer(layer.id)) {
          map.current.addLayer({
            id: layer.id,
            type: layer.type,
            source: layer.id,
            ...layer.options,
          });
        }
      });
    });
  }, [map.current, maplibregl, layers]);

  // Actualizar marcador cuando cambie la ubicación seleccionada
  useEffect(() => {
    if (!map.current || !selectedLocation || !maplibregl) return;

    // Validar coordenadas antes de usarlas
    if (!isValidCoordinate(selectedLocation.lat) || !isValidCoordinate(selectedLocation.lng)) {
      console.warn("Coordenadas inválidas:", selectedLocation);
      return;
    }

    if (marker.current) {
      // Si ya hay marcador, solo actualizar su posición sin cambiar zoom
      marker.current.setLngLat([selectedLocation.lng, selectedLocation.lat]);
      // Solo hacer un pan suave para centrar el marcador sin cambiar el zoom
      const currentZoom = map.current.getZoom();
      map.current.easeTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: currentZoom, // Mantener el zoom actual
        duration: 300,
      });
    } else {
      // Si no hay marcador, crearlo
      addMarker(selectedLocation);
      // Solo hacer un pan suave para centrar el marcador sin cambiar el zoom
      const currentZoom = map.current.getZoom();
      map.current.easeTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: currentZoom, // Mantener el zoom actual
        duration: 300,
      });
    }

    // Obtener dirección desde coordenadas
    getAddressFromCoordinates(selectedLocation);
  }, [selectedLocation, maplibregl, addMarker, getAddressFromCoordinates]);

  const clearLocation = () => {
    if (disabled) return;

    setSelectedLocation(null);
    setAddress("");
    onLocationSelect(null);

    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
  };

  const formatCoordinates = (location) => {
    if (!location) return "No seleccionada";
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
  };

  const toggleLegend = () => {
    setShowLegend(!showLegend);
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
                Centrado en: {comuna || region || locationName || "Santiago, Chile"}
              </p>
            )}
          </div>
          <span className="text-sm text-gray-500">(Opcional)</span>
        </div>
      )}

      {/* Controles */}
      {selectedLocation && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <MdLocationOn className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                {address ? (
                  <>
                    <p className="text-sm font-medium text-red-900 break-words leading-snug">
                      {address}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-red-900">Ubicación seleccionada</p>
                    <p className="text-xs text-red-600 mt-1">
                      {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={clearLocation}
              disabled={disabled}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 hover:border-red-400 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-sm hover:shadow flex-shrink-0 w-full sm:w-auto"
            >
              <MdClear className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div className="relative">
        <div
          ref={mapContainer}
          style={{ height }}
          className="w-full rounded-lg border border-gray-300 overflow-hidden"
        />

        {/* Botón de Leyenda */}
        <button
          type="button"
          onClick={toggleLegend}
          className="absolute top-2 right-20 bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
          title="Mostrar leyenda"
        >
          <MdInfo className="w-5 h-5 text-blue-600" />
        </button>

        {/* Leyenda */}
        {showLegend && (
          <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg border border-gray-200 w-48">
            <h4 className="text-md font-bold mb-2 text-gray-800">Leyenda</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <div className="w-6 h-6 mr-2 bg-white rounded-full border-2 border-blue-600 flex items-center justify-center">
                  <MdLocationOn className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Ubicación seleccionada</span>
              </li>
              <li className="flex items-center">
                <MdWaterDrop className="text-blue-500 w-6 h-6 mr-2" />
                <span className="text-sm text-gray-700">Grifo</span>
              </li>
              {/* Agrega más elementos de leyenda aquí */}
            </ul>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Obteniendo ubicación...</span>
            </div>
          </div>
        )}
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
