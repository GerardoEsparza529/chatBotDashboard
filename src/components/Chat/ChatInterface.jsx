/**
 * Componente ChatInterface - Interfaz principal del chat
 */

import { useState } from 'react';
import ConversationList from './ConversationList';
import MessageView from './MessageView';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';
import './ChatInterface.css';

const ChatInterface = ({ onRefresh }) => {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  
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

  // Manejar selección de conversación
  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
  };

  // Manejar búsqueda
  const handleSearch = (query) => {
    search(query);
    // NO limpiar la selección al buscar para mantener la conversación abierta
    // setSelectedConversationId(null); 
  };

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
    <div className={`chat-interface ${(conversationsLoading || messagesLoading) ? 'loading' : ''}`}>
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
              🔄 Reintentar
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
        />
        
        {messagesError && (
          <div className="error-message">
            <p>❌ Error cargando mensajes: {messagesError}</p>
            <button onClick={refreshMessages} className="retry-button">
              🔄 Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;