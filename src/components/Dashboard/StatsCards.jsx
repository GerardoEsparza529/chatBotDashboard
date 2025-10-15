/**
 * Componente StatsCards - Tarjetas de estadísticas del dashboard
 */

import { Users, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import './StatsCards.css';

const StatsCards = ({ stats, loading }) => {
  const statsConfig = [
    {
      key: 'totalUsers',
      label: 'Total Usuarios',
      icon: Users,
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    {
      key: 'totalConversations',
      label: 'Conversaciones',
      icon: MessageSquare,
      color: '#059669',
      bgColor: '#ecfdf5'
    },
    {
      key: 'totalMessages',
      label: 'Total Mensajes',
      icon: TrendingUp,
      color: '#dc2626',
      bgColor: '#fef2f2'
    },
    {
      key: 'todayMessages',
      label: 'Mensajes Hoy',
      icon: Clock,
      color: '#7c3aed',
      bgColor: '#f3e8ff'
    }
  ];

  if (loading) {
    return (
      <div className="stats-grid">
        {statsConfig.map((_, index) => (
          <div key={index} className="stat-card loading">
            <div className="stat-skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid">
      {statsConfig.map(({ key, label, icon: Icon, color, bgColor }) => (
        <div key={key} className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: bgColor }}>
            <Icon size={24} style={{ color }} />
          </div>
          <div className="stat-content">
            <h3 className="stat-label">{label}</h3>
            <div className="stat-value" style={{ color }}>
              {stats[key]?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;