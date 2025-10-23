import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Conectar a ambos servidores WebSocket
  connect() {
    try {
      // Conectar al API principal (chatbot-api en puerto 3001)
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      this.apiSocket = io(apiUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
        transports: ['websocket', 'polling'], // Fallback a polling si WebSocket falla
      });

      // Conectar al servicio bot (template_JS_basic-main en puerto 3008)  
      const botServiceUrl = import.meta.env.VITE_BOT_SERVICE_URL || 'http://localhost:3008';
      this.botSocket = io(botServiceUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
        transports: ['websocket', 'polling'], // Fallback a polling si WebSocket falla
      });

      // Configurar eventos de conexión para API socket
      this.apiSocket.on('connect', () => {
        console.log('🔌 Conectado al WebSocket del API:', this.apiSocket.id);
        this.isConnected = true;
      });

      this.apiSocket.on('disconnect', () => {
        console.log('🔌 Desconectado del WebSocket del API');
        this.isConnected = false;
      });

      // Configurar eventos de conexión para Bot socket
      this.botSocket.on('connect', () => {
        console.log('🔌 Conectado al WebSocket del Bot Service:', this.botSocket.id);
      });

      this.botSocket.on('disconnect', () => {
        console.log('🔌 Desconectado del WebSocket del Bot Service');
      });

      // Configurar eventos de reconexión
      this.apiSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconectado al API WebSocket en intento:', attemptNumber);
        this.isConnected = true;
      });

      this.botSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconectado al Bot WebSocket en intento:', attemptNumber);
      });

      // Manejar errores de conexión
      this.apiSocket.on('connect_error', (error) => {
        console.warn('⚠️ Error conectando al API WebSocket:', error.message);
        this.isConnected = false;
      });

      this.botSocket.on('connect_error', (error) => {
        console.warn('⚠️ Error conectando al Bot WebSocket:', error.message);
      });

      // Manejar errores de reconexión
      this.apiSocket.on('reconnect_error', (error) => {
        console.warn('⚠️ Error en reconexión API WebSocket:', error.message);
      });

      this.botSocket.on('reconnect_error', (error) => {
        console.warn('⚠️ Error en reconexión Bot WebSocket:', error.message);
      });

      // Manejar falla total de reconexión
      this.apiSocket.on('reconnect_failed', () => {
        console.error('❌ Falló completamente la reconexión al API WebSocket');
        this.isConnected = false;
      });

      this.botSocket.on('reconnect_failed', () => {
        console.error('❌ Falló completamente la reconexión al Bot WebSocket');
      });

      console.log('🔌 WebSocket service iniciado');
      console.log(`   - API URL: ${apiUrl}`);
      console.log(`   - Bot Service URL: ${botServiceUrl}`);

    } catch (error) {
      console.error('❌ Error conectando WebSocket:', error);
    }
  }

  // Desconectar de ambos servidores
  disconnect() {
    if (this.apiSocket) {
      this.apiSocket.disconnect();
    }
    if (this.botSocket) {
      this.botSocket.disconnect();
    }
    this.isConnected = false;
    console.log('🔌 WebSocket service desconectado');
  }

  // Unirse a una sala de conversación en ambos servidores
  joinConversation(conversationId) {
    if (this.apiSocket) {
      this.apiSocket.emit('join-conversation', conversationId);
      console.log(`👥 Uniéndose a conversación ${conversationId} (API)`);
    }
    if (this.botSocket) {
      this.botSocket.emit('join-conversation', conversationId);
      console.log(`👥 Uniéndose a conversación ${conversationId} (Bot)`);
    }
  }

  // Salir de una sala de conversación en ambos servidores
  leaveConversation(conversationId) {
    if (this.apiSocket) {
      this.apiSocket.emit('leave-conversation', conversationId);
      console.log(`👋 Saliendo de conversación ${conversationId} (API)`);
    }
    if (this.botSocket) {
      this.botSocket.emit('leave-conversation', conversationId);
      console.log(`👋 Saliendo de conversación ${conversationId} (Bot)`);
    }
  }

  // Escuchar eventos de nuevos mensajes desde ambos servidores
  onNewMessage(callback) {
    // Remover listeners anteriores para evitar duplicados
    if (this.apiSocket) {
      this.apiSocket.off('new-message');
      this.apiSocket.on('new-message', (data) => {
        console.log('📨 Nuevo mensaje desde API:', data);
        callback(data);
      });
    }
    if (this.botSocket) {
      this.botSocket.off('new-message');
      this.botSocket.on('new-message', (data) => {
        console.log('📨 Nuevo mensaje desde Bot Service:', data);
        callback(data);
      });
    }
  }

  // Escuchar eventos de cambio de estado del bot
  onBotStatusChange(callback) {
    // Remover listeners anteriores para evitar duplicados
    if (this.apiSocket) {
      this.apiSocket.off('bot-status-change');
      this.apiSocket.on('bot-status-change', (data) => {
        console.log('🤖 Cambio de estado del bot desde API:', data);
        callback(data);
      });
    }
    if (this.botSocket) {
      this.botSocket.off('bot-status-change');
      this.botSocket.on('bot-status-change', (data) => {
        console.log('🤖 Cambio de estado del bot desde Bot Service:', data);
        callback(data);
      });
    }
  }

  // Remover todos los listeners
  removeAllListeners() {
    if (this.apiSocket) {
      this.apiSocket.removeAllListeners();
    }
    if (this.botSocket) {
      this.botSocket.removeAllListeners();
    }
  }

  // Obtener estado de conexión
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      apiConnected: this.apiSocket?.connected || false,
      botConnected: this.botSocket?.connected || false
    };
  }
}

// Crear instancia singleton
const webSocketService = new WebSocketService();

export default webSocketService;