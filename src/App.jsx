import { useState, useEffect } from 'react'
import Sidebar from './components/Layout/Sidebar'
import StatsSection from './components/Sections/StatsSection'
import ChatSection from './components/Sections/ChatSection'
import SettingsSection from './components/Sections/SettingsSection'
import { ThemeProvider } from './contexts/ThemeContext'
import webSocketService from './services/websocket'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('chats')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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

  const renderContent = () => {
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

  return (
    <ThemeProvider>
      <div className={`app ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
