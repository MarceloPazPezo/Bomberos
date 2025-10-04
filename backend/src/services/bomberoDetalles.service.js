"use strict";
import { AppDataSource } from "../config/configDb.js";
import minioService from "./minio.service.js";
import { BUCKETS } from "../config/configMinIO.js";

/**
 * Servicio para obtener detalles completos de un bombero
 * Incluye: información básica, ficha, contactos de emergencia, capacitaciones, etc.
 */
export class BomberoDetallesService {
  
  /**
   * Obtiene todos los detalles de un bombero por su ID
   * @param {number} idBombero - ID del bombero
   * @returns {Promise<Array>} [datos, error]
   */
  static async getBomberoDetallesCompletos(idBombero) {
    try {
      console.log('🏠 BomberoDetallesService - getBomberoDetallesCompletos llamado con id:', idBombero);
      const bomberoRepository = AppDataSource.getRepository("Bombero");
      
      // Buscar bombero con todas las relaciones
      console.log('🏠 BomberoDetallesService - Buscando bombero con relaciones...');
      const bombero = await bomberoRepository.findOne({
        where: { id: idBombero },
        relations: [
          "fichaBombero",
          "fichaBombero.compania",
          "fichaBombero.direccion",
          "fichaBombero.direccion.comuna",
          "fichaBombero.direccion.comuna.region",
          "fichaBombero.tipoSangre",
          "fichaBombero.contactoEmergencia",
          "fichaBombero.contactoEmergencia.vinculo",
          "fichaBombero.capacitaciones",
          "fichaBombero.capacitaciones.tipoCapacitacion",
          "fichaBombero.eppAcargo",
          "fichaBombero.eppAcargo.epp",
          "fichaBombero.eppAcargo.epp.tipoEpp",
          "fichaBombero.eppAcargo.epp.estadosEpp",
          "roles",
          "asistenciasEvento",
          "asistenciasEvento.evento",
          "asistenciasIncidente",
          "asistenciasIncidente.incidente",
          "bomberosAccidentados"
        ]
      });

      if (!bombero) {
        console.log('🏠 BomberoDetallesService - Bombero no encontrado');
        return [null, "Bombero no encontrado"];
      }

      console.log('🏠 BomberoDetallesService - Bombero encontrado:', {
        id: bombero.id,
        nombre: bombero.nombres?.join(' ') + ' ' + bombero.apellidos?.join(' '),
        tieneFicha: !!bombero.fichaBombero,
        tieneDireccion: !!bombero.fichaBombero?.direccion
      });

      // Formatear datos del bombero
      const bomberoFormateado = await this.formatearBomberoCompleto(bombero);
      
      return [bomberoFormateado, null];
    } catch (error) {
      console.error("Error al obtener detalles del bombero:", error);
      return [null, "Error interno del servidor"];
    }
  }


