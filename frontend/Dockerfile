# ===========================================
# DOCKERFILE PARA FRONTEND (USANDO BUILD LOCAL)
# ===========================================

# Usar imagen de nginx
FROM nginx:stable-alpine

    # Instalar curl para health checks
    RUN apk add --no-cache curl

    # Crear usuario no-root
    RUN addgroup -g 1001 -S nginx-app && \
        adduser -S nginx-app -u 1001 -G nginx-app

    # Copiar archivos construidos desde el build local
    COPY dist /usr/share/nginx/html

    # Copiar configuración personalizada de Nginx
    COPY nginx.conf /etc/nginx/conf.d/default.conf

    # Cambiar permisos
    RUN chown -R nginx-app:nginx-app /usr/share/nginx/html && \
        chown -R nginx-app:nginx-app /var/cache/nginx && \
        chown -R nginx-app:nginx-app /var/log/nginx && \
        chown -R nginx-app:nginx-app /etc/nginx/conf.d && \
        touch /var/run/nginx.pid && \
        chown -R nginx-app:nginx-app /var/run/nginx.pid

    # Cambiar a usuario no-root
    USER nginx-app

    # Exponer puerto
    EXPOSE 80

    # Health check
    HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
      CMD curl -f http://localhost/health || exit 1

    # Comando para iniciar Nginx
    CMD ["nginx", "-g", "daemon off;"]