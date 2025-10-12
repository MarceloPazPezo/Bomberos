
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidentesRevision, cambiarEstadoIncidente } from '@services/incidentes.service.js';
import { CheckCircle2, Edit3 } from 'lucide-react';
import Card from '@components/Card.jsx';
// PrimeReact
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { MultiSelect } from 'primereact/multiselect';
import { FilterMatchMode } from 'primereact/api';

function TablaRevision({ rows, onOpen, onChangeEstado }) {
  const trim = (t, n) => (t && t.length > n ? `${t.slice(0, n)}…` : t || '');

  // Robust parsing para ordenar por fecha (intenta ISO y dd/MM/yyyy HH:mm)
  const parseDateToTs = useCallback((s) => {
    if (!s) return 0;
    const t = Date.parse(s);
    if (!Number.isNaN(t)) return t;
    const m = typeof s === 'string' && s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (m) {
      const [, d, mo, y, h = '0', mi = '0', se = '0'] = m;
      const yyyy = (y?.length === 2 ? `20${y}` : y) * 1;
      return new Date(yyyy, (mo * 1) - 1, d * 1, h * 1, mi * 1, se * 1).getTime();
    }
    return 0;
  }, []);

  // Normalizamos filas para DataTable (campos planos para filtrar/ordenar)
  const tableRows = useMemo(() => {
    const estadosPermitidos = new Set(['ENVIADO','CORREGIR','APROBADO']);
    return (rows || []).filter(r => estadosPermitidos.has(String(r?.estado || '').toUpperCase())).map(r => ({
      ...r,
      descripcion: r?.detalle?.descripcionPreliminar || r?.titulo || '',
      claveRadial: r?.detalle?.claveRadial ? String(r.detalle.claveRadial) : '',
      fechaSort: parseDateToTs(r?.fecha)
    }));
  }, [rows, parseDateToTs]);

  // Filtros controlados del DataTable
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    estado: { value: null, matchMode: FilterMatchMode.IN },
    claveRadial: { value: null, matchMode: FilterMatchMode.IN },
  });
  const globalValue = filters.global?.value || '';

  const estadosOptions = useMemo(() => {
    const set = new Set(tableRows.map(r => r.estado).filter(Boolean));
    return Array.from(set).map(v => ({ label: v, value: v }));
  }, [tableRows]);

  const clavesOptions = useMemo(() => {
    const set = new Set(tableRows.map(r => r.claveRadial).filter(v => v !== '' && v != null));
    return Array.from(set).map(v => ({ label: v, value: v }));
  }, [tableRows]);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          value={globalValue}
          onChange={(e) => setFilters((f) => ({ ...f, global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } }))}
          placeholder="Buscar en la tabla"
          className="p-inputtext-sm w-64 md:w-80"
        />
      </IconField>
    </div>
  );

  const estadoBody = (row) => {
    const e = String(row.estado || '').toUpperCase();
    const sev = e === 'APROBADO' ? 'success' : e === 'ENVIADO' ? 'info' : e === 'CORREGIR' ? 'danger' : null;
    return <Tag value={row.estado} severity={sev} />;
  };

  const descripcionBody = (row) => (
    <span title={row.descripcion}>{trim(row.descripcion, 60)}</span>
  );

  const accionesBody = (row) => (
    <div className="flex items-center gap-2">
      <Button size="small" label="Ver" icon="pi pi-eye" outlined onClick={() => onOpen(row)} />
      {row.estado === 'ENVIADO' && (
        <Button size="small" label="Cambiar estado" icon="pi pi-pencil" severity="info" outlined onClick={() => onChangeEstado(row)} />
      )}
    </div>
  );

  const estadoFilterElement = (options) => (
    <MultiSelect
      value={options.value}
      options={estadosOptions}
      onChange={(e) => options.filterCallback(e.value)}
      className="p-column-filter"
      placeholder="Estados"
      maxSelectedLabels={1}
      display="chip"
      showClear
    />
  );

  const claveFilterElement = (options) => (
    <MultiSelect
      value={options.value}
      options={clavesOptions}
      onChange={(e) => options.filterCallback(e.value)}
      className="p-column-filter"
      placeholder="Clave radial"
      maxSelectedLabels={1}
      display="chip"
      showClear
    />
  );

  return (
    <DataTable
      value={tableRows}
      dataKey="id"
      paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
      sortField="fechaSort" sortOrder={-1}
      filters={filters}
      onFilter={(e) => setFilters(e.filters)}
      filterDisplay="menu"
      globalFilterFields={["estado", "claveRadial", "tipo", "compania", "descripcion"]}
      emptyMessage="Sin registros"
      header={header}
      className="rounded-md border border-gray-200 bg-white"
    >
      <Column field="fechaSort" header="Fecha" sortable body={(row) => row.fecha} style={{ minWidth: '10rem' }} />
      <Column field="estado" header="Estado" sortable body={estadoBody} filter filterElement={estadoFilterElement} showFilterMatchModes={false} style={{ minWidth: '10rem' }} />
      <Column field="claveRadial" header="Clave radial" sortable filter body={(row) => row.claveRadial} filterElement={claveFilterElement} showFilterMatchModes={false} style={{ minWidth: '10rem' }} />
      <Column field="descripcion" header="Descripción" body={descripcionBody} style={{ minWidth: '16rem' }} />
      <Column field="tipo" header="Tipo" sortable style={{ minWidth: '8rem' }} />
      <Column field="compania" header="Compañía" sortable style={{ minWidth: '10rem' }} />
      <Column header="Acciones" body={accionesBody} exportable={false} style={{ minWidth: '14rem' }} />
    </DataTable>
  );
}

export default function RevisionPartes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState({ open: false, incidente: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Mostrar solo BORRADOR, CORREGIR y APROBADO
      const estadosPermitidos = ['ENVIADO', 'CORREGIR', 'APROBADO'];
      const data = await getIncidentesRevision(estadosPermitidos);
      const filtrados = (Array.isArray(data) ? data : []).filter(r => estadosPermitidos.includes(String(r?.estado || '').toUpperCase()));
      setRows(filtrados);
    } finally {
      setLoading(false);
    }
  }, []);

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
      {/* Card de filtros eliminada por solicitud; la DataTable provee búsqueda y filtros */}

      <Card title={`Revision de partes de emergencia (${rows.length})`}>
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
