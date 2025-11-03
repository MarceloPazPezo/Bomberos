import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdVisibility } from 'react-icons/md';
import { useDebounce } from '@hooks/useDebounce.js';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const PrimeTableBasic = ({
  data = [],
  columns = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onViewDetail,
  onSearch,
  searchPlaceholder = "Buscar...",
  addButtonText = "Agregar",
  showAddButton = true,
  showSearch = true,
  showFilters = false,
  pagination = true,
  rowsPerPage = 10,
  emptyMessage = "No se encontraron datos",
  className = ""
}) => {
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(rowsPerPage);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Debounce para la búsqueda
  const debouncedSearchValue = useDebounce(globalFilterValue, 300);

  // Configurar filtros globales
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  // Efecto para llamar onSearch con debounce
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearch]);

  // Renderizar acciones
  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2 justify-center">
        {onViewDetail && (
          <Button
            icon={<MdVisibility size={18} />}
            className="p-button-rounded p-button-text p-button-info"
            onClick={() => onViewDetail(rowData)}
            tooltip="Ver detalle"
            tooltipOptions={{ position: 'top' }}
          />
        )}
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
        />
      );
    });
  };

  // Header de la tabla
  const header = () => {
    return (
      <div className="flex flex-column sm:flex-row justify-content-between align-items-center gap-3">
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
        </div>
        {showAddButton && onAdd && (
          <Button
            label={addButtonText}
            icon={<MdAdd size={18} />}
            onClick={onAdd}
            className="p-button-sm"
          />
        )}
      </div>
    );
  };


  return (
    <div className={`card ${className}`}>
      <DataTable
        value={data}
        paginator={pagination}
        rows={rows}
        first={first}
        loading={loading}
        header={header()}
        emptyMessage={emptyMessage}
        filters={filters}
        filterDisplay="row"
        globalFilterFields={columns.map(col => col.field).filter(Boolean)}
        responsiveLayout="scroll"
        className="p-datatable-sm"
        stripedRows
        showGridlines
        size="small"
        rowsPerPageOptions={[5, 10, 20, 50]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
      >
        {renderColumns()}
      </DataTable>
    </div>
  );
};

export default PrimeTableBasic;
