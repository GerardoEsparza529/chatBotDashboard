/**
 * MobileDashboard - Dashboard móvil simplificado estilo iOS
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import './MobileDashboard.css';

const MobileDashboard = () => {
  const stats = [
    {
      title: 'Conversaciones Totales',
      value: '247',
      icon: '💬',
      trend: '+12%',
      color: '#34c759'
    },
    {
      title: 'Mensajes Hoy',
      value: '1,534',
      icon: '📨',
      trend: '+8%',
      color: '#007aff'
    },
    {
      title: 'Bot Activo',
      value: '89%',
      icon: '🤖',
      trend: '+2%',
      color: '#ff9500'
    },
    {
      title: 'Respuesta Promedio',
      value: '2.3s',
      icon: '⚡',
      trend: '-0.5s',
      color: '#30d158'
    }
  ];

  return (
    <div className="mobile-dashboard">
      {/* Header */}
      <div className="mobile-dashboard-header">
        <h1 className="mobile-dashboard-title">Dashboard</h1>
        <p className="mobile-dashboard-subtitle">Estadísticas en tiempo real</p>
      </div>

      {/* Stats Grid */}
      <div className="mobile-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="mobile-stat-card">
            <div className="mobile-stat-icon" style={{ backgroundColor: stat.color }}>
              <span>{stat.icon}</span>
            </div>
            <div className="mobile-stat-content">
              <h3 className="mobile-stat-value">{stat.value}</h3>
              <p className="mobile-stat-title">{stat.title}</p>
              <span 
                className="mobile-stat-trend"
                style={{ color: stat.trend.startsWith('+') ? '#34c759' : '#007aff' }}
              >
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mobile-quick-actions">
        <h2 className="mobile-section-title">Acciones Rápidas</h2>
        <div className="mobile-actions-grid">
          <button className="mobile-action-button">
            <FontAwesomeIcon icon={faChartBar} className="mobile-action-icon" />
            <span className="mobile-action-label">Ver Reportes</span>
          </button>
          <button className="mobile-action-button">
            <FontAwesomeIcon icon={faSyncAlt} className="mobile-action-icon" />
            <span className="mobile-action-label">Actualizar</span>
          </button>
          <button className="mobile-action-button">
            <span className="mobile-action-icon">📥</span>
            <span className="mobile-action-label">Exportar</span>
          </button>
          <button className="mobile-action-button">
            <span className="mobile-action-icon">⚡</span>
            <span className="mobile-action-label">Optimizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;