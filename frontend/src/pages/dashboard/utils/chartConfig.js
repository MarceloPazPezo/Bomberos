/**
 * Configuraciones de Chart.js para gráficos del dashboard
 */

export const getIncidentesPorDiaChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        color: '#2C3E50',
      },
    },
    title: {
      display: true,
      text: 'Incidentes por Día de la Semana',
      font: {
        size: 16,
        weight: 'bold',
        family: "'Inter', sans-serif",
      },
      color: '#2C3E50',
      padding: {
        top: 10,
        bottom: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(44, 62, 80, 0.9)',
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        color: '#64748b',
        font: {
          size: 12,
        },
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      ticks: {
        color: '#64748b',
        font: {
          size: 12,
        },
      },
      grid: {
        display: false,
      },
    },
  },
});

/**
 * Función para procesar datos de incidentes por día
 */
export const processIncidentesPorDiaData = (responseData) => {
  if (!responseData || !Array.isArray(responseData)) {
    return null;
  }

  const labels = responseData.map(item => 
    item.dia.charAt(0).toUpperCase() + item.dia.slice(1)
  );
  const valores = responseData.map(item => item.cantidad);
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'Cantidad de Incidentes',
        data: valores,
        backgroundColor: 'rgba(78, 185, 250, 0.6)',
        borderColor: 'rgba(78, 185, 250, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };
};

/**
 * Configuraciones de Chart.js para gráfico de incidentes por mes
 */
export const getIncidentesPorMesChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        color: '#2C3E50',
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(44, 62, 80, 0.9)',
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        color: '#64748b',
        font: {
          size: 12,
        },
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      ticks: {
        color: '#64748b',
        font: {
          size: 12,
        },
      },
      grid: {
        display: false,
      },
    },
  },
});

/**
 * Función para procesar datos de incidentes por mes
 */
export const processIncidentesPorMesData = (responseData) => {
  if (!responseData || !Array.isArray(responseData)) {
    return null;
  }

  const labels = responseData.map(item => 
    item.mes.charAt(0).toUpperCase() + item.mes.slice(1)
  );
  const valores = responseData.map(item => item.cantidad);
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'Cantidad de Incidentes',
        data: valores,
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };
};

/**
 * Configuraciones de Chart.js para diagrama de Pareto de claves radiales
 */
export const getClavesRadialesChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  layout: {
    padding: {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 6,
        font: {
          size: 9,
          family: "'Inter', sans-serif",
        },
        color: '#2C3E50',
        boxWidth: 6,
        boxHeight: 6,
      },
    },
    title: {
      display: true,
      text: 'Diagrama de Pareto - Claves Radiales',
      font: {
        size: 12,
        weight: 'bold',
        family: "'Inter', sans-serif",
      },
      color: '#2C3E50',
      padding: {
        top: 2,
        bottom: 8,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(44, 62, 80, 0.9)',
      titleFont: {
        size: 12,
      },
      bodyFont: {
        size: 11,
      },
      padding: 8,
      cornerRadius: 6,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.parsed.y || context.parsed.x || 0;
          
          if (context.dataset.type === 'line') {
            return `${label}: ${value.toFixed(2)}%`;
          }
          return `${label}: ${value}`;
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        color: '#64748b',
        font: {
          size: 9,
        },
        padding: 2,
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      title: {
        display: true,
        text: 'Cantidad de Incidentes',
        color: '#64748b',
        font: {
          size: 10,
          weight: 'bold',
        },
        padding: {
          top: 3,
          bottom: 0,
        },
      },
    },
    y: {
      ticks: {
        color: '#64748b',
        font: {
          size: 8,
        },
        padding: 2,
      },
      grid: {
        display: false,
      },
      title: {
        display: true,
        text: 'Clave Radial',
        color: '#64748b',
        font: {
          size: 10,
          weight: 'bold',
        },
        padding: {
          top: 0,
          bottom: 3,
        },
      },
    },
    y1: {
      type: 'linear',
      position: 'right',
      min: 0,
      max: 100,
      ticks: {
        color: '#dc2626',
        font: {
          size: 8,
        },
        padding: 2,
        callback: function(value) {
          return value + '%';
        },
      },
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: true,
        text: '% Acumulado',
        color: '#dc2626',
        font: {
          size: 10,
          weight: 'bold',
        },
        padding: {
          top: 0,
          bottom: 3,
        },
      },
    },
  },
});

