import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRegion } from "@hooks/region/useRegion";
import { getCoordinatesByLocation } from "@helpers/chileCoordinates";
import { geocodingService } from "@services/geocoding.service";
import GoogleMapPicker from "@components/maps/GoogleMapPicker";
import { MdLocationOn, MdLocationCity, MdHelpOutline } from "react-icons/md";
import Select from "react-select";

// Estilos comunes para los select (igual que en crearParte)
const commonSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "#4EB9FA" : "#D1D5DB",
    borderWidth: "2px",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(78, 185, 250, 0.1)" : "none",
    "&:hover": {
      borderColor: "#4EB9FA",
    },
    minHeight: "44px",
    borderRadius: "10px",
    fontSize: "0.9rem",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 25,
    borderRadius: "10px",
    overflow: "hidden",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "260px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#4EB9FA" : state.isFocused ? "#E0F2FE" : "white",
    color: state.isSelected ? "#FFFFFF" : "#1F2937",
    fontSize: "0.9rem",
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: "0.9rem",
    color: "#9CA3AF",
  }),
  input: (base) => ({
    ...base,
    fontSize: "0.9rem",
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: "0.9rem",
    color: "#1F2937",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

/**
 * Componente mejorado para seleccionar dirección con región, comuna y mapa
 * @param {Object} props
 * @param {Object} props.initialData - Datos iniciales de la dirección
 * @param {Function} props.onChange - Callback cuando cambian los datos
 * @param {Object} props.errors - Errores de validación
 * @param {boolean} props.disabled - Si está deshabilitado
 * @param {boolean} props.showMap - Si mostrar el mapa (default: true)
 */
const DirectionSelector = ({
  initialData = null,
  onChange = () => {},
  errors = {},
  disabled = false,
  showMap = true,
}) => {
  const {
    regiones: regionesRaw,
    comunas: comunasRaw,
    loadingComunas,
    loadingRegiones,
    fetchComunasByRegion,
    error,
  } = useRegion();

  // Asegurar que siempre sean arrays
  const regiones = Array.isArray(regionesRaw) ? regionesRaw : [];
  const comunas = Array.isArray(comunasRaw) ? comunasRaw : [];

  const [formData, setFormData] = useState({
    idRegion: "",
    idComuna: "",
    calle: "",
    numero: "",
    depto: "",
    referencia: "",
    codigoPostal: "",
    latitud: null,
    longitud: null,
  });

  const [mapLocation, setMapLocation] = useState(null);
  const [loadingCoordinates, setLoadingCoordinates] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [regionChangedByUser, setRegionChangedByUser] = useState(false);
  const [userSelectedLocation, setUserSelectedLocation] = useState(false);

  // Portal para los menus de react-select
  const selectMenuPortalTarget = typeof window !== "undefined" ? document.body : null;

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      console.log("[DirectionSelector] Cargando initialData:", initialData);
      setIsInitialLoad(true); // Marcar que estamos en carga inicial

      const newFormData = {
        idRegion: initialData.comuna?.region?.id || initialData.idRegion || "",
        idComuna: initialData.comuna?.id || initialData.idComuna || "",
        calle: initialData.calle || "",
        numero: initialData.numero || "",
        depto: initialData.depto || "",
        referencia: initialData.referencia || "",
        codigoPostal: initialData.codigoPostal || "",
        latitud: initialData.latitud || null,
        longitud: initialData.longitud || null,
      };

      console.log("[DirectionSelector] FormData inicial:", newFormData);
      console.log("[DirectionSelector] Coordenadas recibidas:", {
        lat: newFormData.latitud,
        lng: newFormData.longitud,
        tipo: typeof newFormData.latitud,
        esNumero: typeof newFormData.latitud === "number",
        noEsNaN: !isNaN(newFormData.latitud),
      });

      setFormData(newFormData);

      // Si hay latitud y longitud, establecer ubicación del mapa y marcar como seleccionada
      if (
        newFormData.latitud &&
        newFormData.longitud &&
        typeof newFormData.latitud === "number" &&
        typeof newFormData.longitud === "number" &&
        !isNaN(newFormData.latitud) &&
        !isNaN(newFormData.longitud)
      ) {
        console.log("[DirectionSelector] Estableciendo mapLocation con coordenadas:", {
          lat: newFormData.latitud,
          lng: newFormData.longitud,
        });
        setMapLocation({
          lat: newFormData.latitud,
          lng: newFormData.longitud,
        });
        // Marcar como seleccionada para mantenerla cuando cambie la comuna
        setUserSelectedLocation(true);
      } else {
        console.log(
          "[DirectionSelector] No hay coordenadas válidas, reseteando userSelectedLocation"
        );
        // Si no hay coordenadas guardadas, resetear el estado
        setUserSelectedLocation(false);
      }

      // Cargar comunas si hay región
      if (newFormData.idRegion) {
        console.log("[DirectionSelector] Cargando comunas para región:", newFormData.idRegion);
        fetchComunasByRegion(newFormData.idRegion);
      }
    }
  }, [initialData]);

  // Calcular nombres de región y comuna (necesarios para geocodificación)
  const regionName =
    formData.idRegion && regiones.length > 0
      ? regiones.find((r) => r.id === parseInt(formData.idRegion))?.nombre || ""
      : "";
  const comunaName =
    formData.idComuna && comunas.length > 0
      ? comunas.find((c) => c.id === parseInt(formData.idComuna))?.nombre || ""
      : "";

  // Cargar comunas cuando cambie la región
  // PERO no limpiar idComuna si estamos cargando datos iniciales (initialData ya tiene idComuna)
  useEffect(() => {
    if (formData.idRegion) {
      console.log("[DirectionSelector] Región cambió:", {
        idRegion: formData.idRegion,
        isInitialLoad,
        regionChangedByUser,
        idComunaActual: formData.idComuna,
      });

      fetchComunasByRegion(formData.idRegion);

      // Solo limpiar comuna si el usuario cambió la región manualmente (no durante carga inicial)
      if (!isInitialLoad && regionChangedByUser) {
        console.log("[DirectionSelector] Usuario cambió región manualmente, limpiando comuna");
        setFormData((prev) => ({ ...prev, idComuna: "" }));
        // Solo limpiar ubicación si no hay coordenadas guardadas
        if (!formData.latitud || !formData.longitud) {
          setMapLocation(null);
          setUserSelectedLocation(false);
        }
        setRegionChangedByUser(false); // Resetear flag
      } else {
        console.log(
          "[DirectionSelector] Manteniendo comuna durante carga inicial o cambio automático"
        );
      }
    }
  }, [formData.idRegion, fetchComunasByRegion, isInitialLoad, regionChangedByUser]);

  // Marcar que la carga inicial terminó después de que se carguen las comunas
  useEffect(() => {
    if (isInitialLoad && comunas.length > 0) {
      // Esperar un momento para asegurar que todo esté cargado
      const timer = setTimeout(() => {
        console.log(
          "[DirectionSelector] Carga inicial completada, comunas disponibles:",
          comunas.length
        );
        console.log("[DirectionSelector] Estado final después de carga inicial:", {
          idRegion: formData.idRegion,
          idComuna: formData.idComuna,
          latitud: formData.latitud,
          longitud: formData.longitud,
          mapLocation,
        });
        setIsInitialLoad(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [comunas.length, isInitialLoad]);

  // Cuando cambia la comuna y el usuario no ha seleccionado manualmente, limpiar mapLocation
  // Esto permitirá que el MapComponent se centre usando las props region/comuna sin mostrar marcador
  // PERO solo si no hay coordenadas guardadas en formData
  useEffect(() => {
    if (isInitialLoad) return;

    if (!userSelectedLocation && !formData.latitud && !formData.longitud) {
      // Si el usuario no ha seleccionado manualmente y no hay coordenadas guardadas,
      // limpiar mapLocation para que el mapa se centre automáticamente usando las props region/comuna
      setMapLocation(null);
    }
  }, [
    comunaName,
    regionName,
    userSelectedLocation,
    formData.latitud,
    formData.longitud,
    isInitialLoad,
  ]);

  // Notificar cambios al componente padre
  useEffect(() => {
    const dataToSend = {
      ...formData,
      // Convertir a números si existen
      latitud: mapLocation?.lat || formData.latitud,
      longitud: mapLocation?.lng || formData.longitud,
    };
    onChange(dataToSend);
  }, [formData, mapLocation, onChange]);

  // Manejar cambios en los campos
  const handleInputChange = (field, value) => {
    // Validación especial para el campo número: solo letras, números, espacios y guiones
    if (field === "numero") {
      // Permitir solo letras, números, espacios y guiones
      const numeroPattern = /^[a-zA-Z0-9\s-]*$/;
      if (!numeroPattern.test(value)) {
        // Si contiene caracteres no permitidos, no actualizar
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manejar selección de ubicación en el mapa
  const handleLocationSelect = useCallback((location) => {
    // Si location es null, limpiar la ubicación
    if (!location) {
      setMapLocation(null);
      setUserSelectedLocation(false);
      setFormData((prev) => ({
        ...prev,
        latitud: null,
        longitud: null,
      }));
      return;
    }

    // Validar que las coordenadas sean válidas antes de establecerlas
    if (
      location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number" &&
      !isNaN(location.lat) &&
      !isNaN(location.lng) &&
      isFinite(location.lat) &&
      isFinite(location.lng)
    ) {
      // Establecer la ubicación y marcar que el usuario la seleccionó manualmente
      setMapLocation(location);
      setUserSelectedLocation(true);
      setFormData((prev) => ({
        ...prev,
        latitud: location.lat,
        longitud: location.lng,
      }));
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Región y Comuna */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Región */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MdLocationCity className="inline w-4 h-4 mr-1 text-blue-600" />
            Región *
          </label>
          <Select
            value={
              regiones.find((r) => r.id === formData.idRegion)
                ? {
                    value: String(formData.idRegion),
                    label: regiones.find((r) => r.id === formData.idRegion)?.nombre,
                  }
                : null
            }
            onChange={(option) => {
              const newRegion = option?.value || "";
              console.log("[DirectionSelector] Usuario cambió región:", {
                anterior: formData.idRegion,
                nueva: newRegion,
                isInitialLoad,
                seMarcaraComoCambioManual: !isInitialLoad && newRegion !== formData.idRegion,
              });
              // Si no es carga inicial y cambió la región, marcar como cambio manual
              if (!isInitialLoad && newRegion !== formData.idRegion) {
                setRegionChangedByUser(true);
              }
              handleInputChange("idRegion", newRegion);
            }}
            options={regiones.map((region) => ({
              value: String(region.id),
              label: region.nombre,
            }))}
            isDisabled={disabled || loadingRegiones}
            isLoading={loadingRegiones}
            isClearable
            placeholder={loadingRegiones ? "Cargando regiones..." : "Buscar región..."}
            noOptionsMessage={() => "No hay regiones disponibles"}
            menuPortalTarget={selectMenuPortalTarget}
            styles={commonSelectStyles}
          />
          {errors.idRegion && <p className="mt-1.5 text-sm text-red-600">{errors.idRegion}</p>}
        </div>

        {/* Comuna */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MdLocationCity className="inline w-4 h-4 mr-1 text-blue-600" />
            Comuna *
          </label>
          <Select
            value={
              comunas.find((c) => c.id === formData.idComuna)
                ? {
                    value: String(formData.idComuna),
                    label: comunas.find((c) => c.id === formData.idComuna)?.nombre,
                  }
                : null
            }
            onChange={(option) => {
              const newComuna = option?.value || "";
              console.log("[DirectionSelector] Usuario cambió comuna:", {
                anterior: formData.idComuna,
                nueva: newComuna,
                comunasDisponibles: comunas.length,
              });
              handleInputChange("idComuna", newComuna);
            }}
            options={comunas.map((comuna) => ({
              value: String(comuna.id),
              label: comuna.nombre,
            }))}
            isDisabled={disabled || loadingComunas || !formData.idRegion}
            isLoading={loadingComunas}
            isClearable
            placeholder={
              loadingComunas
                ? "Cargando comunas..."
                : !formData.idRegion
                ? "Seleccione una región primero"
                : "Buscar comuna..."
            }
            noOptionsMessage={() =>
              !formData.idRegion ? "Seleccione una región primero" : "No hay comunas disponibles"
            }
            menuPortalTarget={selectMenuPortalTarget}
            styles={commonSelectStyles}
          />
          {errors.idComuna && <p className="mt-1.5 text-sm text-red-600">{errors.idComuna}</p>}
        </div>
      </div>

      {/* Calle y Número */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Calle/Sector *</label>
          <input
            type="text"
            value={formData.calle}
            onChange={(e) => handleInputChange("calle", e.target.value)}
            disabled={disabled}
            placeholder="Ej: Av. Principal / Sector Centro"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              errors.calle ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
            } ${disabled ? "bg-gray-100 cursor-not-allowed" : "hover:border-gray-400"}`}
          />
          {errors.calle && <p className="mt-1.5 text-sm text-red-600">{errors.calle}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
          <input
            type="text"
            value={formData.numero}
            onChange={(e) => handleInputChange("numero", e.target.value)}
            disabled={disabled}
            placeholder="123"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              errors.numero ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
            } ${disabled ? "bg-gray-100 cursor-not-allowed" : "hover:border-gray-400"}`}
          />
          {errors.numero && <p className="mt-1.5 text-sm text-red-600">{errors.numero}</p>}
        </div>
      </div>

      {/* Departamento y Código Postal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamento (opcional)
          </label>
          <input
            type="text"
            value={formData.depto}
            onChange={(e) => handleInputChange("depto", e.target.value)}
            disabled={disabled}
            placeholder="Depto 4A"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              errors.depto ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
            } ${disabled ? "bg-gray-100 cursor-not-allowed" : "hover:border-gray-400"}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código Postal (opcional)
          </label>
          <input
            type="text"
            value={formData.codigoPostal}
            onChange={(e) => handleInputChange("codigoPostal", e.target.value)}
            disabled={disabled}
            placeholder="1234567"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              errors.codigoPostal ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
            } ${disabled ? "bg-gray-100 cursor-not-allowed" : "hover:border-gray-400"}`}
          />
        </div>
      </div>

      {/* Referencia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Referencia (opcional)
        </label>
        <textarea
          value={formData.referencia}
          onChange={(e) => handleInputChange("referencia", e.target.value)}
          disabled={disabled}
          placeholder="Cerca del supermercado, frente al parque..."
          rows={3}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
            errors.referencia ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : "hover:border-gray-400"}`}
        />
      </div>

      {/* Mapa interactivo */}
      {showMap && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MdLocationOn className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Ubicación en el Mapa</h3>
              <span className="text-sm text-gray-500">(Opcional)</span>
            </div>
            <div className="relative group">
              <button
                type="button"
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                disabled={disabled}
                title="Ver instrucciones"
              >
                <MdHelpOutline className="w-5 h-5" />
              </button>
              <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                <div className="space-y-1.5">
                  <p className="font-semibold mb-2 text-sm">Instrucciones:</p>
                  <p>• Haz clic en el mapa para seleccionar una ubicación</p>
                  <p>• Usa "Mi Ubicación" para obtener tu posición actual</p>
                  <p>• Puedes arrastrar el marcador para ajustar la posición</p>
                </div>
                <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <GoogleMapPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={(() => {
                // Validar y retornar mapLocation si es válido
                if (
                  mapLocation &&
                  typeof mapLocation.lat === "number" &&
                  typeof mapLocation.lng === "number" &&
                  !isNaN(mapLocation.lat) &&
                  !isNaN(mapLocation.lng) &&
                  isFinite(mapLocation.lat) &&
                  isFinite(mapLocation.lng)
                ) {
                  console.log(
                    "DirectionSelector - Pasando initialLocation a GoogleMapPicker:",
                    mapLocation
                  );
                  return mapLocation;
                }
                console.log("DirectionSelector - No hay mapLocation válido, pasando null");
                return null;
              })()}
              disabled={disabled}
              height="350px"
              showLocationInfo={false}
              region={regionName || null}
              comuna={comunaName || null}
            />
          </div>
        </div>
      )}

      {/* Resumen de la dirección */}
      {formData.calle && formData.numero && formData.idComuna && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Dirección completa:</strong> {formData.calle} {formData.numero}
            {formData.depto && `, ${formData.depto}`}
            {comunaName && `, ${comunaName}`}
            {regionName && `, ${regionName}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default DirectionSelector;
