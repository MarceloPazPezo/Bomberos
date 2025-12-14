import PDFDocument from 'pdfkit';
import { AppDataSource } from '../../config/configDb.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { BUCKETS } from '../../config/configMinIO.js';
import logger from '../../config/configLogger.js';
import {
  downloadFile,
  generateUniqueFileName,
  getSignedUrl,
  scheduleFileDeletion,
  uploadFile,
} from '../minio.service.js';
import { obtenerParteDetalladoPorIdService } from '../parteEmergencia.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOGO_BOMBEROS_PATH = join(__dirname, '../../templates/logoBomberos');

const DEFAULT_EXPIRY_SECONDS = 30 * 60; // 30 minutos

// ==================== CONSTANTES DE DISEÑO ====================
const MARGINS = {
  top: 40,
  bottom: 40,
  left: 40,
  right: 40,
};

const COLORS = {
  primary: '#000000',
  border: '#000000',
  headerBg: '#ffffff',
};

const FONTS = {
  title: { family: 'Helvetica-Bold', size: 16 },
  subtitle: { family: 'Helvetica-Bold', size: 11 },
  normal: { family: 'Helvetica', size: 9 },
  small: { family: 'Helvetica', size: 8 },
};

// ==================== UTILIDADES ====================

function formatDate(value) {
  if (!value) return '';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  } catch {
    return '';
  }
}

function formatTime(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(date);
    }
  } catch {
    /* ignore */
  }
  return String(value);
}

