import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { 
  TStudent, 
  TStudentDetail, 
  TStudentSearchParams, 
  TInscriptionFormData, 
  TInscriptionResult 
} from './types';
import { logger } from '../../shared/utils/logger';

// Configuration API
const API_BASE_URL = 'http://localhost:8000';

// Instance Axios avec auth
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

// Intercepteur pour logger les réponses
api.interceptors.response.use(
  (response) => {
    logger.api.response(response.status, response.config.url || '');
    return response;
  },
  (error) => {
    logger.api.error(error.response?.status || 500, error.config?.url || '');
    return Promise.reject(error);
  }
);

// Service API
export const studentsService = {
  /**
   * Récupérer la liste des élèves avec recherche/filtre
   */
  getStudents: async (params: TStudentSearchParams = {}): Promise<TStudent[]> => {
    const searchParams = new URLSearchParams();
    
    if (params.search) {
      searchParams.append('search', params.search);
    }
    if (params.classe_id) {
      searchParams.append('classe_id', params.classe_id);
    }
    // Note: sexe n'est pas encore supporté par le backend
    // if (params.sexe) {
    //   searchParams.append('sexe', params.sexe);
    // }
    if (params.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    
    const url = `/inscriptions/eleves${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const { data } = await api.get<TStudent[]>(url);
    
    return data;
  },

  /**
   * Récupérer le détail d'un élève
   */
  getStudentDetail: async (studentId: string): Promise<TStudentDetail> => {
    const { data } = await api.get<TStudentDetail>(`/inscriptions/eleves/${studentId}`);
    return data;
  },

  /**
   * Créer une nouvelle inscription avec photos
   */
  createInscription: async (inscriptionData: TInscriptionFormData): Promise<TInscriptionResult> => {
    const formData = new FormData();
    
    // Ajouter les données JSON
    formData.append('inscription_data', inscriptionData.inscription_data);
    
    // Ajouter les photos si présentes
    if (inscriptionData.photo_eleve) {
      formData.append('photo_eleve', inscriptionData.photo_eleve);
    }
    if (inscriptionData.photo_pere) {
      formData.append('photo_pere', inscriptionData.photo_pere);
    }
    if (inscriptionData.photo_mere) {
      formData.append('photo_mere', inscriptionData.photo_mere);
    }
    if (inscriptionData.photo_tuteur) {
      formData.append('photo_tuteur', inscriptionData.photo_tuteur);
    }
    
    const { data } = await api.post<TInscriptionResult>('/inscriptions/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return data;
  },

  /**
   * Rechercher des parents existants
   */
  searchParents: async (search: string) => {
    try {
      // TODO: Endpoint exact à confirmer avec le backend
      const { data } = await api.get(`/personnes/parents?search=${encodeURIComponent(search)}`);
      return data;
    } catch (error: unknown) {
      // Si l'endpoint n'existe pas encore, retourner un tableau vide
      if (error && typeof error === 'object' && 'response' in error && 
          (error as { response: { status: number } }).response?.status === 404) {
        logger.info('⚠️ [STUDENTS] Endpoint parents search pas encore disponible');
        return [];
      }
      throw error;
    }
  },
};

// Hooks React Query

/**
 * Hook pour récupérer la liste des élèves
 */
export function useStudents(params: TStudentSearchParams = {}) {
  logger.feature('StudentsAPI', 'useStudents hook appelé', params);
  
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => {
      logger.feature('StudentsAPI', 'Récupération liste élèves', params);
      return studentsService.getStudents(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour récupérer les élèves d'une classe spécifique
 */
export function useStudentsByClasse(classeId: string) {
  logger.feature('StudentsAPI', 'useStudentsByClasse hook appelé', { classeId });
  
  return useQuery({
    queryKey: ['students', 'classe', classeId],
    queryFn: () => {
      logger.feature('StudentsAPI', 'Récupération élèves de la classe', { classeId });
      return studentsService.getStudents({ classe_id: classeId });
    },
    enabled: !!classeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour récupérer le détail d'un élève
 */
export function useStudentDetail(studentId: string) {
  logger.feature('StudentsAPI', 'useStudentDetail hook appelé', { studentId });
  
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: () => {
      logger.feature('StudentsAPI', 'Récupération détail élève', { studentId });
      return studentsService.getStudentDetail(studentId);
    },
    enabled: !!studentId, // Ne s'exécute que si l'ID est fourni
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour créer une nouvelle inscription
 */
export function useCreateInscription() {
  const queryClient = useQueryClient();
  
  logger.feature('StudentsAPI', 'useCreateInscription hook initialisé');
  
  return useMutation({
    mutationFn: (data: TInscriptionFormData) => {
      logger.feature('StudentsAPI', 'Démarrage création inscription', {
        hasInscriptionData: !!data.inscription_data,
        hasPhotos: {
          eleve: !!data.photo_eleve,
          tuteur: !!data.photo_tuteur,
          pere: !!data.photo_pere,
          mere: !!data.photo_mere
        }
      });
      return studentsService.createInscription(data);
    },
    onSuccess: (data) => {
      // Invalider les caches liés aux élèves
      queryClient.invalidateQueries({ queryKey: ['students'] });
      
      // Log succès
      logger.success('Inscription créée avec succès', { 
        student_id: data.eleve_id,
        inscription_id: data.id 
      });
    },
    onError: (error) => {
      logger.error('Erreur création inscription', error);
    },
  });
}

/**
 * Hook pour rechercher des parents existants
 */
export function useSearchParents(search: string) {
  return useQuery({
    queryKey: ['parents', 'search', search],
    queryFn: () => studentsService.searchParents(search),
    enabled: !!search && search.length > 2, // Ne recherche que si au moins 3 caractères
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
