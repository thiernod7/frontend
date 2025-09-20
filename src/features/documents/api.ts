// API pour le module Documents
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { logger } from '../../shared/utils/logger';
import type { 
  TTypeDocument,
  TTypeDocumentCreate,
  TTypeDocumentUpdate,
  TTypeDocumentsSearchParams,
  TDocumentEleve,
  TDocumentEleveCreate,
  TDocumentStatus,
  TDocumentStats
} from './types';

// Configuration API avec auth (même pattern que les autres modules)
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

// Services API - TYPES DE DOCUMENTS
const typeDocumentsService = {
  async getTypeDocuments(params: TTypeDocumentsSearchParams = {}): Promise<TTypeDocument[]> {
    const searchParams = new URLSearchParams();
    if (params.site_id) searchParams.append('site_id', params.site_id);
    
    const url = `/documents/types${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const { data } = await api.get<TTypeDocument[]>(url);
    return data;
  },

  async getTypeDocument(id: string): Promise<TTypeDocument> {
    const { data } = await api.get<TTypeDocument>(`/documents/types/${id}`);
    return data;
  },

  async createTypeDocument(typeDocument: TTypeDocumentCreate): Promise<TTypeDocument> {
    const { data } = await api.post<TTypeDocument>('/documents/types', typeDocument);
    return data;
  },

  async updateTypeDocument(id: string, typeDocument: TTypeDocumentUpdate): Promise<TTypeDocument> {
    const { data } = await api.put<TTypeDocument>(`/documents/types/${id}`, typeDocument);
    return data;
  },

  async deleteTypeDocument(id: string): Promise<void> {
    await api.delete(`/documents/types/${id}`);
  },
};

// Services API - DOCUMENTS ÉLÈVES
const documentsElevesService = {
  async getDocumentsEleve(eleveId: string): Promise<TDocumentEleve[]> {
    const { data } = await api.get<TDocumentEleve[]>(`/documents/eleves/${eleveId}`);
    return data;
  },

  async getDocumentsStatus(eleveId: string): Promise<TDocumentStatus[]> {
    const { data } = await api.get<TDocumentStatus[]>(`/documents/eleves/${eleveId}/documents_status`);
    return data;
  },

  async addDocumentToEleve(document: TDocumentEleveCreate): Promise<TDocumentEleve> {
    const { data } = await api.post<TDocumentEleve>('/documents/eleves', document);
    return data;
  },
};

// React Query hooks - TYPES DE DOCUMENTS
export function useTypeDocuments(params: TTypeDocumentsSearchParams = {}) {
  logger.feature('DocumentsAPI', 'useTypeDocuments hook appelé', params);
  
  return useQuery({
    queryKey: ['typeDocuments', params],
    queryFn: () => {
      logger.feature('DocumentsAPI', 'Récupération types de documents', params);
      return typeDocumentsService.getTypeDocuments(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTypeDocument(id: string) {
  logger.feature('DocumentsAPI', 'useTypeDocument hook appelé', { id });
  
  return useQuery({
    queryKey: ['typeDocument', id],
    queryFn: () => {
      logger.feature('DocumentsAPI', 'Récupération détail type document', { id });
      return typeDocumentsService.getTypeDocument(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTypeDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: typeDocumentsService.createTypeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['typeDocuments'] });
      logger.feature('DocumentsAPI', 'Type de document créé avec succès');
    },
    onError: (error) => {
      logger.feature('DocumentsAPI', 'Erreur création type de document', error);
    },
  });
}

export function useUpdateTypeDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TTypeDocumentUpdate }) =>
      typeDocumentsService.updateTypeDocument(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['typeDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['typeDocument', data.id] });
      logger.feature('DocumentsAPI', 'Type de document mis à jour avec succès');
    },
    onError: (error) => {
      logger.feature('DocumentsAPI', 'Erreur mise à jour type de document', error);
    },
  });
}

export function useDeleteTypeDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: typeDocumentsService.deleteTypeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['typeDocuments'] });
      logger.feature('DocumentsAPI', 'Type de document supprimé avec succès');
    },
    onError: (error) => {
      logger.feature('DocumentsAPI', 'Erreur suppression type de document', error);
    },
  });
}

// React Query hooks - DOCUMENTS ÉLÈVES
export function useDocumentsEleve(eleveId: string) {
  logger.feature('DocumentsAPI', 'useDocumentsEleve hook appelé', { eleveId });
  
  return useQuery({
    queryKey: ['documentsEleve', eleveId],
    queryFn: () => {
      logger.feature('DocumentsAPI', 'Récupération documents élève', { eleveId });
      return documentsElevesService.getDocumentsEleve(eleveId);
    },
    enabled: !!eleveId,
    staleTime: 2 * 60 * 1000, // 2 minutes (plus court pour documents)
  });
}

export function useDocumentsStatus(eleveId: string) {
  logger.feature('DocumentsAPI', 'useDocumentsStatus hook appelé', { eleveId });
  
  return useQuery({
    queryKey: ['documentsStatus', eleveId],
    queryFn: () => {
      logger.feature('DocumentsAPI', 'Récupération statut documents élève', { eleveId });
      return documentsElevesService.getDocumentsStatus(eleveId);
    },
    enabled: !!eleveId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddDocumentToEleve() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: documentsElevesService.addDocumentToEleve,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documentsEleve', data.eleve_id] });
      queryClient.invalidateQueries({ queryKey: ['documentsStatus', data.eleve_id] });
      logger.feature('DocumentsAPI', 'Document ajouté à l\'élève avec succès');
    },
    onError: (error) => {
      logger.feature('DocumentsAPI', 'Erreur ajout document élève', error);
    },
  });
}

// Hook spécialisé pour les types de documents obligatoires (utilisé dans le formulaire d'inscription)
export function useObligatoryTypeDocuments(siteId?: string) {
  return useQuery({
    queryKey: ['typeDocuments', { site_id: siteId, obligatoire: true }],
    queryFn: () => {
      const params: TTypeDocumentsSearchParams = { site_id: siteId };
      return typeDocumentsService.getTypeDocuments(params);
    },
    select: (data) => data.filter(doc => doc.est_obligatoire),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour les statistiques (dashboard admin)
export function useDocumentStats(): { data: TDocumentStats | undefined; isLoading: boolean } {
  const { data: typeDocuments, isLoading } = useTypeDocuments();
  
  const stats = typeDocuments ? {
    total_types: typeDocuments.length,
    obligatoires: typeDocuments.filter(doc => doc.est_obligatoire).length,
    optionnels: typeDocuments.filter(doc => !doc.est_obligatoire).length,
    taux_completion: 0, // TODO: calculer basé sur les élèves
  } : undefined;

  return { data: stats, isLoading };
}