import axios from './root.service.js';


export async function getHistorialCompania(idCompania, fechaInicio = null, fechaFin = null) {
  try {
    const params = {};
    // Convertir de milisegundos a segundos para PostgreSQL
    if (fechaInicio) params.fechaInicio = Math.floor(fechaInicio / 1000);
    if (fechaFin) params.fechaFin = Math.floor(fechaFin / 1000);
    
    const response = await axios.get(`/historial/compania/${idCompania}`, { params });
    console.log("Historial Compania Response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el historial de la compañía:', error);
    throw error;
  }
}

export async function getHistorialVoluntario(idBombero) {
  try {
    const response = await axios.get(`/historial/voluntario/${idBombero}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el historial del voluntario:', error);
    throw error;
  }
}

export async function getKpiAsistenciaVoluntario(idBombero, fechaInicio = null, fechaFin = null) {
  try {
    const params = {};
    // Convertir de milisegundos a segundos para PostgreSQL
    if (fechaInicio) params.fechaInicio = Math.floor(fechaInicio / 1000);
    if (fechaFin) params.fechaFin = Math.floor(fechaFin / 1000);
    
    const response = await axios.get(`/historial/voluntario/${idBombero}/kpi-asistencia`, { params });
    console.log("KPI Asistencia Voluntario Response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el KPI de asistencia del voluntario:', error);
    throw error;
  }
}

export async function getKpiResponsabilidadesVoluntario(idBombero, fechaInicio = null, fechaFin = null) {
  try {
    const params = {};
    // Convertir de milisegundos a segundos para PostgreSQL
    if (fechaInicio) params.fechaInicio = Math.floor(fechaInicio / 1000);
    if (fechaFin) params.fechaFin = Math.floor(fechaFin / 1000);
    
    const response = await axios.get(`/historial/voluntario/${idBombero}/kpi-responsabilidades`, { params });
    console.log("KPI Responsabilidades Voluntario Response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el KPI de responsabilidades del voluntario:', error);
    throw error;
  }
}

export async function getResumenActividadVoluntario(idBombero, fechaInicio = null, fechaFin = null) {
  try {
    const params = {};
    // Convertir de milisegundos a segundos para PostgreSQL
    if (fechaInicio) params.fechaInicio = Math.floor(fechaInicio / 1000);
    if (fechaFin) params.fechaFin = Math.floor(fechaFin / 1000);
    
    const response = await axios.get(`/historial/voluntario/${idBombero}/resumen-actividad`, { params });
    console.log("Resumen Actividad Voluntario Response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el resumen de actividad del voluntario:', error);
    throw error;
  }
}

export async function getHeatmapDisponibilidadVoluntario(idBombero, fechaInicio, fechaFin) {
  try {
    const params = {};
    // Convertir de milisegundos a segundos para PostgreSQL
    if (fechaInicio) params.fechaInicio = Math.floor(fechaInicio / 1000);
    if (fechaFin) params.fechaFin = Math.floor(fechaFin / 1000);
    
    const response = await axios.get(`/historial/voluntario/${idBombero}/heatmap-disponibilidad`, { params });
    console.log("Heatmap Disponibilidad Voluntario Response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el heatmap de disponibilidad del voluntario:', error);
    throw error;
  }
}