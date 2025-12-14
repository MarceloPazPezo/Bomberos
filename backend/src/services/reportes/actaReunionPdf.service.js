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
import { obtenerEventoPorIdService, obtenerAsistenciaEventoService, obtenerTiposEventoService, obtenerNumeroEventoEnAnioService } from '../evento.service.js';
import { obtenerActaEventoService, obtenerListaAsistenciaDetalladaService } from '../actaEvento.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOGO_BOMBEROS_PATH = join(__dirname, '../../templates/logoBomberos');

const DEFAULT_EXPIRY_SECONDS = 30 * 60; // 30 minutos

const MARGINS = { top: 40, bottom: 40, left: 40, right: 40 };
const FONTS = {
    title: { family: 'Helvetica-Bold', size: 16 },
    subtitle: { family: 'Helvetica-Bold', size: 11 },
    normal: { family: 'Helvetica', size: 9 },
    small: { family: 'Helvetica', size: 8 },
};

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
            const compania = await companiaRepo.findOne({ where: { id: companiaId }, select: ['id', 'logoKEY'] });
            if (compania?.logoKEY) {
                try {
                    companiaLogoBuffer = await downloadFile(BUCKETS.COMPANIAS, compania.logoKEY);
                } catch (e) {
                    logger.warn(`[PDF] No se pudo obtener logo de compañía: ${e.message}`);
                }
            }
        } catch (error) {
            logger.warn(`[PDF] Error obteniendo logo de compañía ${companiaId}: ${error.message}`);
        }
    }
    return { bomberosLogoBuffer, companiaLogoBuffer };
}

function drawHeader(doc, logos, titulo = 'Acta de Reunión') {
    const { bomberosLogoBuffer, companiaLogoBuffer } = logos;
    const pageWidth = doc.page.width;
    const logoSize = 60;
    const logoY = MARGINS.top;

    const drawLogo = (buffer, x, y) => {
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
            logger.warn(`[PDF] Error dibujando logo: ${error.message}`);
            return 0;
        }
    };

    const leftLogoHeight = drawLogo(bomberosLogoBuffer, MARGINS.left, logoY);
    const rightLogoHeight = drawLogo(companiaLogoBuffer, pageWidth - MARGINS.right - logoSize, logoY);

    doc.font(FONTS.title.family).fontSize(FONTS.title.size).text(titulo, MARGINS.left, logoY + 70, {
        width: pageWidth - MARGINS.left - MARGINS.right,
        align: 'center',
    });

    const maxLogoHeight = Math.max(leftLogoHeight, rightLogoHeight, logoSize);
    doc.y = logoY + maxLogoHeight + 40;
}

