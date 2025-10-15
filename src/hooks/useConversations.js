/**
 * Custom hook para manejar conversaciones
 */

import { useState, useEffect, useCallback } from 'react';
import { getConversations, searchMessages } from '../services/api';

export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar conversaciones
  const loadConversations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (searchQuery.trim()) {
        // Si hay búsqueda, buscar mensajes
        data = await searchMessages(searchQuery, page);
        // Transformar resultados de búsqueda a formato de conversaciones
        const conversationsFromSearch = data.messages.map(msg => ({
          id: msg.Conversation?.id,
          user: msg.Conversation?.User,
          messages: [{ content: msg.content, created_at: msg.created_at }],
          updated_at: msg.created_at
        }));
        setConversations(conversationsFromSearch);
      } else {
        // Cargar conversaciones normales
        data = await getConversations(page);
        setConversations(data.conversations || []);
      }

      setCurrentPage(data.page || page);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Error cargando conversaciones');
      console.error('Error en useConversations:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Cargar conversaciones al montar el componente o cambiar la búsqueda
  useEffect(() => {
    loadConversations(1);
  }, [loadConversations]);

  // Función para buscar
  const search = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Función para cambiar página
  const changePage = useCallback((page) => {
    loadConversations(page);
  }, [loadConversations]);

  // Función para refrescar
  const refresh = useCallback(() => {
    loadConversations(currentPage);
  }, [loadConversations, currentPage]);

  return {
    conversations,
    loading,
    error,
    currentPage,
    totalPages,
    searchQuery,
    search,
    changePage,
    refresh,
    loadConversations
  };
};