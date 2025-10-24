/**
 * MobileConversationList - Lista de conversaciones optimizada para móvil estilo iOS WhatsApp
 */

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './MobileConversationList.css';

const MobileConversationList = ({
  conversations = [],
  loading = false,
  selectedId = null,
  onSelect,
  onSearch,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // El useEffect manejará el debounce y llamará a onSearch
  };

  const handleConversationClick = (conversationId) => {
    if (onSelect) {
      onSelect(conversationId);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      // Verificar que la fecha sea válida
      if (isNaN(date.getTime())) return '';
      
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Si es hoy, mostrar hora
      if (messageDate.getTime() === today.getTime()) {
        return date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      // Si es ayer
      if (messageDate.getTime() === yesterday.getTime()) {
        return 'ayer';
      }
      
      // Si es esta semana (últimos 7 días)
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (messageDate >= weekAgo) {
        const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
        return days[date.getDay()];
      }
      
      // Si es este año, mostrar día/mes
      if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        });
      }
      
      // Si es otro año, mostrar día/mes/año
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit',
        year: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const getBotStatusBadge = (botStatus) => {
    switch (botStatus) {
      case 'active':
        return { text: 'AUTO', color: '#34c759' }; // Verde iOS
      case 'paused':
        return { text: 'STOP', color: '#ff9500' }; // Naranja iOS
      case 'human_takeover':
        return { text: 'HUMAN', color: '#ff3b30' }; // Rojo iOS
      default:
        return { text: 'AUTO', color: '#34c759' };
    }
  };

  const getUserName = (conversation) => {
    return conversation?.user?.name || 
           conversation?.user?.phone || 
           'Usuario Anónimo';
  };

  const getLastMessage = (conversation) => {
    const lastMessage = conversation?.messages?.[0];
    if (!lastMessage || !lastMessage.content) {
      return 'Sin mensajes';
    }
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content;
  };

  // Función para obtener la fecha más reciente de una conversación
  const getConversationDate = (conversation) => {
    // Priorizar la fecha del último mensaje
    if (conversation?.messages?.[0]?.created_at) {
      return new Date(conversation.messages[0].created_at);
    }
    // Fallback a updated_at de la conversación
    if (conversation?.updated_at) {
      return new Date(conversation.updated_at);
    }
    // Fallback a created_at de la conversación
    if (conversation?.created_at) {
      return new Date(conversation.created_at);
    }
    // Si no hay fecha, usar fecha muy antigua para que aparezca al final
    return new Date(0);
  };

  // Ordenar conversaciones por fecha más reciente
  const sortedConversations = [...conversations].sort((a, b) => {
    const dateA = getConversationDate(a);
    const dateB = getConversationDate(b);
    return dateB - dateA; // Orden descendente (más reciente primero)
  });

  const renderConversationItem = (conversation) => {
    const badge = getBotStatusBadge(conversation.bot_status);
    
    return (
      <div
        key={conversation.id}
        className={`mobile-conversation-item ${selectedId === conversation.id ? 'active' : ''}`}
        onClick={() => handleConversationClick(conversation.id)}
      >
        <div className="mobile-conversation-avatar">
          <span>{getUserName(conversation).charAt(0)?.toUpperCase() || '?'}</span>
        </div>
        
        <div className="mobile-conversation-content">
          <div className="mobile-conversation-header">
            <h3 className="mobile-conversation-name">
              {getUserName(conversation)}
            </h3>
            <div className="mobile-conversation-time">
              {formatTime(
                conversation?.messages?.[0]?.created_at || 
                conversation?.updated_at || 
                conversation?.created_at
              )}
            </div>
          </div>
          
          <div className="mobile-conversation-bottom">
            <p className="mobile-conversation-preview">
              {getLastMessage(conversation)}
            </p>
            <div className="mobile-conversation-badges">
              {conversation?.requires_human && (
                <span className="mobile-urgent-badge" title="Requiere intervención humana">
                  🚨
                </span>
              )}
              {conversation?.unread_count > 0 && (
                <span className="mobile-unread-badge" title={`${conversation.unread_count} mensajes sin leer`}>
                  {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                </span>
              )}
              {badge && (
                <span 
                  className="mobile-bot-status-badge"
                  style={{ backgroundColor: badge.color }}
                >
                  {badge.text}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mobile-conversation-list">
      {/* Header */}
      <div className="mobile-conversation-header-bar">
        <h1 className="mobile-conversation-title">Chats</h1>
        <div className="mobile-conversation-count">
          {sortedConversations.length} conversación{sortedConversations.length !== 1 ? 'es' : ''}
        </div>
      </div>

      {/* Search */}
      <div className="mobile-search-container">
        <div className="mobile-search-box">
          <FontAwesomeIcon icon={faSearch} className="mobile-search-icon" />
          <input
            type="text"
            className="mobile-search-input"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="mobile-conversations-container">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="mobile-conversation-skeleton">
              <div className="mobile-skeleton-avatar"></div>
              <div className="mobile-skeleton-content">
                <div className="mobile-skeleton-name"></div>
                <div className="mobile-skeleton-preview"></div>
              </div>
            </div>
          ))
        ) : sortedConversations.length > 0 ? (
          sortedConversations.map(renderConversationItem)
        ) : (
          <div className="mobile-empty-state">
            <span className="mobile-empty-icon">💬</span>
            <h3>No hay conversaciones</h3>
            <p>Las conversaciones aparecerán aquí</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileConversationList;