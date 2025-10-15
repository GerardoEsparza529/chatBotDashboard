/**
 * Componente Header - Barra superior de la aplicación
 */

import { MessageCircle, RefreshCw } from 'lucide-react';
import './Header.css';

const Header = ({ onRefresh, isRefreshing = false }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <MessageCircle className="header-icon" size={28} />
          <h1 className="header-title">WhatsApp Chat Dashboard</h1>
        </div>
        
        <div className="header-right">
          <button 
            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
            onClick={onRefresh}
            disabled={isRefreshing}
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