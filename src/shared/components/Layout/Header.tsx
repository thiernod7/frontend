import { useState } from 'react';
import { logger } from '../../utils/logger';
import { FraisCalculator } from '../../../features/finance/components';

export function Header() {
  const [showCalculator, setShowCalculator] = useState(false);
  
  logger.feature('Header', 'Composant rendu');
  
  const handleLogout = () => {
    logger.auth.logout();
    logger.feature('Header', 'Déconnexion utilisateur');
    
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  const handleOpenCalculator = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCalculator(true);
    logger.feature('Header', 'Ouverture calculateur de frais');
  };

  return (
    <>
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

            {/* Actions centrales */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleOpenCalculator}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                title="Calculateur de frais scolaires"
              >
                <span className="mr-2">💰</span>
                <span className="hidden sm:inline">Calculateur</span>
                <span className="sm:hidden">💰</span>
              </button>
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

      {/* Modal Calculateur de frais */}
      {showCalculator && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setShowCalculator(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                💰 Calculateur de Frais Scolaires
              </h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <FraisCalculator onClose={() => setShowCalculator(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
