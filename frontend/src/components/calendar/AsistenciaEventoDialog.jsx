import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { getBomberosPorCompania } from '@services/bombero.service.js';
import { useCompaniaConfig } from '@hooks/compania/useCompaniaConfig';
import { registrarAsistenciaEvento, obtenerAsistenciaEvento } from '@services/calendario.service.js';
import { toast } from 'react-toastify';

// Dialogo para registrar asistencia a un evento operativo
// Props:
// - visible: boolean
// - onHide: () => void
// - companiaId: number|string (requerido)
// - eventTitle?: string (mostrar contexto)
// - onSave?: (payload: { presentes: number[] }) => Promise<void> | void
export default function AsistenciaEventoDialog({ visible, onHide, companiaId, eventTitle, eventId, onSave }) {
  const { getConfigValue } = useCompaniaConfig();
  const [loading, setLoading] = useState(false);
  const [bomberos, setBomberos] = useState([]);
  const [query, setQuery] = useState('');
  const [presentes, setPresentes] = useState({}); // { [id]: true }
  const [saving, setSaving] = useState(false);

  // Fallback de compañía desde el contexto si no llega por props
  const effectiveCompaniaId = useMemo(() => {
    // Preferir prop, luego config
    const cfgId = getConfigValue('company_id', null);
    return companiaId ?? cfgId ?? null;
  }, [companiaId, getConfigValue]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!effectiveCompaniaId) return;
      setLoading(true);
      try {
        const list = await getBomberosPorCompania(effectiveCompaniaId);
        if (!mounted) return;
        const arr = Array.isArray(list) ? list : (list?.data || []);
        setBomberos(arr);
        // Si hay un eventId, precargar asistentes marcando presentes
        if (visible && eventId) {
          try {
            const resp = await obtenerAsistenciaEvento(eventId);
            const asistIds = Array.isArray(resp?.data) ? resp.data : (resp || []);
            const map = {};
            for (const id of asistIds) map[String(id)] = true;
            setPresentes(map);
          } catch {
            // si falla, dejamos vacíos los presentes
            setPresentes({});
          }
        } else {
          setPresentes({});
        }
      } catch {
        setBomberos([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [visible, effectiveCompaniaId, companiaId, eventId]);

  // Log simple cuando cambia visible (para confirmar render)
  useEffect(() => {
 
  }, [visible]);

  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    if (!q) return bomberos;
    return bomberos.filter((b) => {
      const name = b?.nombreCompleto || `${b?.nombres || ''} ${b?.apellidos || ''}`;
      return name.toLowerCase().includes(q) || String(b?.run || '').toLowerCase().includes(q);
    });
  }, [bomberos, query]);

  const toggle = (id, checked) => {
    setPresentes((prev) => ({ ...prev, [String(id)]: !!checked }));
  };

  const handleSave = async () => {
    const ids = Object.keys(presentes).filter((k) => presentes[k]).map((k) => Number(k));
    if (!eventId) {
      toast.error('No se puede registrar asistencia: falta el ID del evento');
      return;
    }
    if (ids.length === 0) {
      toast.warn('Selecciona al menos un voluntario');
      return;
    }
    try {
      setSaving(true);
      await registrarAsistenciaEvento(eventId, { idsBomberos: ids });
      toast.success('Asistencia registrada exitosamente');
      // Callback opcional para que el padre refresque si quiere
      await onSave?.({ presentes: ids });
      onHide?.();
    } catch (e) {
      console.error('Error registrando asistencia:', e);
      toast.error(e?.response?.data?.message || 'No se pudo registrar la asistencia');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header={eventTitle ? `Registrar asistencia — ${eventTitle}` : 'Registrar asistencia'}
      visible={visible}
      modal
      style={{ width: '36rem', maxWidth: '94vw' }}
      onHide={onHide}
      onShow={() => {}}
      footer={
        <div className="flex justify-end gap-2">
          <Button label="Cancelar" className="p-button-text" onClick={onHide} disabled={saving} />
          <Button label={saving ? 'Guardando…' : 'Guardar'} icon="pi pi-check" onClick={handleSave} disabled={saving || !effectiveCompaniaId || !eventId} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <i className="pi pi-search text-slate-500" />
          <InputText value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar voluntario por nombre o RUN" className="w-full" />
        </div>
        <div className="rounded-md border border-slate-200 bg-white max-h-[50vh] overflow-auto">
          {!effectiveCompaniaId ? (
            <div className="p-4 text-sm text-slate-500">No hay compañía disponible para cargar voluntarios.</div>
          ) : loading ? (
            <div className="p-4 text-sm text-slate-500 flex items-center gap-2"><i className="pi pi-spinner pi-spin" /> Cargando voluntarios…</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">No se encontraron voluntarios.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="px-3 py-2 text-left">Voluntario</th>
                  <th className="px-3 py-2 text-left">RUN</th>
                  <th className="px-3 py-2 text-left">Asistió</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const id = b?.id ?? b?.bomberoId ?? b?._id;
                  const name = b?.nombreCompleto || `${b?.nombres || ''} ${b?.apellidos || ''}`.trim();
                  const run = b?.run || b?.rut || '';
                  const checked = !!presentes[String(id)];
                  return (
                    <tr key={String(id)} className="border-t border-slate-100">
                      <td className="px-3 py-2">{name || `Bombero #${id}`}</td>
                      <td className="px-3 py-2">{run}</td>
                      <td className="px-3 py-2">
                        <InputSwitch checked={checked} onChange={(e) => toggle(id, e.value)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Dialog>
  );
}