function formatDate(value) {
    if (!value) return '';
    try {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
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
        const labelWidth = width * 0.35;
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

function drawTemas(doc, x, y, width, temas) {
    let currentY = y;
    doc.font(FONTS.subtitle.family).fontSize(FONTS.subtitle.size);
    doc.text('Puntos Tratados', x, currentY);
    currentY += 15;
    doc.font(FONTS.normal.family).fontSize(FONTS.normal.size);
    if (!temas || temas.length === 0) {
        doc.text('— Sin temas registrados —', x, currentY);
        return currentY + 18;
    }
    temas.forEach((t, idx) => {
        const text = `${idx + 1}. ${t}`;
        const h = doc.heightOfString(text, { width });
        doc.text(text, x, currentY, { width });
        currentY += Math.max(18, h + 6);
    });
    return currentY;
}

function drawAsistencia(doc, x, y, width, lista) {
    let currentY = y;
    doc.font(FONTS.subtitle.family).fontSize(FONTS.subtitle.size);
    doc.text('Registro de Asistencia', x, currentY);
    currentY += 15;

    const headers = ['RUN', 'Nombre', 'Asistió'];
    const cellHeight = 18;
    const numCols = headers.length;
    const colWidth = width / numCols;

    headers.forEach((header, i) => {
        doc.rect(x + (i * colWidth), currentY, colWidth, cellHeight).stroke();
        doc.font(FONTS.normal.family).fontSize(FONTS.normal.size);
        doc.text(header, x + (i * colWidth) + 3, currentY + 5, { width: colWidth - 6, lineBreak: false });
    });
    currentY += cellHeight;

    lista.forEach((row) => {
        const cells = [formatRun(row.run) || '', row.nombreCompleto || '', row.asistio ? 'Sí' : 'No'];
        cells.forEach((cell, i) => {
            doc.rect(x + (i * colWidth), currentY, colWidth, cellHeight).stroke();
            doc.font(FONTS.normal.family).fontSize(FONTS.normal.size);
            doc.text(cell, x + (i * colWidth) + 3, currentY + 5, { width: colWidth - 6, lineBreak: false });
        });
        currentY += cellHeight;
        if (currentY > doc.page.height - MARGINS.bottom - 40) {
            doc.addPage({ margins: MARGINS });
            currentY = MARGINS.top;
        }
    });
    return currentY;
}

export async function generarActaReunionPdfService(idEvento, options = {}) {
    try {
        logger.info(`[PDF] Generando Acta de Reunión para evento ${idEvento}`);

        const expirySeconds = typeof options === 'number'
            ? options
            : (options?.expiresIn ? Number(options.expiresIn) : DEFAULT_EXPIRY_SECONDS);

        const validExpiry = Number.isInteger(expirySeconds) && expirySeconds > 0 ? expirySeconds : DEFAULT_EXPIRY_SECONDS;

        const evento = await obtenerEventoPorIdService(idEvento);
        if (!evento) throw new Error(`No se encontró el evento con ID ${idEvento}`);

        const companiaId = null; // sin relación directa; podría inferirse del creador
        const logos = await getLogos(companiaId);

        const acta = await obtenerActaEventoService(idEvento);

        // Obtener número de acta
        const infoNumero = await obtenerNumeroEventoEnAnioService(idEvento);
        const numeroActa = infoNumero ? `N° ${infoNumero.numero}/${infoNumero.anio}` : '';

        // Obtener nombre del tipo de evento
        let tipoNombre = '';
        if (evento.idTipoEvento) {
            try {
                const tipos = await obtenerTiposEventoService();
                const tipo = tipos.find(t => t.id === evento.idTipoEvento);
                tipoNombre = tipo?.nombre || '';
            } catch {
                tipoNombre = '';
            }
        }

        // Construir dirección completa
        let direccionCompleta = '';
        if (evento.direccion) {
            const partes = [];
            if (evento.direccion.calle) partes.push(evento.direccion.calle);
            if (evento.direccion.numero) partes.push(`N° ${evento.direccion.numero}`);
            if (evento.direccion.comuna?.nombre) partes.push(evento.direccion.comuna.nombre);
            if (evento.direccion.comuna?.region?.nombre) partes.push(evento.direccion.comuna.region.nombre);
            direccionCompleta = partes.join(', ');
        }

        const doc = new PDFDocument({ margins: MARGINS, size: 'LETTER', bufferPages: true });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));

        const pageWidth = doc.page.width - MARGINS.left - MARGINS.right;

        const tituloCompleto = numeroActa ? `Acta de Reunión ${numeroActa}` : 'Acta de Reunión';
        drawHeader(doc, logos, tituloCompleto);

        let currentY = doc.y + 10;

        // Datos del evento
        const datosEvento = [
            ['Nombre:', evento.nombre],
            ['Tipo:', tipoNombre],
            ['Inicio:', formatDate(evento.fechaHoraInicio)],
            ['Fin:', formatDate(evento.fechaHoraFin)],
        ];
        if (direccionCompleta) {
            datosEvento.push(['Dirección:', direccionCompleta]);
        }
        currentY = drawSimpleTable(doc, MARGINS.left, currentY, pageWidth, datosEvento, 'Datos del Evento') + 20;

        // Descripción del acta
        const descripcionActa = options?.descripcionActa ?? acta?.descripcionActa ?? evento.descripcion ?? '';
        if (descripcionActa && descripcionActa.trim().length > 0) {
            doc.font(FONTS.subtitle.family).fontSize(FONTS.subtitle.size);
            doc.text('Descripción/Resumen', MARGINS.left, currentY);
            currentY += 15;
            doc.font(FONTS.normal.family).fontSize(FONTS.normal.size);
            const h = doc.heightOfString(descripcionActa, { width: pageWidth });
            doc.text(descripcionActa, MARGINS.left, currentY, { width: pageWidth });
            currentY += Math.max(18, h + 6) + 10;
        }

        // Temas tratados
        const temas = Array.isArray(options?.temas) ? options?.temas : (acta?.temas || []);
        currentY = drawTemas(doc, MARGINS.left, currentY, pageWidth, temas) + 20;

        // Asistencia detallada
        const lista = await obtenerListaAsistenciaDetalladaService(idEvento);
        currentY = drawAsistencia(doc, MARGINS.left, currentY, pageWidth, lista) + 20;

        // Footer
        doc.font(FONTS.small.family).fontSize(FONTS.small.size);
        doc.text(
            `Documento generado el ${formatDate(new Date())}`,
            MARGINS.left,
            doc.page.height - MARGINS.bottom - 15,
            { width: pageWidth, align: 'center' }
        );

        doc.end();

        const pdfBuffer = await new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        const fileName = generateUniqueFileName(`acta_evento_${idEvento}`, 'pdf');
        await uploadFile(BUCKETS.DOCUMENTOS, fileName, pdfBuffer, 'application/pdf');
        scheduleFileDeletion(BUCKETS.DOCUMENTOS, fileName, validExpiry);

        const url = await getSignedUrl(BUCKETS.DOCUMENTOS, fileName, validExpiry);
        return {
            success: true,
            url,
            fileName,
            expiresIn: validExpiry,
            numero: infoNumero?.numero,
            anio: infoNumero?.anio,
        };
    } catch (error) {
        logger.error(`[PDF] Error generando Acta de Reunión para evento ${idEvento}: ${error.message}`);
        throw error;
    }
}
