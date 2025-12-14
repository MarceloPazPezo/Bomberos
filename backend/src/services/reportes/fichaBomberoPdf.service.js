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
import { getBomberoDetallesCompletosService } from '../bomberoDetalles.service.js';

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

function formatRun(run) {
  if (!run) return '';
  const cleanRun = String(run).replace(/[.-]/g, '');
  if (cleanRun.length < 2) return run;
  const dv = cleanRun.slice(-1);
  const numbers = cleanRun.slice(0, -1);
  const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

function calculateAge(birthDate) {
  if (!birthDate) return null;
  try {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
}

function calculateAntiguedad(fechaIngreso) {
  if (!fechaIngreso) return null;
  try {
    const today = new Date();
    const ingreso = new Date(fechaIngreso);
    let years = today.getFullYear() - ingreso.getFullYear();
    const monthDiff = today.getMonth() - ingreso.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < ingreso.getDate())) {
      years--;
    }
    return years;
  } catch {
    return null;
  }
}

function getIncidentesPorAno(historialActividades) {
  if (!Array.isArray(historialActividades)) return {};

  const incidentesPorAno = {};

  historialActividades.forEach(actividad => {
    if (actividad.tipo === 'incidente' && actividad.fecha) {
      try {
        const fecha = new Date(actividad.fecha);
        if (!Number.isNaN(fecha.getTime())) {
          const ano = fecha.getFullYear();
          incidentesPorAno[ano] = (incidentesPorAno[ano] || 0) + 1;
        }
      } catch {
        // Ignorar fechas inválidas
      }
    }
  });

  return incidentesPorAno;
}

// ==================== FUNCIONES DE DIBUJO ====================

