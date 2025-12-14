import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingPage from "@components/LoadingPage";
import PdfViewer from "@components/PdfViewer";
import { generarFichaBomberoPdf } from "@services/bombero.service.js";

export default function VistaFichaBomberoPdf() {
  const { id } = useParams();
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchPdf = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await generarFichaBomberoPdf(id);
      const data = response?.data ?? response;
      if (!data?.url) {
        throw new Error("Respuesta incompleta del backend");
      }
      setPdfData(data);
    } catch (err) {
      const message = err?.message || err?.status || "No se pudo generar la ficha del bombero";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRegenerate = () => {
    setRegenerating(true);
    fetchPdf();
  };

  if (loading) {
    return <LoadingPage message="Generando ficha del bombero..." />;
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
      title="Ficha del Bombero"
      pdfUrl={pdfData?.url}
      expiresAt={pdfData?.expiresAt}
      onRegenerate={handleRegenerate}
      regenerating={regenerating}
      backLabel="Volver"
      metadata={`Bombero #${id}`}
      downloadFileName={`${pdfData?.rut || id}-ficha-bombero.pdf`}
      error={error}
    />
  );
}
