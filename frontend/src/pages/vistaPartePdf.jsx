import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingPage from "@components/LoadingPage";
import PdfViewer from "@components/PdfViewer";
import { generarReporteParteEmergenciaPdf } from "@services/parteEmergencia.service.js";

const DEFAULT_PAGE_SIZE = "A4";

export default function VistaPartePdf() {
  const { id } = useParams();
  const location = useLocation();
  const initialPdf = location.state?.pdf ?? null;

  const [pdfData, setPdfData] = useState(initialPdf);
  const [loading, setLoading] = useState(!initialPdf);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchPdf = async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await generarReporteParteEmergenciaPdf(id, {
        pageSize: options.pageSize || pdfData?.pageSize || DEFAULT_PAGE_SIZE,
        expiresIn: options.expiresIn,
      });
      const data = response?.data ?? response;
      if (!data?.url) {
        throw new Error("Respuesta incompleta del backend");
      }
      setPdfData({
        ...data,
        pageSize: options.pageSize || pdfData?.pageSize || DEFAULT_PAGE_SIZE,
      });
    } catch (err) {
      const message = err?.message || err?.status || "No se pudo generar el reporte PDF";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    fetchPdf({ pageSize: pdfData?.pageSize || DEFAULT_PAGE_SIZE });
  };

  useEffect(() => {
    if (!pdfData) {
      fetchPdf({ pageSize: DEFAULT_PAGE_SIZE });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <LoadingPage message="Generando reporte PDF..." />;
  }

  if (error && !pdfData?.url) {
    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-5 py-6 space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
        <button
          type="button"
          onClick={handleRegenerate}
          className="inline-flex items-center gap-2 rounded border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2 hover:bg-blue-100 disabled:opacity-60"
          disabled={regenerating}
        >
          {regenerating ? "Regenerando..." : "Intentar nuevamente"}
        </button>
      </div>
    );
  }

  return (
    <PdfViewer
      title="Parte de Emergencia"
      pdfUrl={pdfData?.url}
      expiresAt={pdfData?.expiresAt}
      onRegenerate={handleRegenerate}
      regenerating={regenerating}
      backLabel="Volver al parte"
      metadata={`Parte #${id} · Tamaño ${pdfData?.pageSize || DEFAULT_PAGE_SIZE}`}
      downloadFileName={`${id}-${new Date().getFullYear()}-parte.pdf`}
      error={error}
    />
  );
}
