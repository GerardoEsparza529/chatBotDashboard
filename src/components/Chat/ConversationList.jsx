/**
 * Componente ConversationList - Lista de conversaciones
 */

import { useState, useEffect } from 'react';
import { Search, User, MessageCircle, ChevronLeft, ChevronRight, Play, Pause, UserX } from 'lucide-react';
import './ConversationList.css';

const ConversationList = ({ 
  conversations = [], 
  loading, 
  selectedId, 
  onSelect, 
  onSearch,
  currentPage,
  totalPages,
  onPageChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
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

  const getUserName = (conversation) => {
    return conversation?.user?.name || 
           conversation?.user?.phone || 
           'Usuario';
  };

  const getBotStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Play size={10} style={{ color: '#4ade80' }} />;
      case 'paused':
        return <Pause size={10} style={{ color: '#fbbf24' }} />;
      case 'human_takeover':
        return <UserX size={10} style={{ color: '#f87171' }} />;
      default:
        return <Play size={10} style={{ color: '#4ade80' }} />;
    }
  };

  const getBotStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'AUTO';
      case 'paused':
        return 'STOP';
      case 'human_takeover':
        return 'HUMAN';
      default:
        return 'AUTO';
    }
  };

  const getBotStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'automatic';
      case 'paused':
        return 'stopped';
      case 'human_takeover':
        return 'human';
      default:
        return 'automatic';
    }
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

  if (loading) {
    return (
      <div className="conversation-list">
        <div className="conversation-header">
          <h2>Conversaciones</h2>
        </div>
        <div className="search-container">
          <div className="search-box loading">
            <div className="search-skeleton"></div>
          </div>
        </div>
        <div className="conversations-container">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="conversation-item loading">
              <div className="conversation-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      <div className="conversation-header">
        <h2>Conversaciones</h2>
        <div className="conversation-count">
          {sortedConversations.length} conversaciones
          {/* 🧪 BOTÓN TEMPORAL DE TEST - REMOVER DESPUÉS */}
          {window.location.hostname === 'localhost' && (
            <button
              onClick={() => window.location.reload()}
              style={{ 
                marginLeft: '10px', 
                padding: '4px 8px', 
                fontSize: '12px', 
                backgroundColor: '#e74c3c', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              title="🧪 Test: Reload page"
            >
              🔄
            </button>
          )}
        </div>
      </div>
      
      <div className="search-container">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className={`conversations-container ${loading ? 'loading' : ''}`}>
        {sortedConversations.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={48} className="empty-icon" />
            <p>No hay conversaciones</p>
          </div>
        ) : (
          sortedConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${selectedId === conversation.id ? 'active' : ''}`}
              onClick={() => onSelect && onSelect(conversation.id)}
            >
              <div className="conversation-avatar">
                <User size={20} />
              </div>
              
              <div className="conversation-content">
                <div className="conversation-info">
                  <div className="name-status-row">
                    <h3 className="conversation-name">
                      {getUserName(conversation)}
                    </h3>
                    <div className={`mini-status-badge ${getBotStatusClass(conversation.bot_status)}`}>
                      {getBotStatusIcon(conversation.bot_status)}
                      <span>{getBotStatusText(conversation.bot_status)}</span>
                    </div>
                  </div>
                  <span className="conversation-time">
                    {formatTime(
                      conversation?.messages?.[0]?.created_at || 
                      conversation?.updated_at || 
                      conversation?.created_at
                    )}
                  </span>
                </div>
                
                <div className="message-row">
                  <p className="conversation-preview">
                    {getLastMessage(conversation)}
                  </p>
                  <div className="conversation-badges">
                    {conversation?.requires_human && (
                      <span className="urgent-badge" title="Requiere intervención humana">
                        🚨
                      </span>
                    )}
                    {conversation?.unread_count > 0 && (
                      <span className="unread-badge" title={`${conversation.unread_count} mensajes sin leer`}>
                        {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            className="pagination-button"
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationList;