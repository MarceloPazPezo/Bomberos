import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { MdDownload, MdDelete, MdRefresh, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

const Table = ({
  data = [],
  columns: userColumns = [],
  pageSize = 10,
  badgeMap = {},
  onEdit,
  onDelete,
  onView,
  renderActions,
  // Nuevas props
  loading = false,
  error = null,
  title = '',
  enableSelection = false,
  enableExport = false,
  enableRefresh = false,
  onRefresh,
  onBulkDelete,
  onExport,
  emptyMessage = 'No hay datos disponibles',
  searchPlaceholder = 'Buscar...',
  customActions = null, // Nuevo prop para botones personalizados
}) => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const [globalFilter, setGlobalFilter] = useState('');

  // Función para exportar datos (se definirá después de crear la tabla)
  const handleExport = useCallback((tableInstance) => {
    if (onExport) {
      onExport(data, tableInstance.getFilteredRowModel().rows.map(row => row.original));
    } else {
      // Exportación por defecto a CSV
      const filteredData = tableInstance.getFilteredRowModel().rows.map(row => row.original);
      const headers = userColumns.map(col => col.header || col.accessorKey);
      const csvContent = [
        headers.join(','),
        ...filteredData.map(row => 
          userColumns.map(col => {
            const value = row[col.accessorKey] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title || 'datos'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [data, userColumns, title, onExport]);

  // Función para eliminar elementos seleccionados (se definirá después de crear la tabla)
  const handleBulkDelete = useCallback((tableInstance) => {
    const selectedRows = tableInstance.getSelectedRowModel().rows.map(row => row.original);
    if (onBulkDelete && selectedRows.length > 0) {
      onBulkDelete(selectedRows);
      setRowSelection({});
    }
  }, [onBulkDelete]);

  const selectedRowsCount = Object.keys(rowSelection).length;

  // Columnas con renderizado personalizado y acciones
  const columns = useMemo(() => {
    const cols = [];

    // Columna de selección (si está habilitada)
    if (enableSelection) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <button
              onClick={table.getToggleAllRowsSelectedHandler()}
              className="text-blue-600 hover:text-blue-800"
            >
              {table.getIsAllRowsSelected() ? (
                <MdCheckBox className="w-5 h-5" />
              ) : (
                <MdCheckBoxOutlineBlank className="w-5 h-5" />
              )}
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              onClick={row.getToggleSelectedHandler()}
              className="text-blue-600 hover:text-blue-800"
            >
              {row.getIsSelected() ? (
                <MdCheckBox className="w-5 h-5" />
              ) : (
                <MdCheckBoxOutlineBlank className="w-5 h-5" />
              )}
            </button>
          </div>
        ),
        size: 50,
        enableSorting: false,
        enableColumnFilter: false,
      });
    }

    const indexCol = {
      id: 'visualIndex',
      header: <div className="flex items-center justify-center"><span className="font-bold text-slate-700">#</span></div>,
      size: 40,
      cell: ({ row }) => <div className="flex items-center justify-center">{row.index + 1}</div>,
      enableSorting: false,
      enableColumnFilter: false,
    };


    const baseCols = userColumns.map(col => {
      let filterFn = 'includesString';
      let filterElement;
      // Truncamiento automático si la columna tiene truncate: true y no tiene cell custom
      let cellRender = col.cell || ((info) => {
        const value = info.getValue();
        if (col.truncate && typeof value === 'string') {
          const maxLength = typeof col.truncate === 'number' ? col.truncate : 50;
          return value.length > maxLength ? value.slice(0, maxLength) + '...' : value;
        }
        return value;
      });
      if (col.filterType === 'select' && Array.isArray(col.filterOptions)) {
        filterFn = (row, columnId, filterValue) => {
          if (!filterValue && filterValue !== false) return true;
          
          const rowValue = row.getValue(columnId);
          
          // Manejar valores booleanos
          if (typeof rowValue === 'boolean') {
            // Convertir el filterValue string a boolean si es necesario
            if (filterValue === 'true') return rowValue === true;
            if (filterValue === 'false') return rowValue === false;
            return rowValue === filterValue;
          }
          
          return rowValue === filterValue;
        };
        filterElement = ({ column }) => {
          // Convertir el valor del filtro a string para el select
          const currentFilterValue = column.getFilterValue();
          let selectValue = '';
          
          if (currentFilterValue === true) {
            selectValue = 'true';
          } else if (currentFilterValue === false) {
            selectValue = 'false';
          } else if (currentFilterValue !== undefined && currentFilterValue !== null && currentFilterValue !== '') {
            selectValue = String(currentFilterValue);
          }
          
          return (
            <select
              value={selectValue}
              onChange={e => {
                const value = e.target.value;
                // Convertir strings a booleanos si es necesario
                if (value === 'true') {
                  column.setFilterValue(true);
                } else if (value === 'false') {
                  column.setFilterValue(false);
                } else if (value === '') {
                  column.setFilterValue(undefined);
                } else {
                  column.setFilterValue(value);
                }
              }}
              className="mt-1 px-1 py-0.5 border border-blue-200 rounded w-full bg-blue-50 text-[#4EB9FA] focus:outline-none focus:ring-2 focus:ring-blue-300 transition appearance-none"
              style={{ backgroundImage: 'none' }}
            >
              <option value="">Todos</option>
              {col.filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          );
        };
        // Si existe badgeMap para esta columna, renderizar el badge de color
        if (badgeMap[col.accessorKey]) {
          cellRender = info => {
            const value = info.getValue();
            const color = badgeMap[col.accessorKey][value] || badgeMap[col.accessorKey]['default'];
            if (!color) return value;
            return (
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border font-medium text-xs whitespace-nowrap ${color.bg} ${color.text} ${color.border}`}>
                {color.icon ? (
                  React.createElement(color.icon, { className: "w-3 h-3 flex-shrink-0" })
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.dot}`}></span>
                )}
                {color.label || value}
              </span>
            );
          };
        }
      } else if (col.filterType === 'date') {
        filterFn = (row, columnId, filterValue) => {
          if (!filterValue) return true;
          const rowValue = row.getValue(columnId);
          // Si el valor es DD-MM-YYYY, parsear manualmente
          let rowDateISO = '';
          if (rowValue && /^\d{2}-\d{2}-\d{4}$/.test(rowValue)) {
            const [day, month, year] = rowValue.split('-');
            const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
            if (!isNaN(dateObj)) {
              rowDateISO = dateObj.toISOString().slice(0, 10);
            }
          } else if (rowValue) {
            // Si ya es un ISO o Date válido
            const dateObj = new Date(rowValue);
            if (!isNaN(dateObj)) {
              rowDateISO = dateObj.toISOString().slice(0, 10);
            }
          }
          return rowDateISO === filterValue;
        };
        filterElement = ({ column }) => (
          <input
            type="date"
            value={column.getFilterValue() || ''}
            onChange={e => {
              column.setFilterValue(e.target.value);
            }}
            className="mt-1 px-1 py-0.5 border border-blue-200 rounded w-full bg-blue-50 text-[#4EB9FA] focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            style={{ colorScheme: 'light' }}
          />
        );
      } else if (col.filterType === 'text') {
        // Usar la función de filtro personalizada si está definida, sino usar la por defecto
        if (col.filterFn) {
          filterFn = col.filterFn;
        } else {
          filterFn = 'includesString';
        }
        filterElement = ({ column }) => (
          <input
            type="text"
            value={column.getFilterValue() || ''}
            onChange={e => {
              column.setFilterValue(e.target.value);
            }}
            placeholder="Buscar..."
            className="mt-1 px-2 py-0.5 border border-blue-200 rounded w-full bg-blue-50 text-[#4EB9FA] focus:outline-none focus:ring-2 focus:ring-blue-300 transition placeholder-blue-300"
          />
        );
      }
      return {
        ...col,
        enableSorting: true,
        enableColumnFilter: true,
        filterFn,
        filterElement,
        cell: cellRender,
      };
    });
    
    // Agregar columna de índice
    cols.push(indexCol);
    
    // Agregar columnas del usuario
    cols.push(...baseCols);
    
    // Agregar columna de acciones
    cols.push({
      id: 'actions',
      header: 'Acciones',
      size: 120,
      cell: ({ row }) =>
        renderActions
          ? renderActions({ row: row.original })
          : (
            <div className="flex gap-2">
              {onView && <button className="text-blue-600 hover:underline" onClick={() => onView(row.original)}>Ver</button>}
              {onEdit && <button className="text-yellow-600 hover:underline" onClick={() => onEdit(row.original)}>Editar</button>}
              {onDelete && <button className="text-red-600 hover:underline" onClick={() => onDelete(row.original)}>Eliminar</button>}
            </div>
          ),
      enableSorting: false,
      enableColumnFilter: false,
    });
    
    return cols;
  }, [userColumns, onEdit, onDelete, onView, renderActions, enableSelection]);

  const table = useReactTable({
    data: data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: enableSelection,
    enableGlobalFilter: true,
    debugTable: false,
  });

  // --- Rellenar filas vacías para mantener el alto de la tabla ---
  const pageRows = table.getRowModel().rows;
  const pageSizeCurrent = table.getState().pagination.pageSize;
  const emptyRowsCount = Math.max(0, pageSizeCurrent - pageRows.length);
  // Para las filas vacías, generamos celdas vacías según las columnas visibles
  const visibleColumns = table.getVisibleFlatColumns();

  // Estado de carga
  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="inline-flex items-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Cargando datos...</span>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-medium">Error al cargar los datos</p>
          <p className="text-sm mt-1">{error}</p>
          {enableRefresh && onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <MdRefresh className="w-4 h-4" />
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Título y búsqueda */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          {title && (
            <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
          )}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={globalFilter || ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {enableRefresh && onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar"
            >
              <MdRefresh className="w-4 h-4" />
            </button>
          )}
          
          {enableExport && (
            <button
              onClick={() => handleExport(table)}
              className="inline-flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
              title="Exportar"
            >
              <MdDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          )}

          {/* Botones personalizados */}
          {customActions && customActions}

          {enableSelection && selectedRowsCount > 0 && onBulkDelete && (
            <button
              onClick={() => handleBulkDelete(table)}
              className="inline-flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
              title={`Eliminar ${selectedRowsCount} elemento(s)`}
            >
              <MdDelete className="w-4 h-4" />
              <span className="hidden sm:inline">Eliminar ({selectedRowsCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto relative">
        <div className="relative min-w-full [&_button]:cursor-pointer [&_input]:cursor-pointer [&_select]:cursor-pointer">
          <table className="min-w-full border border-white/20 rounded-2xl overflow-hidden bg-transparent text-sm block md:table" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-white/60 block md:table-header-group">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="block md:table-row">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={`p-2 text-left font-semibold border-b border-white/30 text-slate-700 whitespace-nowrap ${header.column.columnDef.sticky === 'left' ? 'sticky left-0 bg-white/60 z-20 shadow-md' : ''} ${header.column.columnDef.sticky === 'right' ? 'sticky right-0 bg-white/60 z-20 shadow-md' : ''} ${header.column.columnDef.sticky ? 'bg-white/60' : ''} block md:table-cell`}
                    style={{ minWidth: header.column.columnDef.size, maxWidth: header.column.columnDef.size }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {/* Filtro por columna */}
                    {header.column.getCanFilter() && (
                      <div>
                        {header.column.columnDef.filterElement
                          ? header.column.columnDef.filterElement({ column: header.column })
                          : (
                            <input
                              type="text"
                              value={header.column.getFilterValue() || ''}
                              onChange={e => header.column.setFilterValue(e.target.value)}
                              placeholder={`Filtrar...`}
                              className="mt-1 px-1 py-0.5 border border-blue-200 rounded w-full bg-blue-50 text-[#4EB9FA] placeholder-[#4EB9FA] focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                            />
                          )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="block md:table-row-group overflow-x-auto md:overflow-visible">
            {pageRows.map((row, idx) => (
              <tr
                key={row.id}
                className={`block md:table-row ${idx % 2 === 1 ? 'bg-gray-100' : ''}`}
                style={{ height: '120px', minHeight: '120px', maxHeight: '120px' }}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={`p-0 align-top border-b border-white/20 text-slate-800 bg-white/80 block md:table-cell ${cell.column.columnDef.sticky === 'left' ? 'sticky left-0 z-10 shadow-md' : ''} ${cell.column.columnDef.sticky === 'right' ? 'sticky right-0 z-10 shadow-md' : ''}`}
                    style={{ minWidth: cell.column.columnDef.size, maxWidth: cell.column.columnDef.size, height: '120px', minHeight: '120px', maxHeight: '120px', backgroundColor: idx % 2 === 1 ? '#f3f4f6' : undefined }}
                  >
                    <div className={`flex items-center h-full w-full ${cell.column.id === 'dates' ? 'px-1' : 'px-2'} break-words whitespace-normal ${cell.column.id === 'select' || cell.column.id === 'visualIndex' ? 'justify-center' : ''}`} title={String(cell.getValue?.() ?? '')}>
                      {/* Si el contenido es un botón, input, select, etc, forzar cursor-pointer */}
                      <span className="break-words whitespace-normal block max-w-full align-middle [&_button]:cursor-pointer [&_input]:cursor-pointer [&_select]:cursor-pointer">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            {/* Filas vacías para mantener el alto de la tabla */}
            {Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <tr key={`empty-row-${idx}`} className="block md:table-row bg-transparent" style={{ pointerEvents: 'none', height: '120px', minHeight: '120px', maxHeight: '120px' }}>
                {visibleColumns.map(col => (
                  <td
                    key={`empty-cell-${col.id}`}
                    className={`p-0 align-top border-b border-white/20 whitespace-nowrap bg-white/80 block md:table-cell`}
                    style={{ minWidth: col.columnDef.size, maxWidth: col.columnDef.size, height: '120px', minHeight: '120px', maxHeight: '120px' }}
                  >
                    <div className={`h-full w-full ${col.id === 'dates' ? 'px-1' : 'px-2'}`}>&nbsp;</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          </table>
          
          {/* Estado vacío */}
          {data.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">{emptyMessage}</p>
              </div>
            </div>
          )}
          
          {/* Sombra para indicar scroll horizontal en mobile */}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white/80 to-transparent md:hidden" />
        </div>
      </div>
      {/* Paginación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-200">
        {/* Filas por página a la izquierda */}
        <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
          <span>Mostrando</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <span>de {table.getFilteredRowModel().rows.length} registros</span>
        </div>
        {/* Página X de Y al centro */}
        <div className="flex-1 flex justify-center items-center text-sm text-slate-700">
          <span>
            Página <strong>{table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</strong>
          </span>
        </div>
        {/* Paginación a la derecha */}
        <div className="flex gap-1 items-center w-full md:w-auto md:justify-end">
          <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="px-2 py-1 border border-white/30 rounded bg-white/10 text-[#2C3E50] hover:bg-[#4EB9FA]/30 disabled:opacity-50 cursor-pointer">Primero</button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-2 py-1 border border-white/30 rounded bg-white/10 text-[#2C3E50] hover:bg-[#4EB9FA]/30 disabled:opacity-50 cursor-pointer">Anterior</button>
          {/* Input de página estilo custom con botones - y + a la derecha */}
          <div className="flex items-center mx-1 border border-white/30 rounded-lg overflow-hidden bg-white/10" style={{ minWidth: '40px', height: '38px' }}>
            <button
              type="button"
              className="w-10 h-full flex items-center justify-center text-2xl text-[#2C3E50] hover:bg-[#4EB9FA]/30 transition disabled:opacity-50 cursor-pointer"
              disabled={table.getState().pagination.pageIndex + 1 <= 1}
              onClick={() => {
                if (table.getState().pagination.pageIndex + 1 > 1) {
                  table.setPageIndex(table.getState().pagination.pageIndex - 1);
                }
              }}
              aria-label="Página anterior"
            >
              –
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={table.getPageCount()}
              value={table.getState().pagination.pageIndex + 1}
              onChange={e => {
                // Solo permitir números válidos
                const val = e.target.value.replace(/\D/g, '');
                let page = val ? Math.max(1, Math.min(Number(val), table.getPageCount())) : 1;
                table.setPageIndex(page - 1);
              }}
              className="w-12 text-lg text-slate-700 bg-transparent outline-none border-none text-center focus:ring-0 cursor-pointer"
              disabled={table.getPageCount() === 0}
              style={{ boxShadow: 'none', minWidth: '3rem', maxWidth: '3rem' }}
            />
            <button
              type="button"
              className="w-10 h-full flex items-center justify-center text-2xl text-[#2C3E50] hover:bg-[#4EB9FA]/30 transition disabled:opacity-50 cursor-pointer"
              disabled={table.getState().pagination.pageIndex + 1 >= table.getPageCount()}
              onClick={() => {
                if (table.getState().pagination.pageIndex + 1 < table.getPageCount()) {
                  table.setPageIndex(table.getState().pagination.pageIndex + 1);
                }
              }}
              aria-label="Siguiente página"
            >
              +
            </button>
          </div>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-2 py-1 border border-white/30 rounded bg-white/10 text-[#2C3E50] hover:bg-[#4EB9FA]/30 disabled:opacity-50 cursor-pointer">Siguiente</button>
          <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="px-2 py-1 border border-white/30 rounded bg-white/10 text-[#2C3E50] hover:bg-[#4EB9FA]/30 disabled:opacity-50 cursor-pointer">Último</button>
        </div>
      </div>
    </div>
  );
};

Table.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  pageSize: PropTypes.number,
  badgeMap: PropTypes.object,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  renderActions: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  enableSelection: PropTypes.bool,
  enableExport: PropTypes.bool,
  enableRefresh: PropTypes.bool,
  onRefresh: PropTypes.func,
  onBulkDelete: PropTypes.func,
  onExport: PropTypes.func,
  emptyMessage: PropTypes.string,
  searchPlaceholder: PropTypes.string,

};

export default Table;
