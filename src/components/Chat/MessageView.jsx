/**
 * Componente MessageView - Vista de mensajes de una conversación
 */

import { useEffect, useRef } from 'react';
import { User, Bot, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import './MessageView.css';

const MessageView = ({ 
  conversation, 
  messages = [], 
  loading, 
  currentPage,
  totalPages,
  onPageChange 
}) => {
  const messagesEndRef = useRef(null);

  // Scroll automático al final cuando se cargan nuevos mensajes
  useEffect(() => {
    if (messages.length > 0 && currentPage === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentPage]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = () => {
    return conversation?.user?.name || 
           conversation?.user?.phone || 
           'Usuario';
  };

  if (loading && !conversation) {
    return (
      <div className="message-view">
        <div className="message-header loading">
          <div className="header-skeleton"></div>
        </div>
        <div className="messages-container">
          <div className="loading-messages">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="message-skeleton"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="message-view">
        <div className="empty-conversation">
          <User size={64} className="empty-icon" />
          <h3>Selecciona una conversación</h3>
          <p>Elige una conversación de la lista para ver los mensajes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-view">
      <div className="message-header">
        <div className="header-left">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <h3 className="user-name">{getUserName()}</h3>
            <span className="user-phone">{conversation.user?.phone}</span>
          </div>
        </div>
        
        {totalPages > 1 && (
          <div className="header-pagination">
            <button
              className="pagination-button small"
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              title="Mensajes anteriores"
            >
              <ChevronLeft size={14} />
            </button>
            
            <span className="pagination-info small">
              {currentPage}/{totalPages}
            </span>
            
            <button
              className="pagination-button small"
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Mensajes siguientes"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
      
      <div className="messages-container">
        {loading && messages.length === 0 ? (
          <div className="loading-messages">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="message-skeleton"></div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">
            <Clock size={48} className="empty-icon" />
            <p>No hay mensajes en esta conversación</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={`${message.id || index}`}
                className={`message ${message.sender}`}
              >
                <div className="message-avatar">
                  {message.sender === 'user' ? (
                    <User size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                </div>
                
                <div className="message-content">
                  <div className="message-bubble">
                    <p className="message-text">{message.content}</p>
                  </div>
                  <div className="message-time">
                    {formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="message-footer">
          <div className="footer-pagination">
            <button
              className="pagination-button"
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft size={16} />
              Anteriores
            </button>
            
            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              className="pagination-button"
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Siguientes
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageView;