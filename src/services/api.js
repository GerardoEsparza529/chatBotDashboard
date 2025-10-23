/**
 * Servicio API para conectar con el backend del bot de WhatsApp
 */

import axios from 'axios';

// URL base del API del bot - configurable via variables de entorno
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
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

/**
 * Obtener lista de negocios
 */
export const getBusinesses = async () => {
  try {
    const response = await api.get('/businesses');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo negocios:', error);
    throw error;
  }
};

/**
 * Actualizar credenciales META de un negocio
 * @param {string} businessId - ID del negocio
 * @param {object} credentials - Objeto con las credenciales META
 */
export const updateBusinessCredentials = async (businessId, credentials) => {
  try {
    const response = await api.put(`/businesses/${businessId}/credentials`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error actualizando credenciales:', error);
    throw error;
  }
};

/**
 * Obtener prompts de un negocio
 * @param {string} businessId - ID del negocio
 */
export const getBusinessPrompts = async (businessId) => {
  try {
    const response = await api.get(`/businesses/${businessId}/prompts`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo prompts:', error);
    throw error;
  }
};

/**
 * Crear un nuevo prompt
 * @param {object} promptData - Datos del prompt
 */
export const createPrompt = async (promptData) => {
  try {
    const response = await api.post('/prompts', promptData);
    return response.data;
  } catch (error) {
    console.error('Error creando prompt:', error);
    throw error;
  }
};

/**
 * Actualizar un prompt
 * @param {string} promptId - ID del prompt
 * @param {object} promptData - Datos del prompt
 */
export const updatePrompt = async (promptId, promptData) => {
  try {
    const response = await api.put(`/prompts/${promptId}`, promptData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando prompt:', error);
    throw error;
  }
};

/**
 * Eliminar un prompt
 * @param {string} promptId - ID del prompt
 */
export const deletePrompt = async (promptId) => {
  try {
    const response = await api.delete(`/prompts/${promptId}`);
    return response.data;
  } catch (error) {
    console.error('Error eliminando prompt:', error);
    throw error;
  }
};

// ===== HUMAN INTERVENTION API =====

/**
 * Cambiar estado del bot para una conversación
 * @param {string} conversationId - ID de la conversación
 * @param {string} status - 'active', 'paused', 'human_takeover'
 * @param {string} humanId - ID del humano que hace el cambio
 */
export const changeBotStatus = async (conversationId, status, humanId = 'dashboard-user') => {
  try {
    const response = await api.put(`/conversations/${conversationId}/bot-status`, {
      status,
      humanId
    });
    return response.data;
  } catch (error) {
    console.error('Error cambiando estado del bot:', error);
    throw error;
  }
};

/**
 * Editar un mensaje del bot
 * @param {string} messageId - ID del mensaje
 * @param {string} newContent - Nuevo contenido
 * @param {string} humanId - ID del humano que edita
 */
export const editBotMessage = async (messageId, newContent, humanId = 'dashboard-user') => {
  try {
    const response = await api.put(`/messages/${messageId}/edit`, {
      newContent,
      humanId
    });
    return response.data;
  } catch (error) {
    console.error('Error editando mensaje:', error);
    throw error;
  }
};

/**
 * Enviar mensaje como humano
 * @param {string} conversationId - ID de la conversación
 * @param {string} content - Contenido del mensaje
 * @param {string} humanId - ID del humano que envía
 */
export const sendHumanMessage = async (conversationId, content, humanId = 'dashboard-user') => {
  try {
    const response = await api.post(`/conversations/${conversationId}/human-message`, {
      content,
      humanId
    });
    return response.data;
  } catch (error) {
    console.error('Error enviando mensaje humano:', error);
    throw error;
  }
};

/**
 * Obtener conversaciones que requieren intervención
 * @param {string} businessId - ID del negocio
 */
export const getConversationsRequiringIntervention = async (businessId) => {
  try {
    const response = await api.get('/conversations/requiring-intervention', {
      params: { businessId }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo conversaciones para intervención:', error);
    throw error;
  }
};

/**
 * Marcar/Quitar marca de intervención humana en una conversación
 */
export const setRequireHumanIntervention = async (conversationId, requires = true, reason = 'manual') => {
  try {
    const response = await api.put(`/conversations/${conversationId}/require-human`, {
      requires,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error estableciendo require human:', error);
    throw error;
  }
};

export default api;