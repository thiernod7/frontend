// API pour le module Finance
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { logger } from '../../shared/utils/logger';
import type { 
  TFrais,
  TVersement,
  TSituationFinanciere,
  TCreateFrais,
  TUpdateFrais,
  TCreateVersement,
  TUpdateVersement,
  TFraisSearchParams,
  TVersmentsSearchParams,
  TSituationFinanciereParams,
  TTypeDeFrais,
  TCreateTypeDeFrais,
  TUpdateTypeDeFrais
} from './types';

// Configuration API avec auth
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token d'auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logger.api.request(config.method?.toUpperCase() || 'GET', config.url || '', config.data);
    return config;
  },
  (error) => {
    logger.api.error('Request interceptor', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    logger.api.response(response.status, response.config.url || '', response.data);
    return response;
  },
  (error) => {
    logger.api.error(error.config?.url || 'Unknown URL', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Services API - TYPES DE FRAIS
const typesFraisService = {
  async getTypesFrais(): Promise<TTypeDeFrais[]> {
    const { data } = await api.get<TTypeDeFrais[]>('/finance/types-frais');
    return data;
  },

  async getTypeFraisById(id: string): Promise<TTypeDeFrais> {
    const { data } = await api.get<TTypeDeFrais>(`/finance/types-frais/${id}`);
    return data;
  },

  async createTypeFrais(typeFrais: TCreateTypeDeFrais): Promise<TTypeDeFrais> {
    const { data } = await api.post<TTypeDeFrais>('/finance/types-frais', typeFrais);
    return data;
  },

  async updateTypeFrais(id: string, typeFrais: TUpdateTypeDeFrais): Promise<TTypeDeFrais> {
    const { data } = await api.put<TTypeDeFrais>(`/finance/types-frais/${id}`, typeFrais);
    return data;
  },

  async deleteTypeFrais(id: string): Promise<void> {
    await api.delete(`/finance/types-frais/${id}`);
  },
};

// Services API - FRAIS
const fraisService = {
  async getFrais(params: TFraisSearchParams): Promise<TFrais[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('annee_scolaire_id', params.annee_scolaire_id);
    searchParams.append('cycle_id', params.cycle_id);
    searchParams.append('niveau_id', params.niveau_id);
    if (params.site_id) searchParams.append('site_id', params.site_id);
    
    const url = `/finance/frais?${searchParams.toString()}`;
    const { data } = await api.get<TFrais[]>(url);
    return data;
  },

  async getFraisById(id: string): Promise<TFrais> {
    const { data } = await api.get<TFrais>(`/finance/frais/${id}`);
    return data;
  },

  async createFrais(frais: TCreateFrais): Promise<TFrais> {
    const { data } = await api.post<TFrais>('/finance/frais', frais);
    return data;
  },

  async updateFrais(id: string, frais: TUpdateFrais): Promise<TFrais> {
    const { data } = await api.put<TFrais>(`/finance/frais/${id}`, frais);
    return data;
  },

  async deleteFrais(id: string): Promise<void> {
    await api.delete(`/finance/frais/${id}`);
  },
};

// Services API - VERSEMENTS
const versementsService = {
  async getVersementsByInscription(params: TVersmentsSearchParams): Promise<TVersement[]> {
    const { data } = await api.get<TVersement[]>(`/finance/inscriptions/${params.inscription_id}/versements`);
    return data;
  },

  async createVersement(versement: TCreateVersement): Promise<TVersement> {
    const { data } = await api.post<TVersement>('/finance/versements', versement);
    return data;
  },

  async updateVersement(id: string, versement: TUpdateVersement): Promise<TVersement> {
    const { data } = await api.put<TVersement>(`/finance/versements/${id}`, versement);
    return data;
  },
};

// Services API - SITUATION FINANCIÈRE
const situationService = {
  async getSituationFinanciere(params: TSituationFinanciereParams): Promise<TSituationFinanciere> {
    const searchParams = new URLSearchParams();
    searchParams.append('annee_scolaire_id', params.annee_scolaire_id);
    
    const url = `/finance/eleves/${params.eleve_id}/situation-financiere?${searchParams.toString()}`;
    const { data } = await api.get<TSituationFinanciere>(url);
    return data;
  },
};

// React Query hooks - TYPES DE FRAIS
export function useTypesFrais() {
  logger.feature('FinanceAPI', 'useTypesFrais hook appelé');
  
  return useQuery({
    queryKey: ['types-frais'],
    queryFn: () => {
      logger.feature('FinanceAPI', 'Récupération liste types de frais');
      return typesFraisService.getTypesFrais();
    },
  });
}

export function useTypeFraisById(id: string) {
  logger.feature('FinanceAPI', 'useTypeFraisById hook appelé', { id });
  
  return useQuery({
    queryKey: ['types-frais', id],
    queryFn: () => {
      logger.feature('FinanceAPI', 'Récupération détail type frais', { id });
      return typesFraisService.getTypeFraisById(id);
    },
    enabled: !!id,
  });
}

export function useCreateTypeFrais() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: typesFraisService.createTypeFrais,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types-frais'] });
    },
    onError: (error) => {
      logger.feature('FinanceAPI', 'Erreur création type frais', error);
    },
  });
}

