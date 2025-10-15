/**
 * Custom hook para manejar mensajes de una conversación
 */

import { useState, useEffect, useCallback } from 'react';
import { getMessages } from '../services/api';

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Cargar mensajes de una conversación
  const loadMessages = useCallback(async (page = 1) => {
    if (!conversationId) {
      setMessages([]);
      setConversation(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getMessages(conversationId, page);
      
      setMessages(data.messages || []);
      setConversation(data.conversation);
      setCurrentPage(data.page || page);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Error cargando mensajes');
      console.error('Error en useMessages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Cargar mensajes cuando cambia el ID de conversación
  useEffect(() => {
    if (conversationId) {
      loadMessages(1);
      setCurrentPage(1);
    } else {
      setMessages([]);
      setConversation(null);
    }
  }, [conversationId, loadMessages]);

  // Función para cambiar página
  const changePage = useCallback((page) => {
    loadMessages(page);
  }, [loadMessages]);

  // Función para refrescar mensajes
  const refresh = useCallback(() => {
    loadMessages(currentPage);
  }, [loadMessages, currentPage]);

  return {
    messages,
    conversation,
    loading,
    error,
    currentPage,
    totalPages,
    changePage,
    refresh,
    loadMessages
  };
};