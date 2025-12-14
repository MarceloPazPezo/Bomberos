# Sistema de Gestión Operativa para Bomberos 🚒

Un sistema integral de gestión operativa diseñado específicamente para cuerpos de bomberos, que permite administrar recursos, personal, emergencias y operaciones de manera eficiente.

## 🎯 Características Principales

- **Gestión de Personal**: Administración de bomberos, turnos y disponibilidad
- **Control de Emergencias**: Registro y seguimiento de incidentes y emergencias
- **Gestión de Recursos**: Inventario de equipos, vehículos y materiales (EPP)
- **Sistema de Notificaciones**: Notificaciones en tiempo real con WebSocket
- **Visualización Geoespacial**: Mapas interactivos con MapLibre GL
- **Reportes Operativos**: Generación de informes y estadísticas
- **Sistema de Usuarios**: Control de acceso con roles y permisos
- **Calendario de Eventos**: Gestión de capacitaciones y eventos

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js 20** con Express.js 5.1
- **PostgreSQL 17** con PostGIS 3.5 para datos geoespaciales
- **TypeORM** como ORM
- **Redis 7** para cache y notificaciones
- **MinIO** para almacenamiento de archivos (S3-compatible)
- **Socket.IO** para WebSockets
- **Winston** para logging estructurado
- **JWT** para autenticación
- **Passport.js** para estrategias de autenticación

### Frontend
- **React 18** con Vite 6
- **Tailwind CSS 4** para estilos
- **React Router** para navegación
- **MapLibre GL** para mapas
- **PrimeReact** para componentes UI
- **Chart.js** para gráficos
- **FullCalendar** para calendarios

### Infraestructura
- **Docker** y Docker Compose para servicios de infraestructura (database, redis, minio)
- **PM2** para gestión de procesos del backend en producción
- **Nginx** como servidor web y proxy inverso para frontend
- **PostgreSQL + PostGIS** para base de datos
- **Redis** para cache y pub/sub
- **MinIO** para almacenamiento de objetos

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 22.19.0 (recomendado usar NVM)
- **NPM** (incluido con Node.js)
- **Docker** y Docker Compose (para servicios de infraestructura)
- **PM2** (para gestión del backend en producción)
- **Nginx** (para servir el frontend)
- **Git** para clonar el repositorio

> **Nota**: Para una guía detallada de instalación en producción, consulta [PUESTA_EN_MARCHA.md](./PUESTA_EN_MARCHA.md)

## 🚀 Guía de Instalación

Este proyecto puede desplegarse de dos formas:

### Opción 1: Instalación en Producción (Recomendado)

Para instalación en producción con PM2 y Nginx, consulta la guía completa:

**[📖 Guía de Puesta en Marcha](./PUESTA_EN_MARCHA.md)**

Esta guía incluye:
- Instalación de Node.js con NVM
- Configuración de servicios Docker (database, redis, minio)
- Configuración del backend con PM2
- Configuración del frontend con Nginx
- Configuración completa de variables de entorno

### Opción 2: Desarrollo Local

Para desarrollo local:

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/MarceloPazPezo/Bomberos
   cd Bomberos
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   nano .env  # Editar con tus configuraciones
   ```

3. **Levantar servicios de infraestructura con Docker**:
   ```bash
   docker compose up -d database redis minio
   ```

4. **Instalar dependencias del backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. **Instalar dependencias del frontend** (en otra terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📁 Estructura del Proyecto

```
Bomberos/
├── backend/           # API REST con Node.js
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── entities/       # Modelos TypeORM
│   │   ├── routes/         # Definición de rutas
│   │   ├── services/       # Servicios de negocio
│   │   ├── config/         # Configuraciones
│   │   └── index.js        # Punto de entrada
│   ├── migrations/         # Migraciones de BD
│   ├── logs/               # Logs de aplicación
│   └── Dockerfile
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios API
│   │   └── main.jsx        # Punto de entrada
│   ├── public/             # Archivos estáticos
│   ├── dist/               # Build de producción
│   ├── Dockerfile
│   └── nginx.conf          # Configuración Nginx
├── docker-compose.yml  # Orquestación de servicios
├── .env.example        # Variables de entorno de ejemplo
└── README.md
```

## 🔧 Arquitectura del Sistema

### Servicios en Docker
- **PostgreSQL + PostGIS**: Base de datos principal (puerto 5432)
- **Redis**: Cache y sistema de notificaciones (puerto 6379)
- **MinIO**: Almacenamiento de archivos (API: 9000, Console: 9002)

### Servicios en el Host
- **Backend**: Ejecutado con PM2 (puerto 11000 por defecto)
- **Frontend**: Servido con Nginx (puerto 11001 por defecto)
- **Nginx**: Actúa como proxy inverso para `/api/` y `/minio/`

## 🐳 Comandos Docker Útiles

### Gestión de Servicios de Infraestructura

```bash
# Levantar servicios (database, redis, minio)
docker compose up -d database redis minio

