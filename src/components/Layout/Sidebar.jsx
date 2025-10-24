/**
 * Componente Sidebar - Navegación lateral estilo WhatsApp Web
 */

import { useState, useEffect } from 'react';
import { MessageCircle, BarChart3, Settings, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './Sidebar.css';

const Sidebar = ({ activeSection, onSectionChange, isCollapsed, onToggleCollapse }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { theme, toggleTheme, isDark } = useTheme();

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // En desktop, cerrar sidebar móvil
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sections = [
    {
      id: 'chats',
      label: 'Chats',
      icon: MessageCircle,
      description: 'Conversaciones'
    },
    {
      id: 'statistics',
      label: 'Estadísticas',
      icon: BarChart3,
      description: 'Métricas del bot'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      description: 'Prompts y configuración'
    }
  ];

  const handleSectionClick = (sectionId) => {
    onSectionChange(sectionId);
    setIsMobileOpen(false); // Cerrar en móvil al seleccionar
  };

  const toggleCollapse = () => {
    onToggleCollapse();
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Botón de menú móvil - solo visible en móvil */}
      {isMobile && (
        <button 
          className="sidebar-mobile-toggle"
          onClick={toggleMobile}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Overlay para móvil */}
      {isMobileOpen && isMobile && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-active' : ''}`}>
        {/* Header del sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <MessageCircle size={24} />
            </div>
            {!isCollapsed && (
              <div className="brand-text">
                <h1>WhatsApp Bot</h1>
                <span>Dashboard</span>
              </div>
            )}
          </div>

          {/* Botones de control */}
          <div className="sidebar-controls">
            <button 
              className="sidebar-close-mobile"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
            <button 
              className="sidebar-toggle-desktop"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              <Menu size={16} />
            </button>
          </div>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSectionClick(section.id)}
                title={isCollapsed ? section.label : section.description}
              >
                <div className="nav-icon">
                  <Icon size={20} />
                  {isActive && <div className="nav-indicator" />}
                </div>
                
                {!isCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{section.label}</span>
                    <span className="nav-description">{section.description}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="sidebar-footer">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {!isCollapsed && (
              <span>{isDark ? 'Tema claro' : 'Tema oscuro'}</span>
            )}
          </button>
          
          {!isCollapsed && (
            <div className="footer-info">
              <div className="status-indicator online"></div>
              <span>Bot activo</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;