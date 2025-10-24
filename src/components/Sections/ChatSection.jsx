/**
 * Componente ChatSection - Sección de chats estilo WhatsApp Web
 */

import ChatInterface from '../Chat/ChatInterface';
import './ChatSection.css';

const ChatSection = ({ isRefreshing, onRefresh, isSidebarCollapsed, onConversationSelect }) => {
  return (
    <div className="chat-section">
      <div className="chat-content">
        <ChatInterface 
          isRefreshing={isRefreshing} 
          onRefresh={onRefresh} 
          isSidebarCollapsed={isSidebarCollapsed}
          onConversationSelect={onConversationSelect}
        />
      </div>
    </div>
  );
};

export default ChatSection;