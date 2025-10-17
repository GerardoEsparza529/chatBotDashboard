/**
 * Componente Dashboard - Dashboard principal con estadísticas y chat
 */

import { useState } from 'react';
import StatsCards from './StatsCards';
import ChatInterface from '../Chat/ChatInterface';
import PromptManager from './PromptManager';
import CredentialsManager from './CredentialsManager';
import { useStats } from '../../hooks/useStats';
import './Dashboard.css';

const Dashboard = ({ onRefresh }) => {
  // Estado para controlar el modal de gestión de prompts
  const [showPromptManager, setShowPromptManager] = useState(false);
  // Estado para controlar el modal de gestión de credenciales
  const [showCredentialsManager, setShowCredentialsManager] = useState(false);
  
  // Hook para estadísticas con actualización automática cada 30 segundos
  const { stats, loading: statsLoading, refresh: refreshStats } = useStats(30000);

  // Manejar refresh general
  const handleRefresh = async () => {
    try {
      await refreshStats();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      // Mostrar error al usuario
      alert('Error al actualizar los datos. Inténtalo de nuevo.');
    }
  };

  // Manejar apertura del gestor de prompts
  const handlePromptManagerClick = () => {
    setShowPromptManager(true);
  };

  // Manejar apertura del gestor de credenciales
  const handleCredentialsManagerClick = () => {
    console.log('🔧 Abriendo gestor de credenciales...');
    setShowCredentialsManager(true);
  };

  // Manejar cierre del gestor de prompts
  const handlePromptManagerClose = () => {
    setShowPromptManager(false);
  };

  // Manejar cierre del gestor de credenciales
  const handleCredentialsManagerClose = () => {
    setShowCredentialsManager(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* Sección de estadísticas */}
        <section className="stats-section">
          <StatsCards 
            stats={stats} 
            loading={statsLoading} 
            onPromptManagerClick={handlePromptManagerClick}
            onCredentialsManagerClick={handleCredentialsManagerClick}
          />
        </section>

        {/* Sección de chat */}
        <section className="chat-section">
          <ChatInterface onRefresh={handleRefresh} />
        </section>
      </div>

      {/* Modal de gestión de prompts */}
      <PromptManager 
        isOpen={showPromptManager}
        onClose={handlePromptManagerClose}
      />

      {/* Modal de gestión de credenciales META */}
      <CredentialsManager 
        isOpen={showCredentialsManager}
        onClose={handleCredentialsManagerClose}
      />
      
      {/* Debug: mostrar estado del modal */}
      {import.meta.env.DEV && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '5px', 
          fontSize: '12px',
          zIndex: 9999
        }}>
          Credentials Modal: {showCredentialsManager ? 'OPEN' : 'CLOSED'}
        </div>
      )}
    </div>
  );
};

export default Dashboard;