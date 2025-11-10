import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingPage from '@components/LoadingPage';
import { generarReporteParteEmergenciaPdf } from '@services/parteEmergencia.service.js';

const DEFAULT_PAGE_SIZE = 'A4';

export default function VistaPartePdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialPdf = location.state?.pdf ?? null;

  const [pdfData, setPdfData] = useState(initialPdf);
  const [loading, setLoading] = useState(!initialPdf);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const expiresText = useMemo(() => {
    if (!pdfData?.expiresAt) return null;
    try {
      const expiresDate = new Date(pdfData.expiresAt);
      if (Number.isNaN(expiresDate.getTime())) return null;
      return expiresDate.toLocaleString('es-CL');
    } catch {
      return null;
    }
  }, [pdfData?.expiresAt]);

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
        throw new Error('Respuesta incompleta del backend');
      }
      setPdfData({
        ...data,
        pageSize: options.pageSize || pdfData?.pageSize || DEFAULT_PAGE_SIZE,
      });
    } catch (err) {
      const message = err?.message || err?.status || 'No se pudo generar el reporte PDF';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[13px] text-gray-700 hover:text-gray-900"
          >
            Volver
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
        <button
          type="button"
          onClick={() => {
            setRegenerating(true);
            fetchPdf({ pageSize: DEFAULT_PAGE_SIZE });
          }}
          className="inline-flex items-center gap-2 rounded border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2 hover:bg-blue-100 disabled:opacity-60"
          disabled={regenerating}
        >
          {regenerating ? 'Regenerando...' : 'Intentar nuevamente'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-5 py-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[13px] text-gray-700 hover:text-gray-900"
          >
            Volver al parte
          </button>
          <span className="text-sm text-gray-500">
            Parte #{id} · Tamaño {pdfData?.pageSize || DEFAULT_PAGE_SIZE}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRegenerating(true);
              fetchPdf({ pageSize: pdfData?.pageSize || DEFAULT_PAGE_SIZE });
            }}
            className="inline-flex items-center gap-2 rounded border border-blue-200 bg-blue-50 text-blue-700 px-3 py-1.5 hover:bg-blue-100 disabled:opacity-60"
            disabled={regenerating}
          >
            {regenerating ? 'Regenerando...' : 'Regenerar PDF'}
          </button>
          <button
            type="button"
            onClick={() => pdfData?.url && window.open(pdfData.url, '_blank', 'noopener')}
            className="inline-flex items-center gap-2 rounded border border-gray-200 bg-white text-gray-700 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-60"
            disabled={!pdfData?.url}
          >
            Abrir en nueva pestaña
          </button>
        </div>
      </div>
      {expiresText && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-md text-sm">
          Este enlace expira aproximadamente a las {expiresText}. Si necesitas un enlace nuevo, usa
          “Regenerar PDF”.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="h-[75vh] border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-gray-50">
        {pdfData?.url ? (
          <iframe
            title={`Reporte parte ${id}`}
            src={pdfData.url}
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No se pudo cargar el PDF.
          </div>
        )}
      </div>
    </div>
  );
}

