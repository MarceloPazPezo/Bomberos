/**
 * Normaliza un string de RUT a un formato estándar (XXXXXXXXK).
 * Elimina puntos, guiones, y convierte a mayúsculas.
 * @param {string | null | undefined} rutString El RUT ingresado por el usuario.
 * @returns {string | null} El RUT normalizado en formato XXXXXXXXK, o null si no es válido o no se puede procesar.
 */
export function normalizeRut(rutString) {
  if (!rutString || typeof rutString !== "string") {
    return null;
  }

  const cleanedRut = rutString.replace(/[^\dkK]/g, "").toUpperCase();

  if (cleanedRut.length < 2) {
    return null;
  }

  const bodyCandidate = cleanedRut.slice(0, -1);
  if (!/^\d+$/.test(bodyCandidate)) {
    return null;
  }

  return cleanedRut;
}

/**
 * Valida el Digito Verificador (DV) de un RUT chileno.
 * Espera un RUT previamente normalizado (formato XXXXXXXXK).
 * @param {string | null | undefined} normalizedRut El RUT normalizado (ej: "12345678K").
 * @returns {boolean} True si el DV es correcto, false en caso contrario.
 */
export function validateRutDv(normalizedRut) {
  if (
    !normalizedRut ||
    typeof normalizedRut !== "string" ||
    normalizedRut.length < 2
  ) {
    return false;
  }
  const body = normalizedRut.slice(0, -1);
  const dvProvided = normalizedRut.slice(-1).toUpperCase();

  let suma = 0;
  let multiplo = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    suma += parseInt(body.charAt(i), 10) * multiplo;
    if (multiplo < 7) {
      multiplo++;
    } else {
      multiplo = 2;
    }
  }

  const resto = suma % 11;
  let dvCalculated = 11 - resto;

  if (dvCalculated === 11) {
    dvCalculated = "0";
  } else if (dvCalculated === 10) {
    dvCalculated = "K";
  } else {
    dvCalculated = String(dvCalculated);
  }
  return dvCalculated === dvProvided; // "7" === "7" -> true
}
