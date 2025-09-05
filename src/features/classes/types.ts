// Types pour le module Classes

export interface TClasse {
  id: string;
  nom: string;
  is_active: boolean;
  niveau?: {
    id: string;
    nom: string;
  };
  ecole?: {
    id: string;
    nom: string;
  };
}

export interface TAnneeScolaire {
  id: string;
  nom: string;          // Le backend utilise "nom" pas "annee"
  date_debut: string;
  date_fin: string;
  is_active?: boolean;  // Optionnel
  is_current?: boolean; // Propriété supplémentaire du backend
}

export interface TCycle {
  id: string;
  nom: string;
  description?: string;
  is_active: boolean;
}

export interface TNiveau {
  id: string;
  nom: string;
  description?: string;
  cycle_id: string;
  is_active: boolean;
  cycle?: TCycle;
}

export interface TClassesSearchParams {
  annee_scolaire_id?: string;
  site_id?: string;
  active_only?: boolean;
}

export interface TNiveauxSearchParams {
  cycle_id?: string;
  active_only?: boolean;
}

export interface TCyclesSearchParams {
  active_only?: boolean;
}

// Types pour les formulaires
export interface TCreateClasse {
  nom: string;
  niveau_id: string;
  is_active?: boolean;
}

export interface TUpdateClasse {
  nom?: string;
  niveau_id?: string;
  is_active?: boolean;
}

export interface TCreateCycle {
  nom: string;
  description?: string;
  is_active?: boolean;
}

export interface TUpdateCycle {
  nom?: string;
  description?: string;
  is_active?: boolean;
}

export interface TCreateNiveau {
  nom: string;
  description?: string;
  cycle_id: string;
  is_active?: boolean;
}

export interface TUpdateNiveau {
  nom?: string;
  description?: string;
  cycle_id?: string;
  is_active?: boolean;
}
