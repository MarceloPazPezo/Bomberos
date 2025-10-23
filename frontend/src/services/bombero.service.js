import axios from './root.service.js';
import { formatBomberoData, normalizeRutForBackend } from '@helpers/formatData.js';

export async function createBombero(bomberoData) {
    try {
        const response = await axios.post('/bombero/', bomberoData);
        return response.data;
    } catch (error) {
        return error.response?.data || error;
    }
}

export async function getBomberos() {
    try {
        // Enviamos todos los posibles estados para obtener todos los bomberos
        // Esto cumple con la validación del backend que requiere al menos un parámetro
        const { data } = await axios.get('/bombero/', {
            params: {
                // Usamos un rango de fechas muy amplio para obtener todos los registros
                creadoDesde: '2020-01-01',
                creadoHasta: '2030-12-31'
            }
        });
        const formattedData = data.data.map(formatBomberoData);
        return formattedData;
    } catch (error) {
        console.error('Error in getBomberos:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}

// ==================== FUNCIONALIDADES POR COMPAÑÍA ====================

/**
 * Obtiene la compañía del usuario autenticado
 */
export const getMiCompania = async () => {
  try {
    const response = await axios.get('/bombero/mi-compania');
    return response.data;
  } catch (error) {
    console.error('Error al obtener mi compañía:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener información de la compañía'
    };
  }
};

/**
 * Obtiene todos los bomberos de la compañía del usuario autenticado
 */
export const getBomberosMiCompania = async () => {
  try {
    const response = await axios.get('/bombero/mi-compania/bomberos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener bomberos de mi compañía:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener bomberos de la compañía'
    };
  }
};

/**
 * Obtiene estadísticas de bomberos de la compañía del usuario autenticado
 */
export const getEstadisticasMiCompania = async () => {
  try {
    const response = await axios.get('/bombero/mi-compania/estadisticas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de mi compañía:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener estadísticas de la compañía'
    };
  }
};

/**
 * Obtiene todos los bomberos de una compañía específica (solo para Administradores/Supervisores)
 */
export const getBomberosByCompania = async (idCompania) => {
  try {
    const response = await axios.get(`/bombero/compania/${idCompania}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener bomberos por compañía:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener bomberos de la compañía'
    };
  }
};

/**
 * Obtiene estadísticas de bomberos de una compañía específica (solo para Administradores/Supervisores)
 */
export const getEstadisticasBomberosCompania = async (idCompania) => {
  try {
    const response = await axios.get(`/bombero/compania/${idCompania}/estadisticas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas por compañía:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener estadísticas de la compañía'
    };
  }
};

/**
 * Obtiene bomberos de otras compañías (solo para Administradores/Supervisores)
 */
export const getBomberosOtrasCompanias = async () => {
  try {
    const response = await axios.get('/bombero/otras-companias');
    return response.data;
  } catch (error) {
    console.error('Error al obtener bomberos de otras compañías:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener bomberos de otras compañías'
    };
  }
};

// ==================== DETALLES COMPLETOS ====================

/**
 * Obtiene todos los detalles de un bombero en una sola consulta
 */
export const getBomberoDetalles = async (idBombero) => {
  try {
    const response = await axios.get(`/bombero/${idBombero}/detalles`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles completos del bombero:', error);
    throw error;
  }
};

// ==================== FUNCIONALIDADES UNIFICADAS ====================

/**
 * Crear bombero con ficha opcional (sin imagen)
 */
export async function createBomberoWithOptionalFicha(bomberoData, fichaData = null) {
    try {
        const response = await axios.post('/bombero/with-ficha', {
            bomberoData,
            fichaData
        });
        return response.data;
    } catch (error) {
        console.error('Error creating bombero with optional ficha:', error);
        return error.response?.data || { success: false, message: 'Error de conexión con el servidor' };
    }
}

/**
 * Crear bombero con ficha opcional e imagen de perfil
 */
export async function createBomberoWithImage(bomberoData, fichaData = null, profileImage = null) {
    try {
        const formData = new FormData();
        
        // Agregar datos del bombero
        formData.append('bomberoData', JSON.stringify(bomberoData));
        
        // Agregar datos de ficha si existen
        if (fichaData) {
            formData.append('fichaData', JSON.stringify(fichaData));
        }
        
        // Agregar imagen si existe
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        const response = await axios.post('/bombero/with-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating bombero with image:', error);
        return error.response?.data || { success: false, message: 'Error de conexión con el servidor' };
    }
}

/**
 * Obtener bombero completo con ficha (si existe)
 */
export async function getBomberoComplete(bomberoId) {
    try {
        const response = await axios.get(`/bombero/${bomberoId}/complete`);
        return response.data;
    } catch (error) {
        console.error('Error getting complete bombero:', error);
        return error.response?.data || { success: false, message: 'Error de conexión con el servidor' };
    }
}

/**
 * Obtener todos los bomberos con información de ficha
 */
export async function getAllBomberosWithFicha() {
    try {
        const response = await axios.get('/bombero/complete');
        return response.data;
    } catch (error) {
        console.error('Error getting all bomberos with ficha:', error);
        return error.response?.data || { success: false, message: 'Error de conexión con el servidor' };
    }
}

/**
 * Agregar ficha a un bombero existente
 */
export async function addFichaToBombero(bomberoId, fichaData) {
    try {
        const response = await axios.post(`/bombero/${bomberoId}/add-ficha`, {
            fichaData
        });
        return response.data;
    } catch (error) {
        console.error('Error adding ficha to bombero:', error);
        return error.response?.data || { success: false, message: 'Error de conexión con el servidor' };
    }
}

/**
 * Función inteligente que decide qué endpoint usar según los datos
 */
export async function createBomberoIntelligent(bomberoData, fichaData = null, profileImage = null) {
    // Si hay imagen de perfil, usar el endpoint con imagen
    if (profileImage) {
        return await createBomberoWithImage(bomberoData, fichaData, profileImage);
    }
    
    // Si hay datos de ficha, usar el endpoint con ficha
    if (fichaData) {
        return await createBomberoWithOptionalFicha(bomberoData, fichaData);
    }
    
    // Si solo hay datos básicos, usar el endpoint con ficha pero sin datos de ficha
    return await createBomberoWithOptionalFicha(bomberoData, null);
}

export async function updateBombero(bomberoData, run, id = null) {
    try {
        const normalizedRut = normalizeRutForBackend(run);
        console.log('DEBUG - updateBombero - run original:', run);
        console.log('DEBUG - updateBombero - run normalizado:', normalizedRut);
        console.log('DEBUG - updateBombero - id:', id);
        console.log('DEBUG - updateBombero - bomberoData original:', bomberoData);
        
        // Remover el RUN del bomberoData ya que va en la URL
        const { run: _, ...dataWithoutRun } = bomberoData;
        console.log('DEBUG - updateBombero - dataWithoutRun:', dataWithoutRun);
        
        // Usar la nueva ruta sin ID, solo con query parameters
        const response = await axios.patch(`/bombero/?run=${normalizedRut}`, dataWithoutRun);
        console.log('DEBUG - updateBombero - response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in updateBombero:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}

export async function deleteBombero(run, id = null) {
    try {
        const normalizedRut = normalizeRutForBackend(run);
        console.log('DEBUG - deleteBombero - run original:', run);
        console.log('DEBUG - deleteBombero - run normalizado:', normalizedRut);
        console.log('DEBUG - deleteBombero - id:', id);
        
        // Usar la nueva ruta sin ID, solo con query parameters
        const response = await axios.delete(`/bombero/?run=${normalizedRut}`);
        console.log('DEBUG - deleteBombero - response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in deleteBombero:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}

export async function changeBomberoEstado(idBombero, activo) {
    try {
        const response = await axios.patch(`/bombero/estado/${idBombero}`, { activo });
        return response.data;
    } catch (error) {
        return error.response?.data || error;
    }
}

//obtener bomberos por compañia
export async function getBomberosPorCompania(idCompania) {
    try {
        const { data } = await axios.get(`/bombero/compania/${idCompania}`);
        const formattedData = data.data.map(formatBomberoData);
        return formattedData.data;
    } catch (error) {
        console.error('Error in getBomberosPorCompania:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}
//obtener bomberos con licencias
export async function getBomberosConLicencias(idCompania) {
    try {
        const { data } = await axios.get(`/bombero/licencias/${idCompania}`);
        const formattedData = data.data.map(formatBomberoData);
        console.log("formattedData", formattedData);
        return formattedData;
    } catch (error) {
        console.error('Error in getBomberosConLicencias:', error);
        return error.response?.data || { status: 'Error', message: 'Error de conexión con el servidor' };
    }
}