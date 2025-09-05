// Utilitaires pour la gestion des photos

const API_BASE_URL = 'http://localhost:8000';

/**
 * Convertit un chemin relatif de photo en URL complète
 * @param photoPath - Chemin relatif de la photo (ex: "photos_eleves/uuid.jpeg")
 * @returns URL complète ou null si pas de photo
 */
export function getPhotoUrl(photoPath?: string | null): string | null {
  if (!photoPath) return null;
  
  // Si l'URL est déjà complète, la retourner telle quelle
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  // Si le chemin commence par /static/, utiliser tel quel
  if (photoPath.startsWith('/static/')) {
    return `${API_BASE_URL}${photoPath}`;
  }
  
  // Sinon, ajouter le préfixe /static/
  return `${API_BASE_URL}/static/${photoPath}`;
}
