// API pour le module Classes
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { 
  TClasse, 
  TAnneeScolaire, 
  TCycle, 
  TNiveau,
  TClassesSearchParams,
  TCyclesSearchParams,
  TNiveauxSearchParams,
  TCreateClasse,
  TUpdateClasse,
  TCreateCycle,
  TUpdateCycle,
  TCreateNiveau,
  TUpdateNiveau
} from './types';

// Configuration API avec auth (même pattern que students/api.ts)
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Services API - CLASSES
const classesService = {
  async getClasses(params: TClassesSearchParams = {}): Promise<TClasse[]> {
    const searchParams = new URLSearchParams();
    if (params.annee_scolaire_id) searchParams.append('annee_scolaire_id', params.annee_scolaire_id);
    if (params.site_id) searchParams.append('site_id', params.site_id);
    if (params.active_only !== undefined) searchParams.append('active_only', params.active_only.toString());
    
    const url = `/planification/classes${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const { data } = await api.get<TClasse[]>(url);
    return data;
  },

  async getClasse(id: string): Promise<TClasse> {
    const { data } = await api.get<TClasse>(`/planification/classes/${id}`);
    return data;
  },

  async createClasse(classe: TCreateClasse): Promise<TClasse> {
    const { data } = await api.post<TClasse>('/planification/classes', classe);
    return data;
  },

  async updateClasse(id: string, classe: TUpdateClasse): Promise<TClasse> {
    const { data } = await api.put<TClasse>(`/planification/classes/${id}`, classe);
    return data;
  },

  async getCurrentYear(): Promise<TAnneeScolaire> {
    const { data } = await api.get<TAnneeScolaire>('/planification/annees-scolaires/actuelle');
    return data;
  },

  async getAllYears(): Promise<TAnneeScolaire[]> {
    const { data } = await api.get<TAnneeScolaire[]>('/planification/annees-scolaires');
    return data;
  },
};

// Services API - CYCLES
const cyclesService = {
  async getCycles(params: TCyclesSearchParams = {}): Promise<TCycle[]> {
    const searchParams = new URLSearchParams();
    if (params.active_only !== undefined) searchParams.append('active_only', params.active_only.toString());
    
    const url = `/cursus/cycles${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const { data } = await api.get<TCycle[]>(url);
    return data;
  },

  async getCycle(id: string): Promise<TCycle> {
    const { data } = await api.get<TCycle>(`/cursus/cycles/${id}`);
    return data;
  },

  async createCycle(cycle: TCreateCycle): Promise<TCycle> {
    const { data } = await api.post<TCycle>('/cursus/cycles', cycle);
    return data;
  },

  async updateCycle(id: string, cycle: TUpdateCycle): Promise<TCycle> {
    const { data } = await api.put<TCycle>(`/cursus/cycles/${id}`, cycle);
    return data;
  },
};

// Services API - NIVEAUX
const niveauxService = {
  async getNiveaux(params: TNiveauxSearchParams = {}): Promise<TNiveau[]> {
    const searchParams = new URLSearchParams();
    if (params.cycle_id) searchParams.append('cycle_id', params.cycle_id);
    if (params.active_only !== undefined) searchParams.append('active_only', params.active_only.toString());
    
    const url = `/cursus/niveaux${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const { data } = await api.get<TNiveau[]>(url);
    return data;
  },

  async getNiveau(id: string): Promise<TNiveau> {
    const { data } = await api.get<TNiveau>(`/cursus/niveaux/${id}`);
    return data;
  },

  async createNiveau(niveau: TCreateNiveau): Promise<TNiveau> {
    const { data } = await api.post<TNiveau>('/cursus/niveaux', niveau);
    return data;
  },

  async updateNiveau(id: string, niveau: TUpdateNiveau): Promise<TNiveau> {
    const { data } = await api.put<TNiveau>(`/cursus/niveaux/${id}`, niveau);
    return data;
  },
};

// React Query hooks - CLASSES
export function useClasses(params: TClassesSearchParams = {}) {
  return useQuery({
    queryKey: ['classes', params],
    queryFn: () => classesService.getClasses(params),
  });
}

export function useClasse(id: string) {
  return useQuery({
    queryKey: ['classe', id],
    queryFn: () => classesService.getClasse(id),
    enabled: !!id,
  });
}

export function useCreateClasse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: classesService.createClasse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useUpdateClasse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdateClasse }) =>
      classesService.updateClasse(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['classe', data.id] });
    },
  });
}

export function useCurrentYear() {
  return useQuery({
    queryKey: ['currentYear'],
    queryFn: classesService.getCurrentYear,
  });
}

export function useAllYears() {
  return useQuery({
    queryKey: ['allYears'],
    queryFn: classesService.getAllYears,
  });
}

// React Query hooks - CYCLES
export function useCycles(params: TCyclesSearchParams = {}) {
  return useQuery({
    queryKey: ['cycles', params],
    queryFn: () => cyclesService.getCycles(params),
  });
}

export function useCycle(id: string) {
  return useQuery({
    queryKey: ['cycle', id],
    queryFn: () => cyclesService.getCycle(id),
    enabled: !!id,
  });
}

export function useCreateCycle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cyclesService.createCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
    },
  });
}

export function useUpdateCycle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdateCycle }) =>
      cyclesService.updateCycle(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      queryClient.invalidateQueries({ queryKey: ['cycle', data.id] });
    },
  });
}

// React Query hooks - NIVEAUX
export function useNiveaux(params: TNiveauxSearchParams = {}) {
  return useQuery({
    queryKey: ['niveaux', params],
    queryFn: () => niveauxService.getNiveaux(params),
  });
}

export function useNiveau(id: string) {
  return useQuery({
    queryKey: ['niveau', id],
    queryFn: () => niveauxService.getNiveau(id),
    enabled: !!id,
  });
}

export function useCreateNiveau() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: niveauxService.createNiveau,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['niveaux'] });
    },
  });
}

export function useUpdateNiveau() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdateNiveau }) =>
      niveauxService.updateNiveau(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['niveaux'] });
      queryClient.invalidateQueries({ queryKey: ['niveau', data.id] });
    },
  });
}