function drawHeader(doc, logos, bombero) {
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
  const companiaNombre = bombero.informacionPersonal?.compania?.nombre || 'Primera compañía';
  doc.font(FONTS.normal.family)
    .fontSize(FONTS.normal.size)
    .text(companiaNombre, MARGINS.left + logoSize + 10, textY, {
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
    .text('Ficha de Bombero', MARGINS.left, textY + 35, {
      width: pageWidth - MARGINS.left - MARGINS.right,
      align: 'center',
    });

  const maxLogoHeight = Math.max(leftLogoHeight, rightLogoHeight, logoSize);
  doc.y = logoY + maxLogoHeight + 30;
}

function drawFotoPerfil(doc, fotoBuffer, x, y, size) {
  if (!fotoBuffer) return 0;

  try {
    const image = doc.openImage(fotoBuffer);
    const scale = Math.min(size / image.width, size / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const offsetX = x + (size - drawWidth) / 2;
    const offsetY = y + (size - drawHeight) / 2;

    // Guardar el estado del canvas
    doc.save();

    // Dibujar rectángulo cuadrado para foto tipo carnet y aplicar clip
    doc.rect(x, y, size, size).clip();
    doc.image(image, offsetX, offsetY, { width: drawWidth, height: drawHeight });

    // Restaurar el estado del canvas
    doc.restore();

    // Dibujar borde del rectángulo (formato carnet)
    doc.rect(x, y, size, size).stroke();

    return size;
  } catch (error) {
    logger.warn(`[PDF] Error dibujando foto de perfil: ${error.message}`);
    return 0;
  }
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

// ==================== OBTENER LOGOS Y FOTO ====================

async function fetchLogoBuffer(bucket, key, label) {
  if (!key) return null;
  try {
    return await downloadFile(bucket, key);
  } catch (error) {
    logger.warn(`[PDF] No se pudo obtener logo (${label}) ${bucket}/${key}: ${error.message}`);
    return null;
  }
}

async function fetchFotoPerfil(fotoKey) {
  if (!fotoKey) return null;
  try {
    return await downloadFile(BUCKETS.PERFILES, fotoKey);
  } catch (error) {
    logger.warn(`[PDF] No se pudo obtener foto de perfil ${fotoKey}: ${error.message}`);
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

export async function generarFichaBomberoPdfService(idBombero, options = {}) {
  try {
    logger.info(`[PDF] Iniciando generación de PDF de ficha para bombero ${idBombero}`);

    const expirySeconds = typeof options === 'number'
      ? options
      : (options?.expiresIn ? Number(options.expiresIn) : DEFAULT_EXPIRY_SECONDS);

    const validExpiry = Number.isInteger(expirySeconds) && expirySeconds > 0
      ? expirySeconds
      : DEFAULT_EXPIRY_SECONDS;

    // Obtener datos completos del bombero
    const [bombero, error] = await getBomberoDetallesCompletosService(idBombero);
    if (error || !bombero) {
      throw new Error(error || `No se encontró el bombero con ID ${idBombero}`);
    }

    const companiaId = bombero.informacionPersonal?.compania?.id;
    const logos = await getLogos(companiaId);

    // Obtener foto de perfil si existe
    const fotoKey = bombero.informacionPersonal?.fotoPerfilKEY;
    const fotoBuffer = fotoKey ? await fetchFotoPerfil(fotoKey) : null;

    const doc = new PDFDocument({
      margins: MARGINS,
      size: 'LETTER',
      bufferPages: true,
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const pageWidth = doc.page.width - MARGINS.left - MARGINS.right;

    // ==================== PÁGINA 1 ====================
    drawHeader(doc, logos, bombero);

    let currentY = doc.y + 10;

    // Sección de foto y datos principales
    const fotoSize = 148; // Tamaño ajustado para que llegue hasta el final de la tabla de datos
    const fotoX = MARGINS.left;
    const fotoY = currentY;

    // Dibujar foto de perfil si existe
    if (fotoBuffer) {
      drawFotoPerfil(doc, fotoBuffer, fotoX, fotoY, fotoSize);
    } else {
      // Dibujar rectángulo vacío si no hay foto
      doc.rect(fotoX, fotoY, fotoSize, fotoSize).stroke();
    }

    // Datos principales al lado de la foto
    const datosX = fotoX + fotoSize + 20;
    const datosY = fotoY;
    const datosWidth = pageWidth - fotoSize - 20;

    doc.font(FONTS.title.family).fontSize(FONTS.title.size);
    doc.text(bombero.nombreCompleto || 'Sin nombre', datosX, datosY);

    currentY = datosY + 25;

    // Datos personales básicos
    const datosBasicos = [
      ['RUN:', formatRun(bombero.run)],
      ['Email:', bombero.email || ''],
      ['Estado:', bombero.activo ? 'Activo' : 'Inactivo'],
    ];

    if (bombero.informacionPersonal?.fechaNacimiento) {
      const edad = calculateAge(bombero.informacionPersonal.fechaNacimiento);
      datosBasicos.push([
        'Fecha de Nacimiento:',
        `${formatDate(bombero.informacionPersonal.fechaNacimiento)}${edad ? ` (${edad} años)` : ''}`
      ]);
    }

    if (bombero.informacionPersonal?.fechaIngreso) {
      const antiguedad = calculateAntiguedad(bombero.informacionPersonal.fechaIngreso);
      datosBasicos.push([
        'Fecha de Ingreso:',
        `${formatDate(bombero.informacionPersonal.fechaIngreso)}${antiguedad !== null ? ` (${antiguedad} años de antigüedad)` : ''}`
      ]);
    }

    if (bombero.informacionPersonal?.telefono) {
      datosBasicos.push(['Teléfono:', bombero.informacionPersonal.telefono]);
    }

    currentY = drawSimpleTable(doc, datosX, currentY, datosWidth, datosBasicos) + 20;

    // Dirección
    if (bombero.informacionPersonal?.direccion) {
      const direccion = bombero.informacionPersonal.direccion;
      const direccionCompleta = [
        direccion.calle,
        direccion.numero,
        direccion.depto,
        direccion.comuna?.nombre,
      ].filter(Boolean).join(', ');

      if (direccionCompleta) {
        const direccionRows = [['Dirección:', direccionCompleta]];
        if (direccion.referencia) {
          direccionRows.push(['Referencia:', direccion.referencia]);
        }
        currentY = drawSimpleTable(doc, MARGINS.left, currentY, pageWidth, direccionRows, 'Dirección') + 20;
      }
    }

    // Información médica
    const infoMedica = [];
    if (bombero.informacionPersonal?.tipoSangre) {
      infoMedica.push(['Tipo de Sangre:', bombero.informacionPersonal.tipoSangre.nombre]);
    }
    if (bombero.informacionPersonal?.donante) {
      infoMedica.push(['Donante de Órganos:', 'Sí']);
    }
    if (bombero.informacionPersonal?.licenciaClaseF) {
      infoMedica.push(['Licencia Clase F:', 'Sí']);
    }

    if (infoMedica.length > 0) {
      currentY = drawSimpleTable(doc, MARGINS.left, currentY, pageWidth, infoMedica, 'Información Médica') + 20;
    }

    // Roles
    if (bombero.roles && bombero.roles.length > 0) {
      const rolesText = bombero.roles.map(r => r.nombre || r.name).join(', ');
      const rolesRows = [['Roles:', rolesText]];
      currentY = drawSimpleTable(doc, MARGINS.left, currentY, pageWidth, rolesRows, 'Roles') + 20;
    }

    // Estadísticas de incidentes por año
    const incidentesPorAno = getIncidentesPorAno(bombero.historialActividades || []);
    if (Object.keys(incidentesPorAno).length > 0) {
      const anos = Object.keys(incidentesPorAno).sort((a, b) => parseInt(b) - parseInt(a));
      const estadisticasHeaders = ['Año', 'Cantidad de Incidentes'];
      const estadisticasRows = anos.map(ano => [ano, incidentesPorAno[ano].toString()]);
      currentY = drawMultiColumnTable(doc, MARGINS.left, currentY, pageWidth, estadisticasHeaders, estadisticasRows, 'Estadísticas de Incidentes por Año') + 20;
    }

    // Verificar si necesitamos nueva página
    if (currentY > doc.page.height - MARGINS.bottom - 100) {
      doc.addPage({ margins: MARGINS });
      drawHeader(doc, logos, bombero);
      currentY = doc.y + 10;
    }

    // Capacitaciones
    if (bombero.capacitaciones && bombero.capacitaciones.length > 0) {
      const capacitacionesHeaders = ['Tipo', 'Descripción', 'Fecha'];
      const capacitacionesRows = bombero.capacitaciones.map(cap => [
        cap.tipoCapacitacion?.nombre || '',
        cap.descripcion || '',
        formatDate(cap.creadoEl),
      ]);
      currentY = drawMultiColumnTable(doc, MARGINS.left, currentY, pageWidth, capacitacionesHeaders, capacitacionesRows, 'Capacitaciones') + 20;

      if (currentY > doc.page.height - MARGINS.bottom - 100) {
        doc.addPage({ margins: MARGINS });
        drawHeader(doc, logos, bombero);
        currentY = doc.y + 10;
      }
    }

    // Contactos de emergencia
    if (bombero.contactosEmergencia && bombero.contactosEmergencia.length > 0) {
      const contactosHeaders = ['Nombre', 'Teléfono', 'Vínculo'];
      const contactosRows = bombero.contactosEmergencia.map(contacto => [
        contacto.nombreCompleto || '',
        contacto.telefono || '',
        contacto.vinculo?.nombre || '',
      ]);
      currentY = drawMultiColumnTable(doc, MARGINS.left, currentY, pageWidth, contactosHeaders, contactosRows, 'Contactos de Emergencia') + 20;

      if (currentY > doc.page.height - MARGINS.bottom - 100) {
        doc.addPage({ margins: MARGINS });
        drawHeader(doc, logos, bombero);
        currentY = doc.y + 10;
      }
    }

    // EPP a cargo
    if (bombero.eppAcargo && bombero.eppAcargo.length > 0) {
      const eppHeaders = ['Código', 'Descripción', 'Tipo', 'Estado', 'Fecha Asignación'];
      const eppRows = bombero.eppAcargo.map(epp => [
        epp.epp?.codigo || '',
        epp.epp?.descripcion || '',
        epp.epp?.tipoEpp?.nombre || '',
        epp.epp?.estadosEpp?.nombre || '',
        formatDate(epp.fechaAsignacion),
      ]);
      currentY = drawMultiColumnTable(doc, MARGINS.left, currentY, pageWidth, eppHeaders, eppRows, 'Equipos de Protección Personal (EPP) a Cargo') + 20;
    }

    // Footer
    doc.font(FONTS.small.family).fontSize(FONTS.small.size);
    doc.text(
      `Documento generado el ${formatDate(new Date())}`,
      MARGINS.left,
      doc.page.height - MARGINS.bottom - 15,
      {
        width: pageWidth,
        align: 'center',
      }
    );

    // Finalizar
    doc.end();

    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const fileName = generateUniqueFileName(`ficha_bombero_${idBombero}`, 'pdf');
    await uploadFile(BUCKETS.DOCUMENTOS, fileName, pdfBuffer, 'application/pdf');
    scheduleFileDeletion(BUCKETS.DOCUMENTOS, fileName, validExpiry);

    logger.info(`[PDF] PDF de ficha generado y subido exitosamente: ${fileName}`);

    // Generar URL firmada de MinIO
    const url = await getSignedUrl(BUCKETS.DOCUMENTOS, fileName, validExpiry);

    return {
      success: true,
      url,
      fileName,
      expiresIn: validExpiry,
      rut: bombero.informacionPersonal?.rut,
      nombre: bombero.informacionPersonal?.nombre,
    };
  } catch (error) {
    logger.error(`[PDF] Error generando PDF de ficha para bombero ${idBombero}: ${error.message}`);
    throw error;
  }
}

