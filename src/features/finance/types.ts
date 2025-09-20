// Types pour le module Finance - Conformes aux schémas backend
// Note: Tous les montants sont en francs guinéens (GNF)

// === TYPES DE FRAIS ===
export interface TTypeDeFrais {
  id: string;
  ecole_id: string;
  nom: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by_user_id: string;
  updated_by_user_id?: string;
}

export interface TCreateTypeDeFrais {
  nom: string;
  description?: string;
}

export interface TUpdateTypeDeFrais {
  nom?: string;
  description?: string;
}

// === CONSTANTES POUR STATUTS ===
export const STATUTS_VERSEMENT = [
  'en_attente',
  'valide',
  'annule',
  'rembourse'
] as const;

export const MODES_PAIEMENT = [
  'especes',
  'cheque',
  'virement',
  'carte_bancaire',
  'mobile_money',
  'autres'
] as const;

export const STATUTS_SITUATION_FINANCIERE = [
  'a_jour',
  'en_retard',
  'paye'
] as const;

// === TYPES DÉRIVÉS ===
export type TStatutVersement = typeof STATUTS_VERSEMENT[number];
export type TModePaiement = typeof MODES_PAIEMENT[number];
export type TStatutSituationFinanciere = typeof STATUTS_SITUATION_FINANCIERE[number];

// === FRAIS ===
export interface TFrais {
  id: string;
  ecole_id: string;
  montant: number;              // Montant en GNF
  description?: string;
  annee_scolaire_id: string;
  cycle_id?: string;
  niveau_id?: string;
  site_id?: string;
  type_frais_id: string;
  type_frais: TTypeDeFrais;     // Relation avec TypeFrais
}

export interface TCreateFrais {
  montant: number;              // Montant en GNF
  description?: string;
  annee_scolaire_id: string;
  cycle_id?: string;
  niveau_id?: string;
  site_id?: string;
  type_frais_id: string;
}

export interface TUpdateFrais {
  montant?: number;             // Montant en GNF
  description?: string;
  annee_scolaire_id?: string;
  cycle_id?: string;
  niveau_id?: string;
  site_id?: string;
  type_frais_id?: string;
}

// === VERSEMENTS ===
export interface TVersement {
  id: string;
  ecole_id: string;
  inscription_id: string;
  frais_id: string;
  montant: number;              // Montant versé en GNF
  date_versement: string;
  mode_paiement: TModePaiement;
  numero_recu?: string;
  statut: TStatutVersement;
  site_id?: string;
  created_at: string;
  created_by_user_id: string;
}

export interface TCreateVersement {
  inscription_id: string;
  frais_id: string;
  montant: number;              // Montant versé en GNF
  date_versement: string;
  mode_paiement: TModePaiement;
  numero_recu?: string;
  statut?: TStatutVersement;
  site_id?: string;
}

export interface TUpdateVersement {
  montant?: number;             // Montant versé en GNF
  date_versement?: string;
  mode_paiement?: TModePaiement;
  numero_recu?: string;
  statut?: TStatutVersement;
  site_id?: string;
}

// === SITUATION FINANCIÈRE ===
export interface TSituationFinanciereResume {
  total_a_payer: number;        // Total à payer en GNF
  total_verse: number;          // Total versé en GNF
  solde_restant: number;        // Solde restant en GNF
  statut: TStatutSituationFinanciere;
}

export interface TSituationFinanciereDetailFrais {
  type: string;
  description?: string;
  montant_a_payer: number;      // Montant à payer en GNF
  montant_verse: number;        // Montant versé en GNF
  solde: number;                // Solde en GNF
}

export interface TSituationFinanciereHistoriqueVersement {
  id: string;
  date_versement: string;
  montant: number;              // Montant du versement en GNF
  type_frais_concerne: string;
  mode_paiement: TModePaiement;
}

export interface TSituationFinanciereEleve {
  id: string;
  nom_complet: string;
}

export interface TSituationFinanciere {
  annee_scolaire: string;
  eleve: TSituationFinanciereEleve;
  resume: TSituationFinanciereResume;
  detail_frais: TSituationFinanciereDetailFrais[];
  historique_versements: TSituationFinanciereHistoriqueVersement[];
}

// === PARAMÈTRES DE RECHERCHE ===
export interface TFraisSearchParams {
  annee_scolaire_id: string;
  cycle_id: string;
  niveau_id: string;
  site_id?: string;
}

export interface TVersmentsSearchParams {
  inscription_id: string;
}

export interface TSituationFinanciereParams {
  eleve_id: string;
  annee_scolaire_id: string;
}

// === UTILITAIRES DE VALIDATION ===
export interface TValidationError {
  field: string;
  message: string;
}

export interface TFinanceFormErrors {
  [key: string]: string;
}

// === TYPES ALIAS POUR LES FORMULAIRES ===
export type TFraisFormData = TCreateFrais;
export type TVersementFormData = TCreateVersement;

// === CONSTANTES MÉTIER ===
export const DEFAULT_STATUT_VERSEMENT: TStatutVersement = 'valide';
export const DEFAULT_MODE_PAIEMENT: TModePaiement = 'especes';

// Labels pour l'affichage
export const LABELS_MODES_PAIEMENT: Record<TModePaiement, string> = {
  especes: 'Espèces',
  cheque: 'Chèque',
  virement: 'Virement bancaire',
  carte_bancaire: 'Carte bancaire',
  mobile_money: 'Mobile Money',
  autres: 'Autres'
};

export const LABELS_STATUTS_VERSEMENT: Record<TStatutVersement, string> = {
  en_attente: 'En attente',
  valide: 'Validé',
  annule: 'Annulé',
  rembourse: 'Remboursé'
};

export const LABELS_STATUTS_SITUATION: Record<TStatutSituationFinanciere, string> = {
  a_jour: 'À jour',
  en_retard: 'En retard',
  paye: 'Payé'
};