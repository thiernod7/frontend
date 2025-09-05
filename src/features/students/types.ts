// Types basés sur l'analyse backend inscriptions
// Source: backend/app/domains/inscriptions/schemas.py

/**
 * Personne de base (élève ou parent)
 */
export interface TPerson {
  id: string;
  nom: string;
  prenom: string;
  sexe: string;
  telephone: string;
  adresse_quartier: string;
  photo?: string;  // URL photo
  type: string;
}

/**
 * Information classe
 */
export interface TClasseInfo {
  id: string;
  nom: string;
  niveau: string;
}

/**
 * Élève (liste) - EleveRead
 */
export interface TStudent {
  id: string;
  numero_matricule: string;
  date_naissance: string;  // ISO date
  lieu_naissance: string;
  personne: TPerson;
  classe_actuelle?: TClasseInfo;
}

/**
 * Parent avec détails professionnels
 */
export interface TParent {
  personne: TPerson;
  profession?: string;
  lieu_travail?: string;
}

/**
 * Inscription d'un élève
 */
export interface TInscription {
  id: string;
  statut: string;
  date_inscription: string;
  classe: TClasseInfo;
  annee_scolaire: {
    id: string;
    nom: string;
    date_debut: string;
    date_fin: string;
  };
}

/**
 * Élève détaillé - EleveDetailRead
 */
export interface TStudentDetail extends TStudent {
  pere?: TParent;
  mere?: TParent;
  tuteur: TParent;  // OBLIGATOIRE
  inscriptions: TInscription[];
}

/**
 * Paramètres de recherche élèves
 */
export interface TStudentSearchParams {
  search?: string;      // Recherche nom/prénom/matricule
  classe_id?: string;   // UUID classe
}

/**
 * Lien vers parent (création inscription)
 */
export interface TParentLink {
  id?: string;          // UUID parent existant
  data?: {              // OU nouvelles données parent
    nom: string;
    prenom: string;
    sexe: string;
    telephone: string;
    adresse_quartier: string;
    profession?: string;
    lieu_travail?: string;
  };
}

/**
 * Données de création élève
 */
export interface TStudentCreate {
  nom: string;
  prenom: string;
  sexe: string;
  telephone: string;
  adresse_quartier: string;
  date_naissance: string;     // ISO date
  lieu_naissance: string;
  site_id?: string;          // UUID optionnel
}

/**
 * Données de création inscription complète
 */
export interface TInscriptionCreate {
  eleve: TStudentCreate;
  pere?: TParentLink;         // Optionnel
  mere?: TParentLink;         // Optionnel
  tuteur: TParentLink;        // OBLIGATOIRE
  classe_id: string;          // UUID
  site_id?: string;          // UUID optionnel
  annee_scolaire_id: string;  // UUID
  frais_inscription?: number;
  frais_scolarite?: number;
  documents_fournis?: unknown[];  // TODO: définir DocumentFourniCreate
}

/**
 * FormData pour création avec photos
 */
export interface TInscriptionFormData {
  inscription_data: string;   // JSON stringifié de TInscriptionCreate
  photo_eleve?: File;
  photo_pere?: File;
  photo_mere?: File;
  photo_tuteur?: File;
}

/**
 * Résultat création inscription
 */
export interface TInscriptionResult {
  id: string;
  eleve_id: string;
  classe_id: string;
  site_id?: string;
  annee_scolaire_id: string;
  statut: string;
}

/**
 * Erreurs API
 */
export interface TStudentError {
  detail: string | { loc: string[]; msg: string; type: string }[];
  status_code: number;
}
