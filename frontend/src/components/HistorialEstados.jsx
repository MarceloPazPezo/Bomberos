import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { obtenerHistorialEstados } from "@services/incidentes.service.js";
import { Timeline } from "primereact/timeline";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { MessageSquare, Clock, User } from "lucide-react";

/**
 * Componente para mostrar el historial de estados de un parte de emergencia
 * Incluye estados, fechas, comentarios y usuarios que realizaron los cambios
 */
export default function HistorialEstados({ incidenteId }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchHistorial = async () => {
      if (!incidenteId) return;

      try {
        setLoading(true);
        setError("");
        const data = await obtenerHistorialEstados(incidenteId);
        if (mounted) {
          setHistorial(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Error al cargar el historial");
          setHistorial([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHistorial();
    return () => {
      mounted = false;
    };
  }, [incidenteId]);

  const getSeverityForEstado = (estado) => {
    const estadoUpper = String(estado || "").toUpperCase();
    switch (estadoUpper) {
      case "APROBADO":
        return "success";
      case "ENVIADO":
        return "info";
      case "CORREGIR":
        return "danger";
      case "BORRADOR":
        return "warning";
      default:
        return null;
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    try {
      const date = new Date(fecha);
      return date.toLocaleString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fecha;
    }
  };

  const customizedMarker = (item) => {
    const estadoUpper = String(item.estado || "").toUpperCase();
    let bgColor = "bg-gray-400";

    switch (estadoUpper) {
      case "APROBADO":
        bgColor = "bg-green-500";
        break;
      case "ENVIADO":
        bgColor = "bg-blue-500";
        break;
      case "CORREGIR":
        bgColor = "bg-red-500";
        break;
      case "BORRADOR":
        bgColor = "bg-yellow-500";
        break;
    }

    return (
      <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center shadow-lg`}>
        <Clock className="w-4 h-4 text-white" />
      </div>
    );
  };

  const customizedContent = (item) => {
    return (
      <Card className="shadow-sm mb-3">
        <div className="space-y-2">
          {/* Estado y Fecha */}
          <div className="flex items-center justify-between">
            <Tag
              value={item.estado}
              severity={getSeverityForEstado(item.estado)}
              className="font-semibold"
            />
            <span className="text-sm text-gray-500">{formatFecha(item.fechaHora)}</span>
          </div>

          {/* Usuario */}
          {item.bombero && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{item.bombero}</span>
            </div>
          )}

          {/* Comentario */}
          {item.comentario && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700 mb-1">Comentario:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.comentario}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-4 text-gray-500">
          <i className="pi pi-spin pi-spinner text-2xl mb-2"></i>
          <p className="text-sm">Cargando historial...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-4 text-red-500">
          <i className="pi pi-exclamation-triangle text-2xl mb-2"></i>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (!historial || historial.length === 0) {
    return (
      <Card>
        <div className="text-center py-4 text-gray-500">
          <i className="pi pi-info-circle text-2xl mb-2"></i>
          <p className="text-sm">No hay historial de estados disponible</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="historial-estados-container">
      <Timeline
        value={historial}
        align="alternate"
        className="customized-timeline"
        marker={customizedMarker}
        content={customizedContent}
      />
    </div>
  );
}

HistorialEstados.propTypes = {
  incidenteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
