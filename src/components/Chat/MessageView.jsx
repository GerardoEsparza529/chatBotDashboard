/**
 * Componente MessageView - Vista de mensajes de una conversación
 */

import { useState, useEffect, useRef } from 'react';
import { User, Bot, Clock, ChevronLeft, ChevronRight, Edit3, Send, Pause, Play, UserX } from 'lucide-react';
import { changeBotStatus, editBotMessage, sendHumanMessage, setRequireHumanIntervention } from '../../services/api';
import webSocketService from '../../services/websocket';
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
  const unreadDividerRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isChangingBotStatus, setIsChangingBotStatus] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const [hasScrolledToUnread, setHasScrolledToUnread] = useState(false);

  // 🔌 WebSocket setup for real-time updates
  useEffect(() => {
    if (!conversation?.id) return;

    console.log(`🔌 Configurando WebSocket para conversación ${conversation.id}`);
    
    // Conectar WebSocket si no está conectado
    if (!webSocketService.getConnectionStatus().isConnected) {
      webSocketService.connect();
    }

    // Unirse a la sala de la conversación
    webSocketService.joinConversation(conversation.id);

    // Cleanup al desmontar o cambiar conversación
    return () => {
      console.log(`🔌 Limpiando WebSocket para conversación ${conversation.id}`);
      webSocketService.leaveConversation(conversation.id);
      setRealtimeMessages([]); // Limpiar mensajes en tiempo real
      setHasScrolledToUnread(false); // Reset scroll state
    };
  }, [conversation?.id]); // Removido onInterventionAction de las dependencias

  // 📨 Configurar listeners de WebSocket (separado para evitar recreaciones)
  useEffect(() => {
    if (!conversation?.id) return;

    // Escuchar nuevos mensajes
    const handleNewMessage = (data) => {
      console.log('📨 Nuevo mensaje recibido vía WebSocket:', data);
      console.log('🔍 Verificando conversación:', {
        dataConversationId: data.conversationId,
        messageConversationId: data.message?.conversation_id,
        currentConversationId: conversation.id,
        match1: data.conversationId === conversation.id,
        match2: data.message?.conversation_id === conversation.id
      });
      
      if (data.conversationId === conversation.id || data.message?.conversation_id === conversation.id) {
        console.log('✅ Mensaje corresponde a conversación actual, procesando...');
        
        // Agregar el nuevo mensaje a la lista de mensajes en tiempo real
        setRealtimeMessages(prev => {
          console.log('🔍 Estado previo de mensajes tiempo real:', prev.length);
          
          // Evitar mensajes duplicados
          const exists = prev.some(msg => 
            msg.id === data.message?.id || 
            (msg.content === data.message?.content && Math.abs(new Date(msg.timestamp) - new Date(data.message?.timestamp)) < 1000)
          );
          
          if (!exists) {
            console.log('✅ Agregando mensaje en tiempo real');
            const newMessage = {
              id: data.message?.id || `realtime-${Date.now()}-${Math.random()}`,
              content: data.message?.content || data.message?.message_content,
              sender: data.message?.sender || (data.message?.from_user ? 'user' : 'bot'),
              role: data.message?.role || (data.message?.from_user ? 'user' : 'assistant'),
              created_at: data.message?.timestamp || data.message?.created_at || new Date().toISOString(),
              metadata: data.message?.metadata || {},
              isRealtime: true
            };
            
            console.log('📤 Mensaje agregado a estado:', newMessage);
            const updated = [...prev, newMessage];
            console.log('📊 Total mensajes en tiempo real después de agregar:', updated.length);
            return updated;
          } else {
            console.log('⚠️ Mensaje duplicado, ignorando');
          }
          
          return prev;
        });

        // NO llamar onInterventionAction inmediatamente para evitar conflictos con el nivel superior
        console.log('⏰ El nivel superior ya maneja la actualización automática...');
        // Solo llamar si no hay manejo superior (fallback)
        if (!onInterventionAction) {
          console.log('🔄 Fallback: No hay manejo superior, ejecutando actualización local');
          // Aquí podrías agregar lógica de fallback si es necesario
        }
      } else {
        console.log('❌ Mensaje no corresponde a conversación actual, ignorando');
      }
    };

    // Escuchar cambios de estado del bot
    const handleBotStatusChange = (data) => {
      console.log('🤖 Cambio de estado del bot vía WebSocket:', data);
      
      if (data.conversationId === conversation.id) {
        // El nivel superior ya maneja la actualización, solo logear
        console.log('✅ Cambio de estado detectado para conversación actual');
        // onInterventionAction será llamado por el nivel superior
      }
    };

    webSocketService.onNewMessage(handleNewMessage);
    webSocketService.onBotStatusChange(handleBotStatusChange);

    // Cleanup solo para este listener
    return () => {
      // Solo remover listeners, no limpiar mensajes aquí
      console.log('🧹 Limpiando listeners WebSocket');
    };
  }, [conversation?.id, onInterventionAction]);

  // Limpiar mensajes en tiempo real solo cuando realmente cambian los mensajes principales
  useEffect(() => {
    // Solo limpiar si realmente hay mensajes diferentes
    if (messages.length > 0) {
      setRealtimeMessages(prev => {
        // Filtrar mensajes en tiempo real que ya existen en messages
        return prev.filter(rtMsg => 
          !messages.some(msg => 
            msg.id === rtMsg.id || 
            (msg.content === rtMsg.content && Math.abs(new Date(msg.created_at) - new Date(rtMsg.created_at)) < 2000)
          )
        );
      });
    }
  }, [messages]); // Usar messages completo

  // Combinar mensajes principales con mensajes en tiempo real
  const allMessages = [...messages, ...realtimeMessages].sort((a, b) => 
    new Date(a.created_at) - new Date(b.created_at)
  );

  // Encontrar el índice donde insertar el divisor de "mensajes sin leer"
  const getUnreadDividerIndex = () => {
    if (!conversation?.last_read_at || allMessages.length === 0) {
      return -1; // No mostrar divisor si no hay fecha de lectura o no hay mensajes
    }
    
    const lastReadDate = new Date(conversation.last_read_at);
    console.log(`🔍 Buscando mensajes sin leer desde: ${lastReadDate.toLocaleString()}`);
    
    // Encontrar el primer mensaje después de la fecha de última lectura
    const unreadIndex = allMessages.findIndex((message, index) => {
      const messageDate = new Date(message.created_at);
      const isAfterLastRead = messageDate > lastReadDate;
      
      if (isAfterLastRead) {
        console.log(`📝 Mensaje sin leer encontrado en índice ${index}: ${message.content?.substring(0, 30)}... (${messageDate.toLocaleString()})`);
      }
      
      return isAfterLastRead;
    });
    
    console.log(`📊 Índice del divisor: ${unreadIndex} (${unreadIndex === -1 ? 'Sin mensajes sin leer' : 'Hay mensajes sin leer'})`);
    return unreadIndex;
  };

  const unreadDividerIndex = getUnreadDividerIndex();

  // Debug controlado (solo cuando cambia el count, no en cada render)
  const debugRef = useRef({ lastTotal: 0 });
  if (allMessages.length !== debugRef.current.lastTotal) {
    console.log('📊 Estado actual de mensajes:', {
      principalesCount: messages.length,
      tiempoRealCount: realtimeMessages.length,
      totalCount: allMessages.length,
      realtimeIds: realtimeMessages.map(m => m.id),
      realtimeContents: realtimeMessages.map(m => m.content?.substring(0, 20) + '...')
    });
    debugRef.current.lastTotal = allMessages.length;
  }

  // Scroll automático al final cuando se cargan nuevos mensajes
  useEffect(() => {
    if (allMessages.length > 0 && currentPage === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages.length, currentPage]);

  // 📖 Scroll inteligente: posicionar en último mensaje leído al abrir conversación
  useEffect(() => {
    if (!hasScrolledToUnread && allMessages.length > 0 && conversation?.id && unreadDividerIndex > -1) {
      console.log(`📖 Posicionando en último mensaje leído para conversación ${conversation.id}`);
      console.log(`🔍 Divisor en índice: ${unreadDividerIndex}, total mensajes: ${allMessages.length}`);
      
      setTimeout(() => {
        if (unreadDividerRef.current) {
          unreadDividerRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          console.log('✅ Scroll realizado al divisor de mensajes sin leer');
          setHasScrolledToUnread(true);
        }
      }, 300); // Delay para asegurar que el DOM esté renderizado
    } else if (!hasScrolledToUnread && allMessages.length > 0 && conversation?.id && unreadDividerIndex === -1) {
      // Si no hay mensajes sin leer, hacer scroll al final
      console.log(`📖 No hay mensajes sin leer, posicionando al final`);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setHasScrolledToUnread(true);
      }, 300);
    }
  }, [allMessages.length, conversation?.id, unreadDividerIndex, hasScrolledToUnread]);

  // Scroll adicional para mensajes en tiempo real (solo si está al final)
  useEffect(() => {
    if (realtimeMessages.length > 0 && hasScrolledToUnread) {
      // Solo hacer scroll automático si el usuario está cerca del final
      const container = messagesEndRef.current?.parentElement?.parentElement;
      if (container) {
        const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
        if (isNearBottom) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          console.log('🔄 Usuario no está al final, no haciendo scroll automático para mensajes nuevos');
        }
      }
    }
  }, [realtimeMessages.length, hasScrolledToUnread]);

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
    
    const messageContent = newMessageContent.trim();
    setIsSendingMessage(true);
    
    // 🚀 Agregar mensaje de forma optimista (aparece inmediatamente)
    const optimisticMessage = {
      id: `optimistic-${Date.now()}-${Math.random()}`,
      content: messageContent,
      sender: 'bot', // Los mensajes humanos se muestran como bot pero con metadata
      role: 'assistant',
      created_at: new Date().toISOString(),
      metadata: {
        sent_by_human: true,
        human_operator_id: 'dashboard',
        optimistic: true
      },
      isOptimistic: true
    };
    
    setRealtimeMessages(prev => [...prev, optimisticMessage]);
    setNewMessageContent(''); // Limpiar input inmediatamente
    
    try {
      const result = await sendHumanMessage(conversation.id, messageContent);
      console.log('✅ Respuesta API mensaje humano:', result);
      
      // Remover mensaje optimista y reemplazar con real si tiene ID
      if (result.sent_message?.id) {
        setRealtimeMessages(prev => 
          prev.filter(msg => msg.id !== optimisticMessage.id)
        );
      }
      
      console.log(`✅ Mensaje humano enviado en conversación ${conversation.id}`);
      
      // El nivel superior manejará la actualización automática, reducir delay
      if (onInterventionAction) {
        console.log('🔄 Ejecutando onInterventionAction...');
        setTimeout(() => {
          onInterventionAction();
        }, 100); // Delay menor ya que el mensaje ya está visible optimísticamente
        console.log('✅ onInterventionAction programado');
      }
    } catch (error) {
      // Si falla, remover el mensaje optimista
      setRealtimeMessages(prev => 
        prev.filter(msg => msg.id !== optimisticMessage.id)
      );
      
      console.error('❌ Error enviando mensaje humano:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      alert('Error enviando mensaje: ' + error.message);
      
      // Restaurar contenido del mensaje si falló
      setNewMessageContent(messageContent);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const startEditingMessage = (message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  // 🧪 FUNCIÓN DE TEST TEMPORAL
  const testAddRealtimeMessage = () => {
    console.log('🧪 TEST: Agregando mensaje de prueba en tiempo real');
    const testMessage = {
      id: `test-${Date.now()}`,
      content: 'Mensaje de prueba en tiempo real',
      sender: 'bot',
      role: 'assistant',
      created_at: new Date().toISOString(),
      metadata: { test: true },
      isRealtime: true
    };
    
    setRealtimeMessages(prev => {
      console.log('🧪 TEST: Estado previo:', prev.length);
      const updated = [...prev, testMessage];
      console.log('🧪 TEST: Estado nuevo:', updated.length);
      return updated;
    });
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
            
            {/* 🧪 BOTÓN TEMPORAL DE TEST - REMOVER DESPUÉS DE CONFIRMAR QUE FUNCIONA */}
            {import.meta.env.DEV && (
              <button
                className="bot-control-btn"
                onClick={testAddRealtimeMessage}
                title="🧪 Test: Agregar mensaje en tiempo real"
                style={{ backgroundColor: '#e74c3c', color: 'white' }}
              >
                🧪
              </button>
            )}
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
        ) : allMessages.length === 0 ? (
          <div className="empty-messages">
            <Clock size={48} className="empty-icon" />
            <p>No hay mensajes en esta conversación</p>
          </div>
        ) : (
          <>
            {allMessages.map((message, index) => (
              <div key={`message-wrapper-${message.id || index}`}>
                {/* Mostrar divisor de mensajes sin leer */}
                {unreadDividerIndex === index && (
                  <div className="unread-divider" ref={unreadDividerRef}>
                    <div className="unread-divider-line"></div>
                    <span className="unread-divider-text">Mensajes sin leer</span>
                    <div className="unread-divider-line"></div>
                  </div>
                )}
                
                <div
                  className={`message ${message.sender} ${
                    unreadDividerIndex > -1 && index >= unreadDividerIndex ? 'unread-message' : ''
                  }`}
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