/**
 * Componente Dashboard - Dashboard principal con estadísticas y chat
 */

import { useState } from 'react';
import StatsCards from './StatsCards';
import ChatInterface from '../Chat/ChatInterface';
import { useStats } from '../../hooks/useStats';
import './Dashboard.css';

const Dashboard = ({ onRefresh, isRefreshing }) => {
  const [localRefreshing, setLocalRefreshing] = useState(false);
  
  // Hook para estadísticas con actualización automática cada 30 segundos
  const { stats, loading: statsLoading, refresh: refreshStats } = useStats(30000);

  // Manejar refresh general
  const handleRefresh = async () => {
    setLocalRefreshing(true);
    try {
      await refreshStats();
      if (onRefresh) {
        onRefresh();
      }
      // Pequeña pausa para mostrar la animación de carga
      setTimeout(() => {
        setLocalRefreshing(false);
      }, 500);
    } catch (error) {
      console.error('Error al actualizar:', error);
      setLocalRefreshing(false);
    }
  };

  const refreshing = isRefreshing || localRefreshing;

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* Sección de estadísticas */}
        <section className="stats-section">
          <StatsCards stats={stats} loading={statsLoading} />
        </section>

        {/* Sección de chat */}
        <section className="chat-section">
          <ChatInterface onRefresh={handleRefresh} />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;