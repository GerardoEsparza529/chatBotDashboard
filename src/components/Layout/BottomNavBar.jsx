/**
 * BottomNavBar - Navegación móvil estilo iOS WhatsApp
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments, 
  faChartLine, 
  faChartBar, 
  faCog 
} from '@fortawesome/free-solid-svg-icons';
import './BottomNavBar.css';

const BottomNavBar = ({ activeTab = 'chats', onTabChange }) => {
  const tabs = [
    {
      id: 'chats',
      label: 'Chats',
      icon: <FontAwesomeIcon icon={faComments} />,
      iconActive: <FontAwesomeIcon icon={faComments} />
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FontAwesomeIcon icon={faChartLine} />,
      iconActive: <FontAwesomeIcon icon={faChartBar} />
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: <FontAwesomeIcon icon={faCog} />,
      iconActive: <FontAwesomeIcon icon={faCog} />
    }
  ];

  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="bottom-nav-bar">
      <div className="bottom-nav-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`bottom-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            type="button"
          >
            <span className="bottom-nav-icon">
              {activeTab === tab.id ? tab.iconActive : tab.icon}
            </span>
            <span className="bottom-nav-label">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;