/**
 * Componente CredentialsManager - Gestión de credenciales META por negocio
 */

import { useState, useEffect } from 'react';
import { X, Save, Edit, Trash2, Plus, Key, Eye, EyeOff } from 'lucide-react';
import { getBusinesses, updateBusinessCredentials } from '../../services/api';
import './CredentialsManager.css';

const CredentialsManager = ({ isOpen, onClose }) => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [formData, setFormData] = useState({
    jwtToken: '',
    numberId: '',
    verifyToken: '',
    version: 'v24.0'
  });

  // Cargar negocios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadBusinesses();
    }
  }, [isOpen]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      console.log('🔍 Cargando negocios desde API...');
      const data = await getBusinesses();
      console.log('📊 Datos recibidos de la API:', data);
      console.log('📋 Número de negocios:', data?.length || 0);
      
      // Log detallado de cada negocio
      if (data && Array.isArray(data)) {
        data.forEach((business, index) => {
          console.log(`🏢 Negocio ${index + 1}:`, {
            id: business.id,
            name: business.name,
            slug: business.slug,
            hasWhatsappConfig: !!business.whatsappConfig,
            whatsappConfigKeys: business.whatsappConfig ? Object.keys(business.whatsappConfig) : [],
            hasCredentials: business.hasCredentials
          });
        });
      }
      
      setBusinesses(data || []);
    } catch (error) {
      console.error('❌ Error loading businesses:', error);
      alert('Error al cargar los negocios');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (business) => {
    setEditingBusiness(business.id);
    const config = business.whatsappConfig || {};
    setFormData({
      jwtToken: config.jwtToken || '',
      numberId: config.numberId || '',
      verifyToken: config.verifyToken || '',
      version: config.version || 'v24.0'
    });
  };

  const handleSave = async (businessId) => {
    setLoading(true);
    try {
      await updateBusinessCredentials(businessId, {
        whatsappConfig: {
          provider: 'meta',
          ...formData
        }
      });

      await loadBusinesses();
      setEditingBusiness(null);
      setFormData({
        jwtToken: '',
        numberId: '',
        verifyToken: '',
        version: 'v24.0'
      });
      alert('Credenciales guardadas exitosamente');
    } catch (error) {
      console.error('Error saving credentials:', error);
      alert('Error al guardar las credenciales');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingBusiness(null);
    setFormData({
      jwtToken: '',
      numberId: '',
      verifyToken: '',
      version: 'v24.0'
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const maskCredential = (credential) => {
    if (!credential) return 'No configurado';
    return `${credential.substring(0, 8)}...${credential.substring(credential.length - 8)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content credentials-modal">
        <div className="modal-header">
          <h2>
            <Key size={24} />
            Gestión de Credenciales META
          </h2>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}

          <div className="businesses-list">
            {businesses.map((business) => (
              <div key={business.id} className="business-card">
                <div className="business-header">
                  <h3>{business.name}</h3>
                  <span className="business-slug">({business.slug})</span>
                </div>

                {editingBusiness === business.id ? (
                  <div className="credentials-form">
                    <div className="form-group">
                      <label>JWT Token:</label>
                      <div className="input-with-toggle">
                        <input
                          type={showPasswords.jwtToken ? 'text' : 'password'}
                          value={formData.jwtToken}
                          onChange={(e) => setFormData(prev => ({ ...prev, jwtToken: e.target.value }))}
                          placeholder="JWT Token de META"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('jwtToken')}
                          className="toggle-password"
                        >
                          {showPasswords.jwtToken ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Number ID:</label>
                      <input
                        type="text"
                        value={formData.numberId}
                        onChange={(e) => setFormData(prev => ({ ...prev, numberId: e.target.value }))}
                        placeholder="Number ID de WhatsApp Business"
                      />
                    </div>

                    <div className="form-group">
                      <label>Verify Token:</label>
                      <div className="input-with-toggle">
                        <input
                          type={showPasswords.verifyToken ? 'text' : 'password'}
                          value={formData.verifyToken}
                          onChange={(e) => setFormData(prev => ({ ...prev, verifyToken: e.target.value }))}
                          placeholder="Token de verificación"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('verifyToken')}
                          className="toggle-password"
                        >
                          {showPasswords.verifyToken ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Versión API:</label>
                      <select
                        value={formData.version}
                        onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                      >
                        <option value="v24.0">v24.0</option>
                        <option value="v23.0">v23.0</option>
                        <option value="v22.0">v22.0</option>
                      </select>
                    </div>

                    <div className="form-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSave(business.id)}
                        disabled={loading}
                      >
                        <Save size={16} />
                        Guardar
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="credentials-display">
                    <div className="credentials-info">
                      <div className="credential-item">
                        <span className="label">JWT Token:</span>
                        <span className="value">
                          {maskCredential(business.whatsappConfig?.jwtToken)}
                        </span>
                      </div>
                      <div className="credential-item">
                        <span className="label">Number ID:</span>
                        <span className="value">
                          {business.whatsappConfig?.numberId || 'No configurado'}
                        </span>
                      </div>
                      <div className="credential-item">
                        <span className="label">Verify Token:</span>
                        <span className="value">
                          {maskCredential(business.whatsappConfig?.verifyToken)}
                        </span>
                      </div>
                      <div className="credential-item">
                        <span className="label">Versión:</span>
                        <span className="value">
                          {business.whatsappConfig?.version || 'v24.0'}
                        </span>
                      </div>
                    </div>

                    <div className="business-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEdit(business)}
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialsManager;