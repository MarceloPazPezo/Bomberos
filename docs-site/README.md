# Documentación del Sistema de Bomberos

Este directorio contiene la documentación técnica del Sistema de Gestión Operativa para Bomberos, construida con [Docusaurus](https://docusaurus.io/).

## 🚀 Despliegue Automático y Manual

Este proyecto está configurado para desplegarse en GitHub Pages usando GitHub Actions de dos formas:

### 🔄 Despliegue Automático
- **Trigger:** Push o Pull Request a la rama `docs`
- **Destino:** GitHub Pages
- **URL:** https://marcelopazpezo.github.io/Bomberos/

### 🎯 Despliegue Manual
Puedes activar el despliegue manualmente desde GitHub:

1. Ve a tu repositorio en GitHub
2. Navega a **Actions** → **Deploy Docs to GitHub Pages**
3. Haz clic en **Run workflow**
4. Selecciona:
   - **Rama:** `docs` o `main` (desde dónde desplegar)
   - **Entorno:** `production` o `staging`
5. Haz clic en **Run workflow**

> 💡 **Ventaja del despliegue manual:** Útil como respaldo si el automático falla o para desplegar desde diferentes ramas.

### Configuración de GitHub Pages

1. Ve a la configuración de tu repositorio en GitHub
2. Navega a **Settings** > **Pages**
3. En **Source**, selecciona **GitHub Actions**
4. El workflow se ejecutará automáticamente en cada push a la rama `docs`

### URL de la Documentación

Una vez configurado, la documentación estará disponible en:
```
https://marcelopazpezo.github.io/Bomberos/
```

## 🛠️ Desarrollo Local

### Instalación
```bash
npm install
```

### Servidor de Desarrollo
```bash
npm start
```

Esto iniciará un servidor local en `http://localhost:3000` con recarga automática.

### Construcción
```bash
npm run build
```

Este comando genera contenido estático en el directorio `build` que puede ser servido por cualquier servicio de hosting estático.

## 📁 Estructura del Proyecto

```
docs-site/
├── docs/                    # Archivos de documentación en Markdown
│   ├── intro.md            # Página de introducción
│   ├── guias/              # Guías de instalación y uso
│   └── arquitectura/       # Documentación técnica
├── src/
│   ├── components/         # Componentes React personalizados
│   ├── css/               # Estilos personalizados
│   └── pages/             # Páginas adicionales
├── static/                 # Archivos estáticos (imágenes, etc.)
├── docusaurus.config.js    # Configuración de Docusaurus
└── sidebars.js            # Configuración de la barra lateral
```

## 📝 Agregar Contenido

### Nuevas Páginas
1. Crea un archivo `.md` en el directorio `docs/`
2. Agrega el frontmatter necesario:
   ```markdown
   ---
   sidebar_position: 1
   title: Mi Página
   ---
   
   # Contenido de la página
   ```

### Imágenes
1. Coloca las imágenes en `static/img/`
2. Referéncialas en Markdown: `![Alt text](/img/mi-imagen.png)`

### Componentes Personalizados
Puedes usar componentes React en archivos MDX:
```jsx
import MiComponente from '@site/src/components/MiComponente';

<MiComponente prop="valor" />
```

## 🔧 Configuración

### Personalización del Tema
Edita `src/css/custom.css` para personalizar colores, fuentes y estilos.

### Configuración del Sitio
Modifica `docusaurus.config.js` para cambiar:
- Título y descripción del sitio
- Configuración de navegación
- Plugins y temas
- Configuración de despliegue

## 🚨 Solución de Problemas

### El sitio no se despliega
1. Verifica que GitHub Pages esté habilitado
2. Revisa los logs del workflow en la pestaña **Actions**
3. Asegúrate de que la rama `docs` exista y tenga contenido

### Enlaces rotos
1. Ejecuta `npm run build` localmente para detectar enlaces rotos
2. Verifica que todas las rutas sean relativas y correctas
3. Usa el formato correcto para enlaces internos: `[Texto](./ruta-relativa)`

### Problemas de estilos
1. Verifica que los archivos CSS estén en `src/css/`
2. Importa los estilos en `docusaurus.config.js`
3. Usa las clases CSS de Docusaurus cuando sea posible

## 📚 Recursos

- [Documentación de Docusaurus](https://docusaurus.io/docs)
- [Guía de Markdown](https://docusaurus.io/docs/markdown-features)
- [Configuración de GitHub Pages](https://docs.github.com/en/pages)
- [GitHub Actions](https://docs.github.com/en/actions)
