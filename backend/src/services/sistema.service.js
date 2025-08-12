"use strict";
import SystemConfig from "../entities/sistema.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function getSystemConfigService(key = null) {
  try {
    const systemConfigRepository = AppDataSource.getRepository(SystemConfig);
    
    if (key) {
      const config = await systemConfigRepository.findOne({
        where: { key }
      });
      return [config, null];
    }
    
    const configs = await systemConfigRepository.find({
      order: { category: "ASC", key: "ASC" }
    });
    return [configs, null];
  } catch (error) {
    console.error("Error al obtener configuración del sistema:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateSystemConfigService(key, value) {
  try {
    const systemConfigRepository = AppDataSource.getRepository(SystemConfig);
    
    const config = await systemConfigRepository.findOne({
      where: { key }
    });
    
    if (!config) {
      return [null, "Configuración no encontrada"];
    }
    
    if (!config.isEditable) {
      return [null, "Esta configuración no es editable"];
    }
    
    config.value = value;
    const updatedConfig = await systemConfigRepository.save(config);
    
    return [updatedConfig, null];
  } catch (error) {
    console.error("Error al actualizar configuración del sistema:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createSystemConfigService(configData) {
  try {
    const systemConfigRepository = AppDataSource.getRepository(SystemConfig);
    
    const existingConfig = await systemConfigRepository.findOne({
      where: { key: configData.key }
    });
    
    if (existingConfig) {
      return [null, "Ya existe una configuración con esta clave"];
    }
    
    const newConfig = systemConfigRepository.create(configData);
    const savedConfig = await systemConfigRepository.save(newConfig);
    
    return [savedConfig, null];
  } catch (error) {
    console.error("Error al crear configuración del sistema:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getSystemConfigByCategory(category) {
  try {
    const systemConfigRepository = AppDataSource.getRepository(SystemConfig);
    
    const configs = await systemConfigRepository.find({
      where: { category },
      order: { key: "ASC" }
    });
    
    return [configs, null];
  } catch (error) {
    console.error("Error al obtener configuraciones por categoría:", error);
    return [null, "Error interno del servidor"];
  }
}