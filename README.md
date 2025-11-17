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
- **Docker** y Docker Compose para orquestación
- **Nginx** como servidor web para frontend
- **PostgreSQL + PostGIS** para base de datos
- **Redis** para cache y pub/sub
- **MinIO** para almacenamiento de objetos

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Docker** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior)
- **Git** para clonar el repositorio

### Verificar Instalación

```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar que Docker esté corriendo
docker ps
```

## 🚀 Guía de Instalación Paso a Paso

### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Bomberos
```

### Paso 2: Configurar Variables de Entorno

1. **Copiar el archivo de ejemplo**:
   ```bash
   cp .env.example .env
   ```

2. **Editar el archivo `.env`** con tus configuraciones:
   ```bash
   nano .env  # o usa tu editor preferido
   ```

3. **Configuraciones mínimas requeridas**:
   - Cambiar los secretos de seguridad (`B_ACCESS_TOKEN_SECRET`, `B_COOKIE_KEY`)
   - Verificar puertos si hay conflictos
   - Configurar contraseñas de base de datos, Redis y MinIO

   > 💡 **Importante**: En producción, **SIEMPRE** cambia todos los secretos y contraseñas por defecto.

### Paso 3: Verificar Puertos Disponibles

Antes de levantar los servicios, verifica que los puertos no estén en uso:

```bash
# Verificar puertos principales
netstat -tuln | grep -E ':(80|443|3000|5432|6379|9000|9002)'

# O usar ss (alternativa)
ss -tuln | grep -E ':(80|443|3000|5432|6379|9000|9002)'
```

Si algún puerto está en uso, modifica las variables `EXTERNAL_*_PORT` en el archivo `.env`.

### Paso 4: Construir y Levantar los Servicios

#### Opción A: Levantar todo de una vez (Recomendado)

```bash
# Construir imágenes y levantar servicios
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f
```

#### Opción B: Levantar servicios paso a paso

```bash
# 1. Levantar servicios base (database, redis, minio)
docker-compose up -d database redis minio

# 2. Esperar a que estén saludables (30-60 segundos)
docker-compose ps

# 3. Levantar backend
docker-compose up -d backend

# 4. Esperar a que backend esté saludable
docker-compose logs -f backend

# 5. Levantar frontend
docker-compose up -d frontend

# 6. Verificar que todo esté corriendo
docker-compose ps
```

### Paso 5: Verificar que Todo Funcione

1. **Verificar estado de servicios**:
   ```bash
   docker-compose ps
   ```
   
   Todos los servicios deben mostrar `Up` y `healthy` (o `healthy` en healthcheck).

2. **Verificar logs**:
   ```bash
   # Logs de todos los servicios
   docker-compose logs
   
   # Logs de un servicio específico
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs database
   ```

3. **Verificar acceso a servicios**:
   - **Frontend**: http://localhost (o el puerto configurado en `EXTERNAL_FRONTEND_PORT`)
   - **Backend API**: http://localhost:3000/api (o el puerto configurado)
   - **MinIO Console**: http://localhost:9002 (usuario: `minioadmin`, contraseña: la configurada en `MINIO_SECRET_KEY`)

### Paso 6: Configurar MinIO (Opcional pero Recomendado)

1. **Acceder a MinIO Console**:
   - URL: http://localhost:9002
   - Usuario: `minioadmin` (o el valor de `MINIO_ACCESS_KEY`)
   - Contraseña: `minioadmin123` (o el valor de `MINIO_SECRET_KEY`)

2. **Configurar CORS** (si necesitas acceso directo desde el navegador):
   - Ve a Settings → CORS
   - O ejecuta el script proporcionado: `./minio-setup-cors.sh`

3. **Verificar buckets creados**:
   Los siguientes buckets se crean automáticamente:
   - `uploads` (principal)
   - `uploads-perfiles`
   - `uploads-companias`
   - `uploads-documentos`
   - `uploads-teselas-publicas`
   - `uploads-teselas-privadas`

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

## 🔧 Servicios Disponibles

| Servicio | Puerto Interno | Puerto Externo | Descripción |
|----------|----------------|----------------|-------------|
| Frontend | 80 | 80 (configurable) | Interfaz de usuario web (Nginx) |
| Backend | 3000 | 3000 (configurable) | API REST (Node.js + Express) |
| PostgreSQL | 5432 | 5432 (configurable) | Base de datos principal |
| Redis | 6379 | 6379 (configurable) | Cache y notificaciones |
| MinIO API | 9000 | 9000 (configurable) | API de almacenamiento |
| MinIO Console | 9001 | 9002 (configurable) | Interfaz web de MinIO |

## 🐳 Comandos Docker Útiles

### Gestión de Servicios

```bash
# Levantar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ CUIDADO: Elimina datos)
docker-compose down -v

# Reconstruir y levantar servicios
docker-compose up -d --build

# Reiniciar un servicio específico
docker-compose restart backend

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Ver estado de servicios
docker-compose ps
```

### Acceso a Contenedores

```bash
# Acceder a la base de datos
docker exec -it bomberos-pern-database psql -U user_bomberos -d db_bomberos

# Acceder al contenedor del backend
docker exec -it bomberos-pern-backend sh

# Acceder al contenedor del frontend
docker exec -it bomberos-pern-frontend sh

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

### Ver Logs del Backend

```bash
# Logs en tiempo real
docker-compose logs -f backend

# Últimas 100 líneas
docker-compose logs --tail=100 backend

# Logs desde archivos (dentro del contenedor)
docker exec bomberos-pern-backend ls -la /app/logs
docker exec bomberos-pern-backend tail -f /app/logs/application-$(date +%Y-%m-%d).log
```

### Logs de Archivos

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
   docker-compose ps database
   ```

2. Verificar variables de entorno:
   ```bash
   docker-compose exec backend env | grep DB_
   ```

3. Verificar conectividad:
   ```bash
   docker-compose exec backend ping database
   ```

### Problema: Frontend no carga

1. Verificar que el backend esté corriendo:
   ```bash
   docker-compose ps backend
   curl http://localhost:3000/api/health
   ```

2. Verificar logs de Nginx:
   ```bash
   docker-compose logs frontend
   ```

3. Verificar configuración de proxy en `nginx.conf`

### Problema: MinIO no crea buckets

1. Verificar que MinIO esté saludable:
   ```bash
   docker-compose ps minio
   ```

2. Verificar logs:
   ```bash
   docker-compose logs minio
   ```

3. Crear buckets manualmente desde la consola web

### Problema: Redis no conecta

1. Verificar que Redis esté saludable:
   ```bash
   docker-compose ps redis
   ```

2. Probar conexión:
   ```bash
   docker-compose exec redis redis-cli ping
   ```

3. Verificar contraseña si está configurada:
   ```bash
   docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping
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

# 2. Reconstruir imágenes
docker-compose build

# 3. Reiniciar servicios
docker-compose up -d
```

### Actualizar Dependencias

```bash
# Backend
cd backend
npm update
docker-compose build backend
docker-compose up -d backend

# Frontend
cd frontend
npm update
docker-compose build frontend
docker-compose up -d frontend
```

## 📚 Documentación Adicional

- [Análisis del Proyecto](./ANALISIS_PROYECTO.md) - Análisis técnico detallado
- Documentación de API: Disponible en `/api/docs` (si está configurado)
- Logs: Revisar `backend/logs/` para información detallada

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

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
