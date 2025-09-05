import { logger } from '../../utils/logger';

export function Header() {
  logger.feature('Header', 'Composant rendu');
  
  const handleLogout = () => {
    logger.auth.logout();
    logger.feature('Header', 'Déconnexion utilisateur');
    
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et nom de l'école */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-100">
              <span className="text-lg">🎓</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">École Management</h1>
              <p className="text-xs text-gray-500">Système de Gestion Scolaire</p>
            </div>
          </div>

          {/* Utilisateur et actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-600">U</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Utilisateur</p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="hidden sm:inline">Déconnexion</span>
              <span className="sm:hidden">↗️</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
