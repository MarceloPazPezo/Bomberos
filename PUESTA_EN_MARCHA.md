# Guía de Puesta en Marcha - Sistema de Gestión de Bomberos

Esta guía describe el proceso de instalación y configuración utilizado para poner en marcha el sistema en producción.

## Prerrequisitos

- Sistema operativo Linux (Ubuntu/Debian recomendado)
- Acceso root o sudo
- Conexión a internet

## Paso 1: Instalar NVM (Node Version Manager)

NVM permite gestionar múltiples versiones de Node.js fácilmente.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Después de la instalación, recarga tu shell o ejecuta:

```bash
source ~/.bashrc
# o
source ~/.zshrc
```

Verifica la instalación:

```bash
nvm --version
```

## Paso 2: Instalar Node.js

Instala la versión específica de Node.js (22.19.0) usando NVM:

```bash
nvm install 22.19.0
nvm use 22.19.0
nvm alias default 22.19.0
```

Verifica la instalación:

```bash
node --version
npm --version
```

## Paso 3: Clonar el Repositorio

```bash
git clone https://github.com/MarceloPazPezo/Bomberos
cd Bomberos/
```

## Paso 4: Configurar Variables de Entorno

Crea y edita el archivo `.env`:

```bash
nano .env
```

Configura el archivo `.env` con la siguiente estructura (reemplaza los valores con tus configuraciones reales):

```env
# CONFIGURACIÓN DEL BACKEND
B_HOST=0.0.0.0
B_PORT=11000
B_ACCESS_TOKEN_SECRET=<TU_SECRETO_JWT_AQUI>
B_COOKIE_KEY=<TU_CLAVE_COOKIE_AQUI>

# CONFIGURACIÓN DE BASE DE DATOS
DB_HOST=0.0.0.0
DB_NAME=db_bomberos
DB_PORT=5432
DB_USERNAME=user_bomberos
DB_PASSWORD=<TU_CONTRASEÑA_DB>

# CONFIGURACIÓN DE MINIO
MINIO_ENDPOINT=0.0.0.0
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=<TU_ACCESS_KEY>
MINIO_SECRET_KEY=<TU_SECRET_KEY>
MINIO_BUCKET_NAME=subidas
MINIO_PUBLIC_URL=http://<TU_IP>:11001/minio
MINIO_EXTERNAL_ENDPOINT=<TU_IP>
MINIO_EXTERNAL_PORT=11002
MINIO_EXTERNAL_USE_SSL=false

# CONFIGURACIÓN DE DOCKER
EXTERNAL_BACKEND_PORT=11000
EXTERNAL_FRONTEND_PORT=11001
EXTERNAL_FRONTEND_SSL_PORT=11443
EXTERNAL_DB_PORT=11004
EXTERNAL_DB_TEST_PORT=11006
EXTERNAL_MINIO_PORT=11002
EXTERNAL_MINIO_CONSOLE_PORT=11003

# CONFIGURACIÓN DE PRODUCCIÓN
NODE_ENV=production

# CONFIGURACIÓN DE REDIS
REDIS_HOST=0.0.0.0
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
EXTERNAL_REDIS_PORT=11005

# CONFIGURACIÓN DE LIMPIEZA AUTOMÁTICA
CLEANUP_INTERVAL=3600000
CLEANUP_BATCH_SIZE=100

# CONFIGURACIÓN DE TTL DE NOTIFICACIONES
NOTIFICATION_TTL_CRITICAL=604800
NOTIFICATION_TTL_EMERGENCY=259200
NOTIFICATION_TTL_PERSONAL=2592000
NOTIFICATION_TTL_REMINDER=604800
NOTIFICATION_TTL_DIRECT_MESSAGE=1209600
NOTIFICATION_TTL_SYSTEM=259200
NOTIFICATION_TTL_READ=86400

# CONFIGURACIÓN DE OPTIMIZACIÓN
COMPRESS_AFTER_DAYS=7
DELETE_READ_AFTER_DAYS=7
MAX_NOTIFICATIONS_PER_USER=50

# CONFIGURACIÓN DEL FRONTEND
VITE_BASE_URL=
VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_BACKEND_URL=http://<TU_IP>:11000
```

> **IMPORTANTE**: Reemplaza todos los valores marcados con `<...>` con tus valores reales. En producción, usa secretos seguros generados aleatoriamente.

## Paso 5: Instalar Docker Compose

Si no tienes Docker Compose instalado:

```bash
# Instalar Docker
sudo apt update
sudo apt install docker.io docker-compose-plugin -y

# Agregar tu usuario al grupo docker (opcional, para no usar sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

## Paso 6: Levantar Servicios Base con Docker

Levanta únicamente los servicios de base de datos, MinIO y Redis. **Nota:** El backend y frontend NO se ejecutan como contenedores Docker, el backend corre con PM2 y el frontend se sirve directamente con Nginx.

```bash
sudo docker compose up --build database minio redis -d
```

Verifica que los servicios estén corriendo:

```bash
sudo docker compose ps
```

Espera unos segundos para que los servicios estén completamente inicializados antes de continuar.

## Paso 7: Instalar Dependencias del Backend

```bash
cd backend/
npm install
```

## Paso 8: Instalar y Configurar PM2

PM2 es un gestor de procesos para Node.js que mantiene la aplicación corriendo en producción.

```bash
# Cambiar a root o usar sudo
sudo su