/**
 * Función para procesar datos de claves radiales en formato Pareto
 */
export const processClavesRadialesData = (responseData) => {
  if (!responseData || !Array.isArray(responseData)) {
    return null;
  }

  // Filtrar solo las claves del Top-10 (rank <= 10) para la línea acumulada
  const top10Data = responseData.filter(item => item.mostrar_linea);
  const labels = responseData.map(item => item.clave || 'Sin clave');
  const cantidades = responseData.map(item => item.cantidad);
  
  // Preparar datos de porcentaje acumulado solo para Top-10
  const porcentajesAcumulados = responseData.map(item => 
    item.mostrar_linea ? parseFloat(item.porcentaje_acumulado) : null
  );
  
  // Generar colores degradados para las barras
  const colors = cantidades.map((_, index) => {
    const isOtros = responseData[index].clave === 'Otros';
    if (isOtros) {
      return 'rgba(156, 163, 175, 0.7)'; // Gris para "Otros"
    }
    const intensity = 1 - (index * 0.08);
    return `rgba(255, 152, 0, ${Math.max(intensity, 0.5)})`;
  });

  return {
    labels: labels,
    datasets: [
      {
        type: 'bar',
        label: 'Cantidad de Incidentes',
        data: cantidades,
        backgroundColor: colors,
        borderColor: 'rgba(255, 152, 0, 1)',
        borderWidth: 2,
        borderRadius: 6,
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'line',
        label: '% Acumulado',
        data: porcentajesAcumulados,
        borderColor: 'rgba(220, 38, 38, 1)',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgba(220, 38, 38, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        yAxisID: 'y1',
        order: 1,
        spanGaps: false, // No conectar puntos cuando hay null (Otros)
      },
    ],
  };
};

/**
 * Configuraciones de Chart.js para gráfico de franja horaria
 */
export const getFranjaHorariaChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        color: '#2C3E50',
      },
    },
    title: {
      display: true,
      text: 'Histograma y Polígono de Frecuencias',
      font: {
        size: 16,
        weight: 'bold',
        family: "'Inter', sans-serif",
      },
      color: '#2C3E50',
      padding: {
        top: 10,
        bottom: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(44, 62, 80, 0.9)',
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        title: function(context) {
          const label = context[0].label;
          return `Franja: ${label}:00 hrs`;
        },
        label: function(context) {
          if (context.dataset.type === 'bar') {
            return `Incidentes: ${context.parsed.y}`;
          }
          return null; // No mostrar tooltip duplicado para la línea
        },
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        color: '#64748b',
        font: {
          size: 12,
        },
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      title: {
        display: true,
        text: 'Cantidad de Incidentes',
        color: '#64748b',
        font: {
          size: 13,
          weight: 'bold',
        },
      },
    },
    x: {
      ticks: {
        color: '#64748b',
        font: {
          size: 11,
        },
      },
      grid: {
        display: false,
      },
      title: {
        display: true,
        text: 'Franja Horaria (cada 2 horas)',
        color: '#64748b',
        font: {
          size: 13,
          weight: 'bold',
        },
      },
    },
  },
});

/**
 * Función para procesar datos de incidentes por franja horaria
 */
export const processFranjaHorariaData = (responseData) => {
  if (!responseData || !Array.isArray(responseData)) {
    return null;
  }

  // Crear labels con formato "0-2", "2-4", "4-6", etc.
  const labels = responseData.map(item => 
    `${item.hora_inicio}-${item.hora_fin + 1}`
  );
  const valores = responseData.map(item => item.cantidad);
  
  // Generar colores con degradado según la cantidad (horas pico más intensas)
  const maxValue = Math.max(...valores);
  const colors = valores.map(value => {
    const intensity = maxValue > 0 ? (value / maxValue) * 0.6 + 0.4 : 0.4;
    return `rgba(156, 39, 176, ${intensity})`; // Purple/Morado
  });

  return {
    labels: labels,
    datasets: [
      {
        type: 'bar',
        label: 'Cantidad de Incidentes',
        data: valores,
        backgroundColor: colors,
        borderColor: 'rgba(156, 39, 176, 1)',
        borderWidth: 2,
        borderRadius: 4,
        order: 2,
      },
      {
        type: 'line',
        label: 'Tendencia',
        data: valores,
        borderColor: 'rgba(33, 150, 243, 1)', // Azul
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4, // Curvatura de la línea
        pointBackgroundColor: 'rgba(33, 150, 243, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        order: 1,
      },
    ],
  };
};

