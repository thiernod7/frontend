// Utilitaire de logging pour le développement
const isDev = import.meta.env.DEV;

export const logger = {
  // Logs généraux
  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(`ℹ️ [INFO] ${message}`, ...args);
    }
  },

  // Logs d'erreur
  error: (message: string, error?: unknown) => {
    if (isDev) {
      console.error(`❌ [ERROR] ${message}`, error);
    }
  },

  // Logs de succès
  success: (message: string, data?: unknown) => {
    if (isDev) {
      console.log(`✅ [SUCCESS] ${message}`, data);
    }
  },

  // Logs d'authentification
  auth: {
    login: (user?: string) => {
      if (isDev) {
        console.log(`🔐 [AUTH] Connexion${user ? ` pour ${user}` : ''}`);
      }
    },
    logout: () => {
      if (isDev) {
        console.log('👋 [AUTH] Déconnexion');
      }
    },
    tokenExpired: () => {
      if (isDev) {
        console.warn('⚠️ [AUTH] Token expiré, redirection...');
      }
    },
  },

  // Logs API
  api: {
    request: (method: string, url: string, data?: unknown) => {
      if (isDev) {
        console.group(`🚀 [API] ${method.toUpperCase()} ${url}`);
        if (data) console.log('📤 Data:', data);
        console.groupEnd();
      }
    },
    response: (status: number, url: string, data?: unknown) => {
      if (isDev) {
        const icon = status >= 200 && status < 300 ? '✅' : '❌';
        console.group(`${icon} [API] ${status} ${url}`);
        if (data) console.log('📥 Response:', data);
        console.groupEnd();
      }
    },
    error: (url: string, error: unknown) => {
      if (isDev) {
        console.group(`❌ [API ERROR] ${url}`);
        console.error('Error:', error);
        console.groupEnd();
      }
    },
  },

  // Logs des features
  feature: (name: string, action: string, data?: unknown) => {
    if (isDev) {
      console.log(`🎯 [${name.toUpperCase()}] ${action}`, data);
    }
  },

  // Logs de navigation
  navigation: (from: string, to: string) => {
    if (isDev) {
      console.log(`🧭 [NAVIGATION] ${from} → ${to}`);
    }
  },
};
