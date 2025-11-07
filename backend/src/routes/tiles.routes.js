import { Router } from 'express';
import minioService from '../services/minio.service.js';
import { BUCKETS } from '../config/configMinIO.js';
import logger from '../config/configLogger.js';

const router = Router();

// Rutas públicas para tiles de MapLibre
router.get('/:comuna/:z/:x/:y', async (req, res) => {
  try {
    const { comuna, z, x, y } = req.params;

    // Construir nombre del archivo del tile
    const fileName = `${comuna}/${z}/${x}/${y}.png`;

    // Intentar obtener el tile desde MinIO
    try {
      const fileBuffer = await minioService.downloadFile(BUCKETS.TILES_PUBLIC, fileName);

      // Configurar headers para tiles
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': fileBuffer.length,
        'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });

      res.send(fileBuffer);

      logger.info(`[MINIO] Tile servido: ${fileName}`);
    } catch (error) {
      if (error.code === 'NotFound') {
        // Si el tile no existe, devolver 404
        res.status(404).json({
          success: false,
          message: 'Tile no encontrado',
          tile: fileName
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error('[MINIO] Error sirviendo tile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

router.get('/:comuna/:z/:x/:y.json', async (req, res) => {
  try {
    const { comuna, z, x, y } = req.params;

    // Construir nombre del archivo del tile
    const fileName = `${comuna}/${z}/${x}/${y}.png`;

    // Verificar si el tile existe
    const exists = await minioService.fileExists(BUCKETS.TILES_PUBLIC, fileName);

    if (exists) {
      const fileInfo = await minioService.getFileInfo(BUCKETS.TILES_PUBLIC, fileName);

      res.json({
        success: true,
        data: {
          tile: fileName,
          exists: true,
          size: fileInfo.size,
          lastModified: fileInfo.lastModified,
          comuna,
          z: parseInt(z),
          x: parseInt(x),
          y: parseInt(y)
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Tile no encontrado',
        tile: fileName
      });
    }
  } catch (error) {
    logger.error('[MINIO] Error obteniendo metadatos del tile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

router.get('/available/:comuna', async (req, res) => {
  try {
    const { comuna } = req.params;
    const { z } = req.query; // Nivel de zoom opcional

    let prefix = `${comuna}/`;
    if (z) {
      prefix += `${z}/`;
    }

    const files = await minioService.listFiles(BUCKETS.TILES_PUBLIC, prefix);

    // Organizar tiles por nivel de zoom
    const tilesByZoom = {};
    files.forEach(file => {
      const pathParts = file.name.split('/');
      if (pathParts.length >= 4) {
        const zoom = pathParts[1];
        if (!tilesByZoom[zoom]) {
          tilesByZoom[zoom] = [];
        }
        tilesByZoom[zoom].push({
          x: pathParts[2],
          y: pathParts[3].replace('.png', ''),
          size: file.size,
          lastModified: file.lastModified
        });
      }
    });

    res.json({
      success: true,
      data: {
        comuna,
        tilesByZoom,
        totalTiles: files.length
      }
    });
  } catch (error) {
    logger.error('[MINIO] Error listando tiles disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

router.get('/communas', async (req, res) => {
  try {
    const files = await minioService.listFiles(BUCKETS.TILES_PUBLIC, '');

    // Extraer comunas únicas
    const comunas = new Set();
    files.forEach(file => {
      const pathParts = file.name.split('/');
      if (pathParts.length > 0) {
        comunas.add(pathParts[0]);
      }
    });

    res.json({
      success: true,
      data: {
        comunas: Array.from(comunas),
        totalComunas: comunas.size
      }
    });
  } catch (error) {
    logger.error('[MINIO] Error listando comunas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

router.get('/cache-info/:comuna', async (req, res) => {
  try {
    const { comuna } = req.params;

    const files = await minioService.listFiles(BUCKETS.TILES_PUBLIC, `${comuna}/`);

    // Calcular información de cache
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const tilesByZoom = {};

    files.forEach(file => {
      const pathParts = file.name.split('/');
      if (pathParts.length >= 4) {
        const zoom = pathParts[1];
        if (!tilesByZoom[zoom]) {
          tilesByZoom[zoom] = {
            count: 0,
            size: 0
          };
        }
        tilesByZoom[zoom].count++;
        tilesByZoom[zoom].size += file.size;
      }
    });

    res.json({
      success: true,
      data: {
        comuna,
        totalTiles: files.length,
        totalSize,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
        tilesByZoom,
        lastUpdated: files.length > 0 ? Math.max(...files.map(f => new Date(f.lastModified).getTime())) : null
      }
    });
  } catch (error) {
    logger.error('[MINIO] Error obteniendo información de cache:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

export default router;
