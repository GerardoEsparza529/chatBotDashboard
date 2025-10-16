/**
 * Componente Header - Barra superior de la aplicación
 */

import { useState, useEffect } from 'react';
import { MessageCircle, RefreshCw } from 'lucide-react';
import './Header.css';

const Header = ({ onRefresh, isRefreshing = false }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Detectar estado de conectividad
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Manejar click del botón refresh
  const handleRefresh = () => {
    if (!isOnline) {
      alert('Sin conexión a internet. Verifica tu conectividad.');
      return;
    }

    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <MessageCircle className="header-icon" size={28} />
          <h1 className="header-title">WhatsApp Chat Dashboard</h1>
        </div>
        
        <div className="header-right">
          <div className="header-status">
            <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></span>
            <span className="status-text">
              {isOnline ? 'En línea' : 'Sin conexión'}
            </span>
          </div>
          
          <button 
            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing || !isOnline}
            title="Actualizar datos"
          >
            <RefreshCw size={18} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;