// ============================================
// Configuraciones para Gráficos de Eventos
// ============================================

/**
 * Configuración de Chart.js para gráfico de eventos por granularidad
 */
export const getEventosPorGranularidadChartOptions = (granularidad) => {
  const titles = {
    'semana': 'Eventos por Semana',
    'mes': 'Eventos por Mes',
    'año': 'Eventos por Año'
  };

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 13,
            family: "'Inter', sans-serif",
          },
          color: '#2C3E50',
        },
      },
      title: {
        display: true,
        text: titles[granularidad] || 'Eventos',
        font: {
          size: 16,
          weight: 'bold',
          family: "'Inter', sans-serif",
        },
        color: '#2C3E50',
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(44, 62, 80, 0.9)',
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} evento${value !== 1 ? 's' : ''}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#64748b',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          color: '#64748b',
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
    },
  };
};

/**
 * Procesa datos de eventos por granularidad
 */
export const processEventosPorGranularidadData = (responseData, granularidad) => {
  if (!responseData || !Array.isArray(responseData)) {
    return null;
  }

  let labels = [];
  // Aseguramos que todos los valores sean numéricos (evita warnings de PropTypes)
  const valores = responseData.map(item => {
    const raw = item.cantidad;
    const num = typeof raw === 'number' ? raw : parseFloat(raw);
    return Number.isFinite(num) ? num : 0;
  });

  // Procesar etiquetas según la granularidad
  if (granularidad === 'semana') {
    labels = responseData.map(item => {
      const year = item.año || item.year;
      const week = item.semana || item.week;
      return `Sem ${week} (${year})`;
    });
  } else if (granularidad === 'mes') {
    const meses = {
      1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
      7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'
    };
    labels = responseData.map(item => {
      const year = item.año || item.year;
      const month = item.mes || item.month;
      return `${meses[month]} ${year}`;
    });
  } else if (granularidad === 'año') {
    labels = responseData.map(item => {
      const year = item.año || item.year;
      return `${year}`;
    });
  }

  return {
    labels: labels,
    datasets: [
      {
        label: 'Cantidad de Eventos',
        data: valores,
        backgroundColor: 'rgba(139, 92, 246, 0.6)', // Púrpura
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };
};

// ============================================
// Gráfico: Eventos por Tipo
// ============================================

export const getEventosPorTipoChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        color: '#2C3E50',
      },
    },
    title: {
      display: true,
      text: 'Eventos por Tipo',
      font: {
        size: 16,
        weight: 'bold',
        family: "'Inter', sans-serif",
      },
      color: '#2C3E50',
      padding: {
        top: 10,
        bottom: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(44, 62, 80, 0.9)',
      titleFont: { size: 14 },
      bodyFont: { size: 13 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const v = ctx.parsed.y;
          return `Eventos: ${v}`;
        }
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        color: '#64748b',
        font: { size: 12 },
      },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
    x: {
      ticks: {
        color: '#64748b',
        font: { size: 12 },
        maxRotation: 45,
        minRotation: 0,
      },
      grid: { display: false },
    },
  },
});

