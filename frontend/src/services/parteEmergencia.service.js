import axios from './root.service';

export async function crearParteEmergencia(payload) {
  
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


export const actualizarPaso2ParteEmergencia = async (payload) => {
  try {
    const res = await axios.post('/parteEmergencia/paso2', payload);
    // Tu controlador devuelve handleSuccess 200 con mensaje
    return res.data;
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Error desconocido al actualizar Paso 2";
    console.error("actualizarPaso2ParteEmergencia:", error);
    throw new Error(msg);
  }
};