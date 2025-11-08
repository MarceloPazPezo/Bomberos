"use strict";

/**
 * Servicio de geocodificación usando Nominatim (OpenStreetMap)
 * Obtiene coordenadas (lat, lng) a partir de una dirección o nombre de lugar
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const REQUEST_DELAY = 1000; // Delay mínimo entre requests (rate limiting de Nominatim)

// Cache simple en memoria para evitar requests repetidos
const geocodingCache = new Map();

/**
 * Obtiene coordenadas de una ubicación usando geocodificación
 * @param {string} query - Nombre de la ubicación (ej: "Cabrero, Chile")
 * @param {string} country - Código de país para limitar búsqueda (default: "Chile")
 * @returns {Promise<Array>} [coordenadas, error] - {lat, lng} o null
 */
export async function geocodeLocation(query, country = "Chile") {
  try {
    if (!query || typeof query !== "string") {
      return [null, "Query inválido"];
    }

    // Verificar cache
    const cacheKey = `${query.toLowerCase()}_${country}`;
    if (geocodingCache.has(cacheKey)) {
      return [geocodingCache.get(cacheKey), null];
    }

    // Construir query para Nominatim
    const searchQuery = `${query}, ${country}`;
    const params = new URLSearchParams({
      q: searchQuery,
      format: "json",
      limit: "1",
      addressdetails: "1",
      countrycodes: "cl", // Código ISO de Chile
    });
    
    const url = `${NOMINATIM_BASE_URL}/search?${params.toString()}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "BomberosApp/1.0", // Nominatim requiere User-Agent
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return [null, `Error HTTP: ${response.status}`];
      }

      const data = await response.json();

      // Rate limiting: esperar 1 segundo antes de continuar
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));

      if (data && data.length > 0) {
        const result = data[0];
        const coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        };

        // Validar coordenadas
        if (
          isNaN(coordinates.lat) ||
          isNaN(coordinates.lng) ||
          coordinates.lat < -90 ||
          coordinates.lat > 90 ||
          coordinates.lng < -180 ||
          coordinates.lng > 180
        ) {
          return [null, "Coordenadas inválidas obtenidas del servicio"];
        }

        // Guardar en cache
        geocodingCache.set(cacheKey, coordinates);

        return [coordinates, null];
      }

      return [null, "Ubicación no encontrada"];
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === "AbortError") {
        return [null, "Timeout al conectar con el servicio de geocodificación"];
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error("Error en geocodificación:", error.message);
    
    // Si es un error de timeout o red, retornar error específico
    if (error.code === "ECONNABORTED" || error.code === "ENOTFOUND" || error.code === "ETIMEDOUT") {
      return [null, "Error de conexión con el servicio de geocodificación"];
    }

    return [null, error.message || "Error al geocodificar ubicación"];
  }
}

/**
 * Obtiene coordenadas de una comuna específica
 * @param {string} comunaNombre - Nombre de la comuna
 * @param {string} regionNombre - Nombre de la región (opcional, mejora la precisión)
 * @returns {Promise<Array>} [coordenadas, error]
 */
export async function geocodeComuna(comunaNombre, regionNombre = null) {
  try {
    if (!comunaNombre) {
      return [null, "Nombre de comuna requerido"];
    }

    // Construir query: "Comuna, Región, Chile"
    let query = comunaNombre;
    if (regionNombre) {
      query = `${comunaNombre}, ${regionNombre}`;
    }

    return await geocodeLocation(query, "Chile");
  } catch (error) {
    console.error("Error al geocodificar comuna:", error);
    return [null, error.message];
  }
}

/**
 * Limpia el cache de geocodificación
 */
export function clearGeocodingCache() {
  geocodingCache.clear();
}

/**
 * Obtiene el tamaño del cache
 */
export function getGeocodingCacheSize() {
  return geocodingCache.size;
}

