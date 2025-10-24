/**
 * Componente ChatInterface - Interfaz principal del chat
 */

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import ConversationList from './ConversationList';
import MessageView from './MessageView';
import MobileConversationList from './MobileConversationList';
import MobileMessageView from './MobileMessageView';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';
import { markConversationAsRead } from '../../services/api';
import webSocketService from '../../services/websocket';
import './ChatInterface.css';

const ChatInterface = ({ onRefresh, isRefreshing, isSidebarCollapsed, onConversationSelect }) => {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [showMessages, setShowMessages] = useState(false); // Para navegación móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // En desktop, mostrar siempre ambos paneles
      if (!mobile) {
        setShowMessages(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Hook para manejar conversaciones
  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    currentPage: conversationsPage,
    totalPages: conversationsTotalPages,
    search,
    changePage: changeConversationsPage,
    refresh: refreshConversations
  } = useConversations();

  // Hook para manejar mensajes
  const {
    messages,
    conversation,
    loading: messagesLoading,
    error: messagesError,
    currentPage: messagesPage,
    totalPages: messagesTotalPages,
    changePage: changeMessagesPage,
    refresh: refreshMessages
  } = useMessages(selectedConversationId);

  // Manejar vuelta a la lista de conversaciones (móvil)
  const handleBackToConversations = () => {
    if (isMobile) {
      setShowMessages(false);
      setSelectedConversationId(null);
      // Notificar al componente padre que no hay conversación seleccionada
      if (onConversationSelect) {
        onConversationSelect(null);
      }
    }
  };

  // Manejar selección de conversación
  const handleSelectConversation = async (conversationId) => {
    console.log(`📖 Seleccionando conversación: ${conversationId}`);
    setSelectedConversationId(conversationId);
    
    // En móvil, mostrar panel de mensajes
    if (isMobile) {
      setShowMessages(true);
      // Notificar al componente padre que hay conversación seleccionada
      if (onConversationSelect) {
        onConversationSelect(conversationId);
      }
    }
    
    // Marcar conversación como leída
    try {
      await markConversationAsRead(conversationId);
      console.log(`✅ Conversación ${conversationId} marcada como leída`);
      
      // Actualizar lista de conversaciones para reflejar el cambio
      setTimeout(() => {
        refreshConversations();
      }, 100);
    } catch (error) {
      console.error('❌ Error marcando conversación como leída:', error);
      // No bloquear la UI por este error
    }
  };

  // Manejar búsqueda
  const handleSearch = (query) => {
    search(query);
    // NO limpiar la selección al buscar para mantener la conversación abierta
    // setSelectedConversationId(null); 
  };

  // Manejar actualización después de acciones de intervención humana
  const handleInterventionAction = async () => {
    // Refrescar tanto conversaciones como mensajes (que incluye la conversación individual)
    console.log('🔄 handleInterventionAction: Iniciando actualización completa');
    try {
      await Promise.all([
        refreshConversations(),
        refreshMessages() // Esto también actualiza el objeto conversation individual
      ]);
      console.log('✅ handleInterventionAction: Actualización completa exitosa');
    } catch (error) {
      console.error('❌ handleInterventionAction: Error en actualización:', error);
    }
  };

  // 🧪 FUNCIÓN DE TEST TEMPORAL
  const testGlobalRefresh = () => {
    console.log('🧪 TEST: Forzando actualización global manual');
    handleInterventionAction();
  };

  // 🔌 WebSocket integration para actualizaciones globales
  useEffect(() => {
    console.log('🔌 Configurando WebSocket global en ChatInterface');
    
    // Conectar WebSocket si no está conectado
    if (!webSocketService.getConnectionStatus().isConnected) {
      webSocketService.connect();
    }

    // Escuchar nuevos mensajes desde cualquier conversación
    const handleGlobalNewMessage = (data) => {
      console.log('📨 [GLOBAL] Nuevo mensaje detectado:', data);
      console.log('🔍 [GLOBAL] Conversación seleccionada:', selectedConversationId);
      console.log('🔍 [GLOBAL] ¿Coincide conversación?:', {
        dataConversationId: data.conversationId,
        messageConversationId: data.message?.conversation_id,
        selectedId: selectedConversationId,
        match1: data.conversationId === selectedConversationId,
        match2: data.message?.conversation_id === selectedConversationId
      });
      
      // SIEMPRE refrescar la lista de conversaciones
      console.log('🔄 [GLOBAL] Iniciando actualización de lista de conversaciones...');
      setTimeout(() => {
        console.log('🔄 [GLOBAL] Ejecutando refreshConversations()');
        refreshConversations()
          .then(() => {
            console.log('✅ [GLOBAL] Lista de conversaciones actualizada exitosamente');
          })
          .catch((error) => {
            console.error('❌ [GLOBAL] Error actualizando lista de conversaciones:', error);
          });
      }, 100); // Reducido delay
      
      // Si el mensaje es de la conversación actualmente seleccionada, también refrescar mensajes
      if (selectedConversationId && 
          (data.conversationId === selectedConversationId || 
           data.message?.conversation_id === selectedConversationId)) {
        console.log('🔄 [GLOBAL] También actualizando mensajes de conversación activa');
        setTimeout(() => {
          console.log('🔄 [GLOBAL] Ejecutando refreshMessages()');
          refreshMessages()
            .then(() => {
              console.log('✅ [GLOBAL] Mensajes actualizados exitosamente');
            })
            .catch((error) => {
              console.error('❌ [GLOBAL] Error actualizando mensajes:', error);
            });
        }, 200);
      }
    };

    // Escuchar eventos globales de conversación actualizada
    const handleConversationUpdated = (data) => {
      console.log('🌍 [GLOBAL] Conversación actualizada:', data);
      console.log('🔄 [GLOBAL] Refrescando lista de conversaciones por conversation-updated...');
      
      setTimeout(() => {
        refreshConversations()
          .then(() => {
            console.log('✅ [GLOBAL] Lista actualizada por conversation-updated');
          })
          .catch((error) => {
            console.error('❌ [GLOBAL] Error en conversation-updated:', error);
          });
      }, 50); // Delay muy corto para actualizaciones rápidas
    };

    // Escuchar cambios de estado del bot
    const handleGlobalBotStatusChange = (data) => {
      console.log('🤖 Cambio de estado global del bot detectado:', data);
      
      // Refrescar conversaciones para actualizar badges de estado
      console.log('🔄 Iniciando actualización de estados de bot...');
      setTimeout(() => {
        console.log('🔄 Ejecutando refreshConversations() por cambio de estado');
        refreshConversations()
          .then(() => {
            console.log('✅ Estados de bot actualizados en conversaciones');
          })
          .catch((error) => {
            console.error('❌ Error actualizando estados de bot:', error);
          });
      }, 200);
      
      // Si es la conversación activa, también refrescar
      if (selectedConversationId && data.conversationId === selectedConversationId) {
        setTimeout(() => {
          console.log('🔄 También actualizando conversación activa por cambio de estado');
          refreshMessages();
        }, 300);
      }
    };

    webSocketService.onNewMessage(handleGlobalNewMessage);
    webSocketService.onBotStatusChange(handleGlobalBotStatusChange);
    webSocketService.onConversationUpdated(handleConversationUpdated);

    // Cleanup
    return () => {
      console.log('🧹 Limpiando listeners globales WebSocket');
    };
  }, [selectedConversationId, refreshConversations, refreshMessages]);

  // Manejar refresh general
  const handleRefresh = () => {
    refreshConversations();
    if (selectedConversationId) {
      refreshMessages();
    }
    // Llamar callback del padre si existe
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className={`chat-interface ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${showMessages ? 'show-messages' : ''}`}>
      {/* 🧪 BOTÓN TEMPORAL DE TEST GLOBAL - SOLO EN DESARROLLO */}
      {window.location.hostname === 'localhost' && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          zIndex: 9999,
          backgroundColor: '#e74c3c',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
        onClick={testGlobalRefresh}
        title="🧪 Test: Forzar actualización global"
        >
          🧪 TEST REFRESH
        </div>
      )}
      
      {/* Renderizado condicional para móvil vs desktop */}
      {isMobile ? (
        // === VERSIÓN MÓVIL ===
        showMessages ? (
          // Mostrar vista de mensajes en móvil
          <MobileMessageView
            conversation={conversation}
            messages={messages}
            loading={messagesLoading}
            onBackToConversations={handleBackToConversations}
            onInterventionAction={handleInterventionAction}
            currentPage={messagesPage}
            totalPages={messagesTotalPages}
            onPageChange={changeMessagesPage}
          />
        ) : (
          // Mostrar lista de conversaciones en móvil
          <MobileConversationList
            conversations={conversations}
            loading={conversationsLoading}
            selectedId={selectedConversationId}
            onSelect={handleSelectConversation}
            onSearch={handleSearch}
            currentPage={conversationsPage}
            totalPages={conversationsTotalPages}
            onPageChange={changeConversationsPage}
          />
        )
      ) : (
        // === VERSIÓN DESKTOP ===
        <>
          {/* Panel de conversaciones */}
          <div className="chat-panel conversations-panel">
            <ConversationList
              conversations={conversations}
              loading={conversationsLoading}
              selectedId={selectedConversationId}
              onSelect={handleSelectConversation}
              onSearch={handleSearch}
              currentPage={conversationsPage}
              totalPages={conversationsTotalPages}
              onPageChange={changeConversationsPage}
            />
            
            {conversationsError && (
              <div className="error-message">
                <p>❌ Error cargando conversaciones: {conversationsError}</p>
                <button onClick={refreshConversations} className="retry-button">
                  <FontAwesomeIcon icon={faSyncAlt} /> Reintentar
                </button>
              </div>
            )}
          </div>

          {/* Panel de mensajes */}
          <div className="chat-panel messages-panel">
            <MessageView
              conversation={conversation}
              messages={messages}
              loading={messagesLoading}
              currentPage={messagesPage}
              totalPages={messagesTotalPages}
              onPageChange={changeMessagesPage}
              onInterventionAction={handleInterventionAction}
              onBackToConversations={handleBackToConversations}
              isMobile={isMobile}
            />
            
            {messagesError && (
              <div className="error-message">
                <p>❌ Error cargando mensajes: {messagesError}</p>
                <button onClick={refreshMessages} className="retry-button">
                  <FontAwesomeIcon icon={faSyncAlt} /> Reintentar
                </button>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Mostrar errores en móvil */}
      {isMobile && (conversationsError || messagesError) && (
        <div className="mobile-error-overlay">
          {conversationsError && (
            <div className="mobile-error-message">
              <p>❌ Error cargando conversaciones: {conversationsError}</p>
              <button onClick={refreshConversations} className="mobile-retry-button">
                <FontAwesomeIcon icon={faSyncAlt} /> Reintentar
              </button>
            </div>
          )}
          {messagesError && (
            <div className="mobile-error-message">
              <p>❌ Error cargando mensajes: {messagesError}</p>
              <button onClick={refreshMessages} className="mobile-retry-button">
                <FontAwesomeIcon icon={faSyncAlt} /> Reintentar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;