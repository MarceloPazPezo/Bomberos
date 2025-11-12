/**
 * Coordenadas de las regiones y comunas principales de Chile
 * Utilizado para centrar el mapa en la ubicación correcta
 */

// Coordenadas de las regiones de Chile (centro aproximado de cada región)
export const regionesCoordinates = {
  'Arica y Parinacota': { lat: -18.4746, lng: -70.3128 },
  'Tarapacá': { lat: -20.2141, lng: -70.1526 },
  'Antofagasta': { lat: -23.6509, lng: -70.3975 },
  'Atacama': { lat: -27.3668, lng: -70.3321 },
  'Coquimbo': { lat: -30.6009, lng: -71.2098 },
  'Valparaíso': { lat: -33.0472, lng: -71.6127 },
  'Metropolitana': { lat: -33.4489, lng: -70.6693 },
  'Región Metropolitana': { lat: -33.4489, lng: -70.6693 },
  'Región de Valparaíso': { lat: -33.0472, lng: -71.6127 },
  'O\'Higgins': { lat: -34.1701, lng: -70.7417 },
  'Maule': { lat: -35.4264, lng: -71.6554 },
  'Ñuble': { lat: -36.6067, lng: -72.1034 },
  'Biobío': { lat: -36.8201, lng: -73.0444 },
  'Del Bíobío': { lat: -36.8201, lng: -73.0444 },
  'La Araucanía': { lat: -38.7359, lng: -72.5904 },
  'Los Ríos': { lat: -39.8196, lng: -73.2422 },
  'Los Lagos': { lat: -41.4693, lng: -72.9424 },
  'Aysén': { lat: -45.8699, lng: -71.4634 },
  'Magallanes': { lat: -51.6230, lng: -69.2168 }
};

