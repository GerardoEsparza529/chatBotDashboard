/**
 * Componente ChatSection - Sección de chats estilo WhatsApp Web
 */

import ChatInterface from '../Chat/ChatInterface';
import './ChatSection.css';

const ChatSection = ({ isRefreshing, onRefresh, isSidebarCollapsed }) => {
  return (
    <div className="chat-section">
      <div className="chat-header">
        <h1>Conversaciones</h1>
        <p>Gestiona las conversaciones de WhatsApp de tus clientes</p>
      </div>

      <div className="chat-content">
        <ChatInterface 
          isRefreshing={isRefreshing} 
          onRefresh={onRefresh} 
          isSidebarCollapsed={isSidebarCollapsed}
        />
      </div>
    </div>
  );
};

export default ChatSection;