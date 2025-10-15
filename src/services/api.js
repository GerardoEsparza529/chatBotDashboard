/**
 * Servicio API para conectar con el backend del bot de WhatsApp
 */

import axios from 'axios';

// URL base del API del bot - configurable via variables de entorno
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3009/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;
const DEBUG_MODE = import.meta.env.VITE_DEBUG === 'true';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: BASE_URL,
  timeout: parseInt(API_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging en modo debug
if (DEBUG_MODE) {
  api.interceptors.request.use((config) => {
    console.log('🔍 API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      params: config.params,
      data: config.data
    });
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
      return response;
    },
    (error) => {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
      });
      return Promise.reject(error);
    }
  );
} else {
  // Interceptor para manejo de errores en producción
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.message);
      return Promise.reject(error);
    }
  );
}

/**
 * Obtener estadísticas generales del bot
 */
export const getStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

/**
 * Obtener lista de conversaciones
 * @param {number} page - Número de página (opcional)
 * @param {number} limit - Límite de resultados (opcional)
 */
export const getConversations = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/conversations', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo conversaciones:', error);
    throw error;
  }
};

/**
 * Obtener mensajes de una conversación específica
 * @param {string} conversationId - ID de la conversación
 * @param {number} page - Número de página (opcional)
 * @param {number} limit - Límite de resultados (opcional)
 */
export const getMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    throw error;
  }
};

/**
 * Buscar mensajes por texto
 * @param {string} query - Texto a buscar
 * @param {number} page - Número de página (opcional)
 * @param {number} limit - Límite de resultados (opcional)
 */
export const searchMessages = async (query, page = 1, limit = 20) => {
  try {
    const response = await api.get('/search', {
      params: { q: query, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error en búsqueda:', error);
    throw error;
  }
};

export default api;