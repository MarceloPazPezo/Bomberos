# 📊 Análisis del Proyecto - Sistema de Gestión Operativa para Bomberos

## 🎯 Resumen Ejecutivo

Este es un sistema integral de gestión operativa diseñado específicamente para cuerpos de bomberos. El proyecto utiliza una arquitectura moderna basada en microservicios con Docker, permitiendo una escalabilidad y mantenimiento eficiente.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### **Backend**
- **Runtime**: Node.js 20 (Alpine)
- **Framework**: Express.js 5.1.0
- **ORM**: TypeORM 0.3.27
- **Base de Datos**: PostgreSQL 17 con extensión PostGIS 3.5
- **Autenticación**: JWT (jsonwebtoken) + Passport.js
- **Almacenamiento**: MinIO (S3-compatible)
- **Cache/Notificaciones**: Redis 7
- **WebSockets**: Socket.IO 4.8.1
- **Logging**: Winston con rotación diaria
- **Validación**: Joi
- **Seguridad**: bcryptjs para hash de contraseñas

#### **Frontend**
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.3.5
- **Estilos**: Tailwind CSS 4.1.10
- **Routing**: React Router DOM 6.26.1
- **Estado**: Context API + Hooks personalizados
- **HTTP Client**: Axios 1.7.5
- **Mapas**: MapLibre GL 5.7.3
- **UI Components**: PrimeReact 10.9.7
- **Gráficos**: Chart.js 4.5.1
- **Calendario**: FullCalendar 6.1.19
- **Notificaciones**: React Hot Toast + Socket.IO Client

#### **Infraestructura**
- **Orquestación**: Docker Compose
- **Web Server**: Nginx (Alpine)
- **Base de Datos**: PostgreSQL + PostGIS
- **Almacenamiento**: MinIO
- **Cache**: Redis

## 📁 Estructura del Proyecto

```
Bomberos/
├── backend/                    # API REST Backend
│   ├── src/
│   │   ├── auth/              # Configuración de autenticación (Passport JWT)
│   │   ├── config/            # Configuraciones (DB, Redis, MinIO, Logger)
│   │   │   └── data/          # Datos iniciales (seeders)
│   │   ├── controllers/       # Controladores de lógica de negocio
│   │   ├── entities/          # Entidades TypeORM (modelos)
│   │   ├── helpers/          # Funciones auxiliares
│   │   ├── middlewares/       # Middlewares (auth, logger, upload)
│   │   ├── routes/            # Definición de rutas
│   │   ├── services/          # Servicios de negocio
│   │   ├── sockets/           # Handlers de WebSocket
│   │   ├── validations/       # Validaciones con Joi
│   │   └── index.js           # Punto de entrada
│   ├── migrations/            # Migraciones de base de datos
│   ├── logs/                  # Logs de aplicación
│   ├── Dockerfile             # Imagen Docker del backend
│   └── package.json
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables (133 archivos)
│   │   ├── pages/            # Páginas principales (56 archivos)
│   │   ├── hooks/            # Custom hooks (46 archivos)
│   │   ├── services/         # Servicios API (44 archivos)
│   │   ├── context/          # Context API providers
│   │   ├── helpers/          # Funciones auxiliares
│   │   ├── config/           # Configuración (API URLs)
│   │   └── main.jsx          # Punto de entrada
│   ├── public/               # Archivos estáticos
│   ├── dist/                 # Build de producción
│   ├── Dockerfile            # Imagen Docker del frontend
│   ├── nginx.conf            # Configuración Nginx
│   └── package.json
│
├── docker-compose.yml         # Orquestación de servicios
├── .env.example              # Variables de entorno de ejemplo
└── README.md                 # Documentación principal
```

## 🔄 Flujo de Datos

### 1. **Autenticación y Autorización**
- Usuario inicia sesión → Backend valida credenciales → Genera JWT → Cliente almacena token
- Requests subsecuentes incluyen JWT en headers → Middleware valida token → Acceso a recursos

