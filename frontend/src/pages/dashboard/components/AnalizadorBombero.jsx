import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getBomberos } from '../../../services/bombero.service';
import { getHistorialVoluntario } from '../../../services/historial.service';
import dayjs from 'dayjs';

const AnalizadorBombero = ({ fechaInicio, fechaFin }) => {
  const [bomberos, setBomberos] = useState([]);
  const [bomberoSeleccionado, setBomberoSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar bomberos activos al montar
  useEffect(() => {
    getBomberos().then((data) => {
      const normalizados = (data || []).map((b) => {
        if (b.nombreCompleto) return b;
        // Si nombres y apellidos son arrays, únelos, si son string sepáralos por coma
        let nombres = b.nombres;
        let apellidos = b.apellidos;
        if (Array.isArray(nombres)) nombres = nombres.join(' ');
        if (typeof nombres === 'string' && nombres.includes(','))
          nombres = nombres.split(',').join(' ');
        if (Array.isArray(apellidos)) apellidos = apellidos.join(' ');
        if (typeof apellidos === 'string' && apellidos.includes(','))
          apellidos = apellidos.split(',').join(' ');
        return {
          ...b,
          nombreCompleto: `${nombres || ''} ${apellidos || ''}`.replace(
            /\s+/g,
            ' '
          ),
        };
      });
      setBomberos(normalizados);
    });
  }, []);

  // Cargar historial al seleccionar bombero
  useEffect(() => {
    if (bomberoSeleccionado && bomberoSeleccionado.id) {
      setLoading(true);
      getHistorialVoluntario(bomberoSeleccionado.id)
        .then((data) => {
          setHistorial(data?.data || []);
        })
        .finally(() => setLoading(false));
    } else {
      setHistorial([]);
    }
  }, [bomberoSeleccionado]);

  // Filtrar solo asistencias y disponibilidad, y por rango de fechas
  const historialFiltrado = useMemo(() => {
    let filtrado = historial.filter(
      (item) => item.tipo === 'asistencia' || item.tipo === 'Disponibilidad'
    );

    // Aplicar filtro de fechas si están definidas
    if (fechaInicio && fechaFin) {
      filtrado = filtrado.filter((item) => {
        if (!item.fecha) return false;
        const fechaItem = dayjs(item.fecha);
        const inicio = dayjs(fechaInicio);
        const fin = dayjs(fechaFin);
        
        // Verificar que la fecha del item esté entre inicio y fin (inclusive)
        return fechaItem.isSame(inicio, 'day') || 
               fechaItem.isSame(fin, 'day') || 
               (fechaItem.isAfter(inicio, 'day') && fechaItem.isBefore(fin, 'day'));
      });
    }

    return filtrado;
  }, [historial, fechaInicio, fechaFin]);

  // Normalizar historial: separar fecha y hora (hora en formato 24h)
  const historialFiltradoNormalizado = useMemo(() => {
    return historialFiltrado.map((item) => {
      let fecha = '';
      let hora = '';
      if (item.fecha) {
        const d = new Date(item.fecha);
        if (!isNaN(d)) {
          fecha = d.toLocaleDateString('es-CL');
          // Formato 24 horas
          hora = d.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
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

  // Resumen
  const resumen = useMemo(() => {
    let totalAsistencias = 0;
    let totalIncidentes = 0;
    let totalEventos = 0;
    let totalHorasDisponibles = 0;
    const diasDisponiblesSet = new Set();
    // Agrupar registros de disponibilidad por día
    const disponibilidadPorDia = {};

    historialFiltrado.forEach((item) => {
      if (item.tipo === 'asistencia') {
        totalAsistencias++;
        if (item.descripcion && item.descripcion.includes('Asistencia a incidente'))
          totalIncidentes++;
        if (item.descripcion && item.descripcion.includes('Asistencia a evento'))
          totalEventos++;
      }
      if (item.tipo === 'Disponibilidad' && item.fecha) {
        const fechaSolo = dayjs(item.fecha).format('YYYY-MM-DD');
        diasDisponiblesSet.add(fechaSolo);
        if (!disponibilidadPorDia[fechaSolo]) disponibilidadPorDia[fechaSolo] = [];
        disponibilidadPorDia[fechaSolo].push(item);
      }
    });

    // Calcular horas de disponibilidad por día
    Object.values(disponibilidadPorDia).forEach((registros) => {
      // Ordenar por fecha/hora
      const ordenados = registros
        .slice()
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      for (let i = 0; i < ordenados.length - 1; i++) {
        const actual = ordenados[i];
        const siguiente = ordenados[i + 1];
        if (
          actual.descripcion &&
          actual.descripcion.includes('Inicio de disponibilidad') &&
          siguiente.descripcion &&
          siguiente.descripcion.includes('Fin de disponibilidad')
        ) {
          const inicio = dayjs(actual.fecha);
          const fin = dayjs(siguiente.fecha);
          const diffHoras = fin.diff(inicio, 'minute') / 60;
          if (diffHoras > 0) totalHorasDisponibles += diffHoras;
          i++; // Saltar el siguiente porque ya fue emparejado
        }
      }
    });

    // Convertir totalHorasDisponibles a horas y minutos enteros
    const horasEnteras = Math.floor(totalHorasDisponibles);
    const minutos = Math.round((totalHorasDisponibles - horasEnteras) * 60);

    return {
      totalAsistencias,
      totalIncidentes,
      totalEventos,
      horasEnteras,
      minutos,
      diasDisponibles: diasDisponiblesSet.size,
    };
  }, [historialFiltrado]);

  return (
    <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-[#2C3E50] mb-3 sm:mb-4">
        Detalle de Actividad del Voluntario
      </h3>
      <div className="mb-3 sm:mb-4 w-full sm:max-w-md">
        <Dropdown
          value={bomberoSeleccionado}
          options={bomberos}
          onChange={(e) => setBomberoSeleccionado(e.value)}
          optionLabel="nombreCompleto"
          placeholder="Seleccione un bombero"
          className="w-full"
          filter
        />
      </div>
      {bomberoSeleccionado && (
        <>
          <DataTable
            value={historialFiltradoNormalizado}
            loading={loading}
            emptyMessage="No hay registros para mostrar"
              className="mb-4 sm:mb-6"
            rows={5}
            paginator
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
          >
            <Column field="tipo" header="Tipo" />
            <Column field="detalle" header="Detalle" />
            <Column field="fecha" header="Fecha" />
            <Column field="hora" header="Hora" />
            <Column field="descripcion" header="Descripción" />
          </DataTable>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 max-w-full sm:max-w-xl mx-auto">
            <h4 className="text-sm sm:text-base font-semibold mb-2 text-[#2C3E50]">
              Resumen
            </h4>
            <p className="mb-1 text-sm sm:text-base">
              El voluntario{' '}
              <b>{bomberoSeleccionado.nombreCompleto}</b> asistió a un total de{' '}
              <b>{resumen.totalAsistencias}</b> actividades.
            </p>
            <ul className="mb-1 ml-3 sm:ml-4 list-disc text-xs sm:text-sm">
              <li>
                <b>{resumen.totalIncidentes}</b> incidentes
              </li>
              <li>
                <b>{resumen.totalEventos}</b> eventos
              </li>
            </ul>
            <p className="mb-0 text-xs sm:text-sm">
              Estuvo disponible un total de{' '}
              <b>{resumen.horasEnteras}</b> horas
              {resumen.minutos > 0
                ? ` y ${resumen.minutos} minutos`
                : ''}{' '}
              en <b>{resumen.diasDisponibles}</b> días distintos.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

AnalizadorBombero.propTypes = {
  fechaInicio: PropTypes.instanceOf(Date),
  fechaFin: PropTypes.instanceOf(Date),
};

export default AnalizadorBombero;
