// Utilitaires pour le module Finance
import type { TValidationError, TFinanceFormErrors, TModePaiement, TStatutVersement } from '../types';
import { LABELS_MODES_PAIEMENT, LABELS_STATUTS_VERSEMENT } from '../types';

// === FORMATAGE MONÉTAIRE ===

/**
 * Formate un montant en francs guinéens (GNF)
 */
export function formatMontant(montant: number, options: { 
  showCurrency?: boolean; 
  decimals?: number;
} = {}): string {
  const { showCurrency = true, decimals = 0 } = options;
  
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(montant);
  
  return showCurrency ? `${formattedAmount} GNF` : formattedAmount;
}

/**
 * Parse un montant depuis une chaîne de caractères
 */
export function parseMontant(value: string): number {
  // Supprimer tous les caractères non numériques sauf le point et la virgule
  const cleanedValue = value.replace(/[^\d.,]/g, '');
  
  // Remplacer la virgule par un point pour le parsing
  const normalizedValue = cleanedValue.replace(',', '.');
  
  const parsed = parseFloat(normalizedValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Valide qu'un montant est positif et non nul
 */
export function validateMontant(montant: number): string | null {
  if (isNaN(montant) || montant <= 0) {
    return 'Le montant doit être positif et supérieur à zéro';
  }
  if (montant > 999999999) {
    return 'Le montant ne peut pas dépasser 999 999 999 GNF';
  }
  return null;
}

// === VALIDATION DES FORMULAIRES ===

/**
 * Valide un nom de type de frais
 */
export function validateNomTypeFrais(nom: string): string | null {
  if (!nom || nom.trim().length === 0) {
    return 'Le nom est requis';
  }
  if (nom.trim().length < 2) {
    return 'Le nom doit contenir au moins 2 caractères';
  }
  if (nom.trim().length > 100) {
    return 'Le nom ne peut pas dépasser 100 caractères';
  }
  return null;
}

/**
 * Valide une description (optionnelle)
 */
export function validateDescription(description?: string): string | null {
  if (description && description.length > 500) {
    return 'La description ne peut pas dépasser 500 caractères';
  }
  return null;
}

/**
 * Valide une date de versement
 */
export function validateDateVersement(date: string): string | null {
  if (!date) {
    return 'La date de versement est requise';
  }
  
  const parsedDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Fin de journée
  
  if (isNaN(parsedDate.getTime())) {
    return 'Date invalide';
  }
  
  if (parsedDate > today) {
    return 'La date de versement ne peut pas être dans le futur';
  }
  
  // Vérifier que la date n'est pas trop ancienne (5 ans)
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  
  if (parsedDate < fiveYearsAgo) {
    return 'La date de versement ne peut pas être antérieure à 5 ans';
  }
  
  return null;
}

/**
 * Valide un numéro de reçu
 */
export function validateNumeroRecu(numero?: string): string | null {
  if (numero && numero.trim().length > 50) {
    return 'Le numéro de reçu ne peut pas dépasser 50 caractères';
  }
  return null;
}

// === GESTION DES ERREURS ===

/**
 * Convertit les erreurs de validation en objet utilisable par les formulaires
 */
export function errorsToFormErrors(errors: TValidationError[]): TFinanceFormErrors {
  return errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {} as TFinanceFormErrors);
}

/**
 * Vérifie si un objet d'erreurs contient des erreurs
 */
export function hasErrors(errors: TFinanceFormErrors): boolean {
  return Object.values(errors).some(error => error && error.trim().length > 0);
}

/**
 * Efface une erreur spécifique
 */
export function clearError(errors: TFinanceFormErrors, field: string): TFinanceFormErrors {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
}

// === AFFICHAGE DES STATUTS ===

/**
 * Obtient le label d'affichage pour un mode de paiement
 */
export function getModeePaiementLabel(mode: TModePaiement): string {
  return LABELS_MODES_PAIEMENT[mode] || mode;
}

/**
 * Obtient le label d'affichage pour un statut de versement
 */
export function getStatutVersementLabel(statut: TStatutVersement): string {
  return LABELS_STATUTS_VERSEMENT[statut] || statut;
}

/**
 * Obtient la classe CSS pour un statut de versement
 */
export function getStatutVersementClass(statut: TStatutVersement): string {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  switch (statut) {
    case 'valide':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'en_attente':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'annule':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'rembourse':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
}

// === CALCULS FINANCIERS ===

/**
 * Calcule le pourcentage de paiement
 */
export function calculatePaymentPercentage(totalVerse: number, totalAPayer: number): number {
  if (totalAPayer === 0) return 0;
  return Math.min(100, (totalVerse / totalAPayer) * 100);
}

/**
 * Détermine si un élève est à jour dans ses paiements
 */
export function isStudentUpToDate(totalVerse: number, totalAPayer: number): boolean {
  return totalVerse >= totalAPayer;
}

/**
 * Calcule le solde restant
 */
export function calculateBalance(totalAPayer: number, totalVerse: number): number {
  return Math.max(0, totalAPayer - totalVerse);
}

// === UTILITAIRES DE DATE ===

/**
 * Formate une date pour l'affichage
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR');
}

/**
 * Formate une date pour un input HTML
 */
export function formatDateForInput(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0];
}

/**
 * Obtient la date d'aujourd'hui au format ISO
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// === GÉNÉRATION DE NUMÉROS ===

/**
 * Génère un numéro de reçu automatique
 */
export function generateNumeroRecu(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const time = now.getTime().toString().slice(-6);
  
  return `R${year}${month}${day}-${time}`;
}

// === CONSTANTES D'AFFICHAGE ===

export const FINANCE_CONSTANTS = {
  CURRENCY: 'GNF',
  CURRENCY_SYMBOL: 'GNF',
  DECIMAL_PLACES: 0,
  MAX_AMOUNT: 999999999,
  DATE_FORMAT: 'dd/MM/yyyy',
} as const;