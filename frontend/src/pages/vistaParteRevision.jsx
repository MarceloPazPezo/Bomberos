import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '@context/AuthContext.jsx';
import { obtenerUltimoEstadoIncidente } from '@services/parteEmergencia.service.js';
import { cambiarEstadoIncidente } from '@services/incidentes.service.js';
import { toast } from 'react-toastify';
import VistaParte from './vistaParte.jsx';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

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
  <VistaParte showEnviarButton={false} />

      {estadoActual === 'ENVIADO' && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            label="Revisar parte"
            icon="pi pi-pencil"
            severity="info"
            className="shadow-lg"
            onClick={() => setModalOpen(true)}
          />
        </div>
      )}

      <Dialog
        header={`Revisar incidente #${id}`}
        visible={modalOpen}
        style={{ width: '24rem' }}
        modal
        onHide={() => !working && setModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              text
              onClick={() => setModalOpen(false)}
              disabled={working}
            />
            <Button
              label="Corregir"
              icon="pi pi-pencil"
              severity="danger"
              onClick={() => doChange('CORREGIR')}
              loading={working}
              disabled={working}
            />
            <Button
              label="Aprobar"
              icon="pi pi-check"
              severity="success"
              onClick={() => doChange('APROBADO')}
              loading={working}
              disabled={working}
            />
          </div>
        }
      >
        <div className="text-sm text-gray-800">
          Selecciona la acción que deseas aplicar a este parte de emergencia.
        </div>
      </Dialog>
    </>
  );
}
