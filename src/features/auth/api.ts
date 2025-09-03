import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TLoginRequest, TToken } from './types';
import { logger } from '../../shared/utils/logger';

// Configuration Axios
const api = axios.create({
  baseURL: 'http://localhost:8000', // URL du backend FastAPI
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 📝 LOGS REQUEST
    console.group(`🚀 [API REQUEST] ${config.method?.toUpperCase()} ${config.url || ''}`);
    console.log('📍 URL:', `${config.baseURL || ''}${config.url || ''}`);
    console.log('📦 Headers:', config.headers);
    if (config.data) {
      console.log('📄 Data:', config.data);
    }
    console.groupEnd();

    return config;
  },
  (error) => {
    console.error('❌ [REQUEST ERROR]:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => {
    // 📝 LOGS RESPONSE SUCCESS
    console.group(`✅ [API RESPONSE] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url || ''}`);
    console.log('📊 Status:', response.status, response.statusText);
    console.log('📦 Headers:', response.headers);
    console.log('📄 Data:', response.data);
    console.groupEnd();

    return response;
  },
  (error) => {
    // 📝 LOGS RESPONSE ERROR
    console.group(`❌ [API ERROR] ${error.response?.status || 'Network'} ${error.config?.method?.toUpperCase()} ${error.config?.url || ''}`);
    console.error('📍 URL:', error.config?.url);
    console.error('📊 Status:', error.response?.status, error.response?.statusText);
    console.error('📄 Error Data:', error.response?.data);
    console.error('🔍 Full Error:', error);
    console.groupEnd();

    if (error.response?.status === 401) {
      logger.auth.tokenExpired();
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services API
export const authService = {
  login: async (credentials: TLoginRequest): Promise<TToken> => {
    logger.feature('auth', 'Tentative de connexion', { username: credentials.username });
    
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    logger.auth.login(credentials.username);
    return response.data;
  },

  // ❌ Supprimé : getMe n'existe pas côté backend
  // Le profil utilisateur sera récupéré via d'autres endpoints si nécessaire

  logout: async (): Promise<void> => {
    logger.feature('auth', 'Déconnexion locale');
    // Pas d'endpoint logout côté backend, on fait juste le nettoyage local
    localStorage.removeItem('access_token');
    logger.auth.logout();
  },
};

// Hooks React Query
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      console.log('🎉 [AUTH] Connexion réussie:', data);
      localStorage.setItem('access_token', data.access_token);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      console.error('❌ [AUTH] Erreur de connexion:', error);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      console.log('👋 [AUTH] Déconnexion réussie');
      queryClient.clear();
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('❌ [AUTH] Erreur déconnexion:', error);
      // Forcer la déconnexion même en cas d'erreur
      localStorage.removeItem('access_token');
      queryClient.clear();
      window.location.href = '/';
    },
  });
}

// Utilitaire pour vérifier si l'utilisateur est connecté
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};
