# Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Gestión Operativa para Bomberos! Esta guía te ayudará a entender cómo puedes contribuir al proyecto.

## Código de Conducta

Este proyecto y todos los que participan en él se rigen por nuestro [Código de Conducta](./CODE_OF_CONDUCT.md). Al participar, se espera que mantengas este código. Por favor, reporta comportamientos inaceptables a los mantenedores del proyecto.

## ¿Cómo puedo contribuir?

### Reportar Bugs

Si encuentras un bug, por favor:

1. **Verifica que el bug no haya sido reportado ya** buscando en los [Issues](https://github.com/MarceloPazPezo/Bomberos/issues) existentes.

2. **Crea un nuevo issue** con la siguiente información:
   - Descripción clara del problema
   - Pasos para reproducir el bug
   - Comportamiento esperado vs comportamiento actual
   - Versión del sistema y entorno (OS, Node.js, etc.)
   - Capturas de pantalla si es relevante
   - Logs de error si están disponibles

### Sugerir Mejoras

Las sugerencias de nuevas funcionalidades son bienvenidas:

1. **Verifica que la sugerencia no exista** en los Issues.

2. **Crea un nuevo issue** con:
   - Descripción clara de la funcionalidad propuesta
   - Casos de uso y beneficios
   - Posibles implementaciones o consideraciones técnicas

### Contribuir con Código

#### Configuración del Entorno de Desarrollo

1. **Fork el repositorio** y clónalo localmente:
   ```bash
   git clone https://github.com/TU_USUARIO/Bomberos.git
   cd Bomberos
   ```

2. **Instala las dependencias**:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configura las variables de entorno**:
   ```bash
   cp .env.example .env
   # Edita .env con tus configuraciones
   ```

4. **Levanta los servicios de infraestructura**:
   ```bash
   docker compose up -d database redis minio
   ```

5. **Inicia el backend en modo desarrollo**:
   ```bash
   cd backend
   npm run dev
   ```

6. **Inicia el frontend en modo desarrollo** (en otra terminal):
   ```bash
   cd frontend
   npm run dev
   ```

#### Proceso de Contribución

1. **Crea una rama** para tu feature o fix:
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   # o
   git checkout -b fix/descripcion-del-fix
   ```

2. **Haz tus cambios** siguiendo las convenciones del proyecto:
   - **Backend**: Usa ESLint y sigue el estilo de código existente
   - **Frontend**: Usa ESLint y sigue el estilo de código existente
   - Escribe código limpio y comentado cuando sea necesario
   - Agrega tests si es posible

3. **Verifica que todo funcione**:
   ```bash
   # Backend
   cd backend
   npm run lint
   npm test  # Si hay tests disponibles
   
   # Frontend
   cd frontend
   npm run lint
   ```

4. **Commit tus cambios**:
   ```bash
   git add .
   git commit -m "feat: descripción clara de tu cambio"
   ```
   
   Usa mensajes de commit descriptivos siguiendo el formato:
   - `feat:` para nuevas funcionalidades
   - `fix:` para correcciones de bugs
   - `docs:` para cambios en documentación
   - `style:` para cambios de formato (no afectan el código)
   - `refactor:` para refactorización de código
   - `test:` para agregar o modificar tests
   - `chore:` para cambios en el proceso de build o herramientas

5. **Push a tu fork**:
   ```bash
   git push origin feature/nombre-de-tu-feature
   ```

6. **Abre un Pull Request**:
   - Ve a https://github.com/MarceloPazPezo/Bomberos
   - Haz clic en "New Pull Request"
   - Selecciona tu rama y describe tus cambios
   - Menciona cualquier issue relacionado

### Contribuir con Documentación

Las mejoras a la documentación son muy valiosas:

- Corregir errores tipográficos
- Mejorar la claridad de las explicaciones
- Agregar ejemplos
- Traducir documentación
- Agregar comentarios útiles en el código

### Contribuir con Tests

Los tests son esenciales para mantener la calidad del código:

- Agrega tests para nuevas funcionalidades
- Agrega tests para bugs corregidos
- Mejora la cobertura de tests existentes

## Estándares de Código

### Backend (Node.js)

- Usa `"use strict"` en archivos JavaScript
- Sigue las convenciones de ESLint configuradas
- Usa async/await en lugar de callbacks cuando sea posible
- Maneja errores apropiadamente
- Documenta funciones complejas con JSDoc

### Frontend (React)

- Usa componentes funcionales con hooks
- Sigue las convenciones de ESLint configuradas
- Mantén componentes pequeños y reutilizables
- Usa PropTypes o TypeScript cuando sea posible
- Optimiza renders innecesarios

### Git

- Haz commits pequeños y frecuentes
- Usa mensajes de commit descriptivos
- Una rama por feature o fix
- Mantén tu rama actualizada con la rama principal

## Proceso de Revisión

1. Los mantenedores revisarán tu Pull Request
2. Puede haber solicitudes de cambios
3. Una vez aprobado, tu código será mergeado
4. ¡Gracias por tu contribución!

## Preguntas

Si tienes preguntas sobre cómo contribuir, puedes:

- Abrir un issue con la etiqueta `question`
- Contactar a los mantenedores del proyecto

## Reconocimiento

Todas las contribuciones son valiosas y serán reconocidas. Los contribuidores serán mencionados en el README y en los releases del proyecto.

---

**Gracias por contribuir al Sistema de Gestión Operativa para Bomberos!** 🚒

