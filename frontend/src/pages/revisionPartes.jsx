
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidentesRevision, cambiarEstadoIncidente } from '@services/incidentes.service.js';
import Card from '@components/Card.jsx';
import { useGlobalFireAlert } from '@components/FireAlertProvider.jsx';
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
          className="p-inputtext-sm text-xs w-48 md:w-64"
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
      <Button size="small" label="Detalle" icon="pi pi-eye" outlined onClick={() => onOpen(row)} />
      {row.estado === 'ENVIADO' && (
        <Button size="small" label="Revisar" icon="pi pi-pencil" severity="info" outlined onClick={() => onChangeEstado(row)} />
      )}
    </div>
  );

  const estadoFilterElement = (options) => (
    <MultiSelect
      value={options.value}
      options={estadosOptions}
      onChange={(e) => options.filterCallback(e.value)}
  className="p-column-filter p-inputtext-sm text-xs min-w-32"
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
  className="p-column-filter p-inputtext-sm text-xs min-w-32"
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
      className="rounded-md border border-gray-200 bg-white text-xs"
      rowClassName={() => 'text-xs'}
    >
      <Column field="fechaSort" header="Fecha" sortable body={(row) => row.fecha} headerClassName="!py-2 !px-2 text-xs" bodyClassName="!py-1 !px-2 text-xs" style={{ minWidth: '8rem' }} />
      <Column field="estado" header="Estado" sortable body={estadoBody} filter filterElement={estadoFilterElement} showFilterMatchModes={false} headerClassName="!py-2 !px-2 text-xs" bodyClassName="!py-1 !px-2 text-xs" style={{ minWidth: '8rem' }} />
      <Column field="claveRadial" header="Clave radial" sortable filter body={(row) => row.claveRadial} filterElement={claveFilterElement} showFilterMatchModes={false} headerClassName="!py-2 !px-2 text-xs" bodyClassName="!py-1 !px-2 text-xs" style={{ minWidth: '8rem' }} />
      <Column field="descripcion" header="Descripción" body={descripcionBody} headerClassName="!py-2 !px-2 text-xs" bodyClassName="!py-1 !px-2 text-xs" style={{ minWidth: '12rem' }} />
      <Column field="tipo" header="Tipo" sortable headerClassName="!py-2 !px-2 text-xs" bodyClassName="!py-1 !px-2 text-xs" style={{ minWidth: '7rem' }} />
      <Column field="compania" header="Compañía" sortable headerClassName="!py-2 !px-2 text-xs" bodyClassName="!py-1 !px-2 text-xs" style={{ minWidth: '8rem' }} />
      <Column header="Acciones" body={accionesBody} exportable={false} headerClassName="!py-2 !px-2 text-xs" bodyClassName="!py-1 !px-2 text-xs" style={{ minWidth: '12rem' }} />
    </DataTable>
  );
}

export default function RevisionPartes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const fireAlert = useGlobalFireAlert();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Mostrar solo ENVIADO, CORREGIR y APROBADO
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
  const onChangeEstado = (incidente) => {
    // Usamos el popup de Información con dos acciones: Aprobar y Corregir
    fireAlert.fireInfo(
      'Cambiar estado',
      `Selecciona la acción para el incidente #${incidente?.id}`,
      {
        showCancel: true,
        confirmText: 'Aprobar',
        cancelText: 'Corregir',
        // Azul por defecto para confirmar (info) y rojo personalizado para corregir
        cancelClassName:
          'flex-1 px-4 py-3 border-2 border-red-300 text-red-700 bg-red-50 rounded-lg font-semibold hover:bg-red-100 hover:border-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        onConfirm: () => confirmChange(incidente, 'APROBADO'),
        onCancel: () => confirmChange(incidente, 'CORREGIR')
      }
    );
  };

  const confirmChange = async (incidente, nuevoEstado) => {
    if (!incidente?.id) return;
    try {
      // TODO: reemplazar idBombero por el usuario autenticado cuando esté disponible
      await cambiarEstadoIncidente(incidente.id, { estado: nuevoEstado, idBombero: 1 });
      // Feedback opcional
      fireAlert.fireSuccess('Estado actualizado', `El incidente #${incidente.id} fue marcado como ${nuevoEstado}.`);
      await fetchData();
    } catch (e) {
      fireAlert.fireError('Error', e?.message || 'No se pudo cambiar el estado');
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

      
    </div>
  );
}