// Coordenadas de las principales comunas de Chile
export const comunasCoordinates = {
  // Región Metropolitana
  'Santiago': { lat: -33.4489, lng: -70.6693 },
  'Las Condes': { lat: -33.4172, lng: -70.5500 },
  'Providencia': { lat: -33.4255, lng: -70.6100 },
  'Ñuñoa': { lat: -33.4569, lng: -70.6000 },
  'Maipú': { lat: -33.5117, lng: -70.7500 },
  'La Florida': { lat: -33.5167, lng: -70.5667 },
  'Puente Alto': { lat: -33.6167, lng: -70.5667 },
  'San Bernardo': { lat: -33.6000, lng: -70.7000 },
  'Pudahuel': { lat: -33.4500, lng: -70.7500 },
  'Quilicura': { lat: -33.3667, lng: -70.7167 },
  'Lo Barnechea': { lat: -33.3500, lng: -70.5167 },
  'Vitacura': { lat: -33.4000, lng: -70.5500 },
  'La Reina': { lat: -33.4500, lng: -70.5500 },
  'Macul': { lat: -33.4833, lng: -70.6000 },
  'Peñalolén': { lat: -33.4833, lng: -70.5500 },
  'San Miguel': { lat: -33.5000, lng: -70.6500 },
  'La Granja': { lat: -33.5333, lng: -70.6167 },
  'San Joaquín': { lat: -33.5000, lng: -70.6167 },
  'La Pintana': { lat: -33.5833, lng: -70.6167 },
  'El Bosque': { lat: -33.5667, lng: -70.6667 },
  'Pedro Aguirre Cerda': { lat: -33.5000, lng: -70.7000 },
  'Lo Espejo': { lat: -33.5167, lng: -70.7000 },
  'Estación Central': { lat: -33.4500, lng: -70.7000 },
  'Cerrillos': { lat: -33.5000, lng: -70.7167 },
  'Cerro Navia': { lat: -33.4167, lng: -70.7333 },
  'Quinta Normal': { lat: -33.4333, lng: -70.7000 },
  'Lo Prado': { lat: -33.4500, lng: -70.7167 },
  'Renca': { lat: -33.4000, lng: -70.7167 },
  'Huechuraba': { lat: -33.3667, lng: -70.6667 },
  'Conchalí': { lat: -33.3833, lng: -70.7000 },
  'Independencia': { lat: -33.4167, lng: -70.6667 },
  'Recoleta': { lat: -33.4167, lng: -70.6500 },
  'Quinta Normal': { lat: -33.4333, lng: -70.7000 },
  'San Ramón': { lat: -33.4500, lng: -70.6500 },
  'La Cisterna': { lat: -33.5333, lng: -70.6667 },
  'San José de Maipo': { lat: -33.6333, lng: -70.3500 },
  'Pirque': { lat: -33.6333, lng: -70.5500 },
  'Colina': { lat: -33.2000, lng: -70.6833 },
  'Lampa': { lat: -33.2833, lng: -70.8833 },
  'Tiltil': { lat: -33.0833, lng: -70.9333 },
  'San Pedro': { lat: -33.9000, lng: -70.8667 },
  'Melipilla': { lat: -33.7000, lng: -71.2167 },
  'Alhué': { lat: -34.0333, lng: -71.1000 },
  'Curacaví': { lat: -33.4000, lng: -71.0167 },
  'María Pinto': { lat: -33.5167, lng: -71.1167 },
  'San Antonio': { lat: -33.5833, lng: -71.6167 },
  'Cartagena': { lat: -33.5500, lng: -71.6000 },
  'El Tabo': { lat: -33.4500, lng: -71.6667 },
  'El Quisco': { lat: -33.4000, lng: -71.7000 },
  'Algarrobo': { lat: -33.3667, lng: -71.6667 },
  'Santo Domingo': { lat: -33.6333, lng: -71.6167 },
  'Isla de Pascua': { lat: -27.1127, lng: -109.3497 },
  'Juan Fernández': { lat: -33.6333, lng: -78.8333 },

  // Región de Valparaíso
  'Valparaíso': { lat: -33.0472, lng: -71.6127 },
  'Viña del Mar': { lat: -33.0153, lng: -71.5506 },
  'Concón': { lat: -32.9167, lng: -71.5167 },
  'Quilpué': { lat: -33.0500, lng: -71.4500 },
  'Villa Alemana': { lat: -33.0500, lng: -71.3833 },
  'Limache': { lat: -33.0167, lng: -71.2667 },
  'Olmué': { lat: -33.0000, lng: -71.2000 },
  'Quillota': { lat: -32.8833, lng: -71.2500 },
  'La Calera': { lat: -32.7833, lng: -71.2000 },
  'Hijuelas': { lat: -32.8000, lng: -71.1333 },
  'La Cruz': { lat: -32.8167, lng: -71.2333 },
  'Nogales': { lat: -32.7500, lng: -71.2167 },
  'San Felipe': { lat: -32.7500, lng: -70.7167 },
  'Putaendo': { lat: -32.6333, lng: -70.7167 },
  'Santa María': { lat: -32.7500, lng: -70.6667 },
  'Catemu': { lat: -32.8167, lng: -70.7500 },
  'Panquehue': { lat: -32.7833, lng: -70.8333 },
  'Llay-Llay': { lat: -32.8500, lng: -70.9500 },
  'San Esteban': { lat: -32.8000, lng: -70.5833 },
  'Los Andes': { lat: -32.8333, lng: -70.6000 },
  'Calle Larga': { lat: -32.8500, lng: -70.6333 },
  'Rinconada': { lat: -32.8333, lng: -70.7000 },

  // Región del Biobío
  'Concepción': { lat: -36.8201, lng: -73.0444 },
  'Talcahuano': { lat: -36.7167, lng: -73.1167 },
  'Hualpén': { lat: -36.7833, lng: -73.1167 },
  'Chiguayante': { lat: -36.9167, lng: -73.0167 },
  'San Pedro de la Paz': { lat: -36.8500, lng: -73.1000 },
  'Coronel': { lat: -37.0167, lng: -73.1333 },
  'Lota': { lat: -37.0833, lng: -73.1667 },
  'Penco': { lat: -36.7333, lng: -72.9833 },
  'Tomé': { lat: -36.6167, lng: -72.9500 },
  'Florida': { lat: -36.8167, lng: -72.6667 },
  'Hualqui': { lat: -36.9667, lng: -72.9333 },
  'Santa Juana': { lat: -37.1667, lng: -72.9333 },
  'Cabrero': { lat: -37.0333, lng: -72.4000 },
  'Nueva Concepción': { lat: -37.0833, lng: -72.3833 },

  // Región de La Araucanía
  'Temuco': { lat: -38.7359, lng: -72.5904 },
  'Padre Las Casas': { lat: -38.7667, lng: -72.6000 },
  'Villarrica': { lat: -39.2833, lng: -72.2167 },
  'Pucón': { lat: -39.2667, lng: -71.9667 },
  'Angol': { lat: -37.8000, lng: -72.7167 },
  'Victoria': { lat: -38.2333, lng: -72.3333 },
  'Traiguén': { lat: -38.2500, lng: -72.3500 },
  'Lautaro': { lat: -38.5167, lng: -72.4500 },
  'Perquenco': { lat: -38.4167, lng: -72.3833 },
  'Galvarino': { lat: -38.4000, lng: -72.7833 },
  'Nueva Imperial': { lat: -38.7333, lng: -72.9500 },
  'Carahue': { lat: -38.7000, lng: -73.1667 },
  'Saavedra': { lat: -38.7833, lng: -73.3833 },
  'Teodoro Schmidt': { lat: -38.9833, lng: -73.0500 },
  'Freire': { lat: -38.9500, lng: -72.6333 },
  'Pitrufquén': { lat: -38.9833, lng: -72.6500 },
  'Gorbea': { lat: -39.0833, lng: -72.6667 },
  'Loncoche': { lat: -39.3667, lng: -72.6333 },
  'Toltén': { lat: -39.2000, lng: -73.2167 },
  'Cunco': { lat: -38.9333, lng: -72.0333 },
  'Curarrehue': { lat: -39.3500, lng: -71.5833 },
  'Melipeuco': { lat: -38.8500, lng: -71.7000 },
  'Lonquimay': { lat: -38.4333, lng: -71.2333 },
  'Curacautín': { lat: -38.4333, lng: -71.8833 },
  'Ercilla': { lat: -38.0500, lng: -72.3667 },
  'Los Sauces': { lat: -37.9667, lng: -72.8333 },
  'Purén': { lat: -38.0167, lng: -73.0833 },
  'Lumaco': { lat: -38.1500, lng: -72.9167 },
  'Collipulli': { lat: -37.9500, lng: -72.4333 },
  'Renaico': { lat: -37.6667, lng: -72.5667 },
  'Negrete': { lat: -37.5833, lng: -72.5333 },
  'Los Álamos': { lat: -37.6167, lng: -73.4667 },
  'Tirúa': { lat: -38.3333, lng: -73.5000 },
  'Contulmo': { lat: -38.0000, lng: -73.2333 },
  'Cañete': { lat: -38.2000, lng: -73.4000 },
  'Curanilahue': { lat: -37.4667, lng: -73.3500 },
  'Arauco': { lat: -37.2500, lng: -73.3167 },
  'Lebu': { lat: -37.6167, lng: -73.6500 },

  // Otras regiones principales
  'Arica': { lat: -18.4746, lng: -70.3128 },
  'Iquique': { lat: -20.2141, lng: -70.1526 },
  'Antofagasta': { lat: -23.6509, lng: -70.3975 },
  'Calama': { lat: -22.4544, lng: -68.9294 },
  'Copiapó': { lat: -27.3668, lng: -70.3321 },
  'La Serena': { lat: -29.9027, lng: -71.2519 },
  'Coquimbo': { lat: -30.6009, lng: -71.2098 },
  'Rancagua': { lat: -34.1701, lng: -70.7417 },
  'Talca': { lat: -35.4264, lng: -71.6554 },
  'Chillán': { lat: -36.6067, lng: -72.1034 },
  'Valdivia': { lat: -39.8196, lng: -73.2422 },
  'Osorno': { lat: -40.5739, lng: -73.1355 },
  'Puerto Montt': { lat: -41.4693, lng: -72.9424 },
  'Coyhaique': { lat: -45.8699, lng: -71.4634 },
  'Punta Arenas': { lat: -51.6230, lng: -69.2168 }
};