  /**
   * Formatea los datos completos del bombero
   * @param {Object} bombero - Datos del bombero desde la BD
   * @returns {Promise<Object>} Datos formateados
   */
  static async formatearBomberoCompleto(bombero) {
    // Crear nombre completo
    let nombreCompleto = null;
    if (bombero.nombres && bombero.apellidos) {
      const nombres = Array.isArray(bombero.nombres) ? bombero.nombres.join(' ') : bombero.nombres;
      const apellidos = Array.isArray(bombero.apellidos) ? bombero.apellidos.join(' ') : bombero.apellidos;
      nombreCompleto = `${nombres} ${apellidos}`.trim();
    }

    // Calcular antigüedad en días
    let antiguedadDias = null;
    if (bombero.fichaBombero?.fechaIngreso) {
      antiguedadDias = Math.floor((new Date() - new Date(bombero.fichaBombero.fechaIngreso)) / (1000 * 60 * 60 * 24));
    }

    return {
      // Información básica
      id: bombero.id,
      nombres: bombero.nombres,
      apellidos: bombero.apellidos,
      run: bombero.run,
      email: bombero.email,
      nombreCompleto: nombreCompleto,
      activo: bombero.activo,
      creadoEl: bombero.creadoEl,
      actualizadoEl: bombero.actualizadoEl,
      roles: bombero.roles || [],

      // Información personal completa (incluye datos médicos)
      informacionPersonal: {
        // Datos básicos
        nombre: bombero.fichaBombero?.nombre || null,
        telefono: bombero.fichaBombero?.telefono || null,
        fechaNacimiento: bombero.fichaBombero?.fechaNacimiento || null,
        fechaIngreso: bombero.fichaBombero?.fechaIngreso || null,
        antiguedadDias: antiguedadDias,
        
        // Datos médicos/personales
        licenciaClaseF: bombero.fichaBombero?.licenciaClaseF || false,
        donante: bombero.fichaBombero?.donante || false,
        tipoSangre: bombero.fichaBombero?.tipoSangre ? {
          id: bombero.fichaBombero.tipoSangre.id,
          nombre: bombero.fichaBombero.tipoSangre.nombre
        } : null,
        
        // Fotos - Solo usar URL existente, no generar automáticamente
        fotoPerfilURL: bombero.fichaBombero?.fotoPerfilURL || null,
        fotoPerfilKEY: bombero.fichaBombero?.fotoPerfilKEY || null,

        // Compañía
        compania: bombero.fichaBombero?.compania ? {
          id: bombero.fichaBombero.compania.id,
          nombre: bombero.fichaBombero.compania.nombre,
          logoURL: bombero.fichaBombero.compania.logoURL
        } : null,

        // Dirección completa
        direccion: (() => {
          console.log('🏠 BomberoDetallesService - fichaBombero:', bombero.fichaBombero);
          console.log('🏠 BomberoDetallesService - direccion en ficha:', bombero.fichaBombero?.direccion);
          
          if (bombero.fichaBombero?.direccion) {
            const direccion = {
              id: bombero.fichaBombero.direccion.id,
              calle: bombero.fichaBombero.direccion.calle,
              numero: bombero.fichaBombero.direccion.numero,
              comuna: bombero.fichaBombero.direccion.comuna ? {
                id: bombero.fichaBombero.direccion.comuna.id,
                nombre: bombero.fichaBombero.direccion.comuna.nombre,
                region: bombero.fichaBombero.direccion.comuna.region ? {
                  id: bombero.fichaBombero.direccion.comuna.region.id,
                  nombre: bombero.fichaBombero.direccion.comuna.region.nombre
                } : null
              } : null
            };
            console.log('🏠 BomberoDetallesService - Dirección formateada:', direccion);
            return direccion;
          } else {
            console.log('🏠 BomberoDetallesService - No hay dirección en ficha');
            return null;
          }
        })()
      },

      // Contactos de emergencia
      contactosEmergencia: (bombero.fichaBombero?.contactoEmergencia || []).map(contacto => ({
        id: contacto.id,
        nombreCompleto: contacto.nombreCompleto,
        telefono: contacto.telefono,
        vinculo: contacto.vinculo ? {
          id: contacto.vinculo.id,
          nombre: contacto.vinculo.nombre
        } : null
      })),

      // Capacitaciones
      capacitaciones: (bombero.fichaBombero?.capacitaciones || []).map(cap => ({
        id: cap.id,
        descripcion: cap.descripcion,
        creadoEl: cap.creadoEl,
        tipoCapacitacion: cap.tipoCapacitacion ? {
          id: cap.tipoCapacitacion.id,
          nombre: cap.tipoCapacitacion.nombre,
          descripcion: cap.tipoCapacitacion.descripcion
        } : null
      })),

      // EPP a cargo
      eppAcargo: (bombero.fichaBombero?.eppAcargo || []).map(epp => ({
        id: epp.id,
        fechaAsignacion: epp.fechaAsignacion,
        epp: epp.epp ? {
          id: epp.epp.id,
          codigo: epp.epp.codigo,
          descripcion: epp.epp.descripcion,
          tipoEpp: epp.epp.tipoEpp ? {
            id: epp.epp.tipoEpp.id,
            nombre: epp.epp.tipoEpp.nombre
          } : null,
          estadosEpp: epp.epp.estadosEpp ? {
            id: epp.epp.estadosEpp.id,
            nombre: epp.epp.estadosEpp.nombre
          } : null
        } : null
      })),

      // Historial de actividades (combinado y ordenado)
      historialActividades: this.combinarHistorialActividades(bombero),

      // Estadísticas resumidas
      estadisticas: {
        tieneFicha: !!bombero.fichaBombero,
        activo: bombero.activo,
        totalRoles: bombero.roles?.length || 0,
        totalEventos: bombero.asistenciasEvento?.length || 0,
        totalIncidentes: bombero.asistenciasIncidente?.length || 0,
        totalAccidentes: bombero.bomberosAccidentados?.length || 0,
        tieneLicencia: bombero.fichaBombero?.licenciaClaseF || false,
        esDonante: bombero.fichaBombero?.donante || false,
        tieneContactosEmergencia: (bombero.fichaBombero?.contactoEmergencia?.length || 0) > 0,
        totalCapacitaciones: bombero.fichaBombero?.capacitaciones?.length || 0,
        totalEppAcargo: bombero.fichaBombero?.eppAcargo?.length || 0,
        antiguedadDias: antiguedadDias
      }
    };
  }