export const processEventosPorTipoData = (responseData) => {
  if (!responseData || !Array.isArray(responseData)) return null;

  // Ordenar por cantidad desc para consistencia (si backend no lo hace)
  const sorted = [...responseData].sort((a,b) => b.cantidad - a.cantidad);

  const labels = sorted.map(item => (item.tipo || 'Sin tipo'));
  const valores = sorted.map(item => {
    const raw = item.cantidad;
    const num = typeof raw === 'number' ? raw : parseFloat(raw);
    return Number.isFinite(num) ? num : 0;
  });

  // Generar una paleta de colores suave
  const baseColor = [99, 102, 241]; // Indigo
  const colors = valores.map((_, idx) => {
    const factor = 0.5 + (idx / valores.length) * 0.4; // 0.5 → 0.9
    return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${factor.toFixed(2)})`;
  });

  return {
    labels,
    datasets: [
      {
        label: 'Eventos',
        data: valores,
        backgroundColor: colors,
        borderColor: 'rgba(99,102,241,1)',
        borderWidth: 2,
        borderRadius: 6,
      }
    ]
  };
};

// ============================================
// Gráfico: Promedio de Asistencia por Tipo de Evento (Barras Horizontales)
// ============================================

export const getPromedioAsistenciaPorTipoChartOptions = () => ({
  indexAxis: 'y', // Barras horizontales
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Promedio de Asistencia por Tipo de Evento',
      font: {
        size: 16,
        weight: 'bold',
        family: "'Inter', sans-serif",
      },
      color: '#2C3E50',
      padding: {
        top: 10,
        bottom: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(44, 62, 80, 0.9)',
      titleFont: { size: 14 },
      bodyFont: { size: 13 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const value = ctx.parsed.x;
          const dataIndex = ctx.dataIndex;
          const dataset = ctx.chart.data.datasets[0];
          const metadata = dataset.metadata?.[dataIndex] || {};
          
          const lines = [
            `Promedio: ${value.toFixed(2)} bomberos`,
          ];
          
          if (metadata.total_eventos) {
            lines.push(`Total eventos: ${metadata.total_eventos}`);
          }
          if (metadata.total_asistencias !== undefined) {
            lines.push(`Total asistencias: ${metadata.total_asistencias}`);
          }
          
          return lines;
        }
      }
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        color: '#64748b',
        font: { size: 12 },
      },
      grid: { color: 'rgba(0,0,0,0.05)' },
      title: {
        display: true,
        text: 'Promedio de Bomberos Asistentes',
        color: '#64748b',
        font: { size: 13, weight: 'bold' },
      },
    },
    y: {
      ticks: {
        color: '#64748b',
        font: { size: 12 },
        autoSkip: false,
      },
      grid: { display: false },
    },
  },
});

export const processPromedioAsistenciaPorTipoData = (responseData) => {
  if (!responseData || !Array.isArray(responseData)) return null;

  // Ya viene ordenado por promedio DESC desde el backend
  const labels = responseData.map(item => item.tipo || 'Sin tipo');
  const valores = responseData.map(item => {
    const raw = item.promedio_asistencia;
    const num = typeof raw === 'number' ? raw : parseFloat(raw);
    return Number.isFinite(num) ? num : 0;
  });

  // Guardar metadata para mostrar en tooltip
  const metadata = responseData.map(item => ({
    total_eventos: item.total_eventos || 0,
    total_asistencias: item.total_asistencias || 0,
  }));

  // Gradiente de color verde-azul
  const colors = valores.map((_, idx) => {
    const factor = 0.4 + (idx / valores.length) * 0.5; // 0.4 → 0.9
    return `rgba(34, 197, 94, ${factor.toFixed(2)})`; // Verde
  });

  return {
    labels,
    datasets: [
      {
        label: 'Promedio de Asistencia',
        data: valores,
        backgroundColor: colors,
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 6,
        metadata, // Guardar metadata para tooltip
      }
    ]
  };
};

// ============================================
// Gráfico: Tendencia Mensual de Asistencia (Línea)
// ============================================

export const getTendenciaMensualChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        font: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        color: '#2C3E50',
      },
    },
    title: {
      display: true,
      text: 'Tendencia Mensual de Asistencia a Eventos',
      font: {
        size: 16,
        weight: 'bold',
        family: "'Inter', sans-serif",
      },
      color: '#2C3E50',
      padding: {
        top: 10,
        bottom: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(44, 62, 80, 0.9)',
      titleFont: { size: 14 },
      bodyFont: { size: 13 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const value = ctx.parsed.y;
          const dataIndex = ctx.dataIndex;
          const dataset = ctx.chart.data.datasets[0];
          const metadata = dataset.metadata?.[dataIndex] || {};
          
          const lines = [
            `Total asistentes: ${value}`,
          ];
          
          if (metadata.total_eventos !== undefined) {
            lines.push(`Eventos realizados: ${metadata.total_eventos}`);
          }
          
          return lines;
        }
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        color: '#64748b',
        font: { size: 12 },
      },
      grid: { color: 'rgba(0,0,0,0.05)' },
      title: {
        display: true,
        text: 'Total de Asistentes',
        color: '#64748b',
        font: { size: 13, weight: 'bold' },
      },
    },
    x: {
      ticks: {
        color: '#64748b',
        font: { size: 12 },
        maxRotation: 45,
        minRotation: 0,
      },
      grid: { display: false },
      title: {
        display: true,
        text: 'Mes',
        color: '#64748b',
        font: { size: 13, weight: 'bold' },
      },
    },
  },
});

export const processTendenciaMensualData = (responseData) => {
  if (!responseData || !Array.isArray(responseData)) return null;

  // Crear etiquetas con formato "Mes Año"
  const labels = responseData.map(item => {
    const mes = item.mes_nombre || 'Sin mes';
    const año = item.año || '';
    return `${mes} ${año}`;
  });

  const valores = responseData.map(item => {
    const raw = item.total_asistentes;
    const num = typeof raw === 'number' ? raw : parseFloat(raw);
    return Number.isFinite(num) ? num : 0;
  });

  // Guardar metadata para tooltips
  const metadata = responseData.map(item => ({
    total_eventos: item.total_eventos || 0,
  }));

  return {
    labels,
    datasets: [
      {
        label: 'Asistentes',
        data: valores,
        borderColor: 'rgba(59, 130, 246, 1)', // Azul
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4, // Curva suave
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        metadata, // Guardar metadata para tooltip
      }
    ]
  };
};

/**
 * Configuración para el gráfico de evolución de eventos y asistentes
 * Gráfico de línea continua estilo valores financieros
 */
export const getEvolucionEventosChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false, // Ocultar leyenda para estilo más limpio
    },
    title: {
      display: true,
      text: 'Evolución de Asistencia a Eventos',
      font: { size: 16, weight: 'bold', family: "'Inter', sans-serif" },
      color: '#2C3E50',
      padding: { top: 10, bottom: 20 },
    },
    tooltip: {
      backgroundColor: 'rgba(44, 62, 80, 0.95)',
      titleFont: { size: 14 },
      bodyFont: { size: 13 },
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        title: (context) => {
          return `📅 ${context[0].label}`;
        },
        label: (context) => {
          const eventos = context.raw.eventos || 0;
          const asistentes = context.parsed.y;
          return [
            `Asistentes: ${asistentes}`,
            `Eventos: ${eventos}`
          ];
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#64748b',
        font: { size: 12 },
      },
      grid: { 
        color: 'rgba(148, 163, 184, 0.1)',
        drawBorder: false,
      },
      border: {
        display: false,
      },
    },
    x: {
      ticks: {
        color: '#64748b',
        font: { size: 11 },
        maxRotation: 0,
        minRotation: 0,
        autoSkip: true,
        maxTicksLimit: 10,
      },
      grid: { 
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
});

/**
 * Procesa datos de evolución de eventos y asistentes
 * Retorna un solo dataset con estilo de línea financiera
 */
export const processEvolucionEventosData = (responseData) => {
  if (!responseData || !Array.isArray(responseData)) return null;

  // Formatear fechas como etiquetas (dd/mm)
  const labels = responseData.map(item => {
    const fecha = new Date(item.fecha);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}`;
  });

  const totalAsistentes = responseData.map(item => {
    const raw = item.total_asistentes;
    const num = typeof raw === 'number' ? raw : parseFloat(raw);
    return Number.isFinite(num) ? num : 0;
  });

  return {
    labels,
    datasets: [
      {
        label: 'Asistentes',
        data: totalAsistentes,
        borderColor: 'rgba(16, 185, 129, 1)', // Verde
        backgroundColor: 'rgba(16, 185, 129, 0.05)', // Área muy sutil
        borderWidth: 2.5,
        fill: true,
        tension: 0, // Sin curva - líneas rectas
        pointRadius: 0, // Sin puntos visibles
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }
    ]
  };
};