### 2. **Comunicación API**
- Frontend hace request a `/api/*` → Nginx proxy a `backend:3000` → Backend procesa → Respuesta JSON

### 3. **Notificaciones en Tiempo Real**
- Backend publica evento → Redis Pub/Sub → Socket.IO emite a clientes conectados → Frontend recibe y actualiza UI

### 4. **Almacenamiento de Archivos**
- Cliente sube archivo → Backend recibe → MinIO almacena → Backend retorna URL firmada → Cliente accede a archivo

## 🗄️ Base de Datos

### Tecnología
- **PostgreSQL 17** con extensión **PostGIS 3.5** para datos geoespaciales
- **TypeORM** como ORM con `synchronize: true` (auto-migraciones)
- Configuración de zona horaria: `America/Santiago`

### Características
- Soporte para datos geoespaciales (coordenadas, polígonos, etc.)
- Inicialización automática con datos seed (regiones, comunas, roles, permisos, etc.)
- Logging de queries desactivado por defecto

## 🔐 Seguridad

### Implementaciones
- **JWT** para autenticación stateless
- **bcryptjs** para hash de contraseñas
- **Passport.js** para estrategias de autenticación
- **CORS** configurado con credenciales
- **Cookies** httpOnly y sameSite strict
- Validación de secretos en producción

### Variables Críticas
- `ACCESS_TOKEN_SECRET`: Clave para firmar JWT
- `COOKIE_KEY`: Clave para sesiones
- `DB_PASSWORD`: Contraseña de base de datos
- `MINIO_SECRET_KEY`: Clave de MinIO
- `REDIS_PASSWORD`: Contraseña de Redis (opcional)

## 📦 Servicios Docker

### 1. **database** (PostgreSQL + PostGIS)
- **Imagen**: `postgis/postgis:17-3.5`
- **Puerto**: 5432 (configurable)
- **Volumen**: `database_data` (persistencia)
- **Healthcheck**: Verifica conexión con `pg_isready`

### 2. **redis** (Cache y Pub/Sub)
- **Imagen**: `redis:7-alpine`
- **Puerto**: 6379 (configurable)
- **Volumen**: `redis_data` (persistencia con AOF)
- **Healthcheck**: `redis-cli ping`

### 3. **minio** (Almacenamiento S3)
- **Imagen**: `minio/minio:latest`
- **Puertos**: 9000 (API), 9001/9002 (Console)
- **Volumen**: `minio_data` (persistencia)
- **Buckets**: Se crean automáticamente al iniciar
- **Healthcheck**: Verifica endpoint de salud

### 4. **backend** (API Node.js)
- **Build**: Dockerfile personalizado
- **Puerto**: 3000 (configurable)
- **Volumen**: `backend_logs` (logs persistentes)
- **Dependencias**: Espera a que database, redis y minio estén saludables
- **Healthcheck**: Endpoint `/api/health`

### 5. **frontend** (React + Nginx)
- **Build**: Dockerfile multi-stage (build local + nginx)
- **Puertos**: 80 (HTTP), 443 (HTTPS)
- **Proxy**: `/api` → `backend:3000`
- **Healthcheck**: Endpoint `/health`

## 🔌 Integraciones

### Socket.IO
- **Conexión**: WebSocket para notificaciones en tiempo real
- **Canales**: Sistema de notificaciones, usuarios activos
- **Configuración**: CORS habilitado, credenciales permitidas

### MinIO
- **Buckets**:
  - `uploads` (principal)
  - `uploads-perfiles` (fotos de perfil)
  - `uploads-companias` (logos de compañías)
  - `uploads-documentos` (con lifecycle de 1 día)
  - `uploads-teselas-publicas` (acceso público)
  - `uploads-teselas-privadas` (acceso privado)
- **URLs Firmadas**: Expiración configurable (default: 3600s)

### Redis
- **Uso Principal**: 
  - Cache de datos frecuentes
  - Sistema de notificaciones Pub/Sub
  - Contadores de notificaciones no leídas
