/**
 * Custom hook para manejar estadísticas del dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { getStats } from '../services/api';

export const useStats = (refreshInterval = 30000) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConversations: 0,
    totalMessages: 0,
    todayMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const data = await getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Error cargando estadísticas');
      console.error('Error en useStats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estadísticas al montar y configurar intervalo de actualización
  useEffect(() => {
    loadStats();

    // Configurar actualización automática si se especifica un intervalo
    let interval;
    if (refreshInterval > 0) {
      interval = setInterval(loadStats, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loadStats, refreshInterval]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
};