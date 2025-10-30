"use strict";

/**
 * Helper para transformación de datos geométricos PostGIS
 * Convierte entre diferentes formatos: WKT, GeoJSON, y coordenadas lat/lng
 */

/**
 * Convierte coordenadas lat/lng a formato WKT Point para PostGIS
 * @param {number} lat - Latitud (coordenada Y)
 * @param {number} lng - Longitud (coordenada X)
 * @returns {string} Formato WKT: "POINT(lng lat)"
 * @throws {Error} Si las coordenadas son inválidas
 */
export function coordsToWKT(lat, lng) {
    if (!lat || !lng) {
        throw new Error("Latitud y longitud son requeridas");
    }

    if (!validarCoordenadas(lat, lng)) {
        throw new Error("Coordenadas fuera del rango válido");
    }

    // PostGIS usa el orden lng lat (X Y) en formato WKT
    return `POINT(${lng} ${lat})`;
}

/**
 * Convierte un objeto GeoJSON Point a formato WKT
 * @param {Object} geojson - Objeto GeoJSON Point
 * @param {string} geojson.type - Tipo de geometría (debe ser "Point")
 * @param {Array<number>} geojson.coordinates - Array [lng, lat]
 * @returns {string} Formato WKT
 * @throws {Error} Si el tipo de geometría no es soportado
 */
export function geojsonToWKT(geojson) {
    if (!geojson || !geojson.type) {
        throw new Error("Objeto GeoJSON inválido");
    }

    switch (geojson.type) {
        case "Point": {
            const [lng, lat] = geojson.coordinates;
            return `POINT(${lng} ${lat})`;
        }
        case "LineString": {
            const coords = geojson.coordinates
                .map(([lng, lat]) => `${lng} ${lat}`)
                .join(", ");
            return `LINESTRING(${coords})`;
        }
        case "Polygon": {
            const rings = geojson.coordinates
                .map(ring => {
                    const coords = ring
                        .map(([lng, lat]) => `${lng} ${lat}`)
                        .join(", ");
                    return `(${coords})`;
                })
                .join(", ");
            return `POLYGON(${rings})`;
        }
        default:
            throw new Error(`Tipo de geometría no soportado: ${geojson.type}`);
    }
}

/**
 * Convierte formato WKT a objeto con lat/lng
 * @param {string} wkt - Formato WKT (ej: "POINT(-70.6693 -33.4489)")
 * @returns {Object} { lat: number, lng: number }
 * @throws {Error} Si el formato WKT es inválido
 */
export function wktToCoords(wkt) {
    if (!wkt || typeof wkt !== "string") {
        throw new Error("Formato WKT inválido");
    }

    // Ejemplo: "POINT(-70.6693 -33.4489)"
    const match = wkt.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (!match) {
        throw new Error(`Formato WKT Point inválido: ${wkt}`);
    }

    return {
        lng: parseFloat(match[1]),
        lat: parseFloat(match[2]),
    };
}

/**
 * Convierte formato WKT a GeoJSON Point
 * @param {string} wkt - Formato WKT
 * @returns {Object} Objeto GeoJSON Point
 * @throws {Error} Si el formato WKT es inválido
 */
export function wktToGeoJSON(wkt) {
    if (!wkt || typeof wkt !== "string") {
        throw new Error("Formato WKT inválido");
    }

    // Point
    const pointMatch = wkt.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (pointMatch) {
        return {
            type: "Point",
            coordinates: [parseFloat(pointMatch[1]), parseFloat(pointMatch[2])],
        };
    }

    // LineString
    const lineMatch = wkt.match(/LINESTRING\(([^)]+)\)/);
    if (lineMatch) {
        const coordinates = lineMatch[1]
            .split(", ")
            .map(coord => {
                const [lng, lat] = coord.split(" ");
                return [parseFloat(lng), parseFloat(lat)];
            });
        return {
            type: "LineString",
            coordinates,
        };
    }

    // Polygon
    const polygonMatch = wkt.match(/POLYGON\(\(([^)]+)\)\)/);
    if (polygonMatch) {
        const coordinates = [
            polygonMatch[1].split(", ").map(coord => {
                const [lng, lat] = coord.split(" ");
                return [parseFloat(lng), parseFloat(lat)];
            }),
        ];
        return {
            type: "Polygon",
            coordinates,
        };
    }

    throw new Error(`Formato WKT no soportado: ${wkt}`);
}

/**
 * Valida coordenadas de latitud y longitud
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean}
 */
export function validarCoordenadas(lat, lng) {
    return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
}

