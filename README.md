# WhatsApp Chat Dashboard

Dashboard moderno construido con React y Vite para visualizar conversaciones y mensajes del bot de WhatsApp.

## 🚀 Características

- **Dashboard en tiempo real** con estadísticas del bot
- **Lista de conversaciones** con búsqueda y paginación
- **Vista de mensajes** estilo WhatsApp con diferenciación user/bot
- **Diseño responsive** optimizado para móvil y escritorio
- **Actualización automática** de estadísticas cada 30 segundos
- **Interfaz moderna** con componentes reutilizables

## 🛠️ Tecnologías

- **React 19** - Framework frontend
- **Vite** - Build tool y servidor de desarrollo
- **Axios** - Cliente HTTP para API calls
- **Lucide React** - Iconos modernos
- **CSS3** - Estilos personalizados con variables CSS

## 📦 Instalación

### Prerrequisitos

- Node.js 20.13+ 
- npm o yarn
- Servidor backend del bot WhatsApp ejecutándose

### Pasos de instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno** (opcional)
   ```bash
   # La API por defecto apunta a http://localhost:3009/api
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en navegador**
   ```
   http://localhost:5173
   ```

## 🔧 Configuración

### Configuración de API

El dashboard se conecta al backend del bot WhatsApp a través de los siguientes endpoints:

- `GET /api/stats` - Estadísticas generales
- `GET /api/conversations` - Lista de conversaciones
- `GET /api/conversations/:id/messages` - Mensajes de una conversación

Por defecto, la API se conecta a `http://localhost:3009/api`. Para cambiar esto, edita `src/services/api.js`.

## 📱 Uso

1. **Iniciar el servidor API** del bot WhatsApp en puerto 3009
2. **Ejecutar** `npm run dev` en este proyecto
3. **Abrir** http://localhost:5173 en tu navegador
4. **Ver estadísticas** en la parte superior
5. **Seleccionar conversación** de la lista lateral
6. **Ver mensajes** en el panel principal

## 🚀 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Vista previa de build
npm run lint         # Ejecutar ESLint
```

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
