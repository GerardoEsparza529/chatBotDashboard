/**
 * Servicio API para conectar con el backend del bot de WhatsApp
 */

import axios from 'axios';

// URL base del API del bot - ajusta según tu configuración
const BASE_URL = 'http://localhost:3009/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

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