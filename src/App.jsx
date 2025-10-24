import { useState, useEffect } from 'react'
import Sidebar from './components/Layout/Sidebar'
import BottomNavBar from './components/Layout/BottomNavBar'
import StatsSection from './components/Sections/StatsSection'
import ChatSection from './components/Sections/ChatSection'
import SettingsSection from './components/Sections/SettingsSection'
import MobileDashboard from './components/Sections/MobileDashboard'
import { ThemeProvider } from './contexts/ThemeContext'
import webSocketService from './services/websocket'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('chats')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [selectedConversationId, setSelectedConversationId] = useState(null)

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Inicializar WebSocket al cargar la app
  useEffect(() => {
    console.log('🚀 Inicializando WebSocket service...');
    webSocketService.connect();

    // Cleanup al cerrar la app
    return () => {
      console.log('🔌 Desconectando WebSocket service...');
      webSocketService.disconnect();
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleConversationSelect = (conversationId) => {
    setSelectedConversationId(conversationId);
  };

  const renderContent = () => {
    // Si es móvil, usar componentes móviles específicos
    if (isMobile) {
      switch (activeSection) {
        case 'statistics':
          return <MobileDashboard />
        case 'settings':
          return <SettingsSection isRefreshing={isRefreshing} onRefresh={handleRefresh} isSidebarCollapsed={isSidebarCollapsed} />
        case 'chats':
        default:
          return <ChatSection 
            isRefreshing={isRefreshing} 
            onRefresh={handleRefresh} 
            isSidebarCollapsed={isSidebarCollapsed}
            onConversationSelect={handleConversationSelect}
          />
      }
    }
    
    // Desktop: usar componentes originales
    switch (activeSection) {
      case 'statistics':
        return <StatsSection isRefreshing={isRefreshing} onRefresh={handleRefresh} isSidebarCollapsed={isSidebarCollapsed} />
      case 'settings':
        return <SettingsSection isRefreshing={isRefreshing} onRefresh={handleRefresh} isSidebarCollapsed={isSidebarCollapsed} />
      case 'chats':
      default:
        return <ChatSection isRefreshing={isRefreshing} onRefresh={handleRefresh} isSidebarCollapsed={isSidebarCollapsed} />
    }
  }

  const handleTabChange = (tabId) => {
    // Mapear tabs móviles a secciones
    const sectionMap = {
      'chats': 'chats',
      'dashboard': 'statistics', 
      'settings': 'settings'
    };
    
    setActiveSection(sectionMap[tabId] || 'chats');
  };

  return (
    <ThemeProvider>
      <div className={`app ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
        {/* Sidebar desktop - oculto en móvil */}
        {!isMobile && (
          <Sidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}
        
        <main className="main-content">
          {renderContent()}
        </main>
        
        {/* Bottom Navigation móvil - oculto en desktop y cuando hay conversación seleccionada */}
        {isMobile && !selectedConversationId && (
          <BottomNavBar 
            activeTab={
              activeSection === 'statistics' ? 'dashboard' : 
              activeSection === 'settings' ? 'settings' : 
              'chats'
            }
            onTabChange={handleTabChange}
          />
        )}
      </div>
    </ThemeProvider>
  )
}

export default App
