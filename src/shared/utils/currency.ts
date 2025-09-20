// Utilitaires pour le formatage des montants en francs guinéens

/**
 * Formate un montant en francs guinéens (GNF)
 * @param montant - Le montant à formater
 * @param options - Options de formatage optionnelles
 * @returns Le montant formaté avec la devise
 */
export function formatMontantGNF(
  montant: number, 
  options: {
    withCurrency?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    withCurrency = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;

  const formatter = new Intl.NumberFormat('fr-GN', {
    style: withCurrency ? 'currency' : 'decimal',
    currency: withCurrency ? 'GNF' : undefined,
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return formatter.format(montant);
}

/**
 * Formate un montant en francs guinéens sans symbole de devise
 * @param montant - Le montant à formater
 * @returns Le montant formaté sans devise
 */
export function formatMontantSimple(montant: number): string {
  return formatMontantGNF(montant, { withCurrency: false });
}

/**
 * Convertit une chaîne de caractères en nombre pour les montants
 * @param value - La valeur à convertir
 * @returns Le nombre converti ou 0 si invalide
 */
export function parseMontant(value: string): number {
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Valide qu'un montant est valide (positif et non nul)
 * @param montant - Le montant à valider
 * @returns true si le montant est valide
 */
export function isValidMontant(montant: number): boolean {
  return typeof montant === 'number' && montant > 0 && !isNaN(montant);
}

/**
 * Constantes pour les montants en Guinée
 */
export const MONTANT_CONSTANTS = {
  // Montants typiques en GNF
  MONTANT_MIN: 1000,
  MONTANT_MAX: 50000000, // 50 millions GNF
  STEP_DEFAULT: 1000,    // Pas par défaut de 1000 GNF
  
  // Labels de devise
  CURRENCY_CODE: 'GNF',
  CURRENCY_LABEL: 'Francs guinéens',
  CURRENCY_SYMBOL: 'GNF',
} as const;