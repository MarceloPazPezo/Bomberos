import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { MdDelete } from "react-icons/md";
/**
 * TableEditableTanStack
 * Props:
 *  - data: array de objetos (filas)
 *  - columns: array de definiciones de columnas (ver ejemplo abajo)

 *  - importedRows: array de índices de filas importadas correctamente (bloqueadas)
 *  - onDeleteRow: función para eliminar una fila (opcional)
 */
const PreviewTable = ({ data, columns, onDataChange, rowErrors, importedRows = [], onDeleteRow }) => {
  // Eliminamos el estado local editRows para evitar re-renders que causan pérdida de foco

  // Resumen
  const total = data.length;
  const imported = importedRows.length;
  const errors = Object.keys(rowErrors || {}).length;
  const pendientes = total - imported - errors;

  // Columnas con edición, # y eliminar
  const tableColumns = useMemo(() => {
    const indexCol = {
      id: 'visualIndex',
      header: '#',
      cell: ({ row }) => row.index + 1,
      size: 40,
    };
    const deleteCol = onDeleteRow ? {
      id: 'delete',
      header: '',
      cell: ({ row }) => (
        <button
          className="text-red-500 hover:text-red-700 px-2 py-1"
          title="Eliminar fila"
          onClick={() => onDeleteRow(row.index)}
        >
          <MdDelete />
        </button>
      ),
      size: 40,
    } : null;
    return [
      indexCol,
      ...columns.map(col => ({
        ...col,
        cell: col.editable !== false
          ? ({ getValue, row, column }) => {
              const value = getValue();
              const rowIndex = row.index;
              const field = column.id || column.accessorKey;
              const errorMsg = rowErrors?.[rowIndex]?.[field];
              const isImported = importedRows.includes(rowIndex);
              return (
                <div className="flex flex-col">
                  <input
                    key={`${rowIndex}-${field}`}
                    className={`border rounded px-2 py-1 text-sm w-full ${isImported ? 'bg-green-50 border-green-300 text-green-700 cursor-not-allowed' : errorMsg ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    value={value ?? ''}
                    disabled={isImported}
                    onChange={e => {
                      if (isImported) return;
                      const newRows = [...data];
                      newRows[rowIndex] = { ...newRows[rowIndex], [field]: e.target.value };
                      onDataChange && onDataChange(newRows);
                    }}
                  />
                  {errorMsg && <span className="text-xs text-red-500 mt-0.5">{errorMsg}</span>}
                </div>
              );
            }
          : col.cell || (info => info.getValue()),
      })),
      ...(deleteCol ? [deleteCol] : []),
    ];
  }, [columns, onDataChange, rowErrors, importedRows, onDeleteRow]);

  const table = useReactTable({
    data: data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="w-full overflow-x-auto">
      {/* Resumen arriba */}
      <div className="flex flex-wrap gap-4 mb-2 text-sm">
        <span className="text-[#2C3E50]">Total: <b>{total}</b></span>
        <span className="text-green-700">Importados: <b>{imported}</b></span>
        <span className="text-red-600">Con error: <b>{errors}</b></span>
        <span className="text-yellow-600">Pendientes: <b>{pendientes}</b></span>
      </div>
      <table className="min-w-full border border-white/20 rounded-2xl overflow-hidden bg-transparent text-sm">
        <thead className="bg-white/60">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="p-2 text-left font-semibold border-b border-white/30 text-slate-700 whitespace-nowrap"
                  style={{ minWidth: header.column.columnDef.size, maxWidth: header.column.columnDef.size }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map(row => {
            const isImported = importedRows.includes(row.index);
            const hasError = rowErrors && rowErrors[row.index];
            return (
              <React.Fragment key={row.id}>
                <tr
                  className={
                    isImported
                      ? 'bg-green-50'
                      : hasError
                      ? 'bg-red-50'
                      : ''
                  }
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="p-0 align-top border-b border-white/20 text-slate-800 bg-white/80"
                      style={{ minWidth: cell.column.columnDef.size, maxWidth: cell.column.columnDef.size }}
                    >
                      <div className="flex items-center h-full w-full px-2 break-words whitespace-normal">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Mostrar error general de fila (por ejemplo, duplicados) */}
                {hasError && rowErrors[row.index]._row && (
                  <tr>
                    <td colSpan={row.getVisibleCells().length} className="bg-red-100 text-red-600 text-xs px-3 py-2 border-b border-white/20">
                      {rowErrors[row.index]._row}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

PreviewTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  onDataChange: PropTypes.func,
  rowErrors: PropTypes.object,
  importedRows: PropTypes.array,
  onDeleteRow: PropTypes.func,
};

export default PreviewTable;
