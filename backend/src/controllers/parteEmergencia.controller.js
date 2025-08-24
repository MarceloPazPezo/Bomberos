"use strict";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

// Transaccion helper, la idea es envolver todo el proceso en una transaccion, 
// como es harta data y varios paso quizas sea mejor hacerlo asi (jpalma)
import { withTransaction } from "../helpers/withTransaction.js";

// servicios (paso 1)
import {
  createParteEmergenciaService,
  updateParteEmergenciaService,
} from "../services/parteEmergencia.service.js";
import {
  createPropietarioService,
  updatePropietarioService,
  deletePropietarioService
} from "../services/propietario.service.js";
import {
  createInmuebleAfectadoService,
  updateInmuebleAfectadoService,
} from "../services/inmuebleAfectado.service.js";


import {
  createOtroInmuebleService,
  updateOtroInmuebleService,
  deleteOtrosInmueblesService,
  getOtrosInmueblesByIdParteService
} from "../services/otrosInmuebles.service.js";

import {
  createVehiculoAfectadoService,
  updateVehiculoAfectadoService,
  deleteVehiculosAfectadosService,
  getVehiculosByIdParteService
} from "../services/vehiculoAfectado.service.js";

import {
  createOcupanteVehiculoService,
  updateOcupanteVehiculoService,
  deleteOcupantesVehiculoService,
  getOcupantesByIdVehiculoService
} from "../services/ocupanteVehiculo.service.js";



// validaciones (paso 1) revisar estas para hacer una para create y otra para update
import { validationBodycreateParteEmergencia, validationBodyUpdateParteEmergencia } from "../validations/parteEmergencia.validation.js";
import { validationBodycreatePropietario, validationBodyUpdatePropietario } from "../validations/afectado.validation.js";
import { validationBodycreateInmuebleAfectado, validationBodyUpdateInmuebleAfectado } from "../validations/inmuebleAfectado.validation.js";

// validaciones (paso 2)
import { validationBodycreateOtroInmuebleAfectado, validationBodyUpdateOtroInmuebleAfectado } from "../validations/otroInmueble.validation.js";
import { createVehiculoAfectadoValidation, updateVehiculoAfectadoValidation } from "../validations/vehiculo.validation.js";
import { createOcupanteValidation, updateOcupanteValidation } from "../validations/ocupante.validation.js";


export const paso1SaveParteEmergencia = async (req, res) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return handleErrorClient(res, 400, "Datos incompletos para crear parte de emergencia");
    }

    const dataparteEmergencia = data.parteEmergencia || {};

    console.log("Datos recibidos para parte de emergencia:", dataparteEmergencia);
    // Ejecutar TODA la operación del paso 1 dentro de UNA transacción:
    const result = await withTransaction(async (trx) => {
      let parte;

      if (!dataparteEmergencia.id || dataparteEmergencia.id == null) {
        //eliminamos el id si viene en null o undefined
        delete dataparteEmergencia.id;
        // CREATE
        console.log("Validando parte de emergencia...", dataparteEmergencia);
        const { error: errorParte } = validationBodycreateParteEmergencia.validate(dataparteEmergencia);
        if (errorParte) {
          // Lanza error para que el withTransaction haga rollback

          console.log("Error de validación parte de emergencia:", errorParte)
          throw new Error(`Error de validación: ${errorParte.details?.[0]?.message}`);
        }
        console.log("Creando parte de emergencia...");
        parte = await createParteEmergenciaService(dataparteEmergencia, trx);
      } else {
        console.log("Parte de emergencia tiene ID, se asume que es para actualizar:", dataparteEmergencia.id);
        // UPDATE
        const { error: errorParte } = validationBodyUpdateParteEmergencia.validate(dataparteEmergencia);
        if (errorParte) {
          throw new Error(`Error de validación: ${errorParte.details?.[0]?.message}`);
        }
        console.log("Actualizando parte de emergencia...");
        parte = await updateParteEmergenciaService(dataparteEmergencia.id, dataparteEmergencia, trx);
      }

      if (!parte?.id) {
        throw new Error("No se pudo obtener el ID del parte de emergencia");
      }

      return { parteEmergenciaId: parte.id };
    });

    return handleSuccess(res, 201, "Parte de emergencia creado/actualizado exitosamente", result);
  } catch (error) {
    // Si algo falla dentro de withTransaction, ya se hizo rollback
    return handleErrorServer(res, 500, `Error al crear/actualizar parte de emergencia: ${error.message}`);
  }
};


