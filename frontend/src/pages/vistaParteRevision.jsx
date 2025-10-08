import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '@context/AuthContext.jsx';
import { obtenerUltimoEstadoIncidente } from '@services/parteEmergencia.service.js';
import { cambiarEstadoIncidente } from '@services/incidentes.service.js';
import { toast } from 'react-toastify';
import VistaParte from './vistaParte.jsx';

// Esta vista envuelve a VistaParte y añade controles para cambiar estado cuando corresponda.
export default function VistaParteRevision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bombero } = useContext(AuthContext);
  const [estadoActual, setEstadoActual] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await obtenerUltimoEstadoIncidente(id);
        const data = resp?.data ?? resp;
        if (mounted) setEstadoActual((data?.estado || '').toString().toUpperCase());
      } catch (_) {
        if (mounted) setEstadoActual('');
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const doChange = async (nuevoEstado) => {
    try {
      setWorking(true);
      const idBombero = Number(bombero?.id) || Number(JSON.parse(localStorage.getItem('bombero') || '{}')?.id) || null;
      await cambiarEstadoIncidente(Number(id), { estado: nuevoEstado, idBombero });
      toast.success(`Estado cambiado a ${nuevoEstado}`);
      setModalOpen(false);
      // refrescar estado
      try {
        const resp = await obtenerUltimoEstadoIncidente(id);
        const data = resp?.data ?? resp;
        setEstadoActual((data?.estado || '').toString().toUpperCase());
      } catch {}
    } catch (e) {
      toast.error(e?.message || 'No se pudo cambiar el estado');
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <VistaParte />

      {estadoActual === 'ENVIADO' && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-indigo-300 bg-indigo-50 text-indigo-700 px-3 py-2 shadow hover:bg-indigo-100"
          >
            <Edit3 className="h-4 w-4" /> Revisar parte
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-80">
            <div className="text-sm font-medium mb-2">Revisar incidente #{id}</div>
            <div className="space-y-2">
              <button
                disabled={working}
                className="w-full inline-flex items-center justify-center gap-2 rounded border border-green-200 bg-green-50 text-green-700 px-3 py-2 hover:bg-green-100 disabled:opacity-60"
                onClick={() => doChange('APROBADO')}
              >
                <CheckCircle2 className="h-4 w-4" /> Aprobar
              </button>
              <button
                disabled={working}
                className="w-full inline-flex items-center justify-center gap-2 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 hover:bg-red-100 disabled:opacity-60"
                onClick={() => doChange('CORREGIR')}
              >
                <Edit3 className="h-4 w-4" /> Corregir
              </button>
            </div>
            <div className="mt-3 text-right">
              <button className="text-xs text-gray-700 hover:text-gray-900" onClick={() => setModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