/**
 * Función para obtener coordenadas basadas en región y comuna
 * @param {string} region - Nombre de la región
 * @param {string} comuna - Nombre de la comuna
 * @param {Function} geocodeCallback - Función opcional para geocodificar si no hay coordenadas locales
 * @returns {Promise<Object>|Object} Coordenadas {lat, lng} o coordenadas por defecto
 */
export const getCoordinatesByLocation = async (region, comuna, geocodeCallback = null) => {
  // Si tenemos comuna específica en el archivo local, usarla directamente
  if (comuna && comunasCoordinates[comuna]) {
    return comunasCoordinates[comuna];
  }

  // Si NO tenemos la comuna en el archivo local pero tenemos callback de geocodificación, intentar geocodificar PRIMERO
  // Esto es importante para obtener coordenadas precisas de la comuna específica
  if (geocodeCallback && comuna) {
    try {
      const coords = await geocodeCallback(comuna, region);
      if (coords && coords.lat && coords.lng) {
        return coords;
      }
    } catch (error) {
      console.warn('Error al geocodificar comuna, usando fallback:', error);
    }
  }

  // Si no pudimos geocodificar, usar las coordenadas de la región como fallback
  if (region && regionesCoordinates[region]) {
    return regionesCoordinates[region];
  }

  // Si no tenemos nada, usar Cabrero como fallback final
  return { lat: -37.0333, lng: -72.4000 };
};

/**
 * Función para obtener coordenadas por nombre de ubicación (búsqueda flexible)
 * @param {string} locationName - Nombre de la ubicación a buscar
 * @param {Function} geocodeCallback - Función opcional para geocodificar si no hay coordenadas locales
 * @returns {Promise<Object>|Object} Coordenadas {lat, lng} o coordenadas por defecto
 */
export const getCoordinatesByName = async (locationName, geocodeCallback = null) => {
  if (!locationName) {
    return { lat: -33.4489, lng: -70.6693 };
  }

  const normalizedName = locationName.toLowerCase().trim();

  // Buscar en comunas
  for (const [comuna, coords] of Object.entries(comunasCoordinates)) {
    if (comuna.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(comuna.toLowerCase())) {
      return coords;
    }
  }

  // Buscar en regiones
  for (const [region, coords] of Object.entries(regionesCoordinates)) {
    if (region.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(region.toLowerCase())) {
      return coords;
    }
  }

  // Si no encontramos y tenemos callback de geocodificación, intentar geocodificar
  if (geocodeCallback) {
    try {
      const coords = await geocodeCallback(locationName);
      if (coords && coords.lat && coords.lng) {
        return coords;
      }
    } catch (error) {
      console.warn('Error al geocodificar ubicación, usando fallback:', error);
    }
  }

  // Fallback a Cabrero
  return { lat: -37.0333, lng: -72.4000 };
};
