import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import PropTypes from "prop-types";
import { getCoordinatesByLocation } from "@helpers/chileCoordinates";

const libraries = ["drawing", "geometry"];

const GoogleMapPicker = ({
  initialLocation = null,
  onLocationSelect,
  disabled = false,
  height = "400px",
  region = null,
  comuna = null,
  showLocationInfo = true,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  // Centro por defecto (Chile central)
  const defaultCenter = { lat: -33.4489, lng: -70.6693 };

  const [markerPosition, setMarkerPosition] = useState(
    initialLocation && initialLocation.lat && initialLocation.lng
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : null
  );

  const [mapCenter, setMapCenter] = useState(
    initialLocation && initialLocation.lat && initialLocation.lng
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : defaultCenter
  );

  const [map, setMap] = useState(null);

  // Actualizar marcador cuando cambia initialLocation desde props
  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      const newPos = { lat: initialLocation.lat, lng: initialLocation.lng };
      setMarkerPosition(newPos);
      setMapCenter(newPos);
      if (map) {
        map.panTo(newPos);
      }
    }
  }, [initialLocation, map]);

  // Centrar mapa cuando cambian región/comuna (geocodificación)
  useEffect(() => {
    const centerMapByLocation = async () => {
      // Solo geocodificar si hay región o comuna Y no hay marcador colocado
      if ((region || comuna) && !markerPosition && map) {
        try {
          const coords = await getCoordinatesByLocation(
            region,
            comuna,
            // Callback de geocodificación para comunas no encontradas
            async (comunaName, regionName) => {
              try {
                const { geocodingService } = await import("@services/geocoding.service");
                return await geocodingService.geocodeComuna(comunaName, regionName);
              } catch (error) {
                console.warn("Error al geocodificar:", error);
                return null;
              }
            }
          );

          if (coords && coords.lat && coords.lng) {
            const newCenter = { lat: coords.lat, lng: coords.lng };
            setMapCenter(newCenter);
            map.panTo(newCenter);
            map.setZoom(13);
          }
        } catch (error) {
          console.warn("Error al centrar mapa por ubicación:", error);
        }
      }
    };

    centerMapByLocation();
  }, [region, comuna, markerPosition, map]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMapClick = useCallback(
    (e) => {
      if (disabled) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      const newPosition = { lat, lng };
      setMarkerPosition(newPosition);

      if (onLocationSelect) {
        onLocationSelect({ lat, lng });
      }
    },
    [disabled, onLocationSelect]
  );

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "transit",
        stylers: [{ visibility: "off" }],
      },
    ],
  };

  if (!isLoaded) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: height,
          borderRadius: "0.5rem",
        }}
        center={mapCenter}
        zoom={markerPosition ? 15 : 12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={!disabled}
            onDragEnd={(e) => {
              if (disabled) return;
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              const newPosition = { lat, lng };
              setMarkerPosition(newPosition);
              if (onLocationSelect) {
                onLocationSelect({ lat, lng });
              }
            }}
          />
        )}
      </GoogleMap>

      {showLocationInfo && markerPosition && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm space-y-1">
            {region && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Región:</span>
                <span className="text-gray-600">{region}</span>
              </div>
            )}
            {comuna && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Comuna:</span>
                <span className="text-gray-600">{comuna}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Coordenadas:</span>
              <span className="text-gray-600 font-mono text-xs">
                {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
              </span>
            </div>
          </div>
        </div>
      )}

      {!disabled && !markerPosition && (
        <div className="mt-2 text-sm text-gray-500 text-center">
          Haz clic en el mapa para seleccionar una ubicación
        </div>
      )}
    </div>
  );
};

GoogleMapPicker.propTypes = {
  initialLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  onLocationSelect: PropTypes.func,
  disabled: PropTypes.bool,
  height: PropTypes.string,
  region: PropTypes.string,
  comuna: PropTypes.string,
  showLocationInfo: PropTypes.bool,
};

export default GoogleMapPicker;
