// Types basés sur les schemas Pydantic du backend
// Backend utilise OAuth2PasswordRequestForm (FormData)

/**
 * Données de connexion attendues par POST /auth/login
 * Format: FormData avec username et password
 */
export interface TLoginRequest {
  username: string;  // Nom d'utilisateur unique (pas forcément email)
  password: string;  // Mot de passe en clair (haché côté backend)
}

/**
 * Réponse du backend après authentification réussie
 * Conforme au schéma Token de FastAPI
 */
export interface TToken {
  access_token: string;  // JWT token
  token_type: string;    // Toujours "bearer"
}

export interface TUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  type: 'eleve' | 'parent' | 'enseignant' | 'personnel';
  ecole_id: string;
  site_id?: string;
  photo?: string;
}

export interface TAuthResponse {
  access_token: string;
  token_type: string;
  user: TUser;
}

export interface TAuthError {
  detail: string;
  status_code: number;
}