# Detener servicios
docker compose down

# Ver estado de servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f database
docker compose logs -f redis
docker compose logs -f minio

# Reiniciar un servicio específico
docker compose restart database
```

### Acceso a Contenedores

```bash
# Acceder a la base de datos
docker exec -it bomberos-pern-database psql -U user_bomberos -d db_bomberos

# Acceder a Redis CLI
docker exec -it bomberos-pern-redis redis-cli
```

### Limpieza

```bash
# Eliminar contenedores detenidos
docker-compose rm

# Limpiar imágenes no utilizadas
docker image prune

# Limpiar todo (⚠️ CUIDADO)
docker system prune -a
```

## 🔐 Seguridad

### Variables de Entorno Críticas

Las siguientes variables **DEBEN** cambiarse en producción:

- `B_ACCESS_TOKEN_SECRET`: Secreto para firmar tokens JWT
- `B_COOKIE_KEY`: Clave para cookies de sesión
- `DB_PASSWORD`: Contraseña de PostgreSQL
- `MINIO_SECRET_KEY`: Contraseña de MinIO
- `REDIS_PASSWORD`: Contraseña de Redis (opcional pero recomendado)

### Generar Secretos Seguros

```bash
# Generar secreto JWT
openssl rand -base64 32

# Generar clave de cookie
openssl rand -base64 32

# Generar contraseña
openssl rand -base64 24
```

## 🗄️ Base de Datos

### Acceso Directo

```bash
# Conectar a PostgreSQL
docker exec -it bomberos-pern-database psql -U user_bomberos -d db_bomberos

# Desde el host (si el puerto está expuesto)
psql -h localhost -p 5432 -U user_bomberos -d db_bomberos
```

### Backup y Restauración

```bash
# Backup
docker exec bomberos-pern-database pg_dump -U user_bomberos db_bomberos > backup.sql

# Restauración
docker exec -i bomberos-pern-database psql -U user_bomberos db_bomberos < backup.sql
```

### Resetear Base de Datos

```bash
# ⚠️ CUIDADO: Esto elimina todos los datos
docker-compose down -v
docker volume rm bomberos_database_data
docker-compose up -d
```

## 📝 Logs

### Ver Logs del Backend (PM2)

```bash
# Ver logs en tiempo real
pm2 logs backend

# Ver últimas líneas
pm2 logs backend --lines 100

# Ver logs desde archivos
tail -f backend/logs/application-$(date +%Y-%m-%d).log
tail -f backend/logs/error-$(date +%Y-%m-%d).log
```

### Ver Logs de Nginx

```bash
# Logs de acceso
sudo tail -f /var/log/nginx/access.log

# Logs de errores
sudo tail -f /var/log/nginx/error.log
```

### Logs de Archivos del Backend

Los logs se almacenan en:
- `backend/logs/application-YYYY-MM-DD.log`
- `backend/logs/error-YYYY-MM-DD.log`
- `backend/logs/debug-YYYY-MM-DD.log`

## 🐛 Solución de Problemas

### Problema: Los servicios no inician

```bash
# Verificar logs de errores
docker-compose logs

# Verificar estado de servicios
docker-compose ps

