import PDFDocument from 'pdfkit';
import { AppDataSource } from '../../config/configDb.js';
import { CUERPO_LOGO_KEY } from '../../config/configEnv.js';
import { BUCKETS } from '../../config/configMinIO.js';
import logger from '../../config/configLogger.js';
import { downloadFile, generateUniqueFileName, getSignedUrl, uploadFile } from '../minio.service.js';
import { obtenerParteDetalladoPorIdService } from '../parteEmergencia.service.js';

const DEFAULT_EXPIRY_SECONDS = 30 * 60; // 30 minutos
const SECTION_SPACING = 12;
const SMALL_SPACING = 6;

function formatDate(value, withTime = false) {
  if (!value) return '-';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    const options = withTime
      ? { dateStyle: 'medium', timeStyle: 'short' }
      : { dateStyle: 'medium' };
    return new Intl.DateTimeFormat('es-CL', options).format(date);
  } catch {
    return '-';
  }
}

function formatTime(value) {
  if (!value) return '-';
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

function writeKeyValue(doc, label, value) {
  doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
  doc.font('Helvetica').text(value ?? '-');
}

function writeSectionTitle(doc, title) {
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(13).text(title);
  doc.moveDown(0.2);
  doc.font('Helvetica').fontSize(11);
}

function writeList(doc, items, emptyText = 'Sin registros') {
  if (!Array.isArray(items) || items.length === 0) {
    doc.text(`• ${emptyText}`);
    return;
  }
  items.forEach((item) => {
    doc.text(`• ${item}`);
  });
}

async function fetchLogoBuffer(bucket, key, label) {
  if (!key) return null;
  try {
    return await downloadFile(bucket, key);
  } catch (error) {
    logger.warn(`[PDF] No se pudo obtener logo (${label}) ${bucket}/${key}: ${error.message}`);
    return null;
  }
}

function drawHeader(doc, logos, parte) {
  const { cuerpoLogo, companiaLogo } = logos;
  const marginLeft = doc.page.margins.left;
  const marginRight = doc.page.width - doc.page.margins.right;
  const headerY = doc.page.margins.top;
  const logoWidth = 110;
  let headerHeight = 0;

  if (cuerpoLogo) {
    doc.image(cuerpoLogo, marginLeft, headerY, { fit: [logoWidth, 80], align: 'left' });
    headerHeight = Math.max(headerHeight, 80);
  } else {
    doc.font('Helvetica-Bold').fontSize(10).text('LOGO CUERPO', marginLeft, headerY);
    doc.font('Helvetica').fontSize(11);
    headerHeight = Math.max(headerHeight, 12);
  }

  if (companiaLogo) {
    doc.image(companiaLogo, marginRight - logoWidth, headerY, { fit: [logoWidth, 80], align: 'right' });
    headerHeight = Math.max(headerHeight, 80);
  } else {
    doc.font('Helvetica-Bold').fontSize(10).text('LOGO COMPAÑÍA', marginRight - logoWidth, headerY, {
      align: 'right',
    });
    doc.font('Helvetica').fontSize(11);
    headerHeight = Math.max(headerHeight, 12);
  }

  const titleY = headerY + headerHeight + SMALL_SPACING;
  doc.moveTo(marginLeft, titleY).lineTo(marginRight, titleY).strokeColor('#333333').lineWidth(1).stroke();
  doc.moveDown(1.2);

  doc.font('Helvetica-Bold').fontSize(18).text(`Parte de Emergencia #${parte.id}`, {
    align: 'center',
  });
  doc.moveDown(0.2);
  doc.fontSize(12).text(`Fecha de emisión: ${formatDate(new Date(), true)}`, { align: 'center' });
  doc.moveDown(0.2);
  doc.text(`Compañía: ${parte.compania?.nombre || `ID ${parte.compania?.id || '-'}`}`, {
    align: 'center',
  });
  doc.moveDown(0.5);
  doc.fontSize(11);
  doc.moveDown();
}

function appendAntecedentesGenerales(doc, parte) {
  writeSectionTitle(doc, 'Antecedentes Generales');
  writeKeyValue(doc, 'Fecha del despacho', formatDate(parte.fecha));
  writeKeyValue(doc, 'Hora del despacho', formatTime(parte.horaDespacho));
  writeKeyValue(doc, 'Dirección', [
    parte?.direccion?.calle,
    parte?.direccion?.numero,
    parte?.direccion?.depto ? `Depto ${parte.direccion.depto}` : null,
  ].filter(Boolean).join(' ') || '-');
  writeKeyValue(doc, 'Comuna', parte?.direccion?.comuna?.nombre || '-');
  writeKeyValue(doc, 'Referencia', parte?.direccion?.referencia || '-');

  doc.moveDown(0.4);
  writeKeyValue(doc, 'Redactor', parte?.redactor?.nombreCompleto || '-');
  writeKeyValue(doc, 'Bombero a cargo', parte?.bomberoACargo?.nombreCompleto || '-');
}

function appendTimeline(doc, parte) {
  writeSectionTitle(doc, 'Secuencia Operativa');
  const hitos = [
    ['6-0', parte?.hora6_0],
    ['6-3', parte?.hora6_3],
    ['6-9', parte?.hora6_9],
    ['6-10', parte?.hora6_10],
  ];
  hitos.forEach(([label, time]) => {
    writeKeyValue(doc, label, formatTime(time));
  });
}

function appendDescripcion(doc, parte) {
  writeSectionTitle(doc, 'Descripción Preliminar');
  doc.text(parte.descripcionPreliminar || '-', {
    align: 'justify',
  });
}

function appendClasificacion(doc, parte) {
  writeSectionTitle(doc, 'Clasificación del Incidente');
  writeKeyValue(doc, 'Clasificación', parte?.clasificacion?.nombre || '-');
  writeKeyValue(doc, 'Clave radial', parte?.subtipo?.claveRadial || '-');
  writeKeyValue(doc, 'Descripción de clave', parte?.subtipo?.descripcion || '-');
  writeKeyValue(doc, 'Tipo de incendio', parte?.incendio?.tipo?.nombre || '-');
  writeKeyValue(doc, 'Fase', parte?.incendio?.fase?.nombre || '-');
}

function appendInmuebles(doc, inmuebles = []) {
  writeSectionTitle(doc, 'Inmuebles Afectados');
  if (!Array.isArray(inmuebles) || inmuebles.length === 0) {
    doc.text('No se registran inmuebles asociados.');
    return;
  }
  inmuebles.forEach((inmueble, index) => {
    doc.font('Helvetica-Bold').text(`Inmueble ${index + 1}`);
    doc.font('Helvetica').text([
      inmueble?.direccion?.calle || inmueble.calle || '',
      inmueble?.direccion?.numero || inmueble.numero || '',
    ].filter(Boolean).join(' ').trim() || 'Dirección no especificada');
    doc.text(`Tipo construcción: ${inmueble?.tipo_construccion || '-'}`);
    doc.text(`Pisos: ${inmueble?.n_pisos ?? '-'}`);
    doc.text(`m² construcción: ${inmueble?.m2_construccion ?? '-'}`);
    doc.text(`m² afectados: ${inmueble?.m2_afectado ?? '-'}`);
    doc.text(`Daños vivienda: ${inmueble?.danos_vivienda || '-'}`);
    doc.text(`Daños anexos: ${inmueble?.danos_anexos || '-'}`);
    if (inmueble?.dueno || inmueble?.propietario) {
      const propietario = inmueble.dueno || inmueble.propietario;
      doc.text(`Propietario: ${propietario?.nombreCompleto || '-'}`);
      doc.text(`RUN: ${propietario?.run || '-'}`);
      doc.text(`Teléfono: ${propietario?.telefono || '-'}`);
    }
    if (Array.isArray(inmueble?.habitantes) && inmueble.habitantes.length > 0) {
      doc.text('Habitantes:');
      inmueble.habitantes.forEach((habitante) => {
        doc.text(`  • ${habitante?.nombreCompleto || '-'}`);
      });
    }
    doc.moveDown(0.4);
  });
}

function appendVehiculos(doc, vehiculos = []) {
  writeSectionTitle(doc, 'Vehículos Involucrados');
  if (!Array.isArray(vehiculos) || vehiculos.length === 0) {
    doc.text('No se registran vehículos asociados.');
    return;
  }
  vehiculos.forEach((vehiculo, index) => {
    doc.font('Helvetica-Bold').text(`Vehículo ${index + 1}`);
    doc.font('Helvetica').text(`Patente: ${vehiculo?.patente || '-'}`);
    doc.text(`Descripción: ${[vehiculo?.marca, vehiculo?.modelo, vehiculo?.anio].filter(Boolean).join(' ') || '-'}`);
    doc.text(`Color: ${vehiculo?.color || '-'}`);
    doc.text(`Daños: ${vehiculo?.danos_vehiculo || '-'}`);
    if (vehiculo?.dueno) {
      doc.text(`Dueño: ${vehiculo.dueno.nombreCompleto || '-'}`);
    }
    if (vehiculo?.chofer) {
      doc.text(`Chofer: ${vehiculo.chofer.nombreCompleto || '-'}`);
    }
    if (Array.isArray(vehiculo?.pasajeros) && vehiculo.pasajeros.length > 0) {
      doc.text('Pasajeros:');
      vehiculo.pasajeros.forEach((pasajero) => {
        const descriptor = pasajero?.vinculo?.nombre ? ` (${pasajero.vinculo.nombre})` : '';
        doc.text(`  • ${pasajero?.nombreCompleto || '-'}${descriptor}`);
      });
    }
    doc.moveDown(0.4);
  });
}

function appendMaterialMayor(doc, materialMayor = []) {
  writeSectionTitle(doc, 'Material Mayor');
  if (!Array.isArray(materialMayor) || materialMayor.length === 0) {
    doc.text('No se registran recursos movilizados.');
    return;
  }
  materialMayor.forEach((material, index) => {
    doc.font('Helvetica-Bold').text(`Recurso ${index + 1}`);
    doc.font('Helvetica').text(`Unidad: ${material?.unidad?.patente || '-'}`);
    doc.text(`Conductor: ${material?.conductor?.nombreCompleto || '-'}`);
    doc.text(`Voluntarios: ${material?.voluntarios ?? '-'}`);
    doc.text(`KM salida: ${material?.kmSalida ?? '-'}`);
    doc.text(`KM llegada: ${material?.kmLlegada ?? '-'}`);
    doc.moveDown(0.3);
  });
}

function appendAccidentados(doc, accidentados = []) {
  writeSectionTitle(doc, 'Bomberos Accidentados');
  if (!Array.isArray(accidentados) || accidentados.length === 0) {
    doc.text('No se reportan bomberos accidentados.');
    return;
  }
  accidentados.forEach((accidentado, index) => {
    doc.font('Helvetica-Bold').text(`Bombero ${index + 1}`);
    doc.font('Helvetica').text(`Nombre: ${accidentado?.bombero?.nombreCompleto || '-'}`);
    doc.text(`Compañía: ${accidentado?.compania?.nombre || '-'}`);
    doc.text(`Lesiones: ${accidentado?.lesiones || '-'}`);
    doc.text(`Constancia: ${accidentado?.constancia || '-'}`);
    doc.text(`Comisaría: ${accidentado?.comisaria || '-'}`);
    doc.text(`Acciones: ${accidentado?.acciones || '-'}`);
    doc.moveDown(0.3);
  });
}

function appendOtrosServicios(doc, servicios = []) {
  writeSectionTitle(doc, 'Otros Servicios en el Lugar');
  if (!Array.isArray(servicios) || servicios.length === 0) {
    doc.text('No se registran apoyos externos.');
    return;
  }
  servicios.forEach((servicio, index) => {
    doc.font('Helvetica-Bold').text(`Servicio ${index + 1}`);
    doc.font('Helvetica').text(`Nombre: ${servicio?.servicio?.nombre || '-'}`);
    doc.text(`Tipo de unidad: ${servicio?.tipoUnidad || '-'}`);
    doc.text(`Responsable: ${servicio?.responsable || '-'}`);
    doc.text(`Personal: ${servicio?.personal ?? '-'}`);
    doc.text(`Observaciones: ${servicio?.observaciones || '-'}`);
    doc.moveDown(0.3);
  });
}

function appendAsistencia(doc, asistencia) {
  writeSectionTitle(doc, 'Asistencia de Personal');
  const enLugar = Array.isArray(asistencia?.lugar)
    ? asistencia.lugar.map((b) => b?.nombreCompleto || `Bombero #${b?.id ?? '-'}`).join(', ')
    : '';
  const enCuartel = Array.isArray(asistencia?.cuartel)
    ? asistencia.cuartel.map((b) => b?.nombreCompleto || `Bombero #${b?.id ?? '-'}`).join(', ')
    : '';
  writeKeyValue(doc, 'En el lugar', enLugar || '-');
  writeKeyValue(doc, 'En cuartel', enCuartel || '-');
}

async function buildPdfBuffer(parte, logos, options = {}) {
  const { pageSize = 'A4' } = options;
  const doc = new PDFDocument({
    size: pageSize === 'letter' ? 'letter' : 'A4',
    margin: 42,
    bufferPages: true,
  });

  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const buildPromise = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  drawHeader(doc, logos, parte);
  doc.moveDown();

  appendAntecedentesGenerales(doc, parte);
  doc.moveDown(SECTION_SPACING / 12);
  appendTimeline(doc, parte);
  doc.moveDown(SECTION_SPACING / 12);

  appendClasificacion(doc, parte);
  doc.moveDown(SECTION_SPACING / 12);

  appendDescripcion(doc, parte);
  doc.moveDown(SECTION_SPACING / 12);

  appendInmuebles(doc, parte.inmuebles);
  doc.moveDown(SECTION_SPACING / 12);

  appendVehiculos(doc, parte.vehiculos);
  doc.moveDown(SECTION_SPACING / 12);

  appendMaterialMayor(doc, parte.materialMayor);
  doc.moveDown(SECTION_SPACING / 12);

  appendAccidentados(doc, parte.accidentados);
  doc.moveDown(SECTION_SPACING / 12);

  appendOtrosServicios(doc, parte.otrosServicios);
  doc.moveDown(SECTION_SPACING / 12);

  appendAsistencia(doc, parte.asistencia);

  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(12).text('Observaciones finales', { underline: true });
  doc.moveDown(0.4);
  doc.font('Helvetica').fontSize(10).text([
    `Reporte generado automáticamente el ${formatDate(new Date(), true)}.`,
    'Este documento se almacena temporalmente en el bucket de documentos (MinIO) durante 30 minutos.',
    'Para cualquier actualización del parte, genere un nuevo documento para garantizar que la información esté sincronizada.',
  ].join('\n'));

  doc.end();

  return buildPromise;
}

export async function generarPdfParteEmergencia(idIncidente, options = {}) {
  const expiresIn = Number.isInteger(options.expiresIn) ? options.expiresIn : DEFAULT_EXPIRY_SECONDS;
  const pageSize = options.pageSize || 'A4';

  const parte = await obtenerParteDetalladoPorIdService(idIncidente);
  if (!parte) {
    const error = new Error('Parte de emergencia no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const companiaId = parte?.compania?.id || parte?.companiaId;
  let companiaLogoKey = null;
  if (companiaId) {
    try {
      const companiaRepo = AppDataSource.getRepository('Compania');
      const compania = await companiaRepo.findOne({
        where: { id: companiaId },
        select: ['id', 'logoKEY', 'nombre'],
      });
      companiaLogoKey = compania?.logoKEY ?? null;
    } catch (error) {
      logger.warn(`[PDF] No se pudo obtener compañía ${companiaId}: ${error.message}`);
    }
  }

  const [cuerpoLogo, companiaLogo] = await Promise.all([
    fetchLogoBuffer(BUCKETS.COMPANIES, CUERPO_LOGO_KEY, 'cuerpo'),
    fetchLogoBuffer(BUCKETS.COMPANIES, companiaLogoKey, 'compañía'),
  ]);

  const logos = {
    cuerpoLogo: cuerpoLogo || companiaLogo || null,
    companiaLogo: companiaLogo || cuerpoLogo || null,
  };

  const pdfBuffer = await buildPdfBuffer(parte, logos, { pageSize });

  const baseName = `parte_${idIncidente}.pdf`;
  const uniqueFileName = generateUniqueFileName(baseName, `parte_${idIncidente}`);
  const objectName = `reportes/parte-emergencia/${idIncidente}/${uniqueFileName}`;

  await uploadFile(BUCKETS.DOCUMENTS, objectName, pdfBuffer, 'application/pdf', {
    'parte-id': String(idIncidente),
    'generated-at': new Date().toISOString(),
    'page-size': pageSize,
  });

  const signedUrl = await getSignedUrl(BUCKETS.DOCUMENTS, objectName, expiresIn);

  return {
    bucket: BUCKETS.DOCUMENTS,
    fileName: objectName,
    url: signedUrl,
    expiresIn,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}

export default generarPdfParteEmergencia;

