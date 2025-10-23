# 🚀 Guía de Despliegue a Producción - Dashboard WebSocket

## ✅ Pre-requisitos

1. **Servidores en Railway activos:**
   - `chatbot-api` (puerto 3001) - API principal
   - `template_JS_basic-main` (puerto 3008) - Servicio bot
   - `whatsapp-chat-dashboard` (puerto 5173) - Dashboard frontend

## 📋 Pasos para Despliegue

### 1. Configurar Variables de Entorno en Railway

#### En el servicio `whatsapp-chat-dashboard`:
```bash
# Reemplazar con las URLs reales de Railway
VITE_API_BASE_URL=https://tu-chatbot-api.railway.app
VITE_BOT_SERVICE_URL=https://tu-bot-service.railway.app
VITE_API_TIMEOUT=15000
VITE_DEBUG=false
NODE_ENV=production
```

#### En el servicio `chatbot-api`:
- Asegurar que tenga todas las variables de base de datos
- Verificar que `PORT=3001` esté configurado

#### En el servicio `template_JS_basic-main`:
- Asegurar que tenga todas las variables de Meta API
- Verificar que `PORT=3008` esté configurado

### 2. Verificar Configuración de Puertos

Los servicios deben usar estos puertos específicos:
- **API (chatbot-api)**: Puerto 3001
- **Bot Service**: Puerto 3008  
- **Dashboard**: Puerto 5173 (o el que asigne Railway)

### 3. Verificar WebSocket en Producción

Una vez desplegado, verificar en la consola del navegador:
```
🔌 WebSocket service iniciado
   - API URL: https://tu-chatbot-api.railway.app
   - Bot Service URL: https://tu-bot-service.railway.app
🔌 Conectado al WebSocket del API: [socket-id]
🔌 Conectado al WebSocket del Bot Service: [socket-id]
```

### 4. Funcionalidades que deben funcionar:

✅ **Conexión WebSocket dual** (API + Bot Service)  
✅ **Mensajes en tiempo real** sin refresh  
✅ **Cambios de estado del bot** actualizaciones instantáneas  
✅ **Envío de mensajes humanos** con entrega real a WhatsApp  
✅ **Sincronización multi-cliente** entre pestañas del dashboard  

## 🔧 Configuración Técnica Completada

### Backend WebSocket:
- ✅ Socket.IO integrado en ambos servidores
- ✅ CORS configurado para todos los orígenes
- ✅ Manejo de salas de conversación
- ✅ Eventos: `new-message`, `bot-status-change`

### Frontend WebSocket:
- ✅ Cliente dual (API + Bot Service)
- ✅ Reconexión automática
- ✅ Manejo de errores robusto
- ✅ Fallback a polling si WebSocket falla

### Integración React:
- ✅ Estado en tiempo real en MessageView
- ✅ Scroll automático a nuevos mensajes
- ✅ Deduplicación de mensajes
- ✅ Cleanup al cambiar conversación

## 🚨 Problemas Potenciales y Soluciones

### 1. WebSocket no conecta en Railway:
- Verificar que las URLs no tengan `/api` al final
- Verificar que los servicios estén corriendo en los puertos correctos
- Verificar variables VITE_* en el dashboard

### 2. CORS errors:
- Ambos servidores ya tienen CORS: '*' configurado
- Si persiste, verificar que las URLs sean exactas

### 3. Mensajes duplicados:
- Ya implementada deduplicación por ID y timestamp
- Si persiste, revisar la lógica de `realtimeMessages`

### 4. Reconexión fallida:
- Implementado fallback a polling transport
- Máximo 5 intentos de reconexión
- Manejo de errores detallado en consola

## 📊 Monitoreo

Revisar logs en Railway para:
- Conexiones WebSocket exitosas
- Eventos emitidos correctamente
- Errores de conexión o timeout

## 🎯 ¡Listo para Producción!

El sistema está completamente preparado para:
- Manejo de múltiples usuarios simultáneos
- Comunicación bidireccional en tiempo real
- Integración completa con WhatsApp Meta API
- Experiencia de usuario sin interrupciones