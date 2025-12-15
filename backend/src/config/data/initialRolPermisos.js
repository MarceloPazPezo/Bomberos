"use strict";
import Rol from "../../entities/rol.entity.js";
import Permiso from "../../entities/permiso.entity.js";
import { AppDataSource } from "../configDb.js";
import { In } from "typeorm";
import logger from "../configLogger.js";

async function crearPermisos() {
  try {
    const permisoRepository = AppDataSource.getRepository(Permiso);
    const count = await permisoRepository.count();
    if (count > 0) {
      // Permisos ya existen, omitiendo creación
      return;
    }

    const permisosData = [
      {
        nombre: "bombero:obtener_perfil",
        descripcion: "Permite obtener el perfil del propio bombero",
        categoria: "Perfil",
        ruta: "/api/perfil",
        metodo: "GET",
      },
      {
        nombre: "bombero:actualizar_perfil",
        descripcion: "Permite actualizar el perfil del propio bombero",
        categoria: "Perfil",
        ruta: "/api/perfil",
        metodo: "PATCH",
      },
      {
        nombre: "bombero:cambiar_contrasena",
        descripcion: "Permite cambiar la contraseña del propio bombero",
        categoria: "Perfil",
        ruta: "/api/perfil/contrasena",
        metodo: "PATCH",
      },
      {
        nombre: "bombero:obtener",
        descripcion: "Permite obtener información de todos los bomberos",
        categoria: "Bomberos",
        ruta: "/api/bombero",
        metodo: "GET",
      },
      {
        nombre: "bombero:crear",
        descripcion: "Permite crear nuevos bomberos",
        categoria: "Bomberos",
        ruta: "/api/bombero",
        metodo: "POST",
      },
      {
        nombre: "bombero:obtener_especifico",
        descripcion:
          "Permite leer información especifica de un bombero especifico (ej. por ID)",
        categoria: "Bomberos",
        ruta: "/api/bombero/detalle/:id",
        metodo: "GET",
      },
      {
        nombre: "bombero:actualizar",
        descripcion: "Permite actualizar información de un bombero especifico",
        categoria: "Bomberos",
        ruta: "/api/bombero/detalle/:id",
        metodo: "PATCH",
      },
      {
        nombre: "bombero:eliminar",
        descripcion: "Permite eliminar bomberos",
        categoria: "Bomberos",
        ruta: "/api/bombero/detalle/:id",
        metodo: "DELETE",
      },
      {
        nombre: "bombero:cambiar_estado",
        descripcion: "Permite activar/desactivar bomberos",
        categoria: "Bomberos",
        ruta: "/api/bombero/estado/:id",
        metodo: "PATCH",
      },
      {
        nombre: "bombero:asignar_rol",
        descripcion: "Permite asignar/revocar roles a un bombero",
        categoria: "Bomberos",
        ruta: "/api/bombero/roles/:id",
        metodo: "PATCH",
      },
      {
        nombre: "bombero:admin",
        descripcion:
          "Permite administración completa de bomberos (crear, actualizar, eliminar, cambiar estado, asignar roles)",
        categoria: "Bomberos",
        ruta: "/api/bombero/*",
        metodo: "*",
      },
      {
        nombre: "disponibilidad:obtener",
        descripcion:
          "Permite obtener la disponibilidad de todos los voluntarios",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad",
        metodo: "GET",
      },
      {
        nombre: "disponibilidad:crear",
        descripcion: "Permite crear registros de disponibilidad",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad",
        metodo: "POST",
      },
      {
        nombre: "disponibilidad:actualizar",
        descripcion:
          "Permite actualizar registros de disponibilidad específicos",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad/detalle/:id",
        metodo: "PATCH",
      },
      {
        nombre: "disponibilidad:admin",
        descripcion:
          "Permite administración completa de disponibilidad (crear, actualizar, eliminar registros)",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad/*",
        metodo: "*",
      },
      {
        nombre: "compania:obtener",
        descripcion: "Permite obtener la lista de todas las compañías",
        categoria: "Compañía",
        ruta: "/api/compania",
        metodo: "GET",
      },
      {
        nombre: "compania:obtener_especifico",
        descripcion: "Permite obtener información de una compañía específica",
        categoria: "Compañía",
        ruta: "/api/compania/detalle/:id",
        metodo: "GET",
      },
      {
        nombre: "compania:bombero_pertenece",
        descripcion: "Permite obtener la compañía asociada a un bombero",
        categoria: "Compañía",
        ruta: "/api/compania/bombero/:idBombero",
        metodo: "GET",
      },
      {
        nombre: "region:obtener",
        descripcion: "Permite obtener la lista de todas las regiones",
        categoria: "Región",
        ruta: "/api/region",
        metodo: "GET",
      },
      {
        nombre: "comuna:obtener",
        descripcion: "Permite obtener la lista de todas las comunas",
        categoria: "Comuna",
        ruta: "/api/comuna",
        metodo: "GET",
      },
      {
        nombre: "permiso:obtener",
        descripcion: "Permite consultar la lista de permisos del sistema",
        categoria: "Permiso",
        ruta: "/api/permiso",
        metodo: "GET",
      },
      {
        nombre: "permiso:admin",
        descripcion:
          "Permiso especial de administrador para la gestion total de permisos",
        categoria: "Administración",
        ruta: "*",
        metodo: "*",
      },
      {
        nombre: "rol:obtener",
        descripcion: "Permite consultar la lista de roles del sistema",
        categoria: "Rol",
        ruta: "/api/rol",
        metodo: "GET",
      },
      {
        nombre: "rol:admin",
        descripcion:
          "Permiso especial de administrador para la gestion total de roles",
        categoria: "Administración",
        ruta: "*",
        metodo: "*",
      },
      {
        nombre: "region:admin",
        descripcion:
          "Permiso especial de administrador para la gestion total de regiones",
        categoria: "Administración",
        ruta: "*",
        metodo: "*",
      },
      {
        nombre: "comuna:admin",
        descripcion:
          "Permiso especial de administrador para la gestion total de comunas",
        categoria: "Administración",
        ruta: "*",
        metodo: "*",
      },
      {
        nombre: "compania:admin",
        descripcion:
          "Permiso especial de administrador para la gestion total de compañias",
        categoria: "Administración",
        ruta: "*",
        metodo: "*",
      },
      {
        nombre: "tipo_sangre:obtener",
        descripcion: "Permite obtener la lista de tipos de sangre",
        categoria: "Tipos de Sangre",
        ruta: "/api/tipo-sangre",
        metodo: "GET",
      },
      {
        nombre: "direccion:crear",
        descripcion: "Permite crear direcciones",
        categoria: "Ubicación",
        ruta: "/api/direccion",
        metodo: "POST",
      },
      {
        nombre: "direccion:obtener",
        descripcion: "Permite obtener direcciones",
        categoria: "Ubicación",
        ruta: "/api/direccion",
        metodo: "GET",
      },
      {
        nombre: "direccion:actualizar",
        descripcion: "Permite actualizar direcciones",
        categoria: "Ubicación",
        ruta: "/api/direccion",
        metodo: "PATCH",
      },
      {
        nombre: "direccion:eliminar",
        descripcion: "Permite eliminar direcciones",
        categoria: "Ubicación",
        ruta: "/api/direccion",
        metodo: "DELETE",
      },
      {
        nombre: "estadoCivil:obtener",
        descripcion: "Permite obtener información de todos los estados civiles",
        categoria: "Estados Civiles",
        ruta: "/api/estado-civil",
        metodo: "GET",
      },
      {
        nombre: "estadoCivil:admin",
        descripcion: "Permite administración completa de estados civiles (crear, actualizar, eliminar)",
        categoria: "Estados Civiles",
        ruta: "/api/estado-civil/*",
        metodo: "*",
      },
      {
        nombre: "servicio:obtener",
        descripcion: "Permite obtener información de todos los servicios",
        categoria: "Servicios",
        ruta: "/api/servicios",
        metodo: "GET",
      },
      {
        nombre: "servicio:admin",
        descripcion: "Permite administración completa de servicios (crear, actualizar, eliminar)",
        categoria: "Servicios",
        ruta: "/api/servicios/*",
        metodo: "*",
      },
      {
        nombre: "carro:obtener",
        descripcion: "Permite obtener información de todos los carros",
        categoria: "Carros",
        ruta: "/api/carros",
        metodo: "GET",
      },
      {
        nombre: "carro:admin",
        descripcion: "Permite administración completa de carros (crear, actualizar, eliminar)",
        categoria: "Carros",
        ruta: "/api/carros/*",
        metodo: "*",
      },
      {
        nombre: "epp:obtener",
        descripcion: "Permite obtener información de todos los EPP",
        categoria: "EPP",
        ruta: "/api/epp",
        metodo: "GET",
      },
      {
        nombre: "epp:crear",
        descripcion: "Permite crear nuevos EPP",
        categoria: "EPP",
        ruta: "/api/epp",
        metodo: "POST",
      },
      {
        nombre: "epp:obtener_especifico",
        descripcion: "Permite obtener información específica de un EPP",
        categoria: "EPP",
        ruta: "/api/epp/detalle/:id",
        metodo: "GET",
      },
      {
        nombre: "epp:actualizar",
        descripcion: "Permite actualizar información de un EPP específico",
        categoria: "EPP",
        ruta: "/api/epp/detalle/:id",
        metodo: "PATCH",
      },
      {
        nombre: "epp:eliminar",
        descripcion: "Permite eliminar EPP",
        categoria: "EPP",
        ruta: "/api/epp/detalle/:id",
        metodo: "DELETE",
      },
      {
        nombre: "epp:cambiar_estado",
        descripcion: "Permite cambiar el estado de un EPP",
        categoria: "EPP",
        ruta: "/api/epp/estado/:id",
        metodo: "PATCH",
      },
      {
        nombre: "epp:asignar",
        descripcion: "Permite asignar EPP a bomberos",
        categoria: "EPP",
        ruta: "/api/epp/asignar/:id",
        metodo: "PATCH",
      },
      {
        nombre: "epp:admin",
        descripcion: "Permite administración completa de EPP (crear, actualizar, eliminar, cambiar estado, asignar)",
        categoria: "EPP",
        ruta: "/api/epp/*",
        metodo: "*",
      },
      {
        nombre: "tipo_epp:obtener",
        descripcion: "Permite obtener la lista de tipos de EPP",
        categoria: "Tipos de EPP",
        ruta: "/api/tipo-epp",
        metodo: "GET",
      },
      {
        nombre: "tipo_epp:admin",
        descripcion: "Permite administración completa de tipos de EPP (crear, actualizar, eliminar)",
        categoria: "Tipos de EPP",
        ruta: "/api/tipo-epp/*",
        metodo: "*",
      },
      {
        nombre: "estado_epp:obtener",
        descripcion: "Permite obtener la lista de estados de EPP",
        categoria: "Estados de EPP",
        ruta: "/api/estado-epp",
        metodo: "GET",
      },
      {
        nombre: "estado_epp:admin",
        descripcion: "Permite administración completa de estados de EPP (crear, actualizar, eliminar)",
        categoria: "Estados de EPP",
        ruta: "/api/estado-epp/*",
        metodo: "*",
      },
      {
        nombre: "vinculo:obtener",
        descripcion: "Permite obtener la lista de vínculos",
        categoria: "Vínculos",
        ruta: "/api/vinculo",
        metodo: "GET",
      },
      {
        nombre: "vinculo:admin",
        descripcion: "Permite administración completa de vínculos (crear, actualizar, eliminar)",
        categoria: "Vínculos",
        ruta: "/api/vinculo/*",
        metodo: "*",
      },
      {
        nombre: "clave_radial:obtener",
        descripcion: "Permite obtener la lista de claves radiales",
        categoria: "Claves Radiales",
        ruta: "/api/clave-radial",
        metodo: "GET",
      },
      {
        nombre: "clave_radial:admin",
        descripcion: "Permite administración completa de claves radiales (crear, actualizar, eliminar)",
        categoria: "Claves Radiales",
        ruta: "/api/clave-radial/*",
        metodo: "*",
      },
      {
        nombre: "subtipo_incidente:obtener",
        descripcion: "Permite obtener la lista de subtipos de incidente",
        categoria: "Subtipos de Incidente",
        ruta: "/api/subtipoIncidente",
        metodo: "GET",
      },
      {
        nombre: "subtipo_incidente:admin",
        descripcion: "Permite administración completa de subtipos de incidente (crear, actualizar, eliminar)",
        categoria: "Subtipos de Incidente",
        ruta: "/api/subtipoIncidente/*",
        metodo: "*",
      },
      {
        nombre: "clasificacion_emergencia:obtener",
        descripcion: "Permite obtener la lista de clasificaciones de emergencia",
        categoria: "Clasificaciones de Emergencia",
        ruta: "/api/clasificacion-emergencia",
        metodo: "GET",
      },
      {
        nombre: "clasificacion_emergencia:admin",
        descripcion: "Permite administración completa de clasificaciones de emergencia (crear, actualizar, eliminar)",
        categoria: "Clasificaciones de Emergencia",
        ruta: "/api/clasificacion-emergencia/*",
        metodo: "*",
      },
      {
        nombre: "tipoEvento:obtener",
        descripcion: "Permite obtener la lista de tipos de evento",
        categoria: "Tipos de Evento",
        ruta: "/api/tipo-evento",
        metodo: "GET",
      },
      {
        nombre: "tipoEvento:admin",
        descripcion: "Permite administración completa de tipos de evento (crear, actualizar, eliminar)",
        categoria: "Tipos de Evento",
        ruta: "/api/tipo-evento/*",
        metodo: "*",
      },
      {
        nombre: "evento:obtener",
        descripcion: "Permite obtener la lista de eventos del calendario",
        categoria: "Eventos del Calendario",
        ruta: "/api/calendario/eventos",
        metodo: "GET",
      },
      {
        nombre: "evento:crear",
        descripcion: "Permite crear eventos en el calendario",
        categoria: "Eventos del Calendario",
        ruta: "/api/calendario/eventos",
        metodo: "POST",
      },
      {
        nombre: "evento:actualizar",
        descripcion: "Permite actualizar eventos del calendario",
        categoria: "Eventos del Calendario",
        ruta: "/api/calendario/eventos/*",
        metodo: "PUT",
      },
      {
        nombre: "evento:eliminar",
        descripcion: "Permite eliminar eventos del calendario",
        categoria: "Eventos del Calendario",
        ruta: "/api/calendario/eventos/*",
        metodo: "DELETE",
      },
      {
        nombre: "evento:admin",
        descripcion: "Permite administración completa de eventos del calendario (crear, actualizar, eliminar)",
        categoria: "Eventos del Calendario",
        ruta: "/api/calendario/eventos/*",
        metodo: "*",
      },
      {
        nombre: "capacitacion:obtener",
        descripcion: "Permite obtener la lista de tipos de capacitación",
        categoria: "Tipos de Capacitación",
        ruta: "/api/tipo-capacitacion",
        metodo: "GET",
      },
      {
        nombre: "capacitacion:admin",
        descripcion: "Permite administración completa de tipos de capacitación (crear, actualizar, eliminar)",
        categoria: "Tipos de Capacitación",
        ruta: "/api/tipo-capacitacion/*",
        metodo: "*",
      },
      {
        nombre: "parte_emergencia:crear",
        descripcion: "Permite crear/redactar partes de emergencia",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia",
        metodo: "POST",
      },
      {
        nombre: "parte_emergencia:obtener",
        descripcion: "Permite obtener partes de emergencia (generalmente de la compañía del usuario)",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia",
        metodo: "GET",
      },
      {
        nombre: "parte_emergencia:actualizar",
        descripcion: "Permite actualizar partes de emergencia (solo si no están ENVIADO/APROBADO)",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia/:id",
        metodo: "PUT",
      },
      {
        nombre: "parte_emergencia:eliminar",
        descripcion: "Permite eliminar partes de emergencia",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia/incidente/:id",
        metodo: "DELETE",
      },
      {
        nombre: "parte_emergencia:revisar",
        descripcion: "Permite ver partes enviados para revisión, aprobar y rechazar partes",
        categoria: "Partes de Emergencia",
        ruta: "/api/incidentes/revision",
        metodo: "GET",
      },
      {
        nombre: "parte_emergencia:generar_pdf",
        descripcion: "Permite generar PDF de partes de emergencia",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia/:id/reporte/pdf",
        metodo: "POST",
      },
      {
        nombre: "parte_emergencia:admin",
        descripcion: "Permite administración completa de partes de emergencia (incluye todos los permisos anteriores)",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia/*",
        metodo: "*",
      },
      {
        nombre: "tipoPunto:obtener",
        descripcion: "Permite obtener la lista de tipos de punto",
        categoria: "Puntos Geográficos",
        ruta: "/api/tipos-punto",
        metodo: "GET",
      },
      {
        nombre: "tipoPunto:crear",
        descripcion: "Permite crear tipos de punto",
        categoria: "Puntos Geográficos",
        ruta: "/api/tipos-punto",
        metodo: "POST",
      },
      {
        nombre: "tipoPunto:actualizar",
        descripcion: "Permite actualizar tipos de punto",
        categoria: "Puntos Geográficos",
        ruta: "/api/tipos-punto/:id",
        metodo: "PATCH",
      },
      {
        nombre: "tipoPunto:eliminar",
        descripcion: "Permite eliminar tipos de punto",
        categoria: "Puntos Geográficos",
        ruta: "/api/tipos-punto/:id",
        metodo: "DELETE",
      },
      {
        nombre: "tipoPunto:admin",
        descripcion: "Permite administración completa de tipos de punto",
        categoria: "Puntos Geográficos",
        ruta: "/api/tipos-punto/*",
        metodo: "*",
      },
      {
        nombre: "puntoGeografico:obtener",
        descripcion: "Permite obtener la lista de puntos geográficos",
        categoria: "Puntos Geográficos",
        ruta: "/api/puntos-geograficos",
        metodo: "GET",
      },
      {
        nombre: "puntoGeografico:crear",
        descripcion: "Permite crear puntos geográficos",
        categoria: "Puntos Geográficos",
        ruta: "/api/puntos-geograficos",
        metodo: "POST",
      },
      {
        nombre: "puntoGeografico:actualizar",
        descripcion: "Permite actualizar puntos geográficos",
        categoria: "Puntos Geográficos",
        ruta: "/api/puntos-geograficos/:id",
        metodo: "PATCH",
      },
      {
        nombre: "puntoGeografico:eliminar",
        descripcion: "Permite eliminar puntos geográficos",
        categoria: "Puntos Geográficos",
        ruta: "/api/puntos-geograficos/:id",
        metodo: "DELETE",
      },
      {
        nombre: "puntoGeografico:admin",
        descripcion: "Permite administración completa de puntos geográficos",
        categoria: "Puntos Geográficos",
        ruta: "/api/puntos-geograficos/*",
        metodo: "*",
      },
      {
        nombre: "jurisdiccion:obtener",
        descripcion: "Permite obtener la lista de jurisdicciones",
        categoria: "Puntos Geográficos",
        ruta: "/api/jurisdicciones",
        metodo: "GET",
      },
      {
        nombre: "jurisdiccion:crear",
        descripcion: "Permite crear jurisdicciones",
        categoria: "Puntos Geográficos",
        ruta: "/api/jurisdicciones",
        metodo: "POST",
      },
      {
        nombre: "jurisdiccion:actualizar",
        descripcion: "Permite actualizar jurisdicciones",
        categoria: "Puntos Geográficos",
        ruta: "/api/jurisdicciones/:id",
        metodo: "PATCH",
      },
      {
        nombre: "jurisdiccion:eliminar",
        descripcion: "Permite eliminar jurisdicciones",
        categoria: "Puntos Geográficos",
        ruta: "/api/jurisdicciones/:id",
        metodo: "DELETE",
      },
      {
        nombre: "jurisdiccion:admin",
        descripcion: "Permite administración completa de jurisdicciones",
        categoria: "Puntos Geográficos",
        ruta: "/api/jurisdicciones/*",
        metodo: "*",
      },
      {
        nombre: "historial:obtener",
        descripcion: "Permite obtener el historial de actividad de bomberos y compañía",
        categoria: "Historial",
        ruta: "/api/historial/*",
        metodo: "GET",
      },
      {
        nombre: "historial:admin",
        descripcion: "Permite administración completa del historial",
        categoria: "Historial",
        ruta: "/api/historial/*",
        metodo: "*",
      },
      {
        nombre: "notification:enviar_sistema",
        descripcion: "Permite enviar notificaciones a nivel de sistema",
        categoria: "Notificaciones",
        ruta: "/api/notification/send-system",
        metodo: "POST",
      },
      {
        nombre: "notification:enviar_rol",
        descripcion: "Permite enviar notificaciones a roles específicos",
        categoria: "Notificaciones",
        ruta: "/api/notification/send-rol",
        metodo: "POST",
      },
      {
        nombre: "notification:estadisticas",
        descripcion: "Permite ver estadísticas de notificaciones",
        categoria: "Notificaciones",
        ruta: "/api/notification/stats",
        metodo: "GET",
      },
      {
        nombre: "notification:admin",
        descripcion: "Permite administración completa de notificaciones",
        categoria: "Notificaciones",
        ruta: "/api/notification/*",
        metodo: "*",
      },
      {
        nombre: "file:upload",
        descripcion: "Permite subir archivos especiales (tiles, documentos)",
        categoria: "Archivos",
        ruta: "/api/file/upload/*",
        metodo: "POST",
      },
      {
        nombre: "file:delete",
        descripcion: "Permite eliminar archivos del sistema",
        categoria: "Archivos",
        ruta: "/api/file/:bucket/:fileName",
        metodo: "DELETE",
      },
      {
        nombre: "file:admin",
        descripcion: "Permite administración completa de archivos",
        categoria: "Archivos",
        ruta: "/api/file/*",
        metodo: "*",
      },
    ];

    const permisos = permisosData.map((p) => permisoRepository.create(p));
    await permisoRepository.save(permisos);
    logger.info("[SERVER] Permisos creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearPermisos" });
    throw error;
  }
}

async function crearRoles() {
  try {
    const roleRepository = AppDataSource.getRepository(Rol);
    const permisoRepository = AppDataSource.getRepository(Permiso);

    const count = await roleRepository.count();
    if (count > 0) {
      // Roles ya existen, omitiendo creación
      return;
    }

    const rolesData = [
      {
        nombre: "Voluntario",
        descripcion: "Rol básico para bomberos voluntarios. Permisos mínimos para operación diaria.",
        permisoNames: [
          // Perfil básico
          "bombero:obtener",
          "bombero:obtener_perfil",
          "bombero:actualizar_perfil",
          "bombero:cambiar_contrasena",
          // Disponibilidad operativa
          "disponibilidad:obtener",
          "disponibilidad:crear",
          "disponibilidad:actualizar",
          // Partes de emergencia
          "parte_emergencia:crear",
          "parte_emergencia:obtener",
          "parte_emergencia:actualizar",
          // Historial
          "historial:obtener",
          // Consultas básicas necesarias
          "compania:obtener",
          "compania:obtener_especifico",
          "compania:bombero_pertenece",
          "region:obtener",
          "comuna:obtener",
          "tipo_sangre:obtener",
          "direccion:crear",
          "direccion:obtener",
          "direccion:actualizar",
          "estadoCivil:obtener",
          "vinculo:obtener",
          "clave_radial:obtener",
          "subtipo_incidente:obtener",
          "clasificacion_emergencia:obtener",
          "epp:obtener",
          "tipo_epp:obtener",
          "estado_epp:obtener",
          "servicio:obtener",
          "carro:obtener",
          "capacitacion:obtener",
          "tipoEvento:obtener",
          "evento:obtener",
          "puntoGeografico:obtener",
          "tipoPunto:obtener",
          "jurisdiccion:obtener",
        ],
      },
      {
        nombre: "Directiva",
        descripcion: "Rol para miembros de la directiva con permisos intermedios de gestión.",
        permisoNames: [
          // Todos los permisos de Voluntario
          "bombero:obtener_perfil",
          "bombero:actualizar_perfil",
          "bombero:cambiar_contrasena",
          "disponibilidad:obtener",
          "disponibilidad:crear",
          "disponibilidad:actualizar",
          "parte_emergencia:crear",
          "parte_emergencia:obtener",
          "parte_emergencia:actualizar",
          "compania:obtener",
          "compania:bombero_pertenece",
          "region:obtener",
          "comuna:obtener",
          "tipo_sangre:obtener",
          "direccion:crear",
          "direccion:obtener",
          "direccion:actualizar",
          "estadoCivil:obtener",
          "vinculo:obtener",
          "clave_radial:obtener",
          "subtipo_incidente:obtener",
          "clasificacion_emergencia:obtener",
          "epp:obtener",
          "tipo_epp:obtener",
          "estado_epp:obtener",
          "servicio:obtener",
          "carro:obtener",
          "capacitacion:obtener",
          "tipoEvento:obtener",
          "evento:obtener",
          "puntoGeografico:obtener",
          "tipoPunto:obtener",
          "jurisdiccion:obtener",
          // Permisos adicionales de Directiva
          "bombero:obtener",
          "bombero:obtener_especifico",
          "compania:obtener_especifico",
          "disponibilidad:admin",
          "parte_emergencia:revisar",
          "parte_emergencia:generar_pdf",
          "evento:crear",
          "evento:actualizar",
          "evento:eliminar",
          "epp:asignar",
          "puntoGeografico:crear",
          "puntoGeografico:actualizar",
          "puntoGeografico:eliminar",
        ],
      },
      {
        nombre: "Teniente",
        descripcion: "Rol Teniente con los mismos permisos que Directiva.",
        permisoNames: [
          // Mismos permisos que Directiva
          "bombero:obtener_perfil",
          "bombero:actualizar_perfil",
          "bombero:cambiar_contrasena",
          "disponibilidad:obtener",
          "disponibilidad:crear",
          "disponibilidad:actualizar",
          "parte_emergencia:crear",
          "parte_emergencia:obtener",
          "parte_emergencia:actualizar",
          "compania:obtener",
          "compania:bombero_pertenece",
          "region:obtener",
          "comuna:obtener",
          "tipo_sangre:obtener",
          "direccion:crear",
          "direccion:obtener",
          "direccion:actualizar",
          "estadoCivil:obtener",
          "vinculo:obtener",
          "clave_radial:obtener",
          "subtipo_incidente:obtener",
          "clasificacion_emergencia:obtener",
          "epp:obtener",
          "tipo_epp:obtener",
          "estado_epp:obtener",
          "servicio:obtener",
          "carro:obtener",
          "capacitacion:obtener",
          "tipoEvento:obtener",
          "evento:obtener",
          "puntoGeografico:obtener",
          "tipoPunto:obtener",
          "jurisdiccion:obtener",
          "bombero:obtener",
          "bombero:obtener_especifico",
          "compania:obtener_especifico",
          "disponibilidad:admin",
          "parte_emergencia:revisar",
          "parte_emergencia:generar_pdf",
          "evento:crear",
          "evento:actualizar",
          "evento:eliminar",
          "epp:asignar",
          "puntoGeografico:crear",
          "puntoGeografico:actualizar",
          "puntoGeografico:eliminar",
        ],
      },
      {
        nombre: "Ayudante",
        descripcion: "Rol Ayudante con los mismos permisos que Directiva.",
        permisoNames: [
          // Mismos permisos que Directiva
          "bombero:obtener_perfil",
          "bombero:actualizar_perfil",
          "bombero:cambiar_contrasena",
          "disponibilidad:obtener",
          "disponibilidad:crear",
          "disponibilidad:actualizar",
          "parte_emergencia:crear",
          "parte_emergencia:obtener",
          "parte_emergencia:actualizar",
          "compania:obtener",
          "compania:bombero_pertenece",
          "region:obtener",
          "comuna:obtener",
          "tipo_sangre:obtener",
          "direccion:crear",
          "direccion:obtener",
          "direccion:actualizar",
          "estadoCivil:obtener",
          "vinculo:obtener",
          "clave_radial:obtener",
          "subtipo_incidente:obtener",
          "clasificacion_emergencia:obtener",
          "epp:obtener",
          "tipo_epp:obtener",
          "estado_epp:obtener",
          "servicio:obtener",
          "carro:obtener",
          "capacitacion:obtener",
          "tipoEvento:obtener",
          "evento:obtener",
          "puntoGeografico:obtener",
          "tipoPunto:obtener",
          "jurisdiccion:obtener",
          "bombero:obtener",
          "bombero:obtener_especifico",
          "compania:obtener_especifico",
          "disponibilidad:admin",
          "parte_emergencia:revisar",
          "parte_emergencia:generar_pdf",
          "evento:crear",
          "evento:actualizar",
          "evento:eliminar",
          "epp:asignar",
          "puntoGeografico:crear",
          "puntoGeografico:actualizar",
          "puntoGeografico:eliminar",
        ],
      },
      {
        nombre: "Capitán",
        descripcion: "Rol Capitán con permisos de Directiva más la capacidad de registrar bomberos.",
        permisoNames: [
          // Todos los permisos de Directiva
          "bombero:obtener_perfil",
          "bombero:actualizar_perfil",
          "bombero:cambiar_contrasena",
          "disponibilidad:obtener",
          "disponibilidad:crear",
          "disponibilidad:actualizar",
          "parte_emergencia:crear",
          "parte_emergencia:obtener",
          "parte_emergencia:actualizar",
          "compania:obtener",
          "compania:bombero_pertenece",
          "region:obtener",
          "comuna:obtener",
          "tipo_sangre:obtener",
          "direccion:crear",
          "direccion:obtener",
          "direccion:actualizar",
          "estadoCivil:obtener",
          "vinculo:obtener",
          "clave_radial:obtener",
          "subtipo_incidente:obtener",
          "clasificacion_emergencia:obtener",
          "epp:obtener",
          "tipo_epp:obtener",
          "estado_epp:obtener",
          "servicio:obtener",
          "carro:obtener",
          "capacitacion:obtener",
          "tipoEvento:obtener",
          "evento:obtener",
          "puntoGeografico:obtener",
          "tipoPunto:obtener",
          "jurisdiccion:obtener",
          "bombero:obtener",
          "bombero:obtener_especifico",
          "compania:obtener_especifico",
          "disponibilidad:admin",
          "parte_emergencia:revisar",
          "parte_emergencia:generar_pdf",
          "evento:crear",
          "evento:actualizar",
          "evento:eliminar",
          "epp:asignar",
          "puntoGeografico:crear",
          "puntoGeografico:actualizar",
          "puntoGeografico:eliminar",
          // Permisos adicionales de Capitán
          "bombero:crear",
          "bombero:actualizar",
          "rol:obtener",
          "permiso:obtener",
        ],
      },
      {
        nombre: "Administrador",
        descripcion: "Rol con acceso total al sistema. Todos los permisos administrativos.",
        permisoNames: [
          "bombero:obtener_perfil",
          "bombero:actualizar_perfil",
          "bombero:cambiar_contrasena",
          "bombero:crear",
          "bombero:obtener",
          "bombero:obtener_especifico",
          "bombero:actualizar",
          "bombero:eliminar",
          "bombero:cambiar_estado",
          "bombero:asignar_rol",
          "bombero:admin",
          "compania:obtener",
          "compania:obtener_especifico",
          "compania:bombero_pertenece",
          "compania:admin",
          "disponibilidad:obtener",
          "disponibilidad:crear",
          "disponibilidad:actualizar",
          "disponibilidad:admin",
          "permiso:obtener",
          "permiso:admin",
          "rol:obtener",
          "rol:admin",
          "region:obtener",
          "region:admin",
          "comuna:obtener",
          "comuna:admin",
          "tipo_sangre:obtener",
          "direccion:crear",
          "direccion:obtener",
          "direccion:actualizar",
          "direccion:eliminar",
          "estadoCivil:obtener",
          "estadoCivil:admin",
          "servicio:obtener",
          "servicio:admin",
          "carro:obtener",
          "carro:admin",
          "epp:crear",
          "epp:obtener",
          "epp:obtener_especifico",
          "epp:actualizar",
          "epp:eliminar",
          "epp:cambiar_estado",
          "epp:asignar",
          "epp:admin",
          "tipo_epp:obtener",
          "tipo_epp:admin",
          "estado_epp:obtener",
          "estado_epp:admin",
          "vinculo:obtener",
          "vinculo:admin",
          "clave_radial:obtener",
          "clave_radial:admin",
          "subtipo_incidente:obtener",
          "subtipo_incidente:admin",
          "clasificacion_emergencia:obtener",
          "clasificacion_emergencia:admin",
          "tipoEvento:obtener",
          "tipoEvento:admin",
          "evento:obtener",
          "evento:crear",
          "evento:actualizar",
          "evento:eliminar",
          "evento:admin",
          "capacitacion:obtener",
          "capacitacion:admin",
          "parte_emergencia:crear",
          "parte_emergencia:obtener",
          "parte_emergencia:actualizar",
          "parte_emergencia:eliminar",
          "parte_emergencia:revisar",
          "parte_emergencia:generar_pdf",
          "parte_emergencia:admin",
          "tipoPunto:obtener",
          "tipoPunto:crear",
          "tipoPunto:actualizar",
          "tipoPunto:eliminar",
          "tipoPunto:admin",
          "puntoGeografico:obtener",
          "puntoGeografico:crear",
          "puntoGeografico:actualizar",
          "puntoGeografico:eliminar",
          "puntoGeografico:admin",
          "jurisdiccion:obtener",
          "jurisdiccion:crear",
          "jurisdiccion:actualizar",
          "jurisdiccion:eliminar",
          "jurisdiccion:admin",
        ],
      },
    ];

    const allNeededPermisoNames = [
      ...new Set(rolesData.flatMap((r) => r.permisoNames)),
    ];
    const existingPermisos = await permisoRepository.findBy({
      nombre: In(allNeededPermisoNames),
    });

    if (existingPermisos.length !== allNeededPermisoNames.length) {
      const foundNames = existingPermisos.map((p) => p.nombre);
      const missingNames = allNeededPermisoNames.filter(
        (name) => !foundNames.includes(name),
      );
      logger.error(
        `Error: Faltan los siguientes permisos en la BD: ${missingNames.join(", ")}. Asegúrate de que createPermisos se ejecutó correctamente.`,
      );
      return;
    }

    const permisosMap = new Map(existingPermisos.map((p) => [p.nombre, p]));

    const rolesToSave = rolesData.map((roleDef) => {
      const permisosForRole = roleDef.permisoNames
        .map((name) => permisosMap.get(name))
        .filter((p) => p); // Filter out undefined if any mistake
      return roleRepository.create({
        nombre: roleDef.nombre,
        descripcion: roleDef.descripcion,
        permisos: permisosForRole,
      });
    });

    await roleRepository.save(rolesToSave);
    logger.info("[SERVER] Roles creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearRoles" });
    throw error;
  }
}

/**
 * Agregar permisos faltantes de partes de emergencia si no existen
 */
async function agregarPermisosParteEmergencia() {
  try {
    const permisoRepository = AppDataSource.getRepository(Permiso);
    const roleRepository = AppDataSource.getRepository(Rol);

    // Verificar y crear permisos de partes de emergencia si no existen
    const permisosParteEmergencia = [
      {
        nombre: "parte_emergencia:crear",
        descripcion: "Permite crear/redactar partes de emergencia",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia",
        metodo: "POST",
      },
      {
        nombre: "parte_emergencia:obtener",
        descripcion: "Permite obtener partes de emergencia (generalmente de la compañía del usuario)",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia",
        metodo: "GET",
      },
      {
        nombre: "parte_emergencia:actualizar",
        descripcion: "Permite actualizar partes de emergencia (solo si no están ENVIADO/APROBADO)",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia/:id",
        metodo: "PUT",
      },
      {
        nombre: "parte_emergencia:eliminar",
        descripcion: "Permite eliminar partes de emergencia",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia/incidente/:id",
        metodo: "DELETE",
      },
      {
        nombre: "parte_emergencia:revisar",
        descripcion: "Permite ver partes enviados para revisión, aprobar y rechazar partes",
        categoria: "Partes de Emergencia",
        ruta: "/api/incidentes/revision",
        metodo: "GET",
      },
      {
        nombre: "parte_emergencia:generar_pdf",
        descripcion: "Permite generar PDF de partes de emergencia",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia/:id/reporte/pdf",
        metodo: "POST",
      },
      {
        nombre: "parte_emergencia:admin",
        descripcion: "Permite administración completa de partes de emergencia (incluye todos los permisos anteriores)",
        categoria: "Partes de Emergencia",
        ruta: "/api/parteEmergencia/*",
        metodo: "*",
      },
    ];

    for (const permisoData of permisosParteEmergencia) {
      const permisoExistente = await permisoRepository.findOne({
        where: { nombre: permisoData.nombre },
      });

      if (!permisoExistente) {
        const nuevoPermiso = permisoRepository.create(permisoData);
        await permisoRepository.save(nuevoPermiso);
        logger.info(`[SERVER] Permiso "${permisoData.nombre}" creado.`);
      }
      // Si el permiso ya existe, no se registra nada
    }

    // Agregar permisos al rol Administrador si existe
    const rolAdmin = await roleRepository.findOne({
      where: { nombre: "Administrador" },
      relations: ["permisos"],
    });

    if (rolAdmin) {
      const permisosParteEmergenciaObjetos = await permisoRepository.findBy({
        nombre: In([
          "parte_emergencia:crear",
          "parte_emergencia:obtener",
          "parte_emergencia:actualizar",
          "parte_emergencia:eliminar",
          "parte_emergencia:revisar",
          "parte_emergencia:generar_pdf",
          "parte_emergencia:admin",
        ]),
      });

      const permisosExistentesNombres = rolAdmin.permisos.map((p) => p.nombre);
      const permisosAAgregar = permisosParteEmergenciaObjetos.filter(
        (p) => !permisosExistentesNombres.includes(p.nombre)
      );

      if (permisosAAgregar.length > 0) {
        rolAdmin.permisos = [...rolAdmin.permisos, ...permisosAAgregar];
        await roleRepository.save(rolAdmin);
        logger.info(
          `[SERVER] Permisos de partes de emergencia agregados al rol Administrador: ${permisosAAgregar
            .map((p) => p.nombre)
            .join(", ")}`
        );
      }
      // Si el rol ya tiene los permisos, no se registra nada
    }

    // Agregar permisos básicos al rol Bombero si existe
    const rolBombero = await roleRepository.findOne({
      where: { nombre: "Bombero" },
      relations: ["permisos"],
    });

    if (rolBombero) {
      const permisosBasicos = await permisoRepository.findBy({
        nombre: In([
          "parte_emergencia:crear",
          "parte_emergencia:obtener",
          "parte_emergencia:generar_pdf",
        ]),
      });

      const permisosExistentesNombres = rolBombero.permisos.map((p) => p.nombre);
      const permisosAAgregar = permisosBasicos.filter(
        (p) => !permisosExistentesNombres.includes(p.nombre)
      );

      if (permisosAAgregar.length > 0) {
        rolBombero.permisos = [...rolBombero.permisos, ...permisosAAgregar];
        await roleRepository.save(rolBombero);

      }
      // Si el rol ya tiene los permisos, no se registra nada
    }
  } catch (error) {
    logger.errorWithContext(error, { function: "agregarPermisosParteEmergencia" });
    throw error;
  }
}

/**
 * Agregar permisos faltantes de capacitación si no existen
 */
async function agregarPermisosCapacitacion() {
  try {
    const permisoRepository = AppDataSource.getRepository(Permiso);
    const roleRepository = AppDataSource.getRepository(Rol);

    // Verificar y crear permisos de capacitación si no existen
    const permisosCapacitacion = [
      {
        nombre: "capacitacion:obtener",
        descripcion: "Permite obtener la lista de tipos de capacitación",
        categoria: "Tipos de Capacitación",
        ruta: "/api/tipo-capacitacion",
        metodo: "GET",
      },
      {
        nombre: "capacitacion:admin",
        descripcion: "Permite administración completa de tipos de capacitación (crear, actualizar, eliminar)",
        categoria: "Tipos de Capacitación",
        ruta: "/api/tipo-capacitacion/*",
        metodo: "*",
      },
    ];

    for (const permisoData of permisosCapacitacion) {
      const permisoExistente = await permisoRepository.findOne({
        where: { nombre: permisoData.nombre },
      });

      if (!permisoExistente) {
        const nuevoPermiso = permisoRepository.create(permisoData);
        await permisoRepository.save(nuevoPermiso);
        logger.info(`[SERVER] Permiso "${permisoData.nombre}" creado.`);
      }
      // Si el permiso ya existe, no se registra nada
    }

    // Agregar permisos al rol Administrador si existe
    const rolAdmin = await roleRepository.findOne({
      where: { nombre: "Administrador" },
      relations: ["permisos"],
    });

    if (rolAdmin) {
      const permisosCapacitacionObjetos = await permisoRepository.findBy({
        nombre: In(["capacitacion:obtener", "capacitacion:admin"]),
      });

      const permisosExistentesNombres = rolAdmin.permisos.map((p) => p.nombre);
      const permisosAAgregar = permisosCapacitacionObjetos.filter(
        (p) => !permisosExistentesNombres.includes(p.nombre)
      );

      if (permisosAAgregar.length > 0) {
        rolAdmin.permisos = [...rolAdmin.permisos, ...permisosAAgregar];
        await roleRepository.save(rolAdmin);
        logger.info(
          `[SERVER] Permisos de capacitación agregados al rol Administrador: ${permisosAAgregar
            .map((p) => p.nombre)
            .join(", ")}`
        );
      }
      // Si el rol ya tiene los permisos, no se registra nada
    }
  } catch (error) {
    logger.errorWithContext(error, { function: "agregarPermisosCapacitacion" });
    throw error;
  }
}

export { crearPermisos, crearRoles, agregarPermisosCapacitacion, agregarPermisosParteEmergencia };
