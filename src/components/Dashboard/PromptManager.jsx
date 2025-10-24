/**
 * Componente PromptManager - Gestión de prompts para el chatbot
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Edit3, Trash2, Eye, MessageSquare } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBrain, 
  faBriefcase, 
  faCalendarAlt, 
  faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';
import { getBusinesses, getBusinessPrompts, createPrompt, updatePrompt, deletePrompt } from '../../services/api';
import './PromptManager.css';

const PromptManager = ({ isOpen, onClose }) => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    content: '',
    isActive: true
  });

  const promptTypes = [
    { value: 'DETECTION', label: 'Detección de Intenciones', icon: <FontAwesomeIcon icon={faBrain} /> },
    { value: 'SALES', label: 'Orientación de Ventas', icon: <FontAwesomeIcon icon={faBriefcase} /> },
    { value: 'APPOINTMENT', label: 'Gestión de Citas', icon: <FontAwesomeIcon icon={faCalendarAlt} /> },
    { value: 'INFO', label: 'Información General', icon: <FontAwesomeIcon icon={faInfoCircle} /> }
  ];

  // Función para cargar negocios
  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await getBusinesses();
      setBusinesses(data);
      if (data.length > 0) {
        setSelectedBusiness(data[0].id.toString());
      }
    } catch (error) {
      console.error('Error cargando negocios:', error);
      alert('Error al cargar negocios');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar prompts
  const loadPrompts = async () => {
    if (!selectedBusiness) return;
    
    try {
      setLoading(true);
      const response = await getBusinessPrompts(selectedBusiness);
      
      // La API devuelve {success: true, data: [...]}
      let prompts = [];
      
      if (response && response.success && response.data) {
        if (Array.isArray(response.data)) {
          prompts = response.data;
        } else if (Array.isArray(response.data.prompts)) {
          prompts = response.data.prompts;
        }
      } else if (Array.isArray(response)) {
        // Fallback: si la respuesta es directamente un array
        prompts = response;
      }
      
      setPrompts(prompts);
    } catch (error) {
      console.error('❌ Error cargando prompts:', error);
      setPrompts([]); // Asegurar que prompts sea un array vacío en caso de error
      alert('Error al cargar prompts');
    } finally {
      setLoading(false);
    }
  };

  // Cargar negocios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadBusinesses();
    }
  }, [isOpen]);

  // Cargar prompts cuando se selecciona un negocio
  useEffect(() => {
    if (selectedBusiness) {
      loadPrompts();
    }
  }, [selectedBusiness]);

  // Early return si el modal no está abierto (después de los hooks)
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBusiness) {
      alert('Selecciona un negocio');
      return;
    }

    try {
      setLoading(true);
      
      if (editingPrompt) {
        await updatePrompt(selectedBusiness, editingPrompt.id, formData);
      } else {
        await createPrompt(selectedBusiness, formData);
      }
      
      await loadPrompts();
      setEditingPrompt(null);
      setShowCreateForm(false);
      setFormData({
        type: '',
        name: '',
        content: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error guardando prompt:', error);
      alert('Error al guardar prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      type: prompt.type,
      name: prompt.name,
      content: prompt.content,
      isActive: prompt.isActive
    });
    setShowCreateForm(true);
    
    // Scroll automático al formulario después de un pequeño delay
    setTimeout(() => {
      const formElement = document.querySelector('.prompt-form-container');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleDelete = async (promptId) => {
    if (!window.confirm('¿Estás seguro de eliminar este prompt?')) return;
    
    try {
      setLoading(true);
      await deletePrompt(selectedBusiness, promptId);
      await loadPrompts();
    } catch (error) {
      console.error('Error eliminando prompt:', error);
      alert('Error al eliminar prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingPrompt(null);
    setShowCreateForm(false);
    setFormData({
      type: '',
      name: '',
      content: '',
      isActive: true
    });
  };

  const testPrompt = async (prompt) => {
    try {
      const testMessage = window.prompt('Introduce un mensaje de prueba:');
      if (testMessage) {
        alert(`Prompt: ${prompt.name}\nMensaje: ${testMessage}\nRespuesta: [Aquí iría la respuesta del chatbot]`);
      }
    } catch (error) {
      console.error('Error probando prompt:', error);
      alert('Error al probar prompt');
    }
  };

  return (
    <div className="prompt-manager-overlay">
      <div className="prompt-manager-modal">
        <div className="prompt-manager-header">
          <h2>
            <MessageSquare size={24} />
            Gestión de Prompts
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="prompt-manager-content">
          {/* Selector de Negocio */}
          <div className="business-selector">
            <label htmlFor="business-select">Negocio:</label>
            <select
              id="business-select"
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              disabled={loading}
            >
              <option value="">Selecciona un negocio</option>
              {businesses.map(business => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>

          {selectedBusiness && (
            <>
              {/* Botón para crear nuevo prompt */}
              <div className="prompt-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowCreateForm(true);
                    // Scroll automático al formulario después de un pequeño delay
                    setTimeout(() => {
                      const formElement = document.querySelector('.prompt-form-container');
                      if (formElement) {
                        formElement.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start' 
                        });
                      }
                    }, 100);
                  }}
                  disabled={loading}
                >
                  <Plus size={16} />
                  Nuevo Prompt
                </button>
              </div>

              {/* Formulario de creación/edición */}
              {showCreateForm ? (
                <div className="prompt-form-container">
                  <form onSubmit={handleSubmit} className="prompt-form">
                    <h3>{editingPrompt ? 'Editar Prompt' : 'Crear Nuevo Prompt'}</h3>
                    
                    <div className="form-group">
                      <label htmlFor="prompt-type">Tipo de Prompt:</label>
                      <select
                        id="prompt-type"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        required
                      >
                        <option value="">Selecciona un tipo</option>
                        {promptTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="prompt-name">Nombre:</label>
                      <input
                        type="text"
                        id="prompt-name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Nombre descriptivo del prompt"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="prompt-content">Contenido del Prompt:</label>
                      <textarea
                        id="prompt-content"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        placeholder="Escribe aquí el prompt que utilizará el chatbot..."
                        rows="6"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        />
                        Prompt activo
                      </label>
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                      >
                        <Save size={16} />
                        {editingPrompt ? 'Actualizar' : 'Crear'} Prompt
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {/* Lista de prompts */}
              <div className="prompts-list">
                <h3>Prompts Configurados</h3>
                {loading ? (
                  <div className="loading">Cargando prompts...</div>
                ) : !Array.isArray(prompts) || prompts.length === 0 ? (
                  <div className="no-prompts">
                    No hay prompts configurados para este negocio.
                  </div>
                ) : (
                  prompts.map(prompt => (
                    <div key={prompt.id} className="prompt-card">
                      <div className="prompt-info">
                        <div className="prompt-header">
                          <span className="prompt-type">
                            {promptTypes.find(t => t.value === prompt.type)?.icon || '📝'}
                            {promptTypes.find(t => t.value === prompt.type)?.label || prompt.type}
                          </span>
                          <span className={`prompt-status ${prompt.isActive ? 'active' : 'inactive'}`}>
                            {prompt.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <h4>{prompt.name}</h4>
                        <p className="prompt-preview">{prompt.content.substring(0, 150)}...</p>
                      </div>
                      <div className="prompt-actions">
                        <button
                          className="btn-icon"
                          onClick={() => testPrompt(prompt)}
                          title="Probar prompt"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(prompt)}
                          title="Editar prompt"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(prompt.id)}
                          title="Eliminar prompt"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptManager;