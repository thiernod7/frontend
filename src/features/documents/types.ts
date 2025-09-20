// Types pour la gestion des documents
// Basé sur l'analyse backend documents

/**
 * Type de document - Configuration
 */
export interface TTypeDocument {
  id: string;
  nom: string;                    // Ex: "Certificat de naissance", "Photo d'identité"
  description?: string;
  est_obligatoire: boolean;       // Document requis ou optionnel
  est_multiple?: boolean;         // Peut fournir plusieurs exemplaires
  nombre_requis?: number;
  format_accepte?: string;        // Ex: "PDF,JPG,PNG"
  cycle_id?: string;             // Documents spécifiques à un cycle
  site_id?: string;              // Documents spécifiques à un site
  ecole_id?: string;
  created_at?: string;
}

/**
 * Création d'un type de document
 */
export interface TTypeDocumentCreate {
  nom: string;
  description?: string;
  est_obligatoire: boolean;
  cycle_id?: string;
  site_id?: string;
}

/**
 * Mise à jour d'un type de document
 */
export interface TTypeDocumentUpdate {
  nom?: string;
  description?: string;
  est_obligatoire?: boolean;
  site_id?: string;
}

/**
 * Document fourni par un élève - Suivi
 */
export interface TDocumentEleve {
  id: string;
  eleve_id: string;
  type_document_id: string;
  inscription_id: string;
  statut: string;                // "fourni" | "manquant"
  date_fourni?: string;          // ISO date
  observation?: string;
  nom_fichier?: string;          // Pour futur upload de fichiers
  chemin_fichier?: string;
  format_fichier?: string;
  taille_fichier?: number;
  created_at?: string;
  type_document: TTypeDocument;
}

/**
 * Création d'un document pour un élève
 */
export interface TDocumentEleveCreate {
  eleve_id: string;
  type_document_id: string;
  inscription_id: string;
  statut?: string;
  observation?: string;
}

/**
 * Document fourni à l'inscription
 */
export interface TDocumentFourni {
  type_document_id: string;
}

/**
 * Statut d'un document pour un élève (fourni ou manquant)
 */
export interface TDocumentStatus {
  id: string;
  nom: string;
  description?: string;
  est_obligatoire: boolean;
  site_id?: string;
  statut: 'fourni' | 'manquant';
  date_fourni?: string;
  observation?: string;
}

/**
 * Paramètres de recherche pour les types de documents
 */
export interface TTypeDocumentsSearchParams {
  site_id?: string;
  cycle_id?: string;
  est_obligatoire?: boolean;
}

/**
 * Erreurs API documents
 */
export interface TDocumentError {
  detail: string | { loc: string[]; msg: string; type: string }[];
  status_code: number;
}

/**
 * Statistiques des documents
 */
export interface TDocumentStats {
  total_types: number;
  obligatoires: number;
  optionnels: number;
  taux_completion: number;  // Pourcentage d'élèves avec tous les documents obligatoires
}