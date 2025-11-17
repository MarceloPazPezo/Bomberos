# Usar una imagen oficial de Node.js ligera. La versión LTS es una buena práctica.
FROM node:20-alpine

# Instalar dependencias del sistema necesarias para algunas librerías de Node.js
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Establecer variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Cambiar ownership del directorio de trabajo y crear directorio para logs
RUN chown -R backend:nodejs /app && mkdir -p /app/logs && chown -R backend:nodejs /app/logs
USER backend

# Copiar el package.json y package-lock.json para instalar dependencias
COPY --chown=backend:nodejs package*.json ./

# Instalar las dependencias del proyecto. Al hacerlo antes de copiar el resto del código,
# Docker puede usar la caché si las dependencias no han cambiado.
RUN npm ci --only=production && npm cache clean --force

# Copiar el resto del código fuente de la aplicación
COPY --chown=backend:nodejs . .

# Exponer el puerto en el que la aplicación se ejecutará dentro del contenedor
EXPOSE 3000

# Health check para verificar que la aplicación esté funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# El comando para iniciar la aplicación
CMD ["sh", "-c", "mkdir -p /app/logs && npm start"]