# Instalar PM2 globalmente
npm install pm2 -g

# Salir de root
exit
```

Iniciar el backend con PM2:

```bash
cd backend/
pm2 start src/index.js --name "backend"
```

Comandos útiles de PM2:

```bash
# Ver estado de procesos
pm2 status

# Ver logs en tiempo real
pm2 logs backend

# Reiniciar el backend
pm2 restart backend

# Detener el backend
pm2 stop backend

# Configurar PM2 para iniciar al arrancar el sistema
pm2 startup
pm2 save
```

## Paso 9: Instalar Dependencias y Construir el Frontend

```bash
cd frontend/
npm install
npm run build
```

El comando `npm run build` generará los archivos estáticos en la carpeta `dist/`.

## Paso 10: Configurar Nginx

### 10.1. Instalar Nginx (si no está instalado)

```bash
sudo apt update
sudo apt install nginx -y
```

### 10.2. Crear Directorio para el Frontend

```bash
sudo mkdir -p /var/www/bomberos
```

### 10.3. Copiar Archivos del Frontend

```bash
# Desde el directorio frontend/
sudo cp -r dist/* /var/www/bomberos/
```

### 10.4. Crear Configuración de Nginx

Crea el archivo de configuración:

```bash
sudo nano /etc/nginx/sites-available/bomberos
```

Pega la siguiente configuración (ajusta los valores según tu entorno):

```nginx
server {
    listen 11001;
    server_name _;

    client_max_body_size 10M;

    root /var/www/bomberos/; 
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:11000;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:11000;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /minio/ {
        rewrite ^/minio/(.*)$ /$1 break;
        
        proxy_pass http://localhost:11002;
        
        proxy_set_header Host 127.0.0.1:11002;
        proxy_set_header Cookie "";
        
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 10.5. Habilitar el Sitio

Crea un enlace simbólico para habilitar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/bomberos /etc/nginx/sites-enabled/
```

### 10.6. Verificar y Recargar Nginx

```bash
# Verificar la configuración
sudo nginx -t

# Si la verificación es exitosa, recargar Nginx
sudo systemctl reload nginx
```

## Paso 11: Verificar la Instalación

1. **Verificar servicios Docker:**
   ```bash
   sudo docker compose ps
   ```

2. **Verificar PM2:**
   ```bash
   pm2 status
   pm2 logs backend --lines 50
   ```

3. **Verificar Nginx:**
   ```bash
   sudo systemctl status nginx
   ```

4. **Acceder a la aplicación:**
   - Frontend: `http://<TU_IP>:11001`
   - Backend API: `http://<TU_IP>:11001/api`
   - MinIO Console: `http://<TU_IP>:11003`

## Actualizar el Frontend

Cuando necesites actualizar el frontend después de cambios:

```bash
cd frontend/
npm run build
sudo rm -rf /var/www/bomberos/*
sudo cp -r dist/* /var/www/bomberos/
```

## Comandos Útiles

### Reiniciar Backend
```bash
pm2 restart backend
```

### Ver Logs del Backend
```bash
pm2 logs backend
```

### Reiniciar Nginx
```bash
sudo systemctl restart nginx
```

### Ver Logs de Nginx
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Reiniciar Servicios Docker
```bash
sudo docker compose restart database minio redis
```

### Ver Logs de Docker
```bash
sudo docker compose logs -f database
sudo docker compose logs -f minio
sudo docker compose logs -f redis
```

## Seguridad

- **Cambia todos los secretos** en el archivo `.env` antes de poner en producción
- **Usa contraseñas seguras** para la base de datos, MinIO y Redis
- **Configura firewall** para permitir solo los puertos necesarios
- **Considera usar SSL/TLS** para conexiones seguras en producción

## Notas Importantes

- El backend corre con PM2 en el puerto 11000 (NO como contenedor Docker)
- El frontend se sirve desde Nginx en el puerto 11001 (NO como contenedor Docker)
- Nginx actúa como proxy inverso para `/api/` y `/minio/`
- Solo los servicios de base de datos, Redis y MinIO corren en Docker
- PM2 mantiene el backend corriendo y lo reinicia automáticamente si falla

## Solución de Problemas

### El backend no inicia
```bash
# Verificar logs de PM2
pm2 logs backend

# Verificar que el puerto 11000 no esté en uso
sudo netstat -tuln | grep 11000
```

### Nginx no sirve el frontend
```bash
# Verificar permisos del directorio
sudo chown -R www-data:www-data /var/www/bomberos

# Verificar configuración de Nginx
sudo nginx -t
```

### Los servicios Docker no inician
```bash
# Ver logs de los servicios
sudo docker compose logs

# Verificar que los puertos no estén en uso
sudo netstat -tuln | grep -E ':(11002|11003|11004|11005)'
```

---

**Versión del Sistema:** 1.0.0  
**Licencia:** GPL-3.0  
**Autores:** Jerson Palma y Marcelo Paz

