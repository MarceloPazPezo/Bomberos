
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidentesRevision, cambiarEstadoIncidente } from '@services/incidentes.service.js';
import { Eye, Filter, CheckCircle2, Send, Edit3, FileText } from 'lucide-react';
import Card from '@components/Card.jsx';

// Estilos coherentes con PartesDeEmergencias.jsx
const CONTAINER_STYLE_BY_ESTADO = {
  ENVIADO: 'border-blue-300 bg-blue-50',
  APROBADO: 'border-green-300 bg-green-50',
  CORREGIR: 'border-red-300 bg-red-50',
};
const HEADER_STYLE_BY_ESTADO = {
  ENVIADO: 'bg-blue-600 text-white',
  APROBADO: 'bg-green-600 text-white',
  CORREGIR: 'bg-red-600 text-white',
};
const ICON_BY_ESTADO = {
  ENVIADO: <Send className="h-4 w-4" />,
  APROBADO: <CheckCircle2 className="h-4 w-4" />,
  CORREGIR: <Edit3 className="h-4 w-4" />,
};

function TablaRevision({ rows, onOpen, onChangeEstado }) {
  const trim = (t, n) => (t && t.length > n ? `${t.slice(0, n)}…` : t || '');
  return (
    <div className={`overflow-auto rounded-md border border-gray-200 bg-white`}>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-2 text-left">Fecha</th>
            <th className="px-3 py-2 text-left">Estado</th>
            <th className="px-3 py-2 text-left">Clave radial</th>
            <th className="px-3 py-2 text-left">Descripción</th>
            <th className="px-3 py-2 text-left">Tipo</th>
            <th className="px-3 py-2 text-left">Compañía</th>
            <th className="px-3 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td className="px-3 py-3 text-gray-500 italic" colSpan={7}>
                Sin registros
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-3 py-2">{r.fecha}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs border ${
                  r.estado === 'APROBADO' ? 'bg-green-50 text-green-700 border-green-200' :
                  r.estado === 'ENVIADO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  r.estado === 'CORREGIR' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  {ICON_BY_ESTADO[r.estado] || <FileText className="h-4 w-4" />}
                  {r.estado}
                </span>
              </td>
              <td className="px-3 py-2">{r.detalle?.claveRadial || ''}</td>
              <td className="px-3 py-2" title={r.detalle?.descripcionPreliminar || r.titulo}>
                {trim(r.detalle?.descripcionPreliminar || r.titulo, 50)}
              </td>
              <td className="px-3 py-2">{r.tipo}</td>
              <td className="px-3 py-2">{r.compania}</td>
              <td className="px-3 py-2">
                <button
                  className="inline-flex items-center gap-1 text-xs rounded border border-gray-300 px-2 py-1 hover:bg-gray-50"
                  onClick={() => onOpen(r)}
                >
                  <Eye className="h-3.5 w-3.5" /> Ver
                </button>
                {r.estado === 'ENVIADO' && (
                  <button
                    className="ml-2 inline-flex items-center gap-1 text-xs rounded border border-indigo-300 px-2 py-1 hover:bg-indigo-50 text-indigo-700"
                    onClick={() => onChangeEstado(r)}
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Cambiar estado
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RevisionPartes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [filtros, setFiltros] = useState({ ENVIADO: true, APROBADO: true, CORREGIR: true });
  const [modal, setModal] = useState({ open: false, incidente: null });

  const estadosSeleccionados = useMemo(
    () => Object.entries(filtros).filter(([, v]) => v).map(([k]) => k),
    [filtros]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getIncidentesRevision(estadosSeleccionados);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [estadosSeleccionados]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onOpen = (r) => navigate(`/vistaparterev/${r.id}`);
  const onChangeEstado = (r) => setModal({ open: true, incidente: r });

  const confirmChange = async (nuevoEstado) => {
    if (!modal.incidente) return;
    try {
      // TODO: reemplazar idBombero por el usuario autenticado cuando esté disponible
      await cambiarEstadoIncidente(modal.incidente.id, { estado: nuevoEstado, idBombero: 1 });
      setModal({ open: false, incidente: null });
      await fetchData();
    } catch (e) {
      alert(e?.message || 'No se pudo cambiar el estado');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card title="Revisión de Partes" titleIcon={<Filter className="h-5 w-5 text-gray-700" />}>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm text-gray-700">
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                className="accent-blue-600"
                checked={filtros.ENVIADO}
                onChange={(e) => setFiltros((f) => ({ ...f, ENVIADO: e.target.checked }))}
              />
              ENVIADO
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                className="accent-green-600"
                checked={filtros.APROBADO}
                onChange={(e) => setFiltros((f) => ({ ...f, APROBADO: e.target.checked }))}
              />
              APROBADO
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                className="accent-red-600"
                checked={filtros.CORREGIR}
                onChange={(e) => setFiltros((f) => ({ ...f, CORREGIR: e.target.checked }))}
              />
              CORREGIR
            </label>
          </div>
          <button
            onClick={fetchData}
            className="text-sm rounded border border-gray-300 px-2 py-1 hover:bg-gray-50"
          >
            Actualizar
          </button>
        </div>
      </Card>

      <Card title={`Resultados (${rows.length})`}>
        {loading ? (
          <div className="text-sm text-gray-500">Cargando…</div>
        ) : (
          <TablaRevision rows={rows} onOpen={onOpen} onChangeEstado={onChangeEstado} />
        )}
      </Card>

      {modal.open && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-80">
            <div className="text-sm font-medium mb-2">Cambiar estado del incidente #{modal.incidente?.id}</div>
            <div className="space-y-2">
              <button
                className="w-full inline-flex items-center justify-center gap-2 rounded border border-green-200 bg-green-50 text-green-700 px-3 py-2 hover:bg-green-100"
                onClick={() => confirmChange('APROBADO')}
              >
                <CheckCircle2 className="h-4 w-4" /> Aprobar
              </button>
              <button
                className="w-full inline-flex items-center justify-center gap-2 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 hover:bg-red-100"
                onClick={() => confirmChange('CORREGIR')}
              >
                <Edit3 className="h-4 w-4" /> Corregir
              </button>
            </div>
            <div className="mt-3 text-right">
              <button className="text-xs text-gray-700 hover:text-gray-900" onClick={() => setModal({ open: false, incidente: null })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
