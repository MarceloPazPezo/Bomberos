# Sistema de Gestión Operativa para Bomberos 🚒

Un sistema integral de gestión operativa diseñado específicamente para cuerpos de bomberos, que permite administrar recursos, personal, emergencias y operaciones de manera eficiente.

## 🎯 Características Principales

- **Gestión de Personal**: Administración de bomberos, turnos y disponibilidad
- **Control de Emergencias**: Registro y seguimiento de incidentes y emergencias
- **Gestión de Recursos**: Inventario de equipos, vehículos y materiales
- **Reportes Operativos**: Generación de informes y estadísticas
- **Sistema de Usuarios**: Control de acceso con roles y permisos

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con Express.js
- **PostgreSQL** con PostGIS para datos geoespaciales
- **Sequelize** como ORM
- **Winston** para logging
- **JWT** para autenticación

### Frontend
- **React** con Vite
- **Tailwind CSS** para estilos
- **React Router** para navegación

### Infraestructura
- **Docker** y Docker Compose
- **MinIO** para almacenamiento de archivos
- **Nginx** como servidor web

## 🚀 Instalación y Configuración

### Prerrequisitos
- Docker y Docker Compose instalados
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd Bomberos
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Edita el archivo `.env` con tus configuraciones específicas.

3. **Levantar los servicios**
   ```bash
   docker-compose up -d
   ```

4. **Acceder a la aplicación**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000/api
   - MinIO Console: http://localhost:9002

## 📁 Estructura del Proyecto

```
Bomberos/
├── backend/           # API REST con Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── Dockerfile
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── Dockerfile
├── docker-compose.yml # Configuración de servicios
└── README.md
```

## 🔧 Servicios Disponibles

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend | 80/443 | Interfaz de usuario web |
| Backend | 3000 | API REST |
| PostgreSQL | 5433 | Base de datos principal |
| PostgreSQL Test | 5434 | Base de datos de pruebas |
| MinIO | 9000/9002 | Almacenamiento de archivos |

## 🔐 Usuarios por Defecto

El sistema se inicializa con usuarios predeterminados para diferentes roles. Consulta la documentación del backend para más detalles sobre las credenciales iniciales.

## 📝 Desarrollo

### Comandos Útiles

```bash
# Detener todos los servicios
docker-compose down

# Reconstruir y levantar servicios
docker-compose up --build -d

# Ver logs de un servicio específico
docker logs plantilla-pern-backend

# Acceder a la base de datos
docker exec -it plantilla-pern-database psql -U user_plantilla -d db_plantilla
```

### Variables de Entorno Importantes

- `NODE_ENV`: Entorno de ejecución (development/production)
- `DB_NAME`: Nombre de la base de datos
- `DB_USERNAME`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `JWT_SECRET`: Clave secreta para JWT

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

---

**Desarrollado con ❤️ para mejorar la gestión operativa de los cuerpos de bomberos**