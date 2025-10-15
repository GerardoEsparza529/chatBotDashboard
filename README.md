# WhatsApp Chat Dashboard

Dashboard moderno construido con React y Vite para visualizar conversaciones y mensajes del bot de WhatsApp.

![Dashboard Preview](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-4.5.3-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

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
- **Servidor backend del bot WhatsApp ejecutándose** (ver [Backend Setup](#backend-setup))

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/GerardoEsparza529/chatBotDashboard.git
   cd chatBotDashboard
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Copiar el archivo de ejemplo
   cp .env.example .env.local
   
   # Editar las variables según tu configuración
   # .env.local
   VITE_API_BASE_URL=http://localhost:3009/api
   VITE_API_TIMEOUT=10000
   VITE_DEBUG=true
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en navegador**
   ```
   http://localhost:5173
   ```

## 🔧 Backend Setup

Este dashboard requiere un servidor backend que exponga la API de datos del bot de WhatsApp.

### Servidor API requerido (puerto 3009)

El backend debe incluir un servidor como este:

```javascript
// api-server.js
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Endpoints requeridos
app.get('/api/stats', async (req, res) => {
  // Retornar estadísticas
});

app.get('/api/conversations', async (req, res) => {
  // Retornar lista de conversaciones
});

app.get('/api/conversations/:id/messages', async (req, res) => {
  // Retornar mensajes de una conversación
});

app.listen(3009, () => {
  console.log('API running on http://localhost:3009');
});
```

### Iniciar el backend

```bash
# En el directorio del proyecto del bot
node api-server.js
```

## 🔧 Configuración

### Variables de Entorno

El proyecto utiliza las siguientes variables de entorno:

| Variable | Descripción | Valor por defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `VITE_API_BASE_URL` | URL base de la API del backend | `http://localhost:3009/api` | ✅ |
| `VITE_API_TIMEOUT` | Timeout de requests en ms | `10000` | ❌ |
| `VITE_DEBUG` | Habilitar logs de debug | `false` | ❌ |

#### Configuración para diferentes entornos

**Desarrollo local (.env.local)**
```env
VITE_API_BASE_URL=http://localhost:3009/api
VITE_API_TIMEOUT=10000
VITE_DEBUG=true
```

**Producción (.env.production)**
```env
VITE_API_BASE_URL=https://tu-servidor.com/api
VITE_API_TIMEOUT=15000
VITE_DEBUG=false
```

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

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── Dashboard.jsx      # Componente principal
│   │   └── StatsCards.jsx     # Tarjetas de estadísticas
│   ├── Chat/
│   │   ├── ChatInterface.jsx  # Interfaz de chat
│   │   ├── ConversationList.jsx # Lista de conversaciones
│   │   └── MessageView.jsx    # Vista de mensajes
│   └── Layout/
│       └── Header.jsx         # Cabecera
├── hooks/
│   ├── useStats.js           # Hook para estadísticas
│   ├── useConversations.js   # Hook para conversaciones
│   └── useMessages.js        # Hook para mensajes
├── services/
│   └── api.js                # Cliente API
└── App.jsx                   # Componente raíz
```

## 🌐 Demo

Visita el repositorio: [https://github.com/GerardoEsparza529/chatBotDashboard](https://github.com/GerardoEsparza529/chatBotDashboard)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
