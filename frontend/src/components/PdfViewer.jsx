import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

/**
 * Componente genérico para visualizar PDFs en un iframe
 * @param {Object} props
 * @param {string} props.title - Título del documento
 * @param {string} props.pdfUrl - URL del PDF a mostrar
 * @param {string} props.expiresAt - Fecha de expiración del enlace (ISO string)
 * @param {function} props.onRegenerate - Callback para regenerar el PDF
 * @param {boolean} props.regenerating - Estado de regeneración
 * @param {string} props.backLabel - Texto del botón volver
 * @param {string} props.metadata - Información adicional a mostrar
 * @param {string} props.error - Mensaje de error si existe
 * @param {string} props.downloadFileName - Nombre del archivo para descargar (ej: "ficha-bombero.pdf")
 */
export default function PdfViewer({
  title = "Documento PDF",
  pdfUrl,
  expiresAt,
  onRegenerate,
  regenerating = false,
  backLabel = "Volver",
  metadata,
  error,
  downloadFileName,
}) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!pdfUrl) return;

    try {
      setDownloading(true);
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName || "documento.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  const expiresText = useMemo(() => {
    if (!expiresAt) return null;
    try {
      const expiresDate = new Date(expiresAt);
      if (Number.isNaN(expiresDate.getTime())) return null;
      return expiresDate.toLocaleString("es-CL");
    } catch {
      return null;
    }
  }, [expiresAt]);

  return (
    <div className="flex flex-col flex-1 px-3 sm:px-5 lg:px-6 py-5 gap-4 min-h-[calc(100vh-96px)]">
      {/* Header con controles */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 text-sm font-medium transition"
          >
            {backLabel}
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{title}</span>
            {metadata && <span className="text-xs text-gray-500">{metadata}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 justify-end">
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 text-sm font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={regenerating}
            >
              {regenerating ? "Regenerando..." : "Regenerar PDF"}
            </button>
          )}
          {pdfUrl && downloadFileName && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium transition disabled:bg-green-300 disabled:cursor-not-allowed"
              disabled={downloading}
            >
              {downloading ? "Descargando..." : "Descargar PDF"}
            </button>
          )}
          <button
            type="button"
            onClick={() => pdfUrl && window.open(pdfUrl, "_blank", "noopener")}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={!pdfUrl}
          >
            Abrir en nueva pestaña
          </button>
        </div>
      </div>

      {/* Advertencia de expiración */}
      {expiresText && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-md text-sm">
          Este enlace expira aproximadamente a las {expiresText}.{" "}
          {onRegenerate && 'Si necesitas un enlace nuevo, usa "Regenerar PDF".'}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Visor de PDF */}
      <div className="relative flex-1 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50">
        {pdfUrl ? (
          <iframe
            title={title}
            src={pdfUrl}
            className="absolute inset-0 w-full h-full"
            style={{ minHeight: "100%" }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            No se pudo cargar el PDF.
          </div>
        )}
      </div>
    </div>
  );
}

PdfViewer.propTypes = {
  title: PropTypes.string,
  pdfUrl: PropTypes.string,
  expiresAt: PropTypes.string,
  onRegenerate: PropTypes.func,
  regenerating: PropTypes.bool,
  backLabel: PropTypes.string,
  metadata: PropTypes.string,
  error: PropTypes.string,
  downloadFileName: PropTypes.string,
};
