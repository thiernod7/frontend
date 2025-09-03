// Types basés sur les schemas backend analysés

/**
 * Statistiques générales du dashboard
 * Calculées côté frontend à partir des endpoints disponibles
 */
export interface TDashboardStats {
  totalEleves: number;
  totalClasses: number;
  anneeCourante: TAnneeScolaire;
  totalCycles: number;
  totalNiveaux: number;
}

/**
 * Année scolaire courante
 * Endpoint: GET /planification/annees-scolaires/actuelle
 */
export interface TAnneeScolaire {
  id: string;
  annee: string;
  date_debut: string;
  date_fin: string;
  is_active: boolean;
}

/**
 * Élève pour dashboard (version simplifiée)
 * Endpoint: GET /inscriptions/eleves
 */
export interface TEleveDashboard {
  id: string;
  numero_matricule: string;
  date_naissance: string;
  personne: {
    id: string;
    nom: string;
    prenom: string;
    type: string;
  };
}

/**
 * Classe pour dashboard
 * Endpoint: GET /planification/classes
 */
export interface TClasseDashboard {
  id: string;
  nom: string;
  is_active: boolean;
}

/**
 * Cycle d'études
 * Endpoint: GET /cursus/cycles
 */
export interface TCycle {
  id: string;
  nom: string;
  description: string;
  is_active: boolean;
}

/**
 * Niveau scolaire
 * Endpoint: GET /cursus/niveaux
 */
export interface TNiveau {
  id: string;
  nom: string;
  description: string;
  cycle_id: string;
  is_active: boolean;
}

/**
 * Widget de navigation dashboard
 */
export interface TDashboardWidget {
  id: string;
  title: string;
  description: string;
  icon: string;
  count?: number;
  route: string;
  color: string;
}

/**
 * Situation financière résumée (pour widget finance)
 * Endpoint: GET /finance/eleves/{id}/situation-financiere
 */
export interface TSituationFinanciereResume {
  total_frais: number;
  total_verse: number;
  solde: number;
  pourcentage_paye: number;
}

/**
 * Données pour widget activité récente
 * Construites à partir des listes récupérées
 */
export interface TActiviteRecente {
  dernieresInscriptions: TEleveDashboard[];
  dernieresClasses: TClasseDashboard[];
  timestamp: string;
}
