/**
 * Componente StatsSection - Sección de estadísticas
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import './StatsSection.css';

const StatsSection = ({ isRefreshing, onRefresh, isSidebarCollapsed }) => {
  return (
    <div className="stats-section">
      <div className="stats-header">
        <h1>Estadísticas del Bot</h1>
        <p>Métricas y configuración de tu WhatsApp Bot</p>
      </div>

      <div className="stats-content">
        <div className="stats-grid">
          <div className="stat-card">
            <FontAwesomeIcon icon={faChartBar} className="stat-icon" />
            <div className="stat-info">
              <h3>Mensajes Totales</h3>
              <p className="stat-value">1,234</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <h3>Conversaciones Activas</h3>
              <p className="stat-value">56</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <h3>Tiempo de Respuesta</h3>
              <p className="stat-value">2.3s</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-info">
              <h3>Accuracy del Bot</h3>
              <p className="stat-value">94%</p>
            </div>
          </div>
        </div>

        <div className="refresh-section">
          <button 
            className={`refresh-btn ${isRefreshing ? 'loading' : ''}`}
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <FontAwesomeIcon icon={faSyncAlt} spin /> Actualizando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSyncAlt} /> Actualizar Estadísticas
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;