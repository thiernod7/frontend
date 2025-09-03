import { useDashboardStats } from './api';
import { StatsGrid } from './components/StatWidget';
import { logger } from '../../shared/utils/logger';
import { useEffect } from 'react';
import type { TDashboardWidget } from './types';

export function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  useEffect(() => {
    logger.feature('dashboard', 'Page dashboard affichée');
  }, []);

  // Configuration des widgets basée sur les données backend
  const widgets: TDashboardWidget[] = [
    {
      id: 'eleves',
      title: 'Élèves',
      description: 'Total inscrits',
      icon: '🎓',
      count: stats?.totalEleves,
      route: '/students',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'classes',
      title: 'Classes',
      description: 'Classes actives',
      icon: '📚',
      count: stats?.totalClasses,
      route: '/classes',
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
      id: 'cycles',
      title: 'Cycles',
      description: 'Cycles d\'études',
      icon: '🔄',
      count: stats?.totalCycles,
      route: '/cursus',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      id: 'niveaux',
      title: 'Niveaux',
      description: 'Niveaux scolaires',
      icon: '📊',
      count: stats?.totalNiveaux,
      route: '/cursus',
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <div className="text-center">
            <span className="text-6xl">⚠️</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              Erreur de chargement
            </h2>
            <p className="text-gray-600 mt-2">
              Impossible de récupérer les données du tableau de bord
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de Bord
        </h1>
        <p className="text-gray-600 mt-1">
          Vue d'ensemble de votre établissement scolaire
        </p>
        {stats?.anneeCourante && (
          <p className="text-sm text-indigo-600 mt-2">
            📅 Année scolaire {stats.anneeCourante.annee}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Statistiques générales
        </h2>
        <StatsGrid widgets={widgets} isLoading={isLoading} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">➕</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nouvelle inscription
                </h3>
                <p className="text-sm text-gray-600">
                  Inscrire un nouvel élève
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Créer une classe
                </h3>
                <p className="text-sm text-gray-600">
                  Ajouter une nouvelle classe
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestion financière
                </h3>
                <p className="text-sm text-gray-600">
                  Paiements et situations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Year Info */}
      {stats?.anneeCourante && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">
                Année Scolaire {stats.anneeCourante.annee}
              </h3>
              <p className="text-indigo-700 mt-1">
                Du {new Date(stats.anneeCourante.date_debut).toLocaleDateString('fr-FR')} 
                au {new Date(stats.anneeCourante.date_fin).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✅ Active
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
