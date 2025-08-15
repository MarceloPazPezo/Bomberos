import axios from './root.service';

export async function crearParteEmergencia(payload) {
  // payload = { general, afectados, compania, asistencia }
  console.log("Servicio crearParteEmergencia llamado con payload:", payload);
  const { data } = await axios.post('/parteEmergencia/paso1', payload);
  return data;
}

export async function listarPartesEmergencia(params = {}) {
  const { data } = await axios.get('/parteEmergencia/', { params });
  return data?.data || [];
}

export async function obtenerParteEmergencia(id) {
  const { data } = await axios.get(`/parteEmergencia/${id}`);
  return data?.data;
}
