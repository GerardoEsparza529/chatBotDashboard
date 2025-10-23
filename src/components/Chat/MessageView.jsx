/**
 * Componente MessageView - Vista de mensajes de una conversación
 */

import { useState, useEffect, useRef } from 'react';
import { User, Bot, Clock, ChevronLeft, ChevronRight, Edit3, Send, Pause, Play, UserX } from 'lucide-react';
import { changeBotStatus, editBotMessage, sendHumanMessage, setRequireHumanIntervention } from '../../services/api';
import './MessageView.css';

const MessageView = ({ 
  conversation, 
  messages = [], 
  loading, 
  currentPage,
  totalPages,
  onPageChange,
  onInterventionAction
}) => {
  const messagesEndRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isChangingBotStatus, setIsChangingBotStatus] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

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

  // Funciones para intervención humana
  const handleChangeBotStatus = async (newStatus) => {
    if (!conversation?.id) return;
    
    setIsChangingBotStatus(true);
    try {
      await changeBotStatus(conversation.id, newStatus);
      console.log(`✅ Bot ${newStatus} para conversación ${conversation.id}`);
      
      // Actualizar datos después de la acción
      if (onInterventionAction) {
        await onInterventionAction();
      }
    } catch (error) {
      console.error('Error cambiando estado del bot:', error);
      alert('Error cambiando estado del bot: ' + error.message);
    } finally {
      setIsChangingBotStatus(false);
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editContent.trim()) return;
    
    try {
      await editBotMessage(messageId, editContent.trim());
      setEditingMessageId(null);
      setEditContent('');
      console.log(`✅ Mensaje ${messageId} editado`);
      
      // Actualizar datos después de la acción
      if (onInterventionAction) {
        await onInterventionAction();
      }
    } catch (error) {
      console.error('Error editando mensaje:', error);
      alert('Error editando mensaje: ' + error.message);
    }
  };

  const handleSendHumanMessage = async () => {
    if (!newMessageContent.trim() || !conversation?.id) return;
    
    console.log('🚀 Iniciando envío de mensaje humano:', {
      conversationId: conversation.id,
      content: newMessageContent.trim(),
      contentLength: newMessageContent.trim().length
    });
    
    setIsSendingMessage(true);
    try {
      const result = await sendHumanMessage(conversation.id, newMessageContent.trim());
      console.log('✅ Respuesta API mensaje humano:', result);
      
      setNewMessageContent('');
      console.log(`✅ Mensaje humano enviado en conversación ${conversation.id}`);
      
      // Actualizar datos después de la acción
      if (onInterventionAction) {
        console.log('🔄 Ejecutando onInterventionAction...');
        await onInterventionAction();
        console.log('✅ onInterventionAction completado');
      }
    } catch (error) {
      console.error('❌ Error enviando mensaje humano:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      alert('Error enviando mensaje: ' + error.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const startEditingMessage = (message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleToggleRequireHuman = async () => {
    if (!conversation?.id) return;
    
    setIsChangingBotStatus(true);
    try {
      const newRequiresHuman = !conversation.requires_human;
      await setRequireHumanIntervention(conversation.id, newRequiresHuman);
      console.log(`✅ Conversación ${newRequiresHuman ? 'marcada para' : 'removida de'} intervención humana`);
      
      // Actualizar datos después de la acción
      if (onInterventionAction) {
        await onInterventionAction();
      }
    } catch (error) {
      console.error('Error cambiando marca de intervención:', error);
      alert('Error cambiando marca de intervención: ' + error.message);
    } finally {
      setIsChangingBotStatus(false);
    }
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const getBotStatusIcon = () => {
    switch (conversation?.bot_status) {
      case 'active':
        return <Play size={14} style={{ color: '#4ade80' }} />;
      case 'paused':
        return <Pause size={14} style={{ color: '#fbbf24' }} />;
      case 'human_takeover':
        return <UserX size={14} style={{ color: '#f87171' }} />;
      default:
        return <Play size={14} style={{ color: '#4ade80' }} />;
    }
  };

  const getBotStatusText = () => {
    switch (conversation?.bot_status) {
      case 'active':
        return 'AUTOMÁTICO';
      case 'paused':
        return 'DETENIDO';
      case 'human_takeover':
        return 'MODO HUMANO';
      default:
        return 'AUTOMÁTICO';
    }
  };

  const getBotStatusClass = () => {
    switch (conversation?.bot_status) {
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

  const getBotStatusDescription = () => {
    switch (conversation?.bot_status) {
      case 'active':
        return 'El bot responde automáticamente';
      case 'paused':
        return 'Bot pausado, no responde';
      case 'human_takeover':
        return 'Operador humano al control';
      default:
        return 'El bot responde automáticamente';
    }
  };

  if (loading && !conversation) {
    return (
      <div className="message-view">
        <div className="message-header loading">
          <div className="header-skeleton"></div>
        </div>
        <div className="messages-container">
          <div className="loading-messages">
            {[...Array(4)].map((_, index) => (
              <div 
                key={index} 
                className={`message-skeleton ${index % 2 === 0 ? 'user' : 'bot'}`}
                style={{
                  animationDelay: `${index * 0.15}s`,
                  width: `${65 + Math.random() * 25}%`
                }}
              ></div>
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
        
        <div className="header-center">
          <div className="bot-status-container">
            <div className={`bot-status-indicator ${getBotStatusClass()}`}>
              {getBotStatusIcon()}
              <span>{getBotStatusText()}</span>
            </div>
            <div className={`status-description ${getBotStatusClass()}`}>
              {getBotStatusDescription()}
            </div>
            {conversation?.requires_human && (
              <div className="intervention-alert" style={{
                padding: '4px 8px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '6px',
                color: '#f87171',
                fontSize: '10px',
                fontWeight: '500',
                textAlign: 'center',
                marginTop: '6px',
                opacity: '0.9'
              }}>
                🚨 Requiere intervención
              </div>
            )}
          </div>
          
          <div className="bot-controls">
            {conversation?.bot_status !== 'active' && (
              <button
                className="bot-control-btn active"
                onClick={() => handleChangeBotStatus('active')}
                disabled={isChangingBotStatus}
                title="Reactivar Bot"
              >
                <Play size={14} />
              </button>
            )}
            
            {conversation?.bot_status !== 'paused' && (
              <button
                className="bot-control-btn pause"
                onClick={() => handleChangeBotStatus('paused')}
                disabled={isChangingBotStatus}
                title="Pausar Bot"
              >
                <Pause size={14} />
              </button>
            )}
            
            {conversation?.bot_status !== 'human_takeover' && (
              <button
                className="bot-control-btn takeover"
                onClick={() => handleChangeBotStatus('human_takeover')}
                disabled={isChangingBotStatus}
                title="Tomar Control"
              >
                <UserX size={14} />
              </button>
            )}
            
            <button
              className={`bot-control-btn ${conversation?.requires_human ? 'remove-flag' : 'add-flag'}`}
              onClick={() => handleToggleRequireHuman()}
              disabled={isChangingBotStatus}
              title={conversation?.requires_human ? "Quitar marca de intervención" : "Marcar para intervención"}
            >
              {conversation?.requires_human ? '🏁' : '🚨'}
            </button>
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
      
      <div className={`messages-container ${loading ? 'loading' : ''}`}>
        {loading && messages.length === 0 ? (
          <div className="loading-messages">
            {[...Array(5)].map((_, index) => (
              <div 
                key={index} 
                className={`message-skeleton ${index % 2 === 0 ? 'user' : 'bot'}`}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  width: `${60 + Math.random() * 30}%`
                }}
              ></div>
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
                  {editingMessageId === message.id ? (
                    // Modo edición
                    <div className="message-edit">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="edit-textarea"
                        rows={3}
                        autoFocus
                      />
                      <div className="edit-controls">
                        <button
                          className="edit-btn save"
                          onClick={() => handleEditMessage(message.id)}
                          disabled={!editContent.trim()}
                        >
                          <Send size={14} />
                          Guardar
                        </button>
                        <button
                          className="edit-btn cancel"
                          onClick={cancelEditing}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo normal
                    <>
                      <div className="message-bubble">
                        <p className="message-text">
                          {message.content}
                          {message.is_edited && (
                            <span className="edited-indicator" title="Mensaje editado">
                              (editado)
                            </span>
                          )}
                        </p>
                        
                        {/* Controles de mensaje para bot */}
                        {message.sender === 'bot' && !message.is_edited && editingMessageId !== message.id && (
                          <button
                            className="message-edit-btn"
                            onClick={() => startEditingMessage(message)}
                            title="Editar mensaje"
                          >
                            <Edit3 size={12} />
                          </button>
                        )}
                      </div>
                      <div className="message-time">
                        {formatTime(message.created_at)}
                        {message.metadata?.sent_by_human && (
                          <span className="human-indicator" title="Enviado por humano">
                            👤
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Área para enviar mensajes como humano */}
      {conversation && (
        <div className="human-message-area">
          <div className="human-message-input">
            <textarea
              value={newMessageContent}
              onChange={(e) => setNewMessageContent(e.target.value)}
              placeholder="Escribir como humano..."
              className="human-textarea"
              rows={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendHumanMessage();
                }
              }}
            />
            <button
              className="send-human-btn"
              onClick={handleSendHumanMessage}
              disabled={!newMessageContent.trim() || isSendingMessage}
              title="Enviar como humano"
            >
              {isSendingMessage ? (
                <Clock size={16} className="spinning" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
          <div className="human-message-hint">
            💡 Los mensajes enviados aquí aparecerán como respuestas del bot pero con indicador humano
          </div>
        </div>
      )}
      
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