function formatRun(run) {
  if (!run) return '';
  const cleanRun = String(run).replace(/[.-]/g, '');
  if (cleanRun.length < 2) return run;
  const dv = cleanRun.slice(-1);
  const numbers = cleanRun.slice(0, -1);
  const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

// ==================== FUNCIONES DE DIBUJO ====================

function drawHeader(doc, logos, parte) {
  const { bomberosLogoBuffer, companiaLogoBuffer } = logos;
  const pageWidth = doc.page.width;
  const logoSize = 60;
  const logoY = MARGINS.top;

  const drawLogo = (buffer, x, y, label) => {
    if (!buffer) return 0;
    try {
      const image = doc.openImage(buffer);
      const scale = Math.min(logoSize / image.width, logoSize / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const offsetX = x + (logoSize - drawWidth) / 2;
      const offsetY = y + (logoSize - drawHeight) / 2;
      doc.image(image, offsetX, offsetY, { width: drawWidth, height: drawHeight });
      return drawHeight;
    } catch (error) {
      logger.warn(`[PDF] Error dibujando logo de ${label}: ${error.message}`);
      return 0;
    }
  };

  const leftLogoHeight = drawLogo(bomberosLogoBuffer, MARGINS.left, logoY, 'Bomberos');
  const rightLogoHeight = drawLogo(
    companiaLogoBuffer,
    pageWidth - MARGINS.right - logoSize,
    logoY,
    'compañía',
  );

  // Texto central
  const textY = logoY + 5;
  doc.font(FONTS.normal.family)
    .fontSize(FONTS.normal.size)
    .text(parte.compania?.nombre || 'Primera compañía', MARGINS.left + logoSize + 10, textY, {
      width: pageWidth - (MARGINS.left + logoSize + 10) - (MARGINS.right + logoSize + 10),
      align: 'center',
    });

  doc.text('Cuerpo de Bomberos Cabrero', MARGINS.left + logoSize + 10, textY + 12, {
    width: pageWidth - (MARGINS.left + logoSize + 10) - (MARGINS.right + logoSize + 10),
    align: 'center',
  });

  // Título
  doc.font(FONTS.title.family)
    .fontSize(FONTS.title.size)
    .text('Parte de emergencias', MARGINS.left, textY + 35, {
      width: pageWidth - MARGINS.left - MARGINS.right,
      align: 'center',
    });

  doc.text(`${parte.subtipo?.claveRadial?.nombre || parte.subtipo?.codigoRadial || parte.id}`, MARGINS.left, textY + 52, {
    width: pageWidth - MARGINS.left - MARGINS.right,
    align: 'center',
  });

  const maxLogoHeight = Math.max(leftLogoHeight, rightLogoHeight, logoSize);
  doc.y = logoY + maxLogoHeight + 30;
}

function drawSimpleTable(doc, x, y, width, rows, title = null) {
  let currentY = y;

  if (title) {
    doc.font(FONTS.subtitle.family).fontSize(FONTS.subtitle.size);
    doc.text(title, x, currentY);
    currentY += 15;
  }

  rows.forEach(([label, rawValue]) => {
    const labelText = label ?? '';
    const valueText = rawValue || '';
    const labelWidth = width * 0.4;
    const valueWidth = width - labelWidth;

    doc.font(FONTS.normal.family).fontSize(FONTS.normal.size);
    const labelHeight = doc.heightOfString(labelText, { width: labelWidth - 6 });
    const valueHeight = doc.heightOfString(valueText, { width: valueWidth - 6 });
    const cellHeight = Math.max(18, Math.max(labelHeight, valueHeight) + 10);

    doc.rect(x, currentY, labelWidth, cellHeight).stroke();
    doc.rect(x + labelWidth, currentY, valueWidth, cellHeight).stroke();

    doc.text(labelText, x + 3, currentY + 5, { width: labelWidth - 6, lineBreak: true });
    doc.text(valueText, x + labelWidth + 3, currentY + 5, { width: valueWidth - 6, lineBreak: true });

    currentY += cellHeight;
  });

  return currentY;
}

function drawWideTable(doc, x, y, width, rows, title = null) {
  let currentY = y;

  if (title) {
    doc.font(FONTS.subtitle.family).fontSize(FONTS.subtitle.size);
    doc.text(title, x, currentY);
    currentY += 15;
  }

  rows.forEach(([label, rawValue]) => {
    const labelText = label ?? '';
    const valueText = rawValue || '';
    const labelWidth = width * 0.2;
    const valueWidth = width - labelWidth;

    doc.font(FONTS.normal.family).fontSize(FONTS.normal.size);
    const labelHeight = doc.heightOfString(labelText, { width: labelWidth - 6 });
    const valueHeight = doc.heightOfString(valueText, { width: valueWidth - 6 });
    const cellHeight = Math.max(18, Math.max(labelHeight, valueHeight) + 10);

    doc.rect(x, currentY, labelWidth, cellHeight).stroke();
    doc.rect(x + labelWidth, currentY, valueWidth, cellHeight).stroke();

    doc.text(labelText, x + 3, currentY + 5, { width: labelWidth - 6, lineBreak: true });
    doc.text(valueText, x + labelWidth + 3, currentY + 5, { width: valueWidth - 6, lineBreak: true });

    currentY += cellHeight;
  });

  return currentY;
}

function drawMultiColumnTable(doc, x, y, width, headers, rows, title = null) {
  let currentY = y;

  if (title) {
    doc.font(FONTS.subtitle.family).fontSize(FONTS.subtitle.size);
    doc.text(title, x, currentY);
    currentY += 15;
  }

  const cellHeight = 18;
  const numCols = headers.length;
  const colWidth = width / numCols;

  // Headers
  headers.forEach((header, i) => {
    doc.rect(x + (i * colWidth), currentY, colWidth, cellHeight).stroke();
    doc.font(FONTS.normal.family).fontSize(FONTS.normal.size);
    doc.text(header, x + (i * colWidth) + 3, currentY + 5, { width: colWidth - 6, lineBreak: false });
  });

  currentY += cellHeight;

  // Rows
  rows.forEach((row) => {
    row.forEach((cell, i) => {
      doc.rect(x + (i * colWidth), currentY, colWidth, cellHeight).stroke();
      doc.font(FONTS.normal.family).fontSize(FONTS.normal.size);
      doc.text(cell || '', x + (i * colWidth) + 3, currentY + 5, { width: colWidth - 6, lineBreak: false });
    });
    currentY += cellHeight;
  });

  return currentY;
}

// ==================== OBTENER LOGOS ====================

async function fetchLogoBuffer(bucket, key, label) {
  if (!key) return null;
  try {
    return await downloadFile(bucket, key);
  } catch (error) {
    logger.warn(`[PDF] No se pudo obtener logo (${label}) ${bucket}/${key}: ${error.message}`);
    return null;
  }
}

async function getLogos(companiaId) {
  let companiaLogoBuffer = null;
  let bomberosLogoBuffer = null;

  try {
    if (fs.existsSync(LOGO_BOMBEROS_PATH)) {
      bomberosLogoBuffer = fs.readFileSync(LOGO_BOMBEROS_PATH);
      logger.info('[PDF] Logo de Bomberos de Chile cargado desde templates');
    }
  } catch (error) {
    logger.warn(`[PDF] No se pudo cargar logo estático de Bomberos: ${error.message}`);
  }

  if (companiaId) {
    try {
      const companiaRepo = AppDataSource.getRepository('Compania');
      const compania = await companiaRepo.findOne({
        where: { id: companiaId },
        select: ['id', 'logoKEY'],
      });

      if (compania?.logoKEY) {
        companiaLogoBuffer = await fetchLogoBuffer(BUCKETS.COMPANIAS, compania.logoKEY, 'Compañía');
      }
    } catch (error) {
      logger.warn(`[PDF] Error obteniendo logo de compañía ${companiaId}: ${error.message}`);
    }
  }

  return { bomberosLogoBuffer, companiaLogoBuffer };
}

// ==================== GENERACIÓN DEL PDF ====================

export async function generarParteEmergenciaPdfService(idIncidente, options = {}) {
  try {
    logger.info(`[PDF] Iniciando generación de PDF para incidente ${idIncidente}`);

    const expirySeconds = typeof options === 'number'
      ? options
      : (options?.expiresIn ? Number(options.expiresIn) : DEFAULT_EXPIRY_SECONDS);

    const validExpiry = Number.isInteger(expirySeconds) && expirySeconds > 0
      ? expirySeconds
      : DEFAULT_EXPIRY_SECONDS;

    const parte = await obtenerParteDetalladoPorIdService(idIncidente);
    if (!parte) {
      throw new Error(`No se encontró el parte de emergencia con ID ${idIncidente}`);
    }

    const logos = await getLogos(parte.compania?.id);

    const doc = new PDFDocument({
      margins: MARGINS,
      size: 'LETTER',
      bufferPages: true,
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const pageWidth = doc.page.width - MARGINS.left - MARGINS.right;

    // ==================== PÁGINA 1 ====================
    drawHeader(doc, logos, parte);

    let currentY = doc.y + 10;

    // 1.- Datos generales (2 tablas lado a lado)
    doc.font(FONTS.subtitle.family).fontSize(FONTS.subtitle.size);
    doc.text('1.- Datos generales', MARGINS.left, currentY);
    currentY += 15;

    const col1Width = pageWidth * 0.48;
    const col2Width = pageWidth * 0.48;
    const colGap = pageWidth * 0.04;

    // Tabla izquierda
    const leftRows = [
      ['Fecha:', formatDate(parte.fecha)],
      ['Compañía:', parte.compania?.nombre || ''],
      ['Hr Despacho:', formatTime(parte.horaDespacho)],
      ['Hr 6-0:', formatTime(parte.hora6_0)],
      ['Km Salida:', parte.materialMayor?.[0]?.kmSalida?.toString() || ''],
    ];

    // Tabla derecha
    const materialMayor = Array.isArray(parte.materialMayor) && parte.materialMayor.length > 0
      ? parte.materialMayor[0]
      : null;

    const rightRows = [
      ['Unidad', parte.materialMayor?.[0]?.unidad?.patente || ''],
      ['Hora 6-3:', formatTime(parte.hora6_3)],
      ['Hora 6-9:', formatTime(parte.hora6_9)],
      ['Hora 6-10:', formatTime(parte.hora6_10)],
      ['Km Llegada:', parte.materialMayor?.[0]?.kmLlegada?.toString() || ''],
    ];

    const leftEndY = drawSimpleTable(doc, MARGINS.left, currentY, col1Width, leftRows);
    const rightEndY = drawSimpleTable(doc, MARGINS.left + col1Width + colGap, currentY, col2Width, rightRows);

    currentY = Math.max(leftEndY, rightEndY) + 20;

    // 2.- Datos del lugar
    const direccion = [parte?.direccion?.calle, parte?.direccion?.numero].filter(Boolean).join(' ') || '';

    const lugarRows = [
      ['Comuna:', parte?.direccion?.comuna?.nombre || ''],
      ['Dirección:', direccion],
      ['Villa/Poblacion', parte?.direccion?.localidad || ''],
      ['Tipo de vía', parte?.direccion?.tipoVia || ''],
    ];

    currentY = drawWideTable(doc, MARGINS.left, currentY, pageWidth, lugarRows, '2.- Datos del lugar') + 20;

    // 3.- Datos del afectado
    const primerVehiculoData = Array.isArray(parte.vehiculos) && parte.vehiculos.length > 0
      ? parte.vehiculos[0]
      : null;

    // Determinar el primer afectado: priorizar conductor (chofer), luego primer pasajero
    const primerAfectado = primerVehiculoData?.conductor ||
      (Array.isArray(primerVehiculoData?.pasajeros) && primerVehiculoData.pasajeros.length > 0
        ? primerVehiculoData.pasajeros[0]?.afectado || primerVehiculoData.pasajeros[0]
        : null);

    // Determinar tipo de ocupante solo si hay afectado
    let tipoOcupante = '';
    if (primerAfectado) {
      const esChofer = primerVehiculoData?.conductor && primerAfectado?.id === primerVehiculoData.conductor.id;
      tipoOcupante = esChofer ? 'chofer' : 'acompañante';
    }

    const afectadoRows = [
      ['Rut:', formatRun(primerAfectado?.run)],
      ['Nombres:', primerAfectado?.nombreCompleto?.split(' ')[0] || ''],
      ['Apellidos', primerAfectado?.nombreCompleto?.split(' ').slice(1).join(' ') || ''],
      ['Telefono', primerAfectado?.telefono || ''],
      ['Estado', primerAfectado?.descripcionGravedad || ''],
      ['Tipo ocupante', tipoOcupante],
    ];

    currentY = drawWideTable(doc, MARGINS.left, currentY, pageWidth, afectadoRows, '3.- Datos del afectado') + 20;

    // 4.- Datos del vehículo
    const primerVehiculo = Array.isArray(parte.vehiculos) && parte.vehiculos.length > 0
      ? parte.vehiculos[0]
      : null;

    const vehiculoRows = [
      ['Tipo vehículo:', ''],
      ['Marca vehículo:', primerVehiculo?.marca || ''],
      ['Modelo vehículo', primerVehiculo?.modelo || ''],
      ['Patente vehículo', primerVehiculo?.patente || ''],
      ['Daños', ''],
    ];

    currentY = drawWideTable(doc, MARGINS.left, currentY, pageWidth, vehiculoRows, '4.- Datos del vehículo');

    // ==================== PÁGINA 2 ====================
    doc.addPage({ margins: MARGINS });
    drawHeader(doc, logos, parte);
    currentY = doc.y + 10;

    // Descripción preliminar
    doc.font(FONTS.subtitle.family).fontSize(FONTS.subtitle.size);
    doc.text('Descripción preliminar', MARGINS.left, currentY);
    currentY += 15;

    doc.rect(MARGINS.left, currentY, pageWidth, 30).stroke();
    doc.font(FONTS.normal.family).fontSize(FONTS.normal.size);
    doc.text(parte.descripcionPreliminar || '', MARGINS.left + 3, currentY + 5, {
      width: pageWidth - 6,
      height: 25,
    });
    currentY += 40;

    // 5.- Ocupantes del vehículo
    const ocupantesHeaders = ['Nombre', 'Rut', 'Edad', 'Estado'];
    const ocupantesRows = primerVehiculo && Array.isArray(primerVehiculo.pasajeros)
      ? primerVehiculo.pasajeros.map(p => [
        p?.afectado?.nombreCompleto || '',
        formatRun(p?.afectado?.run),
        p?.afectado?.edad?.toString() || '',
        '',
      ])
      : [];

    if (primerAfectado) {
      ocupantesRows.unshift([
        primerAfectado.nombreCompleto || '',
        formatRun(primerAfectado.run),
        primerAfectado.edad?.toString() || '',
        '',
      ]);
    }

    currentY = drawMultiColumnTable(doc, MARGINS.left, currentY, pageWidth, ocupantesHeaders, ocupantesRows, '5.- Ocupantes del vehículo') + 20;

    // 6.- Otros vehículos afectados
    const otrosVehiculosHeaders = ['Tipo V.', 'Marca', 'Modelo', 'Patente', 'Rut C.', 'Nombre C.'];
    const otrosVehiculosRows = Array.isArray(parte.vehiculos) && parte.vehiculos.length > 1
      ? parte.vehiculos.slice(1).map(v => [
        '',
        v.marca || '',
        v.modelo || '',
        v.patente || '',
        formatRun(v.conductor?.run),
        v.conductor?.nombreCompleto || '',
      ])
      : [];

    currentY = drawMultiColumnTable(doc, MARGINS.left, currentY, pageWidth, otrosVehiculosHeaders, otrosVehiculosRows, '6.- Otros vehículos afectados') + 20;

    // 7.- Otros Ocupantes afectados
    const otrosOcupantesHeaders = ['Nombre', 'Rut', 'Edad', 'Estado'];
    const otrosOcupantesRows = [];

    currentY = drawMultiColumnTable(doc, MARGINS.left, currentY, pageWidth, otrosOcupantesHeaders, otrosOcupantesRows, '7.- Otros Ocupantes afectados') + 20;

    // 8.- Material mayor
    const materialHeaders = ['Unidad', 'Maquinista', 'Obac', 'Nro personal'];
    const materialRows = Array.isArray(parte.materialMayor)
      ? parte.materialMayor.map(m => [
        m.unidad?.patente || '',
        m.conductor?.nombreCompleto || '',
        m.bomberoACargo?.nombreCompleto || '',
        m.voluntarios?.toString() || '',
      ])
      : [];

    currentY = drawMultiColumnTable(doc, MARGINS.left, currentY, pageWidth, materialHeaders, materialRows, '8.- Material mayor');

    // ==================== PÁGINA 3 ====================
    doc.addPage({ margins: MARGINS });
    drawHeader(doc, logos, parte);
    currentY = doc.y + 10;

    // 9.- bomberos accidentados
    const accidentadosHeaders = ['Cia', 'Nombre', 'Rut', 'Constancia', 'Comisaria', 'Detalles'];
    const accidentadosRows = Array.isArray(parte.accidentados)
      ? parte.accidentados.map(a => [
        a.compania?.nombre || '',
        a.bombero?.nombreCompleto || '',
        formatRun(a.bombero?.run),
        '',
        '',
        a.descripcion || '',
      ])
      : [];

    currentY = drawMultiColumnTable(doc, MARGINS.left, currentY, pageWidth, accidentadosHeaders, accidentadosRows, '9.- Bomberos accidentados') + 20;

    // 10.- Otros servicios de emergencia en el lugar
    const serviciosHeaders = ['Servicios', 'Unidad', 'A cargo', 'Nro personal', 'Observaciones'];
    const serviciosRows = Array.isArray(parte.otrosServicios)
      ? parte.otrosServicios.map(s => [
        s.servicio?.nombre || '',
        '',
        '',
        '',
        s.observaciones || '',
      ])
      : [];

    currentY = drawMultiColumnTable(doc, MARGINS.left, currentY, pageWidth, serviciosHeaders, serviciosRows, '10.- Otros servicios de emergencia en el lugar') + 20;

    // 11.- Asistencia (1 columna)
    doc.font(FONTS.subtitle.family).fontSize(FONTS.subtitle.size);
    doc.text('11.- Asistencia:', MARGINS.left, currentY);
    currentY += 15;

    const asistenciaHeaders = ['Nombre', 'Rut'];
    const enLugar = Array.isArray(parte.asistencia?.lugar) ? parte.asistencia.lugar : [];
    const enCuartel = Array.isArray(parte.asistencia?.cuartel) ? parte.asistencia.cuartel : [];

    // Combinar ambas listas en una sola
    const todosAsistentes = [...enLugar, ...enCuartel];

    const asistenciaRows = todosAsistentes.map(bombero => [
      bombero?.nombreCompleto || '',
      formatRun(bombero?.run),
    ]);

    currentY = drawMultiColumnTable(doc, MARGINS.left, currentY, pageWidth, asistenciaHeaders, asistenciaRows) + 20;

    // Footer
    doc.font(FONTS.normal.family).fontSize(FONTS.normal.size);
    doc.text(`Oficial o voluntario que toma el parte: ${parte.redactor?.nombreCompleto || ''}`, MARGINS.left, currentY);
    currentY += 15;
    doc.text(`Oficial o voluntario a cargo: ${parte.bomberoACargo?.nombreCompleto || ''}`, MARGINS.left, currentY);

    // Finalizar
    doc.end();

    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const fileName = generateUniqueFileName(`parte_emergencia_${idIncidente}`, 'pdf');
    await uploadFile(BUCKETS.DOCUMENTOS, fileName, pdfBuffer, 'application/pdf');
    scheduleFileDeletion(BUCKETS.DOCUMENTOS, fileName, validExpiry);

    logger.info(`[PDF] PDF generado y subido exitosamente: ${fileName}`);

    // Generar URL firmada de MinIO
    const url = await getSignedUrl(BUCKETS.DOCUMENTOS, fileName, validExpiry);

    return {
      success: true,
      url,
      fileName,
      expiresIn: validExpiry,
    };
  } catch (error) {
    logger.error(`[PDF] Error generando PDF para incidente ${idIncidente}: ${error.message}`);
    throw error;
  }
}

// Alias para compatibilidad con el controlador
export const generarPdfParteEmergencia = generarParteEmergenciaPdfService;
