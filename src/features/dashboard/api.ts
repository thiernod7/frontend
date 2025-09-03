import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { 
  TDashboardStats, 
  TAnneeScolaire, 
  TEleveDashboard, 
  TClasseDashboard,
  TCycle,
  TNiveau
} from './types';

const API_BASE = 'http://localhost:8000';

// Configuration Axios avec token depuis localStorage
const apiClient = axios.create({
  baseURL: API_BASE,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== SERVICES API ====================

/**
 * Service: Récupération année scolaire courante
 * Endpoint: GET /planification/annees-scolaires/actuelle
 */
const dashboardService = {
  async getCurrentYear(): Promise<TAnneeScolaire> {
    const response = await apiClient.get('/planification/annees-scolaires/actuelle');
    return response.data;
  },

  async getEleves(): Promise<TEleveDashboard[]> {
    const response = await apiClient.get('/inscriptions/eleves');
    return response.data;
  },

  async getClasses(): Promise<TClasseDashboard[]> {
    const response = await apiClient.get('/planification/classes', {
      params: { active_only: true }
    });
    return response.data;
  },

  async getCycles(): Promise<TCycle[]> {
    const response = await apiClient.get('/cursus/cycles', {
      params: { active_only: true }
    });
    return response.data;
  },

  async getNiveaux(): Promise<TNiveau[]> {
    const response = await apiClient.get('/cursus/niveaux', {
      params: { active_only: true }
    });
    return response.data;
  },

  // Méthode qui agrège toutes les stats
  async getDashboardStats(): Promise<TDashboardStats> {
    const [anneeCourante, eleves, classes, cycles, niveaux] = await Promise.all([
      this.getCurrentYear(),
      this.getEleves(),
      this.getClasses(),
      this.getCycles(),
      this.getNiveaux(),
    ]);

    return {
      totalEleves: eleves.length,
      totalClasses: classes.length,
      anneeCourante,
      totalCycles: cycles.length,
      totalNiveaux: niveaux.length,
    };
  },
};

// ==================== HOOKS REACT QUERY ====================

/**
 * Hook: Statistiques générales du dashboard
 * Combine plusieurs endpoints pour calculer les stats
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

/**
 * Hook: Année scolaire courante
 */
export function useCurrentYear() {
  return useQuery({
    queryKey: ['dashboard', 'current-year'],
    queryFn: () => dashboardService.getCurrentYear(),
    staleTime: 30 * 60 * 1000, // 30 minutes (change rarement)
  });
}

/**
 * Hook: Liste des élèves (pour comptage et activité récente)
 */
export function useEleves() {
  return useQuery({
    queryKey: ['dashboard', 'eleves'],
    queryFn: () => dashboardService.getEleves(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook: Liste des classes actives
 */
export function useClasses() {
  return useQuery({
    queryKey: ['dashboard', 'classes'],
    queryFn: () => dashboardService.getClasses(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook: Liste des cycles actifs
 */
export function useCycles() {
  return useQuery({
    queryKey: ['dashboard', 'cycles'],
    queryFn: () => dashboardService.getCycles(),
    staleTime: 60 * 60 * 1000, // 1 heure (change très rarement)
  });
}

/**
 * Hook: Liste des niveaux actifs
 */
export function useNiveaux() {
  return useQuery({
    queryKey: ['dashboard', 'niveaux'],
    queryFn: () => dashboardService.getNiveaux(),
    staleTime: 60 * 60 * 1000, // 1 heure
  });
}