# Verificar que los puertos no estén en uso
netstat -tuln | grep -E ':(80|3000|5432|6379|9000)'
```

### Problema: Backend no se conecta a la base de datos

1. Verificar que la base de datos esté saludable:
   ```bash
   docker compose ps database
   ```

2. Verificar que PM2 esté corriendo:
   ```bash
   pm2 status
   pm2 logs backend
   ```

3. Verificar variables de entorno en el archivo `.env`

### Problema: Frontend no carga

1. Verificar que el backend esté corriendo:
   ```bash
   pm2 status
   curl http://localhost:11000/api/health
   ```

2. Verificar logs de Nginx:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo nginx -t
   ```

3. Verificar que los archivos estén en `/var/www/bomberos/`

### Problema: MinIO no crea buckets

1. Verificar que MinIO esté saludable:
   ```bash
   docker compose ps minio
   ```

2. Verificar logs:
   ```bash
   docker compose logs minio
   ```

3. Crear buckets manualmente desde la consola web

### Problema: Redis no conecta

1. Verificar que Redis esté saludable:
   ```bash
   docker compose ps redis
   ```

2. Probar conexión:
   ```bash
   docker exec -it bomberos-pern-redis redis-cli ping
   ```

## 🔄 Desarrollo

### Modo Desarrollo (Sin Docker)

Si prefieres desarrollar sin Docker:

#### Backend

```bash
cd backend
npm install
cp ../../.env .env  # Asegúrate de tener las variables correctas
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

> **Nota**: En desarrollo, necesitarás tener PostgreSQL, Redis y MinIO corriendo (puedes usar Docker solo para estos servicios).

### Hot Reload

El backend usa `nodemon` para hot reload en desarrollo. El frontend usa Vite que tiene hot reload por defecto.

## 📊 Monitoreo y Healthchecks

Todos los servicios tienen healthchecks configurados:

```bash
# Verificar salud de todos los servicios
docker-compose ps

# Verificar salud manualmente
curl http://localhost/api/health          # Frontend
curl http://localhost:3000/api/health      # Backend
```

## 🔄 Actualizaciones

### Actualizar Código

```bash
# 1. Obtener últimos cambios
git pull

# 2. Actualizar dependencias del backend
cd backend
npm install
pm2 restart backend

# 3. Actualizar dependencias del frontend
cd ../frontend
npm install
npm run build
sudo rm -rf /var/www/bomberos/*
sudo cp -r dist/* /var/www/bomberos/
```

### Actualizar Servicios Docker

```bash
# Reconstruir y reiniciar servicios de infraestructura
docker compose up -d --build database redis minio
```

## 📚 Documentación Adicional

- [Guía de Puesta en Marcha](./PUESTA_EN_MARCHA.md) - Guía completa para instalación en producción
- [Análisis del Proyecto](./ANALISIS_PROYECTO.md) - Análisis técnico detallado
- [Guía de Contribución](./CONTRIBUTING.md) - Cómo contribuir al proyecto
- [Código de Conducta](./CODE_OF_CONDUCT.md) - Estándares de comportamiento de la comunidad
- Documentación de API: Disponible en `/api/docs` (si está configurado)
- Logs: Revisar `backend/logs/` para información detallada

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, lee nuestra [Guía de Contribución](./CONTRIBUTING.md) antes de comenzar.

Resumen rápido:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

Por favor, asegúrate de seguir nuestro [Código de Conducta](./CODE_OF_CONDUCT.md).

## 📄 Licencia

Este proyecto está bajo la licencia [GPL-3.0](LICENSE).

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades, por favor abre un issue en el repositorio.

## 🎯 Próximos Pasos

Después de instalar el sistema:

1. Accede a la aplicación en http://localhost
2. Inicia sesión con las credenciales por defecto (consultar documentación del backend)
3. Configura MinIO desde la consola web
4. Revisa los logs para verificar que todo funcione correctamente
5. Personaliza las configuraciones según tus necesidades

---

**Desarrollado con ❤️ para mejorar la gestión operativa de los cuerpos de bomberos**
