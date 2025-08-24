// src/helpers/cast.helpers.js
export const toIntOrNull = (v) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};

export const emptyToNull = (v) => (v === "" || v === undefined ? null : v);
