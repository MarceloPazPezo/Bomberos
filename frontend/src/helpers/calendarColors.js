import tinycolor from 'tinycolor2';

// Decide color de texto legible sobre un fondo dado
export const pickTextColor = (bgHex) => {
  const dark = '#111827';
  const light = '#ffffff';
  const opts = { level: 'AA', size: 'small' };
  const darkOk = tinycolor.isReadable(bgHex, dark, opts);
  const lightOk = tinycolor.isReadable(bgHex, light, opts);
  if (darkOk && !lightOk) return dark;
  if (lightOk && !darkOk) return light;
  const darkScore = tinycolor.readability(bgHex, dark);
  const lightScore = tinycolor.readability(bgHex, light);
  return darkScore >= lightScore ? dark : light;
};

// Genera un mapa { tipoId: {bg,border,text} } usando una paleta triádica a partir de #318CE7
export const buildTipoColorMap = (tipos) => {
  if (!tipos || tipos.length === 0) return {};
  const triad = tinycolor('#318CE7').triad();
  const tipoIndexMap = new Map((tipos || []).map((t, i) => [String(t.value), i]));

  const colorForTipo = (tipoId) => {
    const idx = tipoIndexMap.get(String(tipoId)) ?? 0;
    const anchor = triad[idx % 3].clone();
    const level = Math.floor(idx / 3);
    let variant = anchor.clone();
    if (level > 0) {
      const brightAmt = Math.min(10 + (level - 1) * 8, 35);
      const satAmt = Math.min(8 + (level - 1) * 4, 24);
      variant = (level % 2 === 1) ? anchor.lighten(brightAmt) : anchor.darken(brightAmt);
      if (level % 3 === 1) variant = variant.saturate(satAmt);
      else if (level % 3 === 2) variant = variant.desaturate(satAmt);
      else variant = variant.saturate(4);
    }
    const bg = variant.toHexString();
    const border = variant.darken(14).toHexString();
    const text = pickTextColor(bg);
    return { bg, border, text };
  };

  const map = {};
  for (const t of tipos) {
    map[String(t.value)] = colorForTipo(t.value);
  }
  return map;
};

export const getTipoBgFromMap = (map, id) => map[String(id)]?.bg || '#318CE7';

// Colores para eventos recurrentes (tríada a partir de #318CE7)
export const REC_COLORS = {
  cumple: (() => {
    const c = tinycolor('#318CE7');
    const bg = c.toHexString();
    return { bg, border: c.darken(14).toHexString(), text: pickTextColor(bg) };
  })(),
  ingreso: (() => {
    const c = tinycolor('#E7318C');
    const bg = c.toHexString();
    return { bg, border: c.darken(14).toHexString(), text: pickTextColor(bg) };
  })(),
  fundacion: (() => {
    const c = tinycolor('#31E78C');
    const bg = c.toHexString();
    return { bg, border: c.darken(14).toHexString(), text: pickTextColor(bg) };
  })(),
};
