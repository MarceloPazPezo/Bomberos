import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Paginator } from 'primereact/paginator';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdDownload, MdRefresh, MdClear, MdFileDownload } from 'react-icons/md';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const PrimeTableAdvanced = ({
  data = [],
  columns = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  onSearch,
  onExport,
  searchPlaceholder = "Buscar...",
  addButtonText = "Agregar",
  showAddButton = true,
  showSearch = true,
  showFilters = true,
  showExport = true,
  showRefresh = true,
  pagination = true,
  rowsPerPage = 10,
  emptyMessage = "No se encontraron datos",
  className = "",
  title = "Datos",
  enableSelection = true,
  onSelectionChange
}) => {
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(rowsPerPage);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  
  const dt = useRef(null);

  // Configurar filtros globales
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
    
    if (onSearch) {
      onSearch(value);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setGlobalFilterValue('');
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    if (onSearch) {
      onSearch('');
    }
  };

  // Manejar selección
  const onSelectionChangeHandler = (e) => {
    setSelectedRows(e.value);
    if (onSelectionChange) {
      onSelectionChange(e.value);
    }
  };

  // Exportar datos
  const exportCSV = () => {
    if (dt.current) {
      dt.current.exportCSV();
    }
  };

  const exportExcel = () => {
    if (dt.current && onExport) {
      onExport(selectedRows.length > 0 ? selectedRows : data);
    } else {
      exportCSV(); // Fallback a CSV
    }
  };

  // Renderizar acciones
  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2 justify-center">
        {onEdit && (
          <Button
            icon={<MdEdit size={18} />}
            className="p-button-rounded p-button-text p-button-plain"
            onClick={() => onEdit(rowData)}
            tooltip="Editar"
            tooltipOptions={{ position: 'top' }}
          />
        )}
        {onDelete && (
          <Button
            icon={<MdDelete size={18} />}
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => onDelete(rowData)}
            tooltip="Eliminar"
            tooltipOptions={{ position: 'top' }}
          />
        )}
      </div>
    );
  };

  // Renderizar columnas dinámicamente
  const renderColumns = () => {
    return columns.map((col, index) => {
      if (col.type === 'actions') {
        return (
          <Column
            key={`actions-${index}`}
            header="Acciones"
            body={actionsBodyTemplate}
            style={{ width: '120px', textAlign: 'center' }}
            frozen
            alignFrozen="right"
          />
        );
      }

      return (
        <Column
          key={col.field || index}
          field={col.field}
          header={col.header}
          sortable={col.sortable !== false}
          filter={col.filter}
          filterElement={col.filterElement}
          body={col.body}
          style={col.style}
          className={col.className}
          selectionMode={col.selectionMode}
        />
      );
    });
  };

  // Header de la tabla
  const header = () => {
    return (
      <div className="flex flex-column sm:flex-row justify-content-between align-items-center gap-3 mb-3">
        {/* Título */}
        <div className="flex align-items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 m-0">{title}</h3>
          <span className="text-sm text-gray-500">
            ({data.length} registros)
            {selectedRows.length > 0 && ` - ${selectedRows.length} seleccionados`}
          </span>
        </div>

        {/* Controles */}
        <div className="flex align-items-center gap-2">
          {showSearch && (
            <div className="p-input-icon-left" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MdSearch style={{ position: 'absolute', left: '0.75rem', zIndex: 1, color: '#6c757d' }} size={18} />
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder={searchPlaceholder}
                className="w-full sm:w-80 p-inputtext-sm"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          )}
          
          {showFilters && (
            <Button
              icon={<MdFilterList size={18} />}
              className="p-button-text p-button-plain"
              onClick={() => {/* Implementar panel de filtros */}}
              tooltip="Filtros avanzados"
              tooltipOptions={{ position: 'top' }}
            />
          )}

          {showRefresh && onRefresh && (
            <Button
              icon={<MdRefresh size={18} />}
              className="p-button-text p-button-plain"
              onClick={onRefresh}
              tooltip="Refrescar datos"
              tooltipOptions={{ position: 'top' }}
            />
          )}

          {showExport && (
            <div className="flex gap-1">
              <Button
                icon={<MdDownload size={18} />}
                className="p-button-text p-button-plain"
                onClick={exportCSV}
                tooltip="Exportar CSV"
                tooltipOptions={{ position: 'top' }}
              />
              <Button
                icon={<MdFileDownload size={18} />}
                className="p-button-text p-button-plain"
                onClick={exportExcel}
                tooltip="Exportar Excel"
                tooltipOptions={{ position: 'top' }}
              />
            </div>
          )}

          <Button
            icon={<MdClear size={18} />}
            className="p-button-text p-button-plain"
            onClick={clearFilters}
            tooltip="Limpiar filtros"
            tooltipOptions={{ position: 'top' }}
          />

          {showAddButton && onAdd && (
            <Button
              label={addButtonText}
              icon={<MdAdd size={18} />}
              onClick={onAdd}
              className="p-button-sm"
            />
          )}
        </div>
      </div>
    );
  };

  // Footer de paginación
  const footer = () => {
    if (!pagination) return null;
    
    return (
      <div className="flex justify-content-between align-items-center">
        <div className="text-sm text-gray-600">
          {selectedRows.length > 0 && (
            <span>{selectedRows.length} elementos seleccionados</span>
          )}
        </div>
        <Paginator
          first={first}
          rows={rows}
          totalRecords={data.length}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          onPageChange={(e) => {
            setFirst(e.first);
            setRows(e.rows);
          }}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
        />
      </div>
    );
  };

  return (
    <div className={`card ${className}`}>
      <DataTable
        ref={dt}
        value={data}
        paginator={false} // Usamos paginación personalizada
        rows={rows}
        first={first}
        loading={loading}
        header={header()}
        footer={footer()}
        emptyMessage={emptyMessage}
        filters={filters}
        filterDisplay="row"
        globalFilterFields={columns.map(col => col.field).filter(Boolean)}
        responsiveLayout="scroll"
        className="p-datatable-sm"
        stripedRows
        showGridlines
        size="small"
        selectionMode={enableSelection ? 'multiple' : null}
        selection={selectedRows}
        onSelectionChange={enableSelection ? onSelectionChangeHandler : null}
        metaKeySelection={false}
        exportFilename={`${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`}
      >
        {enableSelection && (
          <Column 
            selectionMode="multiple" 
            headerStyle={{ width: '3rem' }} 
            frozen
          />
        )}
        {renderColumns()}
      </DataTable>
    </div>
  );
};

export default PrimeTableAdvanced;
