// Types pour le module Classes

export interface TClasse {
  id: string;
  nom: string;
  niveau_id: string;
  annee_scolaire_id: string;
  option_id?: string;
  site_id?: string;
  salle_id?: string;
  professeur_principal_id?: string;
  effectif_max?: number;
  is_active: boolean;
  // Relations expandies (basées sur les TODOs backend)
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
  is_current: boolean;  // Obligatoire selon le backend
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

// Types pour les formulaires - CONFORMES AU BACKEND
export interface TCreateClasse {
  nom: string;
  niveau_id: string;
  annee_scolaire_id: string;                    // OBLIGATOIRE (ajouté)
  option_id?: string;                           // Optionnel (ajouté)
  site_id?: string;                            // Optionnel (ajouté)
  salle_id?: string;                           // Optionnel (ajouté)
  professeur_principal_id?: string;            // Optionnel (ajouté)
  effectif_max?: number;                       // Optionnel (ajouté)
}

export interface TUpdateClasse {
  nom?: string;
  niveau_id?: string;
  annee_scolaire_id?: string;                  // Ajouté pour cohérence
  option_id?: string;                          // Ajouté
  site_id?: string;                           // Ajouté
  salle_id?: string;                          // Ajouté
  professeur_principal_id?: string;           // Ajouté
  effectif_max?: number;                      // Ajouté
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
