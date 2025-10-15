/**
 * Componente ConversationList - Lista de conversaciones
 */

import { useState, useEffect } from 'react';
import { Search, User, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Si es hoy, mostrar hora
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Si es esta semana, mostrar día
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    }
    
    // Mostrar fecha
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const getUserName = (conversation) => {
    return conversation?.user?.name || 
           conversation?.user?.phone || 
           'Usuario';
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
          {conversations.length} conversaciones
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
      
      <div className="conversations-container">
        {conversations.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={48} className="empty-icon" />
            <p>No hay conversaciones</p>
          </div>
        ) : (
          conversations.map((conversation) => (
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
                  <h3 className="conversation-name">
                    {getUserName(conversation)}
                  </h3>
                  <span className="conversation-time">
                    {formatTime(conversation.updated_at || conversation.messages?.[0]?.created_at)}
                  </span>
                </div>
                
                <p className="conversation-preview">
                  {getLastMessage(conversation)}
                </p>
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