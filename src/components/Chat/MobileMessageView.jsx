/**
 * MobileMessageView - Vista de mensajes optimizada para móvil estilo iOS WhatsApp
 */

import { useState, useRef, useEffect } from 'react';
import { changeBotStatus, setRequireHumanIntervention, sendHumanMessage } from '../../services/api';
import webSocketService from '../../services/websocket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faEllipsisVertical, 
  faPause, 
  faPlay, 
  faUser, 
  faCheck, 
  faCircleStop, 
  faPaperPlane, 
  faLightbulb,
  faSpinner,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import './MobileMessageView.css';

const MobileMessageView = ({
  conversation = null,
  messages = [],
  loading = false,
  onBackToConversations,
  onInterventionAction,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) => {
  const messagesEndRef = useRef(null);
  const debugRef = useRef({ lastTotal: 0 });
  const [showActions, setShowActions] = useState(false);
  const [isChangingBotStatus, setIsChangingBotStatus] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const [hasScrolledToUnread, setHasScrolledToUnread] = useState(false);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Combinar mensajes principales con mensajes en tiempo real
  const allMessages = [...messages, ...realtimeMessages].sort((a, b) => 
    new Date(a.created_at) - new Date(b.created_at)
  );

  // Debug controlado (solo cuando cambia el count, no en cada render)
  if (allMessages.length !== debugRef.current.lastTotal) {
    console.log('📊 [MOBILE] Estado actual de mensajes:', {
      principalesCount: messages.length,
      tiempoRealCount: realtimeMessages.length,
      totalCount: allMessages.length,
      realtimeIds: realtimeMessages.map(m => m.id),
      realtimeContents: realtimeMessages.map(m => m.content?.substring(0, 20) + '...')
    });
    debugRef.current.lastTotal = allMessages.length;
  }

  // Auto scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current && allMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages.length]);

  // Cerrar menú de acciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActions && !event.target.closest('.mobile-actions-menu') && 
          !event.target.closest('.mobile-actions-button')) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActions]);

  // 🔌 WebSocket setup for real-time updates
  useEffect(() => {
    if (!conversation?.id) return;

    console.log(`🔌 [MOBILE] Configurando WebSocket para conversación ${conversation.id}`);
    
    // Conectar WebSocket si no está conectado
    if (!webSocketService.getConnectionStatus().isConnected) {
      webSocketService.connect();
    }

    // Unirse a la sala de la conversación
    webSocketService.joinConversation(conversation.id);

    // Cleanup al desmontar o cambiar conversación
    return () => {
      console.log(`🔌 [MOBILE] Limpiando WebSocket para conversación ${conversation.id}`);
      webSocketService.leaveConversation(conversation.id);
      setRealtimeMessages([]); // Limpiar mensajes en tiempo real
      setHasScrolledToUnread(false); // Reset scroll state
    };
  }, [conversation?.id]);

  // 📨 Configurar listeners de WebSocket (separado para evitar recreaciones)
  useEffect(() => {
    if (!conversation?.id) return;

    // Escuchar nuevos mensajes
    const handleNewMessage = (data) => {
      console.log('📨 [MOBILE] Nuevo mensaje recibido vía WebSocket:', data);
      console.log('🔍 [MOBILE] Verificando conversación:', {
        dataConversationId: data.conversationId,
        messageConversationId: data.message?.conversation_id,
        currentConversationId: conversation.id,
        match1: data.conversationId === conversation.id,
        match2: data.message?.conversation_id === conversation.id
      });
      
      if (data.conversationId === conversation.id || data.message?.conversation_id === conversation.id) {
        console.log('✅ [MOBILE] Mensaje corresponde a conversación actual, procesando...');
        
        // Agregar el nuevo mensaje a la lista de mensajes en tiempo real
        setRealtimeMessages(prev => {
          console.log('🔍 [MOBILE] Estado previo de mensajes tiempo real:', prev.length);
          
          // Evitar mensajes duplicados
          const exists = prev.some(msg => 
            msg.id === data.message?.id || 
            (msg.content === data.message?.content && Math.abs(new Date(msg.timestamp) - new Date(data.message?.timestamp)) < 1000)
          );
          
          if (!exists) {
            console.log('✅ [MOBILE] Agregando mensaje en tiempo real');
            const newMessage = {
              id: data.message?.id || `mobile-realtime-${Date.now()}-${Math.random()}`,
              content: data.message?.content || data.message?.message_content,
              sender: data.message?.sender || (data.message?.from_user ? 'user' : 'bot'),
              role: data.message?.role || (data.message?.from_user ? 'user' : 'assistant'),
              created_at: data.message?.timestamp || data.message?.created_at || new Date().toISOString(),
              metadata: data.message?.metadata || {},
              isRealtime: true
            };
            
            console.log('📤 [MOBILE] Mensaje agregado a estado:', newMessage);
            const updated = [...prev, newMessage];
            console.log('📊 [MOBILE] Total mensajes en tiempo real después de agregar:', updated.length);
            return updated;
          } else {
            console.log('⚠️ [MOBILE] Mensaje duplicado, ignorando');
          }
          
          return prev;
        });

        // Actualizar datos después del mensaje si hay callback
        console.log('⏰ [MOBILE] El nivel superior ya maneja la actualización automática...');
        if (onInterventionAction) {
          console.log('🔄 [MOBILE] Ejecutando onInterventionAction...');
          setTimeout(() => {
            onInterventionAction();
          }, 500); // Delay para evitar conflictos
        }
      } else {
        console.log('❌ [MOBILE] Mensaje no corresponde a conversación actual, ignorando');
      }
    };

    // Escuchar cambios de estado del bot
    const handleBotStatusChange = (data) => {
      console.log('🤖 [MOBILE] Cambio de estado del bot vía WebSocket:', data);
      
      if (data.conversationId === conversation.id) {
        console.log('✅ [MOBILE] Cambio de estado detectado para conversación actual');
        // El nivel superior ya maneja la actualización, solo actualizar localmente
        if (onInterventionAction) {
          setTimeout(() => {
            onInterventionAction();
          }, 300);
        }
      }
    };

    webSocketService.onNewMessage(handleNewMessage);
    webSocketService.onBotStatusChange(handleBotStatusChange);

    // Cleanup solo para este listener
    return () => {
      console.log('🧹 [MOBILE] Limpiando listeners WebSocket');
    };
  }, [conversation?.id, onInterventionAction]);

  // Limpiar mensajes en tiempo real solo cuando realmente cambian los mensajes principales
  useEffect(() => {
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
  }, [messages]);

  const handleBackClick = () => {
    if (onBackToConversations) {
      onBackToConversations();
    }
  };

  const handleActionsClick = () => {
    setShowActions(!showActions);
  };

  // Funciones para controlar el estado del bot
  const handleChangeBotStatus = async (newStatus) => {
    if (!conversation?.id) return;
    
    setIsChangingBotStatus(true);
    try {
      await changeBotStatus(conversation.id, newStatus);
      console.log(`✅ Bot ${newStatus} para conversación ${conversation.id}`);
      
      // Actualizar datos después de la acción
      if (onInterventionAction) {
        onInterventionAction();
      }
    } catch (error) {
      console.error(`❌ Error al ${newStatus} bot:`, error);
    } finally {
      setIsChangingBotStatus(false);
      setShowActions(false);
    }
  };

  const handleRequireHumanIntervention = async () => {
    if (!conversation?.id) return;
    
    setIsChangingBotStatus(true);
    try {
      await setRequireHumanIntervention(conversation.id);
      console.log(`✅ Intervención humana activada para conversación ${conversation.id}`);
      
      // Actualizar datos después de la acción
      if (onInterventionAction) {
        onInterventionAction();
      }
    } catch (error) {
      console.error('❌ Error al activar intervención humana:', error);
    } finally {
      setIsChangingBotStatus(false);
      setShowActions(false);
    }
  };

  // Función para enviar mensajes como humano
  const handleSendHumanMessage = async () => {
    if (!conversation?.id || !newMessageContent.trim()) return;
    
    setIsSendingMessage(true);
    try {
      console.log('📤 [MOBILE] Enviando mensaje humano:', {
        conversationId: conversation.id,
        content: newMessageContent.trim()
      });
      
      const response = await sendHumanMessage(conversation.id, newMessageContent.trim());
      console.log('✅ [MOBILE] Mensaje humano enviado:', response);
      
      setNewMessageContent(''); // Limpiar input inmediatamente
      
      // Agregar el mensaje enviado a la lista en tiempo real para mostrar inmediatamente
      const immediateMessage = {
        id: `mobile-human-${Date.now()}`,
        content: newMessageContent.trim(),
        sender: 'user',
        role: 'user',
        created_at: new Date().toISOString(),
        metadata: { sent_by_human: true },
        isRealtime: true
      };
      
      setRealtimeMessages(prev => [...prev, immediateMessage]);
      
      // Actualizar datos después del envío
      if (onInterventionAction) {
        setTimeout(() => {
          onInterventionAction();
        }, 500);
      }
    } catch (error) {
      console.error('❌ [MOBILE] Error al enviar mensaje humano:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getUserName = () => {
    return conversation?.user?.name || 
           conversation?.user?.phone || 
           conversation?.contact_name ||
           conversation?.phone_number ||
           'Usuario';
  };

  const getUserPhone = () => {
    return conversation?.user?.phone || 
           conversation?.phone_number || 
           null;
  };

  const parseStatusChangeFromMessage = (content) => {
    if (!content) return null;
    
    // Función helper para traducir estados a español más legible
    const translateStatus = (status) => {
      const statusMap = {
        'active': 'Activo',
        'paused': 'Pausado',
        'inactive': 'Inactivo',
        'stopped': 'Detenido',
        'running': 'Ejecutándose',
        'waiting': 'En espera',
        'human_intervention': 'Intervención humana'
      };
      return statusMap[status?.toLowerCase()] || status;
    };
    
    // Función para generar mensaje específico basado en la transición
    const generateTransitionMessage = (fromStatus, toStatus) => {
      const from = translateStatus(fromStatus);
      const to = translateStatus(toStatus);
      return `${from} → ${to}`;
    };
    
    // Detectar diferentes formatos de mensajes de cambio de estado
    
    // Formato: "Bot status changed from X to Y"
    const statusChangeRegex = /Bot status changed from (\w+) to (\w+)/;
    const statusMatch = content.match(statusChangeRegex);
    
    if (statusMatch) {
      const [, fromStatus, toStatus] = statusMatch;
      return {
        type: 'bot_status_change',
        fromStatus,
        toStatus,
        message: generateTransitionMessage(fromStatus, toStatus),
        subtitle: 'Estado del bot modificado'
      };
    }
    
    // Formato: "Estado del bot cambiado de X a Y"
    const spanishStatusRegex = /Estado del bot cambiado de "(.*?)" a "(.*?)"/;
    const spanishMatch = content.match(spanishStatusRegex);
    
    if (spanishMatch) {
      const [, fromStatus, toStatus] = spanishMatch;
      return {
        type: 'bot_status_change',
        fromStatus,
        toStatus,
        message: generateTransitionMessage(fromStatus, toStatus),
        subtitle: 'Estado del bot modificado'
      };
    }
    
    // Detectar mensajes específicos
    if (content.includes('Bot reactivado')) {
      return {
        type: 'bot_status_change',
        fromStatus: 'paused',
        toStatus: 'active',
        message: generateTransitionMessage('paused', 'active'),
        subtitle: 'Bot reactivado'
      };
    }
    
    if (content.includes('Bot pausado')) {
      return {
        type: 'bot_status_change',
        fromStatus: 'active',
        toStatus: 'paused',
        message: generateTransitionMessage('active', 'paused'),
        subtitle: 'Bot pausado'
      };
    }
    
    if (content.includes('requiere intervención humana') || content.includes('requires human intervention')) {
      return {
        type: 'human_intervention',
        message: 'Intervención humana solicitada',
        subtitle: 'Se requiere atención manual'
      };
    }
    
    return null;
  };

  const renderStatusChangeDivider = (message) => {
    const statusInfo = parseStatusChangeFromMessage(message.content);
    
    if (!statusInfo) return null;
    
    // Seleccionar icono más específico según el tipo de cambio
    const getStatusIcon = (type, fromStatus, toStatus) => {
      if (type === 'human_intervention') return faUser;
      
      // Iconos específicos para transiciones de bot
      if (toStatus === 'active') return faCheck; // Bot activado
      if (toStatus === 'paused') return faPause; // Bot pausado
      if (toStatus === 'inactive') return faCircleStop; // Bot inactivo
      
      return faSyncAlt; // Cambio genérico
    };
    
    return (
      <div className="mobile-status-change" key={`status-${message.id}`}>
        <div className="mobile-status-change-content">
          <FontAwesomeIcon 
            icon={getStatusIcon(statusInfo.type, statusInfo.fromStatus, statusInfo.toStatus)}
            className="mobile-status-change-icon"
          />
          <div className="mobile-status-change-details">
            <span className="mobile-status-change-text">
              {statusInfo.message}
            </span>
            {statusInfo.subtitle && (
              <span className="mobile-status-change-subtitle">
                {statusInfo.subtitle}
              </span>
            )}
          </div>
        </div>
        <div className="mobile-status-change-time">
          {formatTime(message.created_at)}
        </div>
      </div>
    );
  };

  const renderMessage = (message) => {
    // Verificar si es un mensaje de cambio de estado
    const statusInfo = parseStatusChangeFromMessage(message.content);
    if (statusInfo) {
      return renderStatusChangeDivider(message);
    }
    
    const isUser = message.sender === 'user' || message.role === 'user';
    const messageTime = formatTime(message.created_at);
    
    return (
      <div key={message.id} className={`mobile-message ${isUser ? 'mobile-message-user' : 'mobile-message-bot'}`}>
        <div className="mobile-message-content">
          <div className="mobile-message-text">{message.content}</div>
          <div className="mobile-message-time">{messageTime}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mobile-message-view mobile-loading-view">
        {/* Header con información del contacto */}
        <div className="mobile-header">
          <button className="mobile-back-button" onClick={handleBackClick}>
            <FontAwesomeIcon icon={faChevronLeft} className="mobile-back-icon" />
          </button>
          <div className="mobile-contact-info">
            <div className="mobile-contact-name">
              {conversation?.user?.name || conversation?.contact_name || conversation?.phone_number || 'Usuario'}
            </div>
            <div className="mobile-contact-status">
              Cargando conversación...
            </div>
          </div>
        </div>

        {/* Área de mensajes con skeleton loading profesional */}
        <div className="mobile-messages-container mobile-skeleton-container">
          <div className="mobile-loading-skeleton">
            {/* Skeleton de mensaje recibido largo */}
            <div className="mobile-skeleton-message mobile-skeleton-received">
              <div className="mobile-skeleton-avatar"></div>
              <div className="mobile-skeleton-bubble">
                <div className="mobile-skeleton-line mobile-skeleton-line-long"></div>
                <div className="mobile-skeleton-line mobile-skeleton-line-medium"></div>
                <div className="mobile-skeleton-line mobile-skeleton-line-short"></div>
                <div className="mobile-skeleton-timestamp"></div>
              </div>
            </div>
            
            {/* Skeleton de mensaje enviado */}
            <div className="mobile-skeleton-message mobile-skeleton-sent">
              <div className="mobile-skeleton-bubble mobile-skeleton-sent-bubble">
                <div className="mobile-skeleton-line mobile-skeleton-line-medium"></div>
                <div className="mobile-skeleton-line mobile-skeleton-line-short"></div>
                <div className="mobile-skeleton-timestamp mobile-skeleton-timestamp-sent"></div>
              </div>
            </div>
            
            {/* Skeleton de mensaje recibido corto */}
            <div className="mobile-skeleton-message mobile-skeleton-received">
              <div className="mobile-skeleton-avatar"></div>
              <div className="mobile-skeleton-bubble">
                <div className="mobile-skeleton-line mobile-skeleton-line-short"></div>
                <div className="mobile-skeleton-timestamp"></div>
              </div>
            </div>
            
            {/* Skeleton de mensaje enviado largo */}
            <div className="mobile-skeleton-message mobile-skeleton-sent">
              <div className="mobile-skeleton-bubble mobile-skeleton-sent-bubble">
                <div className="mobile-skeleton-line mobile-skeleton-line-long"></div>
                <div className="mobile-skeleton-line mobile-skeleton-line-medium"></div>
                <div className="mobile-skeleton-timestamp mobile-skeleton-timestamp-sent"></div>
              </div>
            </div>
            
            {/* Skeleton de divisor de estado */}
            <div className="mobile-skeleton-status-divider">
              <div className="mobile-skeleton-status-content">
                <div className="mobile-skeleton-status-icon"></div>
                <div className="mobile-skeleton-status-text"></div>
              </div>
            </div>
            
            {/* Más mensajes skeleton */}
            <div className="mobile-skeleton-message mobile-skeleton-received">
              <div className="mobile-skeleton-avatar"></div>
              <div className="mobile-skeleton-bubble">
                <div className="mobile-skeleton-line mobile-skeleton-line-medium"></div>
                <div className="mobile-skeleton-timestamp"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Input de mensajes deshabilitado */}
        <div className="mobile-message-input-container mobile-input-loading">
          <div className="mobile-message-input-wrapper">
            <div className="mobile-message-input-content mobile-input-disabled">
              <div className="mobile-input-placeholder">Cargando...</div>
              <div className="mobile-send-button mobile-send-disabled">
                <span className="mobile-loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="mobile-message-view mobile-no-conversation">
        <div className="mobile-header">
          <button className="mobile-back-button" onClick={handleBackClick}>
            <FontAwesomeIcon icon={faChevronLeft} className="mobile-back-icon" />
          </button>
          <div className="mobile-contact-info">
            <div className="mobile-contact-name">Sin conversación</div>
          </div>
        </div>
        <div className="mobile-no-conversation-content">
          <p>No hay conversación seleccionada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-message-view">
      {/* Header */}
      <div className="mobile-header">
        <button className="mobile-back-button" onClick={handleBackClick}>
          <FontAwesomeIcon icon={faChevronLeft} className="mobile-back-icon" />
        </button>
        
        <div className="mobile-contact-info">
          <div className="mobile-contact-name">
            {getUserName()}
          </div>
          <div className="mobile-contact-status">
            {getUserPhone() ? `+${getUserPhone()}` : 'WhatsApp'}
          </div>
        </div>
        
        <button 
          className="mobile-actions-button"
          onClick={handleActionsClick}
        >
          <FontAwesomeIcon icon={faEllipsisVertical} className="mobile-actions-icon" />
        </button>
        
        {/* Menú de acciones */}
        {showActions && (
          <div className="mobile-actions-menu">
            <div className="mobile-bot-controls-section">
              <div className="mobile-section-title">Control del Bot</div>
              
              <button 
                className="mobile-action-item mobile-pause-bot"
                onClick={() => handleChangeBotStatus('paused')}
                disabled={isChangingBotStatus}
              >
                <FontAwesomeIcon icon={faPause} className="mobile-action-icon" />
                <span className="mobile-action-text">Pausar Bot</span>
              </button>
              
              <button 
                className="mobile-action-item mobile-activate-bot"
                onClick={() => handleChangeBotStatus('active')}
                disabled={isChangingBotStatus}
              >
                <FontAwesomeIcon icon={faPlay} className="mobile-action-icon" />
                <span className="mobile-action-text">Activar Bot</span>
              </button>
              
              <button 
                className="mobile-action-item mobile-human-intervention"
                onClick={handleRequireHumanIntervention}
                disabled={isChangingBotStatus}
              >
                <FontAwesomeIcon icon={faUser} className="mobile-action-icon" />
                <span className="mobile-action-text">Intervención Humana</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Área de mensajes */}
      <div className="mobile-messages-container">
        <div className="mobile-messages-list">
          {allMessages.length === 0 ? (
            <div className="mobile-no-messages">
              <p>No hay mensajes en esta conversación</p>
            </div>
          ) : (
            allMessages.map(renderMessage)
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input para escribir mensajes - Misma lógica que MessageView.jsx */}
      {conversation && (
        <div className="mobile-human-message-area">
          <div className="mobile-human-message-input">
            <textarea
              value={newMessageContent}
              onChange={(e) => setNewMessageContent(e.target.value)}
              placeholder="Escribir como humano..."
              className="mobile-human-textarea"
              rows={1}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendHumanMessage();
                }
              }}
            />
            <button
              className="mobile-send-human-btn"
              onClick={handleSendHumanMessage}
              disabled={!newMessageContent.trim() || isSendingMessage}
              title="Enviar como humano"
            >
              {isSendingMessage ? (
                <FontAwesomeIcon icon={faSpinner} className="mobile-loading-icon" spin />
              ) : (
                <FontAwesomeIcon icon={faPaperPlane} className="mobile-send-icon" />
              )}
            </button>
          </div>
          <div className="mobile-human-message-hint">
            <FontAwesomeIcon icon={faLightbulb} /> Los mensajes enviados aparecerán como respuestas del bot pero con indicador humano
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMessageView;