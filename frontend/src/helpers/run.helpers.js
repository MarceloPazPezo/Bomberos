// src/helpers/run.helpers.js

/* ----------------- HELPERS: RUN (formato + módulo 11) ----------------- */
export const onlyDigitsK = (v = "") => v.replace(/[^0-9kK]/g, "");

export function formatRun(v = "") {
  const s = onlyDigitsK(v).toUpperCase();
  if (!s) return "";
  const body = s.slice(0, -1);
  const dv = s.slice(-1);
  let rev = body.split("").reverse().join("");
  let formatted = "";
  for (let i = 0; i < rev.length; i++) {
    if (i !== 0 && i % 3 === 0) formatted = "." + formatted;
    formatted = rev[i] + formatted;
  }
  return (formatted ? formatted : body) + (dv ? `-${dv}` : "");
}

export function cleanRun(v = "") {
  return v.replace(/\./g, "").replace(/-/g, "").toUpperCase();
}

export function isValidRunModulo11(v = "") {
  const s = cleanRun(v);
  if (s.length < 2) return false;
  const body = s.slice(0, -1);
  const dv = s.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const dvCalc = res === 11 ? "0" : res === 10 ? "K" : String(res);
  return dv.toUpperCase() === dvCalc;
}

/* ----------------- HELPERS: Validadores numéricos ----------------- */
export const isPosInt = (v) => Number.isInteger(Number(v)) && Number(v) >= 0;
export const isAge = (v) => Number.isInteger(Number(v)) && Number(v) > 0 && Number(v) < 130;

export const yearGT1900 = (v) => {
  if (!v) return true;
  const y = parseInt(String(v).slice(0, 4), 10);
  return y > 1900;
};