export const paso2UpdateParteEmergencia = async (req, res) => {
  try {
    let PropietarioId;
    let parteEmergenciaId;
    let inmuebleAfectadoId;
    let otroInmuebleAfectadoId = [];
    let vehiculoAfectadoYOcupanteId = { vehiculos: [] };


    const data = req.body;
    console.log("Datos iniciales controller: ", data);
    const dataPropietario = data.propietario;
    // Crear o actualizar Propietario
    if (!dataPropietario.id) {
      const { errorPropietario } = validationBodycreatePropietario.validate(dataPropietario);
      if (!errorPropietario) {
        const newPropietario = await createPropietarioService(dataPropietario);
        PropietarioId = newPropietario.id;
      }
    } else {
      const { errorPropietario } = validationBodyUpdatePropietario.validate(dataPropietario);
      if (!errorPropietario) {
        await updatePropietarioService(dataPropietario.id, dataPropietario);
        PropietarioId = dataPropietario.id;
      }
    }


    // Actualizar parte de emergencia
    const dataCaracteristicas = data.caracteristicas;

    // Validar parte de emergencia
    const { errorCaracteristicas } = validationBodyUpdateParteEmergencia.validate(dataCaracteristicas);

    if (!errorCaracteristicas) { await updateParteEmergenciaService(dataCaracteristicas.id, dataCaracteristicas) }
    parteEmergenciaId = dataCaracteristicas.id;


    // INMUEBLE AFECTADO
    const inmuebleData = data.inmueble_afectado;


    if (!inmuebleData.id) {
      const { errorInmueble } = validationBodycreateInmuebleAfectado.validate(inmuebleData);

      if (!errorInmueble) {
        console.log("Creando inmueble afectado...");
        inmuebleData.propietario_id = PropietarioId;

        const newInmuebleAfectado = await createInmuebleAfectadoService(inmuebleData);
        console.log("Inmueble afectado creado:", newInmuebleAfectado.id);
        inmuebleAfectadoId = newInmuebleAfectado.id;
      }
    } else {
      const { errorInmueble } = validationBodyUpdateInmuebleAfectado.validate(inmuebleData);
      if (!errorInmueble) {
        await updateInmuebleAfectadoService(inmuebleData.id, inmuebleData);
        console.log("Inmueble afectado actualizado:", inmuebleData.id);
        inmuebleAfectadoId = inmuebleData.id;
      }
    }
    // OTROS INMUEBLES AFECTADOS
    const otrosInmuebles = data.otros_inmuebles;

    let idsExistentes = await getOtrosInmueblesByIdParteService(dataCaracteristicas.id);

    for (const inmueble of otrosInmuebles) {
      if (!inmueble.id) {
        //no hay id, crear
        const { errorOtroInmueble } = validationBodycreateOtroInmuebleAfectado.validate(inmueble);
        if (!errorOtroInmueble) {
          const newInmuebleAfectado = await createOtroInmuebleService(inmueble);
          otroInmuebleAfectadoId.push(newInmuebleAfectado.id);
        }

      }
      else {
        const { errorOtroInmueble } = validationBodyUpdateOtroInmuebleAfectado.validate(inmueble);
        if (!errorOtroInmueble) {
          console.log("Actualizando otro inmueble afectado...");
          await updateOtroInmuebleService(inmueble.id, inmueble);
          otroInmuebleAfectadoId.push(inmueble.id);
          //eliminar id de la lista de ids existentes
          idsExistentes = idsExistentes.filter(id => id !== inmueble.id);

        }
      }
    }
    //eliminar los ids que quedaron en idsExistentes

    if (idsExistentes.length > 0) {
      console.log("Eliminando otros inmuebles afectados con IDs:", idsExistentes);
      await deleteOtrosInmueblesService(idsExistentes);
      console.log("Otros inmuebles afectados eliminados");
    }


    // Vehículos afectados
    const dataVehiculos = data.vehiculos;
    let vehiculosIdsExistentes = await getVehiculosByIdParteService(dataCaracteristicas.id);
    let newVehiculoAfectado;

    for (const vehiculo of dataVehiculos) {
      if (!vehiculo.id) {
        console.log("Creando vehículo afectado...");
        const { errorVehiculo } =
          createVehiculoAfectadoValidation.validate(vehiculo);
        if (!errorVehiculo) {
          newVehiculoAfectado = await createVehiculoAfectadoService({ "parte_id": vehiculo.parte_id, "propietario_id": vehiculo.propietario_id, "tipo_vehiculo": vehiculo.tipo_vehiculo, "marca": vehiculo.marca, "modelo": vehiculo.modelo, "color": vehiculo.color, "patente": vehiculo.patente, "conductor_nombres": vehiculo.conductor_nombres, "conductor_apellidos": vehiculo.conductor_apellidos, "conductor_run": vehiculo.conductor_run });
          console.log("Vehículo afectado creado:", newVehiculoAfectado);
          //almacenar id del vehículo y sus ocupantes
          vehiculoAfectadoYOcupanteId.vehiculos.push({ vehiculoId: newVehiculoAfectado.id, ocupantes: [] });

          //agregar id a vehiculosIdsExistentes

        }
        // Crear ocupantes del vehículo, solo se crea, pq si el vehículo es nuevo no pueden haber ocupantes existentes
        for (const ocupante of vehiculo.ocupantes) {
          if (!ocupante.id) {
            console.log("Creando ocupante del vehículo...");
            ocupante.vehiculo_id = newVehiculoAfectado.id;
            const { errorOcupante } =
              createOcupanteValidation.validate(ocupante);
            if (!errorOcupante) {
              const newOcupante = await createOcupanteVehiculoService(ocupante);
              console.log("Ocupante del vehículo creado:", newOcupante);
              //almacenar id del ocupante en el array del vehículo correspondiente
              const vObj = vehiculoAfectadoYOcupanteId.vehiculos.find(v => v.vehiculoId === newVehiculoAfectado.id);
              if (vObj) vObj.ocupantes.push(newOcupante.id);

            }
          }
        }
      }
      else {
        // Obtener IDs de ocupantes existentes del vehículo (asegurando await para recibir el array y no una Promise)
        let ocupantesIdsExistentes = await getOcupantesByIdVehiculoService(vehiculo.id);
        if (!Array.isArray(ocupantesIdsExistentes)) {
          console.warn("getOcupantesByIdVehiculoService no devolvió un array, se fuerza a []");
          ocupantesIdsExistentes = [];
        }
        const { errorVehiculo } =
          updateVehiculoAfectadoValidation.validate(vehiculo);
        if (!errorVehiculo) {
          console.log("Actualizando vehículo afectado...");
          await updateVehiculoAfectadoService(vehiculo.id, { "parte_id": vehiculo.parte_id, "propietario_id": vehiculo.propietario_id, "tipo_vehiculo": vehiculo.tipo_vehiculo, "marca": vehiculo.marca, "modelo": vehiculo.modelo, "color": vehiculo.color, "patente": vehiculo.patente, "conductor_nombres": vehiculo.conductor_nombres, "conductor_apellidos": vehiculo.conductor_apellidos, "conductor_run": vehiculo.conductor_run });
          console.log("Vehículo afectado actualizado:", vehiculo.id);
          //almacenar id del vehículo y sus ocupantes
          vehiculoAfectadoYOcupanteId.vehiculos.push({ vehiculoId: vehiculo.id, ocupantes: [] });
          //eliminar id de la lista de ids existentes
          vehiculosIdsExistentes = vehiculosIdsExistentes.filter(id => id !== vehiculo.id);
          // Asegurar que haya un array de ocupantes para iterar
          const ocupantesVehiculo = Array.isArray(vehiculo.ocupantes) ? vehiculo.ocupantes : [];
          for (const ocupante of ocupantesVehiculo) {
            // Crear o actualizar ocupantes del vehículo
            if (!ocupante.id) {
              console.log("Creando ocupante del vehículo...");
              ocupante.vehiculo_id = vehiculo.id;
              const { errorOcupante } =
                createOcupanteValidation.validate(ocupante);
              if (!errorOcupante) {
                const newOcupante = await createOcupanteVehiculoService(ocupante);
                console.log("Ocupante del vehículo creado:", newOcupante);
                //almacenar id del ocupante en el array del vehículo correspondiente
                const vObj = vehiculoAfectadoYOcupanteId.vehiculos.find(v => v.vehiculoId === vehiculo.id);
                if (vObj) vObj.ocupantes.push(newOcupante.id);


              }
            } else {
              console.log("Actualizando ocupante del vehículo...");
              const { errorOcupante } =
                updateOcupanteValidation.validate(ocupante);
              if (!errorOcupante) {
                await updateOcupanteVehiculoService(ocupante.id, ocupante);
                console.log("Ocupante del vehículo actualizado:", ocupante.id);
                //almacenar id del ocupante en el array del vehículo correspondiente
                const vObj = vehiculoAfectadoYOcupanteId.vehiculos.find(v => v.vehiculoId === vehiculo.id);
                if (vObj) vObj.ocupantes.push(ocupante.id);


                //eliminar id de la lista de ids existentes
                ocupantesIdsExistentes = ocupantesIdsExistentes.filter(id => id !== ocupante.id);
              }
            }
          }
          //eliminar los ids que quedaron en ocupantesIdsExistentes
          if (ocupantesIdsExistentes.length > 0) {
            console.log("Eliminando ocupantes de vehículo con IDs:", ocupantesIdsExistentes);
            await deleteOcupantesVehiculoService(ocupantesIdsExistentes);
            console.log("Ocupantes de vehículo eliminados");
          }
        }
      }
    }
    //eliminar los ids que quedaron en vehiculosIdsExistentes
    if (vehiculosIdsExistentes.length > 0) {
      console.log("Eliminando vehículos afectados con IDs:", vehiculosIdsExistentes);
      await deleteVehiculosAfectadosService(vehiculosIdsExistentes);
      console.log("Vehículos afectados eliminados");
    }

    console.log({
      "parte_id": parteEmergenciaId,
      "propietario_Id": PropietarioId,
      "inmuebleAfectado_Id": inmuebleAfectadoId,
      "otrosInmueblesAfectados_Ids": otroInmuebleAfectadoId,
      "vehiculos":vehiculoAfectadoYOcupanteId.vehiculos
    });

    console.log(vehiculoAfectadoYOcupanteId.vehiculos[0].ocupantes);

    



    return handleSuccess(
      res,
      200,
      "Parte de emergencia y datos relacionados actualizados exitosamente",
      {
        "parte_id": parteEmergenciaId,
        "propietario_Id": PropietarioId,
        "inmuebleAfectado_Id": inmuebleAfectadoId,
        "otrosInmueblesAfectados_Ids": otroInmuebleAfectadoId,
        "vehiculos":vehiculoAfectadoYOcupanteId.vehiculos
      }
    );




  } catch (error) {

    console.error("Error en paso2UpdateParteEmergencia:", error);
    return handleErrorServer(
      res,
      500,
      `Error al actualizar parte de emergencia: ${error.message}`
    );
  }
}