  /**
   * Combina y ordena el historial de actividades
   * @param {Object} bombero - Datos del bombero
   * @returns {Array} Historial ordenado por fecha
   */
  static combinarHistorialActividades(bombero) {
    const historial = [];

    // Asistencias a eventos
    if (bombero.asistenciasEvento) {
      bombero.asistenciasEvento.forEach(asistencia => {
        historial.push({
          id: `evento_${asistencia.id}`,
          tipo: 'evento',
          titulo: asistencia.evento ? asistencia.evento.nombre : 'Evento',
          fecha: asistencia.fecha,
          descripcion: asistencia.evento ? asistencia.evento.descripcion : null,
          estado: asistencia.estado || 'asistido'
        });
      });
    }

    // Asistencias a incidentes
    if (bombero.asistenciasIncidente) {
      bombero.asistenciasIncidente.forEach(asistencia => {
        historial.push({
          id: `incidente_${asistencia.id}`,
          tipo: 'incidente',
          titulo: asistencia.incidente ? `Incidente #${asistencia.incidente.id}` : 'Incidente',
          fecha: asistencia.fecha,
          descripcion: asistencia.incidente ? asistencia.incidente.descripcion : null,
          estado: asistencia.estado || 'asistido'
        });
      });
    }

    // Accidentes
    if (bombero.bomberosAccidentados) {
      bombero.bomberosAccidentados.forEach(accidente => {
        historial.push({
          id: `accidente_${accidente.id}`,
          tipo: 'accidente',
          titulo: 'Accidente reportado',
          fecha: accidente.fechaAccidente,
          descripcion: accidente.descripcionAccidente,
          estado: 'accidentado'
        });
      });
    }

    // Ordenar por fecha (más reciente primero)
    return historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  /**
   * Genera URL firmada para imagen de perfil si es necesario
   * @param {string} existingURL - URL existente (puede ser null o vacía)
   * @param {string} fotoKey - KEY del archivo en MinIO
   * @returns {Promise<string|null>} URL firmada o null
   */
  static async generateFotoPerfilURL(existingURL, fotoKey) {
    try {
      // Si ya hay una URL válida, usarla
      if (existingURL && existingURL.trim() !== '') {
        return existingURL;
      }
      
      // Si no hay KEY, no hay imagen
      if (!fotoKey || fotoKey.trim() === '') {
        return null;
      }
      
      // Generar URL firmada
      const signedUrl = await minioService.getSignedUrl(BUCKETS.PROFILES, fotoKey);
      return signedUrl;
    } catch (error) {
      console.error('Error generando URL de imagen de perfil:', error);
      return null;
    }
  }

}

export default BomberoDetallesService;
