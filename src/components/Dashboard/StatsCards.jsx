/**
 * Componente StatsCards - Tarjetas de estadísticas del dashboard
 */

import { Users, MessageSquare, Clock, TrendingUp, Brain, Key } from 'lucide-react';
import './StatsCards.css';

const StatsCards = ({ stats, loading, onPromptManagerClick, onCredentialsManagerClick }) => {
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
    },
    {
      key: 'promptManager',
      label: 'Gestionar Prompts',
      icon: Brain,
      color: '#ea580c',
      bgColor: '#fff7ed',
      isAction: true,
      onClick: onPromptManagerClick
    },
    {
      key: 'credentialsManager',
      label: 'Credenciales META',
      icon: Key,
      color: '#7c2d12',
      bgColor: '#fef2f2',
      isAction: true,
      onClick: onCredentialsManagerClick
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
      {statsConfig.map(({ key, label, icon: Icon, color, bgColor, isAction, onClick }) => (
        <div 
          key={key} 
          className={`stat-card ${isAction ? 'stat-card-action' : ''}`}
          onClick={isAction ? () => {
            console.log(`🔍 Clic en card: ${key}`, { isAction, onClick: !!onClick });
            if (onClick) onClick();
          } : undefined}
          style={{ cursor: isAction ? 'pointer' : 'default' }}
        >
          <div className="stat-icon" style={{ backgroundColor: bgColor }}>
            <Icon size={24} style={{ color }} />
          </div>
          <div className="stat-content">
            <h3 className="stat-label">{label}</h3>
            {!isAction && (
              <div className="stat-value" style={{ color }}>
                {stats[key]?.toLocaleString() || 0}
              </div>
            )}
            {isAction && (
              <div className="stat-action" style={{ color }}>
                Clic para gestionar
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;