export function useUpdateTypeFrais() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdateTypeDeFrais }) =>
      typesFraisService.updateTypeFrais(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['types-frais'] });
      queryClient.invalidateQueries({ queryKey: ['types-frais', data.id] });
    },
    onError: (error) => {
      logger.feature('FinanceAPI', 'Erreur mise à jour type frais', error);
    },
  });
}

export function useDeleteTypeFrais() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: typesFraisService.deleteTypeFrais,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types-frais'] });
    },
    onError: (error) => {
      logger.feature('FinanceAPI', 'Erreur suppression type frais', error);
    },
  });
}

// React Query hooks - FRAIS
export function useFrais(params: TFraisSearchParams, options?: { enabled?: boolean }) {
  logger.feature('FinanceAPI', 'useFrais hook appelé', params);
  
  return useQuery({
    queryKey: ['frais', params],
    queryFn: () => {
      logger.feature('FinanceAPI', 'Récupération liste frais', params);
      return fraisService.getFrais(params);
    },
    enabled: options?.enabled !== false,
  });
}

export function useFraisById(id: string) {
  logger.feature('FinanceAPI', 'useFraisById hook appelé', { id });
  
  return useQuery({
    queryKey: ['frais', id],
    queryFn: () => {
      logger.feature('FinanceAPI', 'Récupération détail frais', { id });
      return fraisService.getFraisById(id);
    },
    enabled: !!id,
  });
}

export function useCreateFrais() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fraisService.createFrais,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frais'] });
    },
    onError: (error) => {
      logger.feature('FinanceAPI', 'Erreur création frais', error);
    },
  });
}

export function useUpdateFrais() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdateFrais }) =>
      fraisService.updateFrais(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['frais'] });
      queryClient.invalidateQueries({ queryKey: ['frais', data.id] });
    },
    onError: (error) => {
      logger.feature('FinanceAPI', 'Erreur mise à jour frais', error);
    },
  });
}

export function useDeleteFrais() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fraisService.deleteFrais,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frais'] });
    },
    onError: (error) => {
      logger.feature('FinanceAPI', 'Erreur suppression frais', error);
    },
  });
}

// React Query hooks - VERSEMENTS
export function useVersements(params: TVersmentsSearchParams) {
  logger.feature('FinanceAPI', 'useVersements hook appelé', params);
  
  return useQuery({
    queryKey: ['versements', params.inscription_id],
    queryFn: () => {
      logger.feature('FinanceAPI', 'Récupération versements', params);
      return versementsService.getVersementsByInscription(params);
    },
  });
}

export function useCreateVersement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: versementsService.createVersement,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['versements', data.inscription_id] });
      queryClient.invalidateQueries({ queryKey: ['situation-financiere'] });
    },
    onError: (error) => {
      logger.feature('FinanceAPI', 'Erreur création versement', error);
    },
  });
}

export function useUpdateVersement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdateVersement }) =>
      versementsService.updateVersement(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['versements', data.inscription_id] });
      queryClient.invalidateQueries({ queryKey: ['situation-financiere'] });
    },
    onError: (error) => {
      logger.feature('FinanceAPI', 'Erreur mise à jour versement', error);
    },
  });
}

// React Query hooks - SITUATION FINANCIÈRE
export function useSituationFinanciere(params: TSituationFinanciereParams) {
  logger.feature('FinanceAPI', 'useSituationFinanciere hook appelé', params);
  
  return useQuery({
    queryKey: ['situation-financiere', params.eleve_id, params.annee_scolaire_id],
    queryFn: () => {
      logger.feature('FinanceAPI', 'Récupération situation financière', params);
      return situationService.getSituationFinanciere(params);
    },
  });
}