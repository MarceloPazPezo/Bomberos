import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const DetalleActividadBombero = ({ historial, loading = false }) => {
  // Filtrar solo asistencias y disponibilidad
  const historialFiltrado = useMemo(() => {
    return historial.filter((item) => item.tipo === "asistencia" || item.tipo === "Disponibilidad");
  }, [historial]);

  // Normalizar historial: separar fecha y hora (hora en formato 24h)
  const historialFiltradoNormalizado = useMemo(() => {
    return historialFiltrado.map((item) => {
      let fecha = "";
      let hora = "";
      if (item.fecha) {
        const d = new Date(item.fecha);
        if (!isNaN(d)) {
          fecha = d.toLocaleDateString("es-CL");
          // Formato 24 horas
          hora = d.toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        }
      }
      return {
        ...item,
        fecha,
        hora,
      };
    });
  }, [historialFiltrado]);

  return (
    <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-base sm:text-lg font-semibold text-[#2C3E50] mb-3 sm:mb-4">
        Detalle de Mi Actividad
      </h3>
      <DataTable
        value={historialFiltradoNormalizado}
        loading={loading}
        emptyMessage="No hay registros para mostrar"
        rows={10}
        paginator
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        className="text-sm"
        responsiveLayout="scroll"
      >
        <Column field="tipo" header="Tipo" sortable />
        <Column field="detalle" header="Detalle" sortable />
        <Column field="fecha" header="Fecha" sortable />
        <Column field="hora" header="Hora" sortable />
        <Column field="descripcion" header="Descripción" sortable style={{ minWidth: "250px" }} />
      </DataTable>
    </div>
  );
};

DetalleActividadBombero.propTypes = {
  historial: PropTypes.array.isRequired,
  loading: PropTypes.bool,
};

export default DetalleActividadBombero;
