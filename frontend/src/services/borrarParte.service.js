import axios from './root.service.js';

// Borra un incidente por id. Backend valida que el último estado sea BORRADOR o CORREGIR.
export const borrarIncidente = async (idIncidente) => {
  if (!Number.isFinite(Number(idIncidente))) throw new Error('Id inválido');
  try {
    const resp = await axios.delete(`/parteEmergencia/incidente/${idIncidente}`);
    return resp.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export default { borrarIncidente };