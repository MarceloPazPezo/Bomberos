/**
 * Normaliza un string de RUN a un formato estándar (XXXXXXXXK).
 * Elimina puntos, guiones, y convierte a mayúsculas.
 * @param {string | null | undefined} runString El RUN ingresado por el usuario.
 * @returns {string | null} El RUN normalizado en formato XXXXXXXXK, o null si no es válido o no se puede procesar.
 */
export function normalizeRUN(runString) {
  if (!runString || typeof runString !== "string") {
    return null;
  }

  const cleanedRUN = runString.replace(/[^\dkK]/g, "").toUpperCase();

  if (cleanedRUN.length < 2) {
    return null;
  }

  const bodyCandidate = cleanedRUN.slice(0, -1);
  if (!/^\d+$/.test(bodyCandidate)) {
    return null;
  }

  return cleanedRUN;
}

/**
 * Valida el Digito Verificador (DV) de un RUN chileno.
 * Espera un RUN previamente normalizado (formato XXXXXXXXK).
 * @param {string | null | undefined} normalizedRUN El RUN normalizado (ej: "12345678K").
 * @returns {boolean} True si el DV es correcto, false en caso contrario.
 */
export function validateRUNDv(normalizedRUN) {
  if (
    !normalizedRUN ||
    typeof normalizedRUN !== "string" ||
    normalizedRUN.length < 2
  ) {
    return false;
  }
  const body = normalizedRUN.slice(0, -1);
  const dvProvided = normalizedRUN.slice(-1).toUpperCase();

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
