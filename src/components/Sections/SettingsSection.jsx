/**
 * Componente SettingsSection - Sección de configuración y gestión de prompts
 */

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faSyncAlt, faWrench } from '@fortawesome/free-solid-svg-icons';
import PromptManager from '../Dashboard/PromptManager';
import './SettingsSection.css';

const SettingsSection = ({ isRefreshing, onRefresh, isSidebarCollapsed }) => {
  const [showPromptManager, setShowPromptManager] = useState(false);

  const handleOpenPromptManager = () => {
    setShowPromptManager(true);
  };

  const handleClosePromptManager = () => {
    setShowPromptManager(false);
  };

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h1>Configuración</h1>
        <p>Gestiona los prompts y configuración de tu WhatsApp Bot</p>
      </div>

      <div className="settings-content">
        <div className="settings-grid">
          <div className="setting-card" onClick={handleOpenPromptManager}>
            <div className="setting-icon">🤖</div>
            <div className="setting-info">
              <h3>Gestión de Prompts</h3>
              <p>Configura y edita los prompts del chatbot</p>
            </div>
            <div className="setting-arrow">›</div>
          </div>

          <div className="setting-card">
            <FontAwesomeIcon icon={faChartBar} className="setting-icon" />
            <div className="setting-info">
              <h3>Análisis de Rendimiento</h3>
              <p>Próximamente disponible</p>
            </div>
            <div className="setting-arrow">›</div>
          </div>

          <div className="setting-card">
            <FontAwesomeIcon icon={faWrench} className="setting-icon" />
            <div className="setting-info">
              <h3>Configuración Avanzada</h3>
              <p>Próximamente disponible</p>
            </div>
            <div className="setting-arrow">›</div>
          </div>

          <div className="setting-card">
            <FontAwesomeIcon icon={faSyncAlt} className="setting-icon" />
            <div className="setting-info">
              <h3>Actualizar Sistema</h3>
              <p>Refrescar configuración y datos</p>
            </div>
            <div className="setting-arrow" onClick={onRefresh}>
              {isRefreshing ? '⟳' : '›'}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de PromptManager */}
      <PromptManager 
        isOpen={showPromptManager}
        onClose={handleClosePromptManager}
      />
    </div>
  );
};

export default SettingsSection;