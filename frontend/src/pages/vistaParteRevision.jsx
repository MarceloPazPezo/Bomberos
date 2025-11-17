import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '@context/AuthContext.jsx';
import { obtenerUltimoEstadoIncidente } from '@services/parteEmergencia.service.js';
import { cambiarEstadoIncidente } from '@services/incidentes.service.js';
import VistaParte from './vistaParte.jsx';
import { Button } from 'primereact/button';
import { useGlobalFireAlert } from '@components/FireAlertProvider.jsx';

// Esta vista envuelve a VistaParte y añade controles para cambiar estado cuando corresponda.
export default function VistaParteRevision() {
  const { id } = useParams();
  const { bombero } = useContext(AuthContext);
  const [estadoActual, setEstadoActual] = useState('');
  const [working, setWorking] = useState(false);
  const fireAlert = useGlobalFireAlert();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await obtenerUltimoEstadoIncidente(id);
        const data = resp?.data ?? resp;
        if (mounted) setEstadoActual((data?.estado || '').toString().toUpperCase());
      } catch {
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
      fireAlert.fireSuccess('Estado actualizado', `Estado cambiado a ${nuevoEstado}`);
      // refrescar estado
      try {
        const resp = await obtenerUltimoEstadoIncidente(id);
        const data = resp?.data ?? resp;
        setEstadoActual((data?.estado || '').toString().toUpperCase());
      } catch (e) {
        // No es crítico si falla el refresco del estado
        console.warn('No se pudo refrescar el estado del incidente:', e);
      }
    } catch (e) {
      fireAlert.fireError('Error', e?.message || 'No se pudo cambiar el estado');
    } finally {
      setWorking(false);
    }
  };

  const abrirPopupRevision = () => {
    fireAlert.fireInfo(
      `Revisar incidente #${id}`,
      'Selecciona la acción que deseas aplicar a este parte de emergencia.',
      {
        showCancel: true,
        confirmText: 'Aprobar',
        cancelText: 'Corregir',
        // Botón rojo para Corregir
        cancelClassName:
          'flex-1 px-4 py-3 border-2 border-red-300 text-red-700 bg-red-50 rounded-lg font-semibold hover:bg-red-100 hover:border-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        onConfirm: () => doChange('APROBADO'),
        onCancel: () => doChange('CORREGIR')
      }
    );
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
            onClick={abrirPopupRevision}
            disabled={working}
          />
        </div>
      )}
    </>
  );
}