- **TTL por Tipo de Notificación**:
  - Críticas: 7 días
  - Emergencias: 3 días
  - Personales: 30 días
  - Recordatorios: 7 días
  - Mensajes directos: 14 días

## 📝 Logging

### Backend
- **Winston** con rotación diaria de archivos
- **Niveles**: error, warn, info, debug
- **Archivos**: 
  - `application-YYYY-MM-DD.log`
  - `error-YYYY-MM-DD.log`
  - `debug-YYYY-MM-DD.log`
- **Middleware**: Morgan para HTTP requests

## 🚀 Proceso de Inicialización

1. **Docker Compose** levanta servicios base (database, redis, minio)
2. **Backend** espera a que servicios base estén saludables
3. **Backend** conecta a PostgreSQL y ejecuta TypeORM (synchronize)
4. **Backend** inicializa Redis
5. **Backend** inicializa MinIO y crea buckets
6. **Backend** carga datos iniciales (seeders)
7. **Backend** inicia servidor Express + Socket.IO
8. **Frontend** espera a que backend esté saludable
9. **Frontend** sirve aplicación React a través de Nginx

## 🔧 Configuración de Desarrollo vs Producción

### Desarrollo
- `NODE_ENV=development`
- Hot reload con nodemon
- Logging detallado
- CORS permisivo
- Proxy de Vite para API

### Producción
- `NODE_ENV=production`
- Build optimizado de React
- Nginx sirve archivos estáticos
- Logging estructurado
- Validación de secretos seguros
- Healthchecks activos

## 📊 Métricas y Monitoreo

### Healthchecks
- Todos los servicios tienen healthchecks configurados
- Backend expone `/api/health`
- Frontend expone `/health`
- Dependencias esperan servicios saludables antes de iniciar

### Logs
- Logs centralizados en `backend/logs/`
- Rotación automática diaria
- Compresión de logs antiguos

## 🎯 Características Principales del Sistema

1. **Gestión de Personal**: Bomberos, turnos, disponibilidad
2. **Control de Emergencias**: Incidentes, reportes, seguimiento
3. **Gestión de Recursos**: Inventario EPP, vehículos, equipos
4. **Notificaciones**: Sistema completo con WebSocket
5. **Mapas**: Visualización geoespacial con MapLibre
6. **Reportes**: Generación de informes operativos
7. **Calendario**: Gestión de eventos y capacitaciones
8. **Almacenamiento**: Sistema de archivos con MinIO

## 🔄 Flujo de Despliegue

1. Clonar repositorio
2. Copiar `.env.example` a `.env`
3. Configurar variables de entorno
4. Ejecutar `docker-compose up -d`
5. Esperar inicialización automática
6. Acceder a aplicación en `http://localhost`

## ⚠️ Consideraciones Importantes

1. **TypeORM synchronize**: Está en `true`, lo que puede ser peligroso en producción. Considerar migraciones manuales.
2. **Secretos**: Todos los secretos deben cambiarse en producción.
3. **Puertos**: Verificar que los puertos no estén en uso.
4. **Volúmenes**: Los datos persisten en volúmenes Docker.
5. **MinIO CORS**: Puede requerir configuración adicional para acceso desde navegador.
6. **Memoria**: Backend configurado con `--max-old-space-size=4096` (4GB).

## 📈 Escalabilidad

### Horizontal
- Backend puede escalarse con múltiples instancias
- Redis puede usarse como session store compartido
- MinIO soporta múltiples nodos

### Vertical
- Aumentar recursos de contenedores según necesidad
- Ajustar `NODE_OPTIONS` para más memoria

## 🛠️ Mantenimiento

### Backup
- Volúmenes Docker contienen datos persistentes
- Backup de `database_data`, `minio_data`, `redis_data`

### Actualizaciones
- Reconstruir imágenes: `docker-compose build`
- Actualizar dependencias: `npm update` en backend/frontend
- Migraciones: TypeORM maneja automáticamente (synchronize)

---

**Última actualización**: Noviembre 2024
**Versión del sistema**: 0.0.1