/**
 * Valida si las coordenadas están dentro de Chile continental
 * Chile: Lat aproximada -17° a -56°, Lng -66° a -76°
 * Incluye margen para islas y territorio antártico
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean}
 */
export function validarCoordenadasChile(lat, lng) {
    if (!validarCoordenadas(lat, lng)) {
        return false;
    }

    // Chile continental y sus extremos
    // Norte: Arica (-18.4°)
    // Sur: Cabo de Hornos (-55.9°)
    // Este: Frontera con Argentina (-66.4°)
    // Oeste: Isla de Pascua (-109.4°) o costa continental (-76.0°)

    // Rango amplio que incluye todo el territorio chileno
    return lat >= -56.5 && lat <= -17 && lng >= -110 && lng <= -66;
}

/**
 * Calcula la distancia aproximada entre dos puntos en metros
 * Usa la fórmula de Haversine para distancias cortas
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lng1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lng2 - Longitud del segundo punto
 * @returns {number} Distancia en metros
 */
export function calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
}

/**
 * Calcula el punto medio entre dos coordenadas
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lng1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lng2 - Longitud del segundo punto
 * @returns {Object} { lat: number, lng: number }
 */
export function calcularPuntoMedio(lat1, lng1, lat2, lng2) {
    const φ1 = (lat1 * Math.PI) / 180;
    const λ1 = (lng1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const λ2 = (lng2 * Math.PI) / 180;

    const Bx = Math.cos(φ2) * Math.cos(λ2 - λ1);
    const By = Math.cos(φ2) * Math.sin(λ2 - λ1);
    const φ3 = Math.atan2(
        Math.sin(φ1) + Math.sin(φ2),
        Math.sqrt((Math.cos(φ1) + Bx) * (Math.cos(φ1) + Bx) + By * By)
    );
    const λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

    return {
        lat: (φ3 * 180) / Math.PI,
        lng: ((λ3 * 180) / Math.PI + 540) % 360 - 180, // Normalizar a [-180, 180]
    };
}

/**
 * Crea un bounding box alrededor de un punto con un radio dado
 * @param {number} lat - Latitud del centro
 * @param {number} lng - Longitud del centro
 * @param {number} radio - Radio en metros
 * @returns {Object} { minLat, minLng, maxLat, maxLng }
 */
export function crearBoundingBox(lat, lng, radio) {
    // Aproximación: 1 grado de latitud ≈ 111 km
    // 1 grado de longitud ≈ 111 km * cos(latitud)
    const deltaLat = radio / 111000;
    const deltaLng = radio / (111000 * Math.cos((lat * Math.PI) / 180));

    return {
        minLat: lat - deltaLat,
        minLng: lng - deltaLng,
        maxLat: lat + deltaLat,
        maxLng: lng + deltaLng,
    };
}

/**
 * Verifica si un punto está dentro de un bounding box
 * @param {number} lat - Latitud del punto
 * @param {number} lng - Longitud del punto
 * @param {Object} bbox - Bounding box { minLat, minLng, maxLat, maxLng }
 * @returns {boolean}
 */
export function puntoEnBoundingBox(lat, lng, bbox) {
    return (
        lat >= bbox.minLat &&
        lat <= bbox.maxLat &&
        lng >= bbox.minLng &&
        lng <= bbox.maxLng
    );
}

/**
 * Formatea coordenadas para mostrar (trunca decimales)
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {number} decimales - Número de decimales (default: 6)
 * @returns {Object} { lat: string, lng: string }
 */
export function formatearCoordenadas(lat, lng, decimales = 6) {
    return {
        lat: lat.toFixed(decimales),
        lng: lng.toFixed(decimales),
    };
}

/**
 * Convierte grados decimales a grados, minutos, segundos (DMS)
 * @param {number} decimal - Coordenada en grados decimales
 * @param {boolean} isLat - true si es latitud, false si es longitud
 * @returns {string} Formato DMS (ej: "33°26'56.0\"S")
 */
export function decimalAToDMS(decimal, isLat) {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesDecimal = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(1);

    let direction;
    if (isLat) {
        direction = decimal >= 0 ? "N" : "S";
    } else {
        direction = decimal >= 0 ? "E" : "O";
    }

    return `${degrees}°${minutes}'${seconds}"${direction}`;
}

/**
 * Convierte coordenadas a formato legible para Chile
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {string} Formato legible
 */
export function formatearCoordenadasChile(lat, lng) {
    return `${decimalAToDMS(lat, true)}, ${decimalAToDMS(lng, false)}`